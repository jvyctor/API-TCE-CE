using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace TceCeProxy.Api.Extensions;

internal static class TceCeProblemDetailsWriter
{
    public static Task WriteAsync(HttpContext context)
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var problem = TceCeProblemMapping.Map(exception);

        context.Response.StatusCode = problem.StatusCode;
        context.Response.ContentType = "application/problem+json";

        var payload = new ProblemDetails
        {
            Status = problem.StatusCode,
            Title = problem.Title,
            Detail = problem.Detail,
            Instance = context.Request.Path
        };

        foreach (var extension in BuildExtensions(context, problem.Extensions))
        {
            payload.Extensions[extension.Key] = extension.Value;
        }

        return context.Response.WriteAsJsonAsync(payload, cancellationToken: context.RequestAborted);
    }

    private static Dictionary<string, object?> BuildExtensions(
        HttpContext context,
        IReadOnlyDictionary<string, object?>? additionalExtensions)
    {
        var extensions = new Dictionary<string, object?>
        {
            ["traceId"] = context.TraceIdentifier
        };

        if (additionalExtensions is null)
        {
            return extensions;
        }

        foreach (var extension in additionalExtensions)
        {
            extensions[extension.Key] = extension.Value;
        }

        return extensions;
    }
}
