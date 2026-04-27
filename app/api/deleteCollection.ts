import { host } from "@/app/components/host";

export interface DeleteCollectionResult {
  status: string;
  message: string;
}

/**
 * Delete a Weaviate collection by name via the custom backend endpoint.
 */
export async function deleteCollection(
  collectionName: string
): Promise<DeleteCollectionResult> {
  const startTime = performance.now();
  try {
    const response = await fetch(
      `${host}/api/custom/delete/${encodeURIComponent(collectionName)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        `[deleteCollection] Error! status: ${response.status}`,
        data
      );
      return {
        status: "error",
        message: data.message || response.statusText,
      };
    }

    return data;
  } catch (error) {
    console.error("[deleteCollection] Error:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `deleteCollection took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}

