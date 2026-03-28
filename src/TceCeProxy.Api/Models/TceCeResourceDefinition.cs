using System.ComponentModel.DataAnnotations;

namespace TceCeProxy.Api.Models;

public sealed class TceCeResourceDefinition
{
    [Required]
    public string Path { get; init; } = string.Empty;

    public string? Description { get; init; }

    public string? Category { get; init; }

    public string[] RequiredQueryParameters { get; init; } = [];

    public string[] OptionalQueryParameters { get; init; } = [];

    public TceCeQueryParameterDefinition[] QueryParameters { get; init; } = [];

    public bool RequiresAuthentication { get; init; }

    public TceCePaginationMode PaginationMode { get; init; } = TceCePaginationMode.Auto;
}
