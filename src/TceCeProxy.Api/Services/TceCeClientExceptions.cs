using System.Net;

namespace TceCeProxy.Api.Services;

public sealed class ResourceNotConfiguredException(string resource)
    : Exception($"O recurso '{resource}' não está configurado.");

public sealed class MissingRequiredQueryParametersException(string resource, IReadOnlyList<string> missingParameters)
    : Exception(BuildMessage(resource, missingParameters))
{
    public IReadOnlyList<string> MissingParameters { get; } = missingParameters;

    private static string BuildMessage(string resource, IReadOnlyList<string> missingParameters)
    {
        var joinedParameters = string.Join(", ", missingParameters);
        return $"Parâmetros obrigatórios ausentes para o recurso '{resource}': {joinedParameters}.";
    }
}

public sealed class UpstreamResourceNotFoundException(string resource, string url)
    : Exception($"O recurso remoto '{resource}' não foi encontrado em '{url}'.");

public sealed class UpstreamRequestException(string resource, string url, HttpStatusCode statusCode, string? responseBody = null)
    : Exception(BuildMessage(resource, url, statusCode, responseBody))
{
    public HttpStatusCode StatusCode { get; } = statusCode;

    public string? ResponseBody { get; } = responseBody;

    private static string BuildMessage(string resource, string url, HttpStatusCode statusCode, string? responseBody)
    {
        if (string.IsNullOrWhiteSpace(responseBody))
        {
            return $"Falha ao consultar o recurso '{resource}' em '{url}'. Status: {(int)statusCode}.";
        }

        return $"Falha ao consultar o recurso '{resource}' em '{url}'. Status: {(int)statusCode}. Resposta: {responseBody}";
    }
}

public sealed class UpstreamConnectivityException(string resource, string url, Exception innerException)
    : Exception($"Não foi possível conectar ao recurso '{resource}' em '{url}'.", innerException);
