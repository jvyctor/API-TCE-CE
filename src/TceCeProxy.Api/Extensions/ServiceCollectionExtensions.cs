using Microsoft.Extensions.Diagnostics.HealthChecks;
using TceCeProxy.Api.Options;
using TceCeProxy.Api.Services;

namespace TceCeProxy.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTceCeApi(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddOptions<TceCeApiOptions>()
            .Bind(configuration.GetSection(TceCeApiOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddMemoryCache();
        services.AddProblemDetails();
        services.AddResponseCompression();
        services.AddSingleton<ITceCeResourceCatalog, TceCeSwaggerResourceCatalog>();
        services.AddHttpClient<ITceCeClient, TceCeClient>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
            .AddCheck<ResourceCatalogHealthCheck>("resource_catalog", tags: ["ready"]);
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        return services;
    }
}
