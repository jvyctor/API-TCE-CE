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
                "Recurso nÃ£o configurado",
                resourceNotConfiguredException.Message),

            MissingRequiredQueryParametersException missingRequiredQueryParametersException => new(
                StatusCodes.Status400BadRequest,
                "ParÃ¢metros obrigatÃ³rios ausentes",
                missingRequiredQueryParametersException.Message,
                new Dictionary<string, object?>
                {
                    ["missingParameters"] = missingRequiredQueryParametersException.MissingParameters
                }),

            UpstreamResourceNotFoundException => new(
                StatusCodes.Status404NotFound,
                "Recurso remoto nÃ£o encontrado",
                "O recurso solicitado nÃ£o existe no serviÃ§o remoto."),

            UpstreamRequestException upstreamRequestException when upstreamRequestException.StatusCode == System.Net.HttpStatusCode.BadRequest => new(
                StatusCodes.Status400BadRequest,
                "ParÃ¢metros invÃ¡lidos para o endpoint do TCE-CE",
                "O serviÃ§o remoto rejeitou os parÃ¢metros informados."),

            UpstreamRequestException => new(
                StatusCodes.Status502BadGateway,
                "Falha na consulta ao TCE-CE",
                "O serviÃ§o remoto nÃ£o conseguiu processar a consulta."),

            UpstreamConnectivityException => new(
                StatusCodes.Status502BadGateway,
                "Falha de conectividade com o TCE-CE",
                "NÃ£o foi possÃ­vel concluir a comunicaÃ§Ã£o com o serviÃ§o remoto."),

            UpstreamPayloadException => new(
                StatusCodes.Status502BadGateway,
                "Resposta invÃ¡lida do TCE-CE",
                "O serviÃ§o remoto retornou um payload invÃ¡lido para esta consulta."),

            _ => new(
                StatusCodes.Status500InternalServerError,
                "Erro interno",
                "Ocorreu uma falha inesperada ao processar a requisiÃ§Ã£o.")
        };
    }
}

internal sealed record ProblemDescriptor(
    int StatusCode,
    string Title,
    string Detail,
    IReadOnlyDictionary<string, object?>? Extensions = null);
