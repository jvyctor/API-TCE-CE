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

    [Fact]
    public void GetResources_LoadsSwaggerFromParentDirectory_WhenFileIsOutsideContentRoot()
    {
        var tempPath = Path.Combine(Path.GetTempPath(), $"tcece-{Guid.NewGuid():N}");
        var contentRootPath = Path.Combine(tempPath, "src", "TceCeProxy.Api");
        Directory.CreateDirectory(contentRootPath);

        try
        {
            File.WriteAllText(
                Path.Combine(tempPath, "swagger-ui-init.js"),
                """
                window.onload = function() {
                  var options = {
                    "swaggerDoc": {
                      "openapi": "3.0.0",
                      "paths": {
                        "/funcoes": {
                          "get": {
                            "summary": "Relacao de funcoes",
                            "parameters": [
                              {
                                "name": "codigo_municipio",
                                "required": true,
                                "in": "query",
                                "schema": { "type": "string" }
                              }
                            ],
                            "tags": ["Documentacao referente a Orcamento municipal - SIM"]
                          }
                        }
                      }
                    }
                  };
                };
                """);

            var catalog = new TceCeSwaggerResourceCatalog(
                new FakeEnvironment(contentRootPath),
                Options.Create(new TceCeApiOptions
                {
                    SwaggerUiInitPath = "swagger-ui-init.js",
                    Resources = new Dictionary<string, TceCeResourceDefinition>(StringComparer.OrdinalIgnoreCase)
                }),
                NullLogger<TceCeSwaggerResourceCatalog>.Instance);

            Assert.True(catalog.TryGetResource("funcoes", out var resource));
            Assert.Equal("funcoes", resource.Path);
            Assert.Equal("Orcamento municipal", resource.Category);
            Assert.Contains(resource.QueryParameters, parameter => parameter.Name == "codigo_municipio" && parameter.Required);
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
