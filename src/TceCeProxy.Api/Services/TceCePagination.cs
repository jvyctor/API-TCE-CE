using System.Text.Json.Nodes;
using TceCeProxy.Api.Models;

namespace TceCeProxy.Api.Services;

public static class TceCePagination
{
    public static TceCePaginationMode ResolvePaginationMode(TceCeResourceDefinition definition)
    {
        if (definition.PaginationMode != TceCePaginationMode.Auto)
        {
            return definition.PaginationMode;
        }

        var parameters = definition.QueryParameters
            .Select(parameter => parameter.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        return parameters.Contains("quantidade") || parameters.Contains("deslocamento")
            ? TceCePaginationMode.Source
            : TceCePaginationMode.Local;
    }

    public static bool UsesSourcePagination(TceCeResourceDefinition definition)
    {
        return ResolvePaginationMode(definition) == TceCePaginationMode.Source;
    }

    public static IReadOnlyDictionary<string, string> ApplySourcePagination(
        TceCeResourceDefinition definition,
        PaginationQuery pagination,
        IReadOnlyDictionary<string, string> queryParameters)
    {
        if (!UsesSourcePagination(definition))
        {
            return queryParameters;
        }

        var parameters = new Dictionary<string, string>(queryParameters, StringComparer.OrdinalIgnoreCase)
        {
            ["quantidade"] = pagination.NormalizedPageSize.ToString(),
            ["deslocamento"] = ((pagination.NormalizedPage - 1) * pagination.NormalizedPageSize).ToString()
        };

        return parameters;
    }

    public static PaginatedEnvelope CreateEnvelope(
        string resource,
        string sourceUrl,
        PaginationQuery pagination,
        TceCeResourceDefinition definition,
        IReadOnlyList<JsonObject> items,
        JsonObject metadata,
        DateTimeOffset cachedAtUtc,
        int cacheSeconds)
    {
        var normalizedPage = pagination.NormalizedPage;
        var normalizedPageSize = pagination.NormalizedPageSize;
        var usesSourcePagination = UsesSourcePagination(definition);
        var paginationMode = ResolvePaginationMode(definition);

        if (!usesSourcePagination)
        {
            var localTotalItems = items.Count;
            var localTotalPages = localTotalItems == 0 ? 0 : (int)Math.Ceiling(localTotalItems / (double)normalizedPageSize);
            var skip = (normalizedPage - 1) * normalizedPageSize;
            var pageItems = items.Skip(skip).Take(normalizedPageSize).ToArray();
            var localMetadata = metadata.DeepClone().AsObject();
            localMetadata["sourcePagination"] = false;
            localMetadata["totalItemsExact"] = true;
            localMetadata["paginationMode"] = paginationMode.ToString();

            return new PaginatedEnvelope
            {
                Resource = resource,
                SourceUrl = sourceUrl,
                Page = normalizedPage,
                PageSize = normalizedPageSize,
                TotalItems = localTotalItems,
                TotalPages = localTotalPages,
                Items = pageItems,
                Metadata = localMetadata,
                CachedAtUtc = cachedAtUtc,
                ExpiresAtUtc = cachedAtUtc.AddSeconds(cacheSeconds)
            };
        }

        var hasMorePages = items.Count == normalizedPageSize;
        var normalizedMetadata = metadata.DeepClone().AsObject();
        var upstreamTotal = TryReadKnownTotal(normalizedMetadata);
        normalizedMetadata["hasMorePages"] = hasMorePages;
        normalizedMetadata["sourcePagination"] = true;
        normalizedMetadata["totalItemsExact"] = upstreamTotal.HasValue;
        normalizedMetadata["totalPagesExact"] = upstreamTotal.HasValue;
        normalizedMetadata["paginationMode"] = paginationMode.ToString();

        var knownItemCount = ((normalizedPage - 1) * normalizedPageSize) + items.Count;
        var totalItems = upstreamTotal ?? (hasMorePages ? knownItemCount + 1 : knownItemCount);
        var totalPages = upstreamTotal.HasValue
            ? (totalItems == 0 ? 0 : (int)Math.Ceiling(totalItems / (double)normalizedPageSize))
            : (hasMorePages ? normalizedPage + 1 : normalizedPage);

        return new PaginatedEnvelope
        {
            Resource = resource,
            SourceUrl = sourceUrl,
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            TotalItems = totalItems,
            TotalPages = totalPages,
            Items = items,
            Metadata = normalizedMetadata,
            CachedAtUtc = cachedAtUtc,
            ExpiresAtUtc = cachedAtUtc.AddSeconds(cacheSeconds)
        };
    }

    private static int? TryReadKnownTotal(JsonObject metadata)
    {
        if (metadata["total"] is JsonValue totalValue && totalValue.TryGetValue<int>(out var total))
        {
            return total;
        }

        if (metadata["count"] is JsonValue countValue && countValue.TryGetValue<int>(out var count))
        {
            return count;
        }

        return null;
    }
}
