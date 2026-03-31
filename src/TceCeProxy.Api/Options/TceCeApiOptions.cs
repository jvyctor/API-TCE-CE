using System.ComponentModel.DataAnnotations;
using TceCeProxy.Api.Models;

namespace TceCeProxy.Api.Options;

public sealed class TceCeApiOptions
{
    public const string SectionName = "TceCeApi";

    [Required]
    [Url]
    public string BaseUrl { get; init; } = "https://api.tcm.ce.gov.br/";

    [Range(30, 86400)]
    public int CacheSeconds { get; init; } = 300;

    public string? ApiKey { get; init; }

    public string? ApiKeyHeaderName { get; init; }

    public string SwaggerUiInitPath { get; init; } = "swagger-ui-init.js";

    public Dictionary<string, TceCeResourceDefinition> Resources { get; init; } = new(StringComparer.OrdinalIgnoreCase);
}
