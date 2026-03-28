using System.Net;
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

        var normalizedPage = pagination.NormalizedPage;
        var normalizedPageSize = pagination.NormalizedPageSize;
        var sourceUri = BuildSourceUri(definition.Path, queryParameters);
        var cacheKey = $"tcece::{resource}::{sourceUri}";

        var cachedPayload = await memoryCache.GetOrCreateAsync(cacheKey, async entry =>
        {
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
                return new CachedPayload(DateTimeOffset.UtcNow, normalized.Items, normalized.Metadata, sourceUri);
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

        var totalItems = cachedPayload!.Items.Count;
        var totalPages = totalItems == 0 ? 0 : (int)Math.Ceiling(totalItems / (double)normalizedPageSize);
        var skip = (normalizedPage - 1) * normalizedPageSize;
        var pageItems = cachedPayload.Items.Skip(skip).Take(normalizedPageSize).ToArray();

        return new PaginatedEnvelope
        {
            Resource = resource,
            SourceUrl = cachedPayload.SourceUrl,
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            Items = pageItems,
            Metadata = cachedPayload.Metadata,
            CachedAtUtc = cachedPayload.CachedAtUtc,
            ExpiresAtUtc = cachedPayload.CachedAtUtc.AddSeconds(_options.CacheSeconds)
        };
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
        string SourceUrl);
}
