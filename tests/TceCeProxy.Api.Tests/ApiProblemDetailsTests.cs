using System.Net;
using Microsoft.AspNetCore.Http;
using TceCeProxy.Api.Extensions;
using TceCeProxy.Api.Services;
using Xunit;

namespace TceCeProxy.Api.Tests;

public sealed class ApiProblemDetailsTests
{
    [Fact]
    public void Map_ReturnsSanitizedProblemDescriptor_ForUpstreamBadRequest()
    {
        var descriptor = TceCeProblemMapping.Map(new UpstreamRequestException(
            "contrato",
            "https://example.test/contrato",
            HttpStatusCode.BadRequest,
            """{"secret":"value"}"""));

        Assert.Equal(StatusCodes.Status400BadRequest, descriptor.StatusCode);
        Assert.Equal("ParÃ¢metros invÃ¡lidos para o endpoint do TCE-CE", descriptor.Title);
        Assert.Equal("O serviÃ§o remoto rejeitou os parÃ¢metros informados.", descriptor.Detail);
        Assert.DoesNotContain("secret", descriptor.Detail, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("example.test", descriptor.Detail, StringComparison.OrdinalIgnoreCase);
    }
}
