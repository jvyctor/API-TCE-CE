using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace TceCeProxy.Api.Services;

public sealed class ResourceCatalogHealthCheck(ITceCeResourceCatalog resourceCatalog) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var resourceCount = resourceCatalog.GetResources().Count;

        return Task.FromResult(resourceCount > 0
            ? HealthCheckResult.Healthy($"Resource catalog loaded with {resourceCount} endpoints.")
            : HealthCheckResult.Unhealthy("Resource catalog is empty."));
    }
}
