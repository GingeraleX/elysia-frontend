import { host } from "@/app/components/host";

export interface DeleteFileRecordsResult {
  success: boolean;
  deleted_count: number;
  error?: string;
}

/**
 * Delete all Weaviate records for a specific source file within a collection.
 * Also updates the Collection metadata_json to remove the file entry.
 */
export async function deleteFileRecords(
  collectionName: string,
  sourceFilename: string,
): Promise<DeleteFileRecordsResult> {
  const params = new URLSearchParams({
    collection_name: collectionName,
    source_filename: sourceFilename,
  });

  const response = await fetch(`${host}/api/files/records?${params}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    return { success: false, deleted_count: 0, error: data.error ?? "Unknown error" };
  }
  return { success: true, deleted_count: data.deleted_count ?? 0 };
}

