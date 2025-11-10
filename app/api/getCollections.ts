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
    const collections: Collection[] = (data.collections || []).map((col: any) => ({
      name: col.display_name || col.weaviate_collection_name || "Unknown Collection",
      total: col.record_count || 0,
      vectorizer: {
        fields: {},
        global: {
          named_vector: col.vector_field || "vector",
          vectorizer: col.embedder_provider || "local",
          model: col.embedder_model || "all-minilm-l6-v2",
        },
      },
      processed: col.processed || false,
      prompts: [],
    }));

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
