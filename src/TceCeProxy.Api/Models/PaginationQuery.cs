namespace TceCeProxy.Api.Models;

public sealed class PaginationQuery
{
    public static readonly IReadOnlySet<string> ReservedKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    {
        "page",
        "pageSize"
    };

    public int Page { get; init; } = 1;

    public int PageSize { get; init; } = 25;

    public int NormalizedPage => Page < 1 ? 1 : Page;

    public int NormalizedPageSize => PageSize switch
    {
        < 1 => 25,
        > 250 => 250,
        _ => PageSize
    };
}
