namespace TceCeProxy.Api.Models;

public sealed class TceCeQueryParameterDefinition
{
    public string Name { get; init; } = string.Empty;

    public bool Required { get; init; }

    public string? Description { get; init; }

    public string? Type { get; init; }
}
