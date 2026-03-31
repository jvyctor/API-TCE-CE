using TceCeProxy.Api.Services;

namespace TceCeProxy.Api.Extensions;

internal static class TceCeProblemMapping
{
    public static ProblemDescriptor Map(Exception? exception)
    {
        return exception switch
        {
            ResourceNotConfiguredException resourceNotConfiguredException => new(
                StatusCodes.Status404NotFound,
                "Recurso nao configurado",
                resourceNotConfiguredException.Message),

            MissingRequiredQueryParametersException missingRequiredQueryParametersException => new(
                StatusCodes.Status400BadRequest,
                "Parametros obrigatorios ausentes",
                missingRequiredQueryParametersException.Message,
                new Dictionary<string, object?>
                {
                    ["missingParameters"] = missingRequiredQueryParametersException.MissingParameters
                }),

            UpstreamResourceNotFoundException => new(
                StatusCodes.Status404NotFound,
                "Recurso remoto nao encontrado",
                "O recurso solicitado nao existe no servico remoto."),

            UpstreamRequestException upstreamRequestException when upstreamRequestException.StatusCode == System.Net.HttpStatusCode.BadRequest => new(
                StatusCodes.Status400BadRequest,
                "Parametros invalidos para o endpoint do TCE-CE",
                "O servico remoto rejeitou os parametros informados."),

            UpstreamRequestException => new(
                StatusCodes.Status502BadGateway,
                "Falha na consulta ao TCE-CE",
                "O servico remoto nao conseguiu processar a consulta."),

            UpstreamConnectivityException upstreamConnectivityException => new(
                StatusCodes.Status502BadGateway,
                "Falha de conectividade com o TCE-CE",
                "Nao foi possivel concluir a comunicacao com o servico remoto.",
                new Dictionary<string, object?>
                {
                    ["innerError"] = upstreamConnectivityException.InnerException?.Message
                }),

            UpstreamPayloadException => new(
                StatusCodes.Status502BadGateway,
                "Resposta invalida do TCE-CE",
                "O servico remoto retornou um payload invalido para esta consulta."),

            _ => new(
                StatusCodes.Status500InternalServerError,
                "Erro interno",
                "Ocorreu uma falha inesperada ao processar a requisicao.")
        };
    }
}

internal sealed record ProblemDescriptor(
    int StatusCode,
    string Title,
    string Detail,
    IReadOnlyDictionary<string, object?>? Extensions = null);
