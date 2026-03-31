using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using TceCeProxy.Api.Models;
using TceCeProxy.Api.Options;
using TceCeProxy.Api.Services;
using Xunit;

namespace TceCeProxy.Api.Tests;

public sealed class TceCeSwaggerResourceCatalogTests
{
    [Fact]
    public void GetResources_NormalizesFallbackDefinitions_WhenSwaggerFileIsMissing()
    {
        var tempPath = Path.Combine(Path.GetTempPath(), $"tcece-{Guid.NewGuid():N}");
        Directory.CreateDirectory(tempPath);

        try
        {
            var catalog = new TceCeSwaggerResourceCatalog(
                new FakeEnvironment(tempPath),
                Microsoft.Extensions.Options.Options.Create(new TceCeApiOptions
                {
                    SwaggerUiInitPath = "missing-swagger.js",
                    Resources = new Dictionary<string, TceCeResourceDefinition>(StringComparer.OrdinalIgnoreCase)
                    {
                        ["licitacoes"] = new()
                        {
                            Path = "licitacoes",
                            RequiredQueryParameters = ["codigo_municipio", "data_realizacao_autuacao_licitacao"],
                            OptionalQueryParameters = ["numero_licitacao"]
                        }
                    }
                }),
                NullLogger<TceCeSwaggerResourceCatalog>.Instance);

            var licitacoes = Assert.Single(catalog.GetResources()).Value;

            Assert.Equal(2, licitacoes.RequiredQueryParameters.Length);
            Assert.Equal(3, licitacoes.QueryParameters.Length);
            Assert.Contains(licitacoes.QueryParameters, parameter => parameter.Name == "codigo_municipio" && parameter.Required);
            Assert.Contains(licitacoes.QueryParameters, parameter => parameter.Name == "numero_licitacao" && !parameter.Required);
        }
        finally
        {
            Directory.Delete(tempPath, recursive: true);
        }
    }

    private sealed class FakeEnvironment(string contentRootPath) : IHostEnvironment
    {
        public string ApplicationName { get; set; } = "TceCeProxy.Api.Tests";

        public IFileProvider ContentRootFileProvider { get; set; } = null!;

        public string ContentRootPath { get; set; } = contentRootPath;

        public string EnvironmentName { get; set; } = Environments.Development;
    }
}
