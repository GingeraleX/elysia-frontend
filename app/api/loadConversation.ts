import { ConversationPayload } from "@/app/types/payloads";
import { apiClient } from "@/lib/api-client";

export async function loadConversation(
  user_id: string,
  conversation_id: string,
) {
  const startTime = performance.now();
  try {
    const data = await apiClient.request<ConversationPayload>(
      `/db/${user_id}/load_tree/${conversation_id}`,
      { method: "GET" },
    );
    return data;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return {
      rebuild: [],
      error: `Error fetching saved conversation ${conversation_id}`,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `loadConversation ${conversation_id} took ${(performance.now() - startTime).toFixed(2)}ms`,
      );
    }
  }
}
