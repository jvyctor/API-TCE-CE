using System.Diagnostics;
using System.Globalization;
using System.Net;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using TceCeProxy.Api.Models;
using TceCeProxy.Api.Options;

namespace TceCeProxy.Api.Services;

public sealed class TceCeClient(
    HttpClient httpClient,
    IMemoryCache memoryCache,
    IOptions<TceCeApiOptions> options,
    ITceCeResourceCatalog resourceCatalog,
    ILogger<TceCeClient> logger) : ITceCeClient
{
    private readonly TceCeApiOptions _options = options.Value;

    public async Task<PaginatedEnvelope> GetResourcePageAsync(
        string resource,
        PaginationQuery pagination,
        IReadOnlyDictionary<string, string> queryParameters,
        CancellationToken cancellationToken)
    {
        if (!resourceCatalog.TryGetResource(resource, out var definition))
        {
            throw new ResourceNotConfiguredException(resource);
        }

        var effectiveQueryParameters = TceCePagination.ApplySourcePagination(definition, pagination, queryParameters);
        ValidateRequiredQueryParameters(resource, definition, effectiveQueryParameters);
        var sourceUri = BuildSourceUri(definition.Path, effectiveQueryParameters);
        var cacheKey = $"tcece::{resource}::{sourceUri}";
        var requestStopwatch = Stopwatch.StartNew();

        if (memoryCache.TryGetValue(cacheKey, out CachedPayload? cachedPayload))
        {
            logger.LogInformation(
                "TCE-CE cache hit. Resource: {Resource}. Url: {Url}. PaginationMode: {PaginationMode}",
                resource,
                sourceUri,
                TceCePagination.ResolvePaginationMode(definition));

            return BuildEnvelope(
                resource,
                pagination,
                definition,
                cachedPayload!,
                cacheHit: true,
                requestDurationMs: requestStopwatch.ElapsedMilliseconds);
        }

        cachedPayload = await memoryCache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(_options.CacheSeconds);
            return await FetchCachedPayloadAsync(
                resource,
                definition,
                pagination,
                effectiveQueryParameters,
                sourceUri,
                cancellationToken);
        });

        return BuildEnvelope(
            resource,
            pagination,
            definition,
            cachedPayload!,
            cacheHit: false,
            requestDurationMs: requestStopwatch.ElapsedMilliseconds);
    }

    private async Task<CachedPayload> FetchCachedPayloadAsync(
        string resource,
        TceCeResourceDefinition definition,
        PaginationQuery pagination,
        IReadOnlyDictionary<string, string> queryParameters,
        string sourceUri,
        CancellationToken cancellationToken)
    {
        var upstreamStopwatch = Stopwatch.StartNew();

        try
        {
            var normalized = await FetchNormalizedPayloadAsync(resource, definition, pagination, sourceUri, cancellationToken);
            upstreamStopwatch.Stop();

            if (!TceCePagination.UsesSourcePagination(definition) &&
                normalized.Items.Count == 0 &&
                queryParameters.Count > 0)
            {
                var fallbackPayload = await TryBuildLocalFilterFallbackAsync(
                    resource,
                    definition,
                    queryParameters,
                    cancellationToken);

                if (fallbackPayload is not null)
                {
                    logger.LogInformation(
                        "Aplicado fallback de filtro local. Resource: {Resource}. Url: {Url}. FallbackItemCount: {ItemCount}",
                        resource,
                        sourceUri,
                        fallbackPayload.Items.Count);

                    return fallbackPayload;
                }
            }

            logger.LogInformation(
                "TCE-CE upstream request completed. Resource: {Resource}. Url: {Url}. DurationMs: {DurationMs}. ItemCount: {ItemCount}. PaginationMode: {PaginationMode}",
                resource,
                sourceUri,
                upstreamStopwatch.ElapsedMilliseconds,
                normalized.Items.Count,
                TceCePagination.ResolvePaginationMode(definition));

            return new CachedPayload(
                DateTimeOffset.UtcNow,
                normalized.Items,
                normalized.Metadata,
                sourceUri,
                upstreamStopwatch.ElapsedMilliseconds);
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "Erro de conectividade ao consultar o TCE-CE. Resource: {Resource}. Url: {Url}", resource, sourceUri);
            throw new UpstreamConnectivityException(resource, sourceUri, exception);
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning(exception, "Timeout ao consultar o TCE-CE. Resource: {Resource}. Url: {Url}", resource, sourceUri);
            throw new UpstreamConnectivityException(resource, sourceUri, exception);
        }
        catch (JsonException exception)
        {
            logger.LogWarning(exception, "Payload invalido retornado pelo TCE-CE. Resource: {Resource}. Url: {Url}", resource, sourceUri);
            throw new UpstreamPayloadException(resource, sourceUri, exception);
        }
    }

    private async Task<(IReadOnlyList<JsonObject> Items, JsonObject Metadata)> FetchNormalizedPayloadAsync(
        string resource,
        TceCeResourceDefinition definition,
        PaginationQuery pagination,
        string sourceUri,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, sourceUri);

        if (!string.IsNullOrWhiteSpace(_options.ApiKey) && !string.IsNullOrWhiteSpace(_options.ApiKeyHeaderName))
        {
            request.Headers.TryAddWithoutValidation(_options.ApiKeyHeaderName, _options.ApiKey);
        }

        using var response = await httpClient.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            if (ShouldTreatNotFoundAsEmptyPage(definition, pagination))
            {
                return ([], new JsonObject());
            }

            throw new UpstreamResourceNotFoundException(resource, sourceUri);
        }

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            logger.LogWarning(
                "Falha ao consultar o TCE-CE. Status: {StatusCode}. Resource: {Resource}. Url: {Url}. ResponseLength: {ResponseLength}",
                (int)response.StatusCode,
                resource,
                sourceUri,
                body.Length);

            throw new UpstreamRequestException(resource, sourceUri, response.StatusCode, body);
        }

        await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var rootNode = await JsonNode.ParseAsync(responseStream, cancellationToken: cancellationToken);

        if (rootNode is null)
        {
            throw new UpstreamPayloadException(resource, sourceUri);
        }

        return TceCeResponseParser.Normalize(rootNode);
    }

    private async Task<CachedPayload?> TryBuildLocalFilterFallbackAsync(
        string resource,
        TceCeResourceDefinition definition,
        IReadOnlyDictionary<string, string> queryParameters,
        CancellationToken cancellationToken)
    {
        var requiredParameterNames = definition.QueryParameters
            .Where(parameter => parameter.Required)
            .Select(parameter => parameter.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var contextParameters = queryParameters
            .Where(parameter => requiredParameterNames.Contains(parameter.Key))
            .ToDictionary(parameter => parameter.Key, parameter => parameter.Value, StringComparer.OrdinalIgnoreCase);

        var fallbackFilters = queryParameters
            .Where(parameter => !requiredParameterNames.Contains(parameter.Key))
            .ToArray();

        if (fallbackFilters.Length == 0)
        {
            return null;
        }

        var fallbackSourceUri = BuildSourceUri(definition.Path, contextParameters);
        var fallbackStopwatch = Stopwatch.StartNew();
        var fallbackNormalized = await FetchNormalizedPayloadAsync(
            resource,
            definition,
            new PaginationQuery(),
            fallbackSourceUri,
            cancellationToken);
        fallbackStopwatch.Stop();

        var filteredItems = fallbackNormalized.Items
            .Where(item => MatchesAllFilters(item, fallbackFilters))
            .ToArray();

        if (filteredItems.Length == 0)
        {
            return null;
        }

        return new CachedPayload(
            DateTimeOffset.UtcNow,
            filteredItems,
            fallbackNormalized.Metadata,
            fallbackSourceUri,
            fallbackStopwatch.ElapsedMilliseconds);
    }

    private PaginatedEnvelope BuildEnvelope(
        string resource,
        PaginationQuery pagination,
        TceCeResourceDefinition definition,
        CachedPayload cachedPayload,
        bool cacheHit,
        long requestDurationMs)
    {
        var envelope = TceCePagination.CreateEnvelope(
            resource,
            cachedPayload.SourceUrl,
            pagination,
            definition,
            cachedPayload.Items,
            cachedPayload.Metadata,
            cachedPayload.CachedAtUtc,
            _options.CacheSeconds);

        envelope.Metadata["cacheHit"] = cacheHit;
        envelope.Metadata["requestDurationMs"] = requestDurationMs;
        envelope.Metadata["upstreamDurationMs"] = cachedPayload.UpstreamDurationMs;

        logger.LogInformation(
            "TCE-CE envelope ready. Resource: {Resource}. Page: {Page}. PageSize: {PageSize}. CacheHit: {CacheHit}. RequestDurationMs: {RequestDurationMs}. UpstreamDurationMs: {UpstreamDurationMs}. TotalItems: {TotalItems}",
            resource,
            envelope.Page,
            envelope.PageSize,
            cacheHit,
            requestDurationMs,
            cachedPayload.UpstreamDurationMs,
            envelope.TotalItems);

        return envelope;
    }

    private string BuildSourceUri(string path, IReadOnlyDictionary<string, string> queryParameters)
    {
        var baseUri = _options.BaseUrl.EndsWith('/') ? _options.BaseUrl : $"{_options.BaseUrl}/";
        var cleanedPath = path.TrimStart('/');
        var uriBuilder = new UriBuilder(new Uri(new Uri(baseUri), cleanedPath));

        if (queryParameters.Count == 0)
        {
            return uriBuilder.Uri.ToString();
        }

        var query = System.Web.HttpUtility.ParseQueryString(string.Empty);

        foreach (var parameter in queryParameters
                     .OrderBy(parameter => parameter.Key, StringComparer.OrdinalIgnoreCase)
                     .ThenBy(parameter => parameter.Value, StringComparer.Ordinal))
        {
            query[parameter.Key] = parameter.Value;
        }

        uriBuilder.Query = query.ToString() ?? string.Empty;
        return uriBuilder.Uri.ToString();
    }

    private static void ValidateRequiredQueryParameters(
        string resource,
        TceCeResourceDefinition definition,
        IReadOnlyDictionary<string, string> queryParameters)
    {
        var missingParameters = definition.QueryParameters
            .Where(parameter => parameter.Required)
            .Select(parameter => parameter.Name)
            .Where(parameterName =>
                !queryParameters.TryGetValue(parameterName, out var value) ||
                string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (missingParameters.Length > 0)
        {
            throw new MissingRequiredQueryParametersException(resource, missingParameters);
        }
    }

    private static bool ShouldTreatNotFoundAsEmptyPage(
        TceCeResourceDefinition definition,
        PaginationQuery pagination)
    {
        return TceCePagination.UsesSourcePagination(definition) && pagination.NormalizedPage > 1;
    }

    private static bool MatchesAllFilters(
        JsonObject item,
        IReadOnlyCollection<KeyValuePair<string, string>> filters)
    {
        return filters.All(filter =>
        {
            if (!item.TryGetPropertyValue(filter.Key, out var valueNode))
            {
                return false;
            }

            var filterValue = NormalizeFilterValue(filter.Value);
            var itemValue = NormalizeFilterValue(valueNode?.ToString());

            if (string.IsNullOrWhiteSpace(filterValue))
            {
                return true;
            }

            if (string.IsNullOrWhiteSpace(itemValue))
            {
                return false;
            }

            return itemValue.Contains(filterValue, StringComparison.OrdinalIgnoreCase);
        });
    }

    private static string NormalizeFilterValue(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value.Trim().Normalize(NormalizationForm.FormD);
        var characters = normalized
            .Where(character => CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            .ToArray();

        return new string(characters).Normalize(NormalizationForm.FormC);
    }

    private sealed record CachedPayload(
        DateTimeOffset CachedAtUtc,
        IReadOnlyList<JsonObject> Items,
        JsonObject Metadata,
        string SourceUrl,
        long UpstreamDurationMs);
}
