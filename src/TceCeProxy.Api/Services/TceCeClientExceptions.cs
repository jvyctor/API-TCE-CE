using System.Net;

namespace TceCeProxy.Api.Services;

public sealed class ResourceNotConfiguredException(string resource)
    : Exception($"O recurso '{resource}' nÃ£o estÃ¡ configurado.");

public sealed class MissingRequiredQueryParametersException(string resource, IReadOnlyList<string> missingParameters)
    : Exception(BuildMessage(resource, missingParameters))
{
    public IReadOnlyList<string> MissingParameters { get; } = missingParameters;

    private static string BuildMessage(string resource, IReadOnlyList<string> missingParameters)
    {
        var joinedParameters = string.Join(", ", missingParameters);
        return $"ParÃ¢metros obrigatÃ³rios ausentes para o recurso '{resource}': {joinedParameters}.";
    }
}

public sealed class UpstreamResourceNotFoundException(string resource, string url)
    : Exception($"O recurso remoto '{resource}' nÃ£o foi encontrado.")
{
    public string Resource { get; } = resource;

    public string Url { get; } = url;
}

public sealed class UpstreamRequestException(string resource, string url, HttpStatusCode statusCode, string? responseBody = null)
    : Exception($"Falha ao consultar o recurso '{resource}'. Status: {(int)statusCode}.")
{
    public string Resource { get; } = resource;

    public string Url { get; } = url;

    public HttpStatusCode StatusCode { get; } = statusCode;

    public string? ResponseBody { get; } = responseBody;
}

public sealed class UpstreamConnectivityException(string resource, string url, Exception innerException)
    : Exception($"NÃ£o foi possÃ­vel conectar ao recurso '{resource}'.", innerException)
{
    public string Resource { get; } = resource;

    public string Url { get; } = url;
}

public sealed class UpstreamPayloadException(string resource, string url, Exception? innerException = null)
    : Exception($"O serviÃ§o remoto retornou uma resposta invÃ¡lida para o recurso '{resource}'.", innerException)
{
    public string Resource { get; } = resource;

    public string Url { get; } = url;
}
