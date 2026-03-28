using System.Text.Json.Nodes;

namespace TceCeProxy.Api.Models;

public sealed class PaginatedEnvelope
{
    public required string Resource { get; init; }

    public required string SourceUrl { get; init; }

    public int Page { get; init; }

    public int PageSize { get; init; }

    public int TotalItems { get; init; }

    public int TotalPages { get; init; }

    public IReadOnlyList<JsonObject> Items { get; init; } = [];

    public JsonObject Metadata { get; init; } = new();

    public DateTimeOffset CachedAtUtc { get; init; }

    public DateTimeOffset ExpiresAtUtc { get; init; }
}
