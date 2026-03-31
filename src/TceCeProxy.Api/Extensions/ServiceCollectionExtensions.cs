using System.Net;
using System.Net.Http;
using System.Net.Sockets;
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
                client.Timeout = TimeSpan.FromSeconds(45);
                client.DefaultRequestVersion = HttpVersion.Version11;
                client.DefaultVersionPolicy = HttpVersionPolicy.RequestVersionOrLower;
            })
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
                ConnectTimeout = TimeSpan.FromSeconds(15),
                PooledConnectionLifetime = TimeSpan.FromMinutes(5),
                EnableMultipleHttp2Connections = false,
                ConnectCallback = async (context, cancellationToken) =>
                {
                    var addresses = await Dns.GetHostAddressesAsync(context.DnsEndPoint.Host, cancellationToken);
                    var ipv4Address = addresses.FirstOrDefault(address => address.AddressFamily == AddressFamily.InterNetwork);

                    if (ipv4Address is null)
                    {
                        throw new SocketException((int)SocketError.HostNotFound);
                    }

                    var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

                    try
                    {
                        await socket.ConnectAsync(
                            new IPEndPoint(ipv4Address, context.DnsEndPoint.Port),
                            cancellationToken);

                        return new NetworkStream(socket, ownsSocket: true);
                    }
                    catch
                    {
                        socket.Dispose();
                        throw;
                    }
                }
            });
        services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
            .AddCheck<ResourceCatalogHealthCheck>("resource_catalog", tags: ["ready"]);
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        return services;
    }
}
