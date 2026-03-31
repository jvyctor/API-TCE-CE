using TceCeProxy.Api.Models;

namespace TceCeProxy.Api.Services;

internal static class TceCeResourceDefinitionNormalizer
{
    public static IReadOnlyDictionary<string, TceCeResourceDefinition> NormalizeResources(
        IReadOnlyDictionary<string, TceCeResourceDefinition> resources)
    {
        var normalizedResources = new Dictionary<string, TceCeResourceDefinition>(StringComparer.OrdinalIgnoreCase);

        foreach (var resource in resources)
        {
            normalizedResources[resource.Key] = Normalize(resource.Key, resource.Value);
        }

        return normalizedResources;
    }

    public static TceCeResourceDefinition Normalize(string key, TceCeResourceDefinition definition)
    {
        var path = string.IsNullOrWhiteSpace(definition.Path) ? key : definition.Path.TrimStart('/');
        var queryParameters = BuildQueryParameters(definition);

        return new TceCeResourceDefinition
        {
            Path = path,
            Description = definition.Description,
            Category = definition.Category,
            RequiredQueryParameters = queryParameters
                .Where(parameter => parameter.Required)
                .Select(parameter => parameter.Name)
                .ToArray(),
            OptionalQueryParameters = queryParameters
                .Where(parameter => !parameter.Required)
                .Select(parameter => parameter.Name)
                .ToArray(),
            QueryParameters = queryParameters,
            RequiresAuthentication = definition.RequiresAuthentication,
            PaginationMode = definition.PaginationMode
        };
    }

    private static TceCeQueryParameterDefinition[] BuildQueryParameters(TceCeResourceDefinition definition)
    {
        if (definition.QueryParameters.Length > 0)
        {
            return definition.QueryParameters
                .Where(parameter => !string.IsNullOrWhiteSpace(parameter.Name))
                .OrderByDescending(parameter => parameter.Required)
                .ThenBy(parameter => parameter.Name)
                .ToArray();
        }

        var requiredParameters = definition.RequiredQueryParameters
            .Where(parameter => !string.IsNullOrWhiteSpace(parameter))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        return definition.RequiredQueryParameters
            .Concat(definition.OptionalQueryParameters)
            .Where(parameter => !string.IsNullOrWhiteSpace(parameter))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(parameter => new TceCeQueryParameterDefinition
            {
                Name = parameter,
                Required = requiredParameters.Contains(parameter)
            })
            .OrderByDescending(parameter => parameter.Required)
            .ThenBy(parameter => parameter.Name)
            .ToArray();
    }
}
