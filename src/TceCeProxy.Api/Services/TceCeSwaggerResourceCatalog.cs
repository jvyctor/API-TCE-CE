using System.Text.Json;
using Microsoft.Extensions.Options;
using TceCeProxy.Api.Models;
using TceCeProxy.Api.Options;

namespace TceCeProxy.Api.Services;

public sealed class TceCeSwaggerResourceCatalog : ITceCeResourceCatalog
{
    private readonly IReadOnlyDictionary<string, TceCeResourceDefinition> _resources;

    public TceCeSwaggerResourceCatalog(
        IHostEnvironment environment,
        IOptions<TceCeApiOptions> options,
        ILogger<TceCeSwaggerResourceCatalog> logger)
    {
        _resources = LoadResources(environment, options.Value, logger);
    }

    public IReadOnlyDictionary<string, TceCeResourceDefinition> GetResources() => _resources;

    public bool TryGetResource(string resource, out TceCeResourceDefinition definition)
        => _resources.TryGetValue(resource, out definition!);

    private static IReadOnlyDictionary<string, TceCeResourceDefinition> LoadResources(
        IHostEnvironment environment,
        TceCeApiOptions options,
        ILogger logger)
    {
        var swaggerPath = ResolveSwaggerPath(environment.ContentRootPath, options.SwaggerUiInitPath);

        if (!File.Exists(swaggerPath))
        {
            logger.LogWarning(
                "Arquivo do Swagger nao encontrado em {SwaggerPath}. Usando catalogo de fallback do appsettings.",
                swaggerPath);

            return TceCeResourceDefinitionNormalizer.NormalizeResources(options.Resources);
        }

        try
        {
            var content = File.ReadAllText(swaggerPath);
            var swaggerJson = ExtractSwaggerDocument(content);
            using var document = JsonDocument.Parse(swaggerJson);

            if (!document.RootElement.TryGetProperty("paths", out var pathsElement))
            {
                throw new InvalidOperationException("O swaggerDoc nao contem a secao 'paths'.");
            }

            var resources = new Dictionary<string, TceCeResourceDefinition>(StringComparer.OrdinalIgnoreCase);

            foreach (var pathEntry in pathsElement.EnumerateObject())
            {
                if (!pathEntry.Value.TryGetProperty("get", out var getElement))
                {
                    continue;
                }

                var key = pathEntry.Name.Trim('/');
                if (string.IsNullOrWhiteSpace(key))
                {
                    continue;
                }

                var queryParameters = getElement.TryGetProperty("parameters", out var parametersElement)
                    ? parametersElement
                        .EnumerateArray()
                        .Where(parameter =>
                            parameter.TryGetProperty("in", out var location) &&
                            string.Equals(location.GetString(), "query", StringComparison.OrdinalIgnoreCase))
                        .Select(parameter => new TceCeQueryParameterDefinition
                        {
                            Name = parameter.GetProperty("name").GetString() ?? string.Empty,
                            Required = parameter.TryGetProperty("required", out var requiredElement) && requiredElement.GetBoolean(),
                            Description = parameter.TryGetProperty("description", out var descriptionElement)
                                ? descriptionElement.GetString()
                                : null,
                            Type = parameter.TryGetProperty("schema", out var schemaElement) &&
                                   schemaElement.TryGetProperty("type", out var typeElement)
                                ? typeElement.GetString()
                                : null
                        })
                        .Where(parameter => !string.IsNullOrWhiteSpace(parameter.Name))
                        .OrderByDescending(parameter => parameter.Required)
                        .ThenBy(parameter => parameter.Name)
                        .ToArray()
                    : [];

                resources[key] = new TceCeResourceDefinition
                {
                    Path = key,
                    Category = GetPrimaryTag(getElement),
                    Description = getElement.TryGetProperty("summary", out var summaryElement)
                        ? summaryElement.GetString()
                        : null,
                    RequiredQueryParameters = queryParameters
                        .Where(parameter => parameter.Required)
                        .Select(parameter => parameter.Name)
                        .ToArray(),
                    OptionalQueryParameters = queryParameters
                        .Where(parameter => !parameter.Required)
                        .Select(parameter => parameter.Name)
                        .ToArray(),
                    QueryParameters = queryParameters,
                    PaginationMode = InferPaginationMode(queryParameters)
                };
            }

            var normalizedResources = TceCeResourceDefinitionNormalizer.NormalizeResources(resources);

            logger.LogInformation("Catalogo do TCE-CE carregado do Swagger com {Count} endpoints.", normalizedResources.Count);
            return normalizedResources;
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Falha ao carregar o catalogo do Swagger em {SwaggerPath}. Usando fallback do appsettings.",
                swaggerPath);

            return TceCeResourceDefinitionNormalizer.NormalizeResources(options.Resources);
        }
    }

    private static string ResolveSwaggerPath(string contentRootPath, string configuredPath)
    {
        if (Path.IsPathRooted(configuredPath))
        {
            return configuredPath;
        }

        return Path.GetFullPath(Path.Combine(contentRootPath, configuredPath));
    }

    private static string ExtractSwaggerDocument(string content)
    {
        const string marker = "\"swaggerDoc\":";
        var markerIndex = content.IndexOf(marker, StringComparison.Ordinal);

        if (markerIndex < 0)
        {
            throw new InvalidOperationException("Nao foi possivel localizar 'swaggerDoc' no arquivo.");
        }

        var startIndex = content.IndexOf('{', markerIndex + marker.Length);
        if (startIndex < 0)
        {
            throw new InvalidOperationException("Nao foi possivel localizar o inicio do JSON do Swagger.");
        }

        var endIndex = FindMatchingBrace(content, startIndex);
        return content[startIndex..(endIndex + 1)];
    }

    private static int FindMatchingBrace(string content, int startIndex)
    {
        var depth = 0;
        var inString = false;
        var escaped = false;

        for (var index = startIndex; index < content.Length; index++)
        {
            var current = content[index];

            if (inString)
            {
                if (escaped)
                {
                    escaped = false;
                    continue;
                }

                if (current == '\\')
                {
                    escaped = true;
                    continue;
                }

                if (current == '"')
                {
                    inString = false;
                }

                continue;
            }

            if (current == '"')
            {
                inString = true;
                continue;
            }

            if (current == '{')
            {
                depth++;
                continue;
            }

            if (current != '}')
            {
                continue;
            }

            depth--;
            if (depth == 0)
            {
                return index;
            }
        }

        throw new InvalidOperationException("Nao foi possivel encontrar o fechamento do JSON do Swagger.");
    }

    private static string? GetPrimaryTag(JsonElement getElement)
    {
        if (!getElement.TryGetProperty("tags", out var tagsElement) || tagsElement.GetArrayLength() == 0)
        {
            return "Outros";
        }

        var tag = tagsElement[0].GetString();
        if (string.IsNullOrWhiteSpace(tag))
        {
            return "Outros";
        }

        return tag
            .Replace("Documentacao referente a ", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Replace(" - SIM", string.Empty, StringComparison.OrdinalIgnoreCase)
            .Trim();
    }

    private static TceCePaginationMode InferPaginationMode(
        IEnumerable<TceCeQueryParameterDefinition> queryParameters)
    {
        var parameterNames = queryParameters
            .Select(parameter => parameter.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        return parameterNames.Contains("quantidade") || parameterNames.Contains("deslocamento")
            ? TceCePaginationMode.Source
            : TceCePaginationMode.Local;
    }
}
