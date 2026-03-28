using TceCeProxy.Api.Models;

namespace TceCeProxy.Api.Services;

public interface ITceCeClient
{
    Task<PaginatedEnvelope> GetResourcePageAsync(
        string resource,
        PaginationQuery pagination,
        IReadOnlyDictionary<string, string> queryParameters,
        CancellationToken cancellationToken);
}
