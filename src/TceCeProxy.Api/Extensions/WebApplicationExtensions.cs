using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TceCeProxy.Api.Models;
using TceCeProxy.Api.Options;
using TceCeProxy.Api.Services;

namespace TceCeProxy.Api.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseTceCeApi(this WebApplication app)
    {
        app.UseResponseCompression();
        app.UseExceptionHandler(exceptionApp =>
        {
            exceptionApp.Run(TceCeProblemDetailsWriter.WriteAsync);
        });
        app.UseSwagger();
        app.UseSwaggerUI();

        return app;
    }

    public static WebApplication MapTceCeApi(this WebApplication app)
    {
        app.MapGet("/", () => Results.Redirect("/swagger"));

        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = registration => registration.Tags.Contains("live")
        });

        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = registration => registration.Tags.Contains("ready")
        });

        app.MapHealthChecks("/health");

        app.MapGet("/api/resources", (IOptions<TceCeApiOptions> options, ITceCeResourceCatalog catalog) =>
        {
            var configuredResources = catalog.GetResources()
                .OrderBy(resource => resource.Value.Category)
                .ThenBy(resource => resource.Key)
                .Select(resource => new
                {
                    resource.Key,
                    resource.Value.Path,
                    resource.Value.Category,
                    resource.Value.Description,
                    resource.Value.RequiredQueryParameters,
                    resource.Value.OptionalQueryParameters,
                    resource.Value.QueryParameters,
                    resource.Value.RequiresAuthentication
                });

            return Results.Ok(new
            {
                BaseUrl = options.Value.BaseUrl,
                Resources = configuredResources
            });
        })
        .WithName("ListResources")
        .WithSummary("Lista os recursos remotos configurados.");

        app.MapGet("/api/resources/{resource}", async (
            string resource,
            HttpRequest request,
            [AsParameters] PaginationQuery pagination,
            ITceCeClient client,
            CancellationToken cancellationToken) =>
        {
            var forwardedQuery = request.Query
                .Where(entry => !PaginationQuery.ReservedKeys.Contains(entry.Key))
                .ToDictionary(entry => entry.Key, entry => entry.Value.ToString(), StringComparer.OrdinalIgnoreCase);

            var response = await client.GetResourcePageAsync(resource, pagination, forwardedQuery, cancellationToken);

            return Results.Ok(response);
        })
        .WithName("GetResourcePage")
        .WithSummary("Retorna uma pÃ¡gina de um recurso remoto do TCE-CE.")
        .Produces<PaginatedEnvelope>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status502BadGateway);

        return app;
    }
}
