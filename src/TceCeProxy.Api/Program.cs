using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Mvc;
using TceCeProxy.Api.Models;
using TceCeProxy.Api.Options;
using TceCeProxy.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<TceCeApiOptions>()
    .Bind(builder.Configuration.GetSection(TceCeApiOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddMemoryCache();
builder.Services.AddHealthChecks();
builder.Services.AddProblemDetails();
builder.Services.AddSingleton<ITceCeResourceCatalog, TceCeSwaggerResourceCatalog>();
builder.Services.AddHttpClient<ITceCeClient, TceCeClient>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler(exceptionApp =>
{
    exceptionApp.Run(async context =>
    {
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;

        var (statusCode, title) = exception switch
        {
            ResourceNotConfiguredException => (StatusCodes.Status404NotFound, "Recurso não configurado"),
            UpstreamResourceNotFoundException => (StatusCodes.Status404NotFound, "Recurso remoto não encontrado"),
            UpstreamRequestException upstream when upstream.StatusCode == System.Net.HttpStatusCode.BadRequest
                => (StatusCodes.Status400BadRequest, "Parâmetros inválidos para o endpoint do TCE-CE"),
            UpstreamRequestException => (StatusCodes.Status502BadGateway, "Falha na consulta ao TCE-CE"),
            UpstreamConnectivityException => (StatusCodes.Status502BadGateway, "Falha de conectividade com o TCE-CE"),
            _ => (StatusCodes.Status500InternalServerError, "Erro interno")
        };

        context.Response.StatusCode = statusCode;

        await Results.Problem(
            title: title,
            detail: exception?.Message,
            statusCode: statusCode)
            .ExecuteAsync(context);
    });
});

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/", () => Results.Redirect("/swagger"));

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
.WithSummary("Retorna uma página de um recurso remoto do TCE-CE.")
.Produces<PaginatedEnvelope>(StatusCodes.Status200OK)
.ProducesProblem(StatusCodes.Status400BadRequest)
.ProducesProblem(StatusCodes.Status404NotFound)
.ProducesProblem(StatusCodes.Status502BadGateway);

app.Run();
