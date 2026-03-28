using System.Text.Json.Nodes;
using TceCeProxy.Api.Models;
using TceCeProxy.Api.Services;
using Xunit;

namespace TceCeProxy.Api.Tests;

public sealed class TceCePaginationTests
{
    [Fact]
    public void ApplySourcePagination_OverridesQuantidadeAndDeslocamento_WhenResourceSupportsSourcePaging()
    {
        var definition = CreateDefinition("codigo_municipio", "quantidade", "deslocamento");
        var pagination = new PaginationQuery { Page = 3, PageSize = 50 };
        var query = new Dictionary<string, string>
        {
            ["codigo_municipio"] = "013",
            ["quantidade"] = "25",
            ["deslocamento"] = "0"
        };

        var result = TceCePagination.ApplySourcePagination(definition, pagination, query);

        Assert.Equal("50", result["quantidade"]);
        Assert.Equal("100", result["deslocamento"]);
        Assert.Equal("013", result["codigo_municipio"]);
    }

    [Fact]
    public void CreateEnvelope_UsesSourceItemsDirectly_WhenResourceUsesSourcePagination()
    {
        var definition = CreateDefinition("codigo_municipio", "quantidade", "deslocamento");
        var items = Enumerable.Range(1, 25)
            .Select(index => new JsonObject { ["id"] = index })
            .ToArray();
        var envelope = TceCePagination.CreateEnvelope(
            "contrato",
            "https://example.test/contrato?quantidade=25&deslocamento=25",
            new PaginationQuery { Page = 2, PageSize = 25 },
            definition,
            items,
            new JsonObject(),
            DateTimeOffset.Parse("2026-03-28T00:00:00Z"),
            300);

        Assert.Equal(25, envelope.Items.Count);
        Assert.Equal(2, envelope.Page);
        Assert.Equal(25, envelope.PageSize);
        Assert.Equal(51, envelope.TotalItems);
        Assert.Equal(3, envelope.TotalPages);
        Assert.True(envelope.Metadata["hasMorePages"]?.GetValue<bool>());
        Assert.False(envelope.Metadata["totalItemsExact"]?.GetValue<bool>());
    }

    [Fact]
    public void CreateEnvelope_PaginatesLocally_WhenResourceDoesNotUseSourcePagination()
    {
        var definition = CreateDefinition("codigo_municipio", "data_contrato");
        var items = Enumerable.Range(1, 80)
            .Select(index => new JsonObject { ["id"] = index })
            .ToArray();
        var envelope = TceCePagination.CreateEnvelope(
            "licitacoes",
            "https://example.test/licita",
            new PaginationQuery { Page = 2, PageSize = 25 },
            definition,
            items,
            new JsonObject(),
            DateTimeOffset.Parse("2026-03-28T00:00:00Z"),
            300);

        Assert.Equal(25, envelope.Items.Count);
        Assert.Equal(80, envelope.TotalItems);
        Assert.Equal(4, envelope.TotalPages);
        Assert.Equal(26, envelope.Items[0]["id"]?.GetValue<int>());
    }

    private static TceCeResourceDefinition CreateDefinition(params string[] parameterNames)
    {
        return new TceCeResourceDefinition
        {
            Path = "resource",
            QueryParameters = parameterNames
                .Select(name => new TceCeQueryParameterDefinition
                {
                    Name = name,
                    Required = true
                })
                .ToArray()
        };
    }
}
