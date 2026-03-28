using TceCeProxy.Api.Models;

namespace TceCeProxy.Api.Services;

public interface ITceCeResourceCatalog
{
    IReadOnlyDictionary<string, TceCeResourceDefinition> GetResources();

    bool TryGetResource(string resource, out TceCeResourceDefinition definition);
}
