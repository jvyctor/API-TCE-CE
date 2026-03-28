using System.Net;
using System.Diagnostics;
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
            var upstreamStopwatch = Stopwatch.StartNew();
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(_options.CacheSeconds);

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, sourceUri);

                if (!string.IsNullOrWhiteSpace(_options.ApiKey) && !string.IsNullOrWhiteSpace(_options.ApiKeyHeaderName))
                {
                    request.Headers.TryAddWithoutValidation(_options.ApiKeyHeaderName, _options.ApiKey);
                }

                using var response = await httpClient.SendAsync(request, cancellationToken);

                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    throw new UpstreamResourceNotFoundException(resource, sourceUri);
                }

                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync(cancellationToken);

                    logger.LogWarning(
                        "Falha ao consultar o TCE-CE. Status: {StatusCode}. Resource: {Resource}. Url: {Url}. Body: {Body}",
                        (int)response.StatusCode,
                        resource,
                        sourceUri,
                        body);

                    throw new UpstreamRequestException(resource, sourceUri, response.StatusCode, body);
                }

                await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
                var rootNode = await JsonNode.ParseAsync(responseStream, cancellationToken: cancellationToken);

                if (rootNode is null)
                {
                    throw new UpstreamRequestException(resource, sourceUri, HttpStatusCode.NoContent);
                }

                var normalized = TceCeResponseParser.Normalize(rootNode);
                upstreamStopwatch.Stop();

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
        });

        return BuildEnvelope(
            resource,
            pagination,
            definition,
            cachedPayload!,
            cacheHit: false,
            requestDurationMs: requestStopwatch.ElapsedMilliseconds);
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

        foreach (var parameter in queryParameters)
        {
            query[parameter.Key] = parameter.Value;
        }

        uriBuilder.Query = query.ToString() ?? string.Empty;
        return uriBuilder.Uri.ToString();
    }

    private sealed record CachedPayload(
        DateTimeOffset CachedAtUtc,
        IReadOnlyList<JsonObject> Items,
        JsonObject Metadata,
        string SourceUrl,
        long UpstreamDurationMs);
}
