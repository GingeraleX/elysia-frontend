import { BasePayload } from "@/app/types/payloads";
import { host } from "@/app/components/host";

export async function saveConversation(
  user_id: string,
  conversation_id: string,
  title: string,
  rebuild: unknown[],
): Promise<BasePayload> {
  const startTime = performance.now();
  try {
    const response = await fetch(
      `${host}/db/${user_id}/save_tree/${conversation_id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, rebuild }),
      },
    );

    if (!response.ok) {
      console.error(
        `Error saving conversation ${conversation_id}! status: ${response.status} ${response.statusText}`,
      );
      return {
        error: `Error saving conversation ${conversation_id}`,
      };
    }

    const data: BasePayload = await response.json();
    return data;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return {
      error: `Error saving conversation ${conversation_id}`,
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `saveConversation ${conversation_id} took ${(performance.now() - startTime).toFixed(2)}ms`,
      );
    }
  }
}

