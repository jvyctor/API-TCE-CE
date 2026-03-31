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
                client.Timeout = TimeSpan.FromSeconds(120);
                client.DefaultRequestVersion = HttpVersion.Version11;
                client.DefaultVersionPolicy = HttpVersionPolicy.RequestVersionOrLower;
            })
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
                ConnectTimeout = TimeSpan.FromSeconds(30),
                PooledConnectionLifetime = TimeSpan.FromMinutes(5),
                PooledConnectionIdleTimeout = TimeSpan.FromMinutes(2),
                EnableMultipleHttp2Connections = false,
                ConnectCallback = async (context, cancellationToken) =>
                {
                    var addresses = await Dns.GetHostAddressesAsync(context.DnsEndPoint.Host, cancellationToken);
                    var ipv4Addresses = addresses
                        .Where(address => address.AddressFamily == AddressFamily.InterNetwork)
                        .ToArray();

                    if (ipv4Addresses.Length == 0)
                    {
                        throw new SocketException((int)SocketError.HostNotFound);
                    }

                    Exception? lastException = null;

                    foreach (var ipv4Address in ipv4Addresses)
                    {
                        var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

                        try
                        {
                            await socket.ConnectAsync(
                                new IPEndPoint(ipv4Address, context.DnsEndPoint.Port),
                                cancellationToken);

                            return new NetworkStream(socket, ownsSocket: true);
                        }
                        catch (Exception exception)
                        {
                            lastException = exception;
                            socket.Dispose();
                        }
                    }

                    throw lastException ?? new SocketException((int)SocketError.NotConnected);
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
