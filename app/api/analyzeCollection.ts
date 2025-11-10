import { host } from "@/app/components/host";

export async function analyzeCollection(
  tenant_id: string,
  collection_name: string
): Promise<{
  success: boolean;
  error: string;
  analysis?: {
    collection_name: string;
    record_count: number;
    sample_size: number;
    fields: Array<{
      name: string;
      dataType: string[];
      description: string;
    }>;
    sample_records: any[];
    statistics: {
      has_vector_field: boolean;
      field_count: number;
      sample_data_available: boolean;
    };
  };
}> {
  const startTime = performance.now();

  try {
    console.log(`[analyzeCollection] Starting analysis for: ${collection_name}`);

    const response = await fetch(`${host}/api/import/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_id,
        collection_name,
      }),
    });

    if (!response.ok) {
      console.error(
        `[analyzeCollection] Error! status: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      return {
        success: false,
        error: errorText || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    console.log(`[analyzeCollection] Analysis successful`, data);

    return data;
  } catch (error) {
    console.error("[analyzeCollection] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[analyzeCollection] took ${(performance.now() - startTime).toFixed(2)}ms`
      );
    }
  }
}

