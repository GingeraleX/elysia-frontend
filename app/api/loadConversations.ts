import { SavedConversationPayload } from "@/app/types/payloads";
import { apiClient } from "@/lib/api-client";

export async function loadConversations(user_id: string) {
  const startTime = performance.now();
  try {
    const data = await apiClient.request<SavedConversationPayload>(
      `/db/${user_id}/saved_trees`,
      { method: "GET" },
    );
    return data;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return {
      trees: {},
      error: "Error fetching saved conversations",
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `loadConversations took ${(performance.now() - startTime).toFixed(2)}ms`,
      );
    }
  }
}
