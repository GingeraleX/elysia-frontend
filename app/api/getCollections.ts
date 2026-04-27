import { CollectionPayload } from "@/app/types/payloads";
import { host } from "@/app/components/host";
import { Collection } from "../types/objects";

export async function getCollections(
  user_id: string | null | undefined,
): Promise<Collection[]> {
  const startTime = performance.now();
  try {
    if (!user_id) {
      console.warn(`[getCollections] No user_id provided, returning empty array`);
      return [];
    }

    console.log(`[getCollections] Fetching collections for user_id: ${user_id}`);
    const response = await fetch(`${host}/collections/${user_id}/list`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error(
        `[getCollections] Error! status: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data: CollectionPayload = await response.json();
    console.log(`[getCollections] Response received:`, data);
    
    // Transform backend response to Collection type
    const collections: Collection[] = (data.collections || []).map((col: any) => {
      // Resolve embedding model: direct field → metadata_json fallback → "not recorded"
      let embedModel: string = col.embedder_model || "";
      let embedProvider: string = col.embedder_provider || "";
      if (!embedModel && col.metadata_json) {
        try {
          const meta = typeof col.metadata_json === "string"
            ? JSON.parse(col.metadata_json)
            : col.metadata_json;
          if (meta?.embedder_model) embedModel = meta.embedder_model;
        } catch { /* ignore parse errors */ }
      }
      return {
        name: col.display_name || col.name || col.weaviate_collection_name || "Unknown Collection",
        total: col.total ?? col.record_count ?? 0,
        vectorizer: {
          fields: {},
          global: {
            named_vector: col.vector_field || "vector",
            vectorizer: embedProvider || "local",
            model: embedModel || "not recorded",
          },
        },
        processed: col.processed || col.status === "analyzed" || false,
        prompts: [],
        metadata_json: col.metadata_json ?? null,
      };
    });

    return collections;
  } catch (error) {
    console.error("Get Collections error:", error);
    return [];
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `collections/list took ${(performance.now() - startTime).toFixed(2)}ms`,
      );
    }
  }
}
