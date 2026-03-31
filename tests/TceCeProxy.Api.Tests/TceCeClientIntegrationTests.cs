using System.Net;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using TceCeProxy.Api.Models;
using TceCeProxy.Api.Options;
using TceCeProxy.Api.Services;
using Xunit;

namespace TceCeProxy.Api.Tests;

public sealed class TceCeClientIntegrationTests
{
    [Fact]
    public async Task GetResourcePageAsync_UsesSourcePaginationAndCachesResponse()
    {
        var handler = new FakeHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    """
                    [
                      { "id": 26 },
                      { "id": 27 }
                    ]
                    """,
                    Encoding.UTF8,
                    "application/json")
            });

        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        using var httpClient = new HttpClient(handler);
        var client = CreateClient(
            httpClient,
            memoryCache,
            new Dictionary<string, TceCeResourceDefinition>(StringComparer.OrdinalIgnoreCase)
            {
                ["contrato"] = new()
                {
                    Path = "contrato",
                    PaginationMode = TceCePaginationMode.Source,
                    QueryParameters =
                    [
                        new() { Name = "codigo_municipio", Required = true },
                        new() { Name = "data_contrato", Required = true },
                        new() { Name = "quantidade", Required = true },
                        new() { Name = "deslocamento", Required = true }
                    ]
                }
            });

        var pagination = new PaginationQuery { Page = 2, PageSize = 25 };
        var parameters = new Dictionary<string, string>
        {
            ["codigo_municipio"] = "013",
            ["data_contrato"] = "2025-01-01_2025-12-31"
        };

        var first = await client.GetResourcePageAsync("contrato", pagination, parameters, CancellationToken.None);
        var second = await client.GetResourcePageAsync("contrato", pagination, parameters, CancellationToken.None);

        Assert.Equal(1, handler.CallCount);
        Assert.Contains("quantidade=25", handler.RequestUris[0]);
        Assert.Contains("deslocamento=25", handler.RequestUris[0]);
        Assert.Equal(2, first.Items.Count);
        Assert.Equal(2, first.Page);
        Assert.True(first.Metadata["sourcePagination"]?.GetValue<bool>());
        Assert.False(first.Metadata["cacheHit"]?.GetValue<bool>());
        Assert.True(second.Metadata["cacheHit"]?.GetValue<bool>());
    }

    [Fact]
    public async Task GetResourcePageAsync_PaginatesLocally_WhenResourceUsesLocalPagination()
    {
        var handler = new FakeHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    """
                    [
                      { "id": 1 },
                      { "id": 2 },
                      { "id": 3 }
                    ]
                    """,
                    Encoding.UTF8,
                    "application/json")
            });

        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        using var httpClient = new HttpClient(handler);
        var client = CreateClient(
            httpClient,
            memoryCache,
            new Dictionary<string, TceCeResourceDefinition>(StringComparer.OrdinalIgnoreCase)
            {
                ["licitacoes"] = new()
                {
                    Path = "licitacoes",
                    PaginationMode = TceCePaginationMode.Local,
                    QueryParameters =
                    [
                        new() { Name = "codigo_municipio", Required = true },
                        new() { Name = "data_realizacao_autuacao_licitacao", Required = true }
                    ]
                }
            });

        var page = await client.GetResourcePageAsync(
            "licitacoes",
            new PaginationQuery { Page = 2, PageSize = 1 },
            new Dictionary<string, string>
            {
                ["codigo_municipio"] = "013",
                ["data_realizacao_autuacao_licitacao"] = "2025-01-01_2025-12-31"
            },
            CancellationToken.None);

        Assert.Equal(1, handler.CallCount);
        Assert.DoesNotContain("quantidade=", handler.RequestUris[0]);
        Assert.Single(page.Items);
        Assert.Equal(3, page.TotalItems);
        Assert.Equal(3, page.TotalPages);
        Assert.False(page.Metadata["sourcePagination"]?.GetValue<bool>());
        Assert.True(page.Metadata["totalItemsExact"]?.GetValue<bool>());
    }

    [Fact]
    public async Task GetResourcePageAsync_ReturnsEmptyPage_WhenSourcePaginationExceedsAvailableItemsAndUpstreamReturnsNotFound()
    {
        var handler = new FakeHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.NotFound));

        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        using var httpClient = new HttpClient(handler);
        var client = CreateClient(
            httpClient,
            memoryCache,
            new Dictionary<string, TceCeResourceDefinition>(StringComparer.OrdinalIgnoreCase)
            {
                ["agentes_publicos"] = new()
                {
                    Path = "agentes_publicos",
                    PaginationMode = TceCePaginationMode.Source,
                    QueryParameters =
                    [
                        new() { Name = "codigo_municipio", Required = true },
                        new() { Name = "exercicio_orcamento", Required = true },
                        new() { Name = "quantidade", Required = true },
                        new() { Name = "deslocamento", Required = true }
                    ]
                }
            });

        var page = await client.GetResourcePageAsync(
            "agentes_publicos",
            new PaginationQuery { Page = 2, PageSize = 250 },
            new Dictionary<string, string>
            {
                ["codigo_municipio"] = "016",
                ["exercicio_orcamento"] = "202500"
            },
            CancellationToken.None);

        Assert.Equal(1, handler.CallCount);
        Assert.Contains("quantidade=250", handler.RequestUris[0]);
        Assert.Contains("deslocamento=250", handler.RequestUris[0]);
        Assert.Empty(page.Items);
        Assert.Equal(2, page.Page);
        Assert.Equal(250, page.PageSize);
        Assert.Equal(250, page.TotalItems);
        Assert.Equal(2, page.TotalPages);
        Assert.True(page.Metadata["sourcePagination"]?.GetValue<bool>());
        Assert.False(page.Metadata["hasMorePages"]?.GetValue<bool>());
        Assert.False(page.Metadata["totalItemsExact"]?.GetValue<bool>());
        Assert.False(page.Metadata["totalPagesExact"]?.GetValue<bool>());
    }

    [Fact]
    public async Task GetResourcePageAsync_ThrowsUpstreamPayloadException_WhenUpstreamReturnsInvalidJson()
    {
        var handler = new FakeHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("not-json", Encoding.UTF8, "application/json")
            });

        using var memoryCache = new MemoryCache(new MemoryCacheOptions());
        using var httpClient = new HttpClient(handler);
        var client = CreateClient(
            httpClient,
            memoryCache,
            new Dictionary<string, TceCeResourceDefinition>(StringComparer.OrdinalIgnoreCase)
            {
                ["contrato"] = new()
                {
                    Path = "contrato",
                    PaginationMode = TceCePaginationMode.Source,
                    QueryParameters =
                    [
                        new() { Name = "codigo_municipio", Required = true },
                        new() { Name = "data_contrato", Required = true },
                        new() { Name = "quantidade", Required = true },
                        new() { Name = "deslocamento", Required = true }
                    ]
                }
            });

        await Assert.ThrowsAsync<UpstreamPayloadException>(() => client.GetResourcePageAsync(
            "contrato",
            new PaginationQuery { Page = 1, PageSize = 25 },
            new Dictionary<string, string>
            {
                ["codigo_municipio"] = "013",
                ["data_contrato"] = "2025-01-01_2025-12-31"
            },
            CancellationToken.None));
    }

    private static TceCeClient CreateClient(
        HttpClient httpClient,
        IMemoryCache memoryCache,
        IReadOnlyDictionary<string, TceCeResourceDefinition> resources)
    {
        return new TceCeClient(
            httpClient,
            memoryCache,
            Microsoft.Extensions.Options.Options.Create(new TceCeApiOptions
            {
                BaseUrl = "https://example.test/",
                CacheSeconds = 300
            }),
            new FakeResourceCatalog(resources),
            NullLogger<TceCeClient>.Instance);
    }

    private sealed class FakeResourceCatalog(
        IReadOnlyDictionary<string, TceCeResourceDefinition> resources) : ITceCeResourceCatalog
    {
        public IReadOnlyDictionary<string, TceCeResourceDefinition> GetResources() => resources;

        public bool TryGetResource(string resource, out TceCeResourceDefinition definition)
            => resources.TryGetValue(resource, out definition!);
    }

    private sealed class FakeHttpMessageHandler(
        Func<HttpRequestMessage, HttpResponseMessage> responseFactory) : HttpMessageHandler
    {
        public int CallCount { get; private set; }

        public List<string> RequestUris { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            CallCount++;
            RequestUris.Add(request.RequestUri!.ToString());
            return Task.FromResult(responseFactory(request));
        }
    }
}
