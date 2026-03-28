using System.Text.Json.Nodes;

namespace TceCeProxy.Api.Services;

internal static class TceCeResponseParser
{
    private static readonly string[] CandidateCollectionProperties = ["data", "items", "results", "records"];

    public static (IReadOnlyList<JsonObject> Items, JsonObject Metadata) Normalize(JsonNode root)
    {
        return root switch
        {
            JsonArray array => (ToObjectList(array), new JsonObject()),
            JsonObject obj => NormalizeObject(obj),
            _ => ([], new JsonObject { ["value"] = root.ToJsonString() })
        };
    }

    private static (IReadOnlyList<JsonObject> Items, JsonObject Metadata) NormalizeObject(JsonObject obj)
    {
        foreach (var property in CandidateCollectionProperties)
        {
            if (obj[property] is JsonArray array)
            {
                var metadata = new JsonObject();

                foreach (var entry in obj)
                {
                    if (!string.Equals(entry.Key, property, StringComparison.OrdinalIgnoreCase))
                    {
                        metadata[entry.Key] = entry.Value?.DeepClone();
                    }
                }

                return (ToObjectList(array), metadata);
            }
        }

        return ([obj.DeepClone().AsObject()], new JsonObject());
    }

    private static IReadOnlyList<JsonObject> ToObjectList(JsonArray array)
    {
        var items = new List<JsonObject>(array.Count);

        foreach (var node in array)
        {
            if (node is JsonObject obj)
            {
                items.Add(obj.DeepClone().AsObject());
                continue;
            }

            items.Add(new JsonObject
            {
                ["value"] = node?.DeepClone()
            });
        }

        return items;
    }
}
