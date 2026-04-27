import { host } from "@/app/components/host";

/**
 * Download the original source file that was ingested.
 * Falls back to downloading the extracted records as JSON if the original
 * file is not available (e.g. imported before file-saving was enabled).
 */
export async function downloadFileRecords(
  collectionName: string,
  sourceFilename: string,
  tenantId?: string,
): Promise<void> {
  // Try original file first
  const dlParams = new URLSearchParams({ collection_name: collectionName, source_filename: sourceFilename });
  if (tenantId) dlParams.set("tenant_id", tenantId);

  const dlRes = await fetch(`${host}/api/files/download?${dlParams}`);
  if (dlRes.ok) {
    const blob = await dlRes.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sourceFilename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // Fall back: download extracted records as JSON
  const recParams = new URLSearchParams({ collection_name: collectionName, source_filename: sourceFilename });
  const response = await fetch(`${host}/api/files/records?${recParams}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || `Download failed: ${response.status}`);
  }

  const data = await response.json();
  const blob = new Blob([JSON.stringify(data.records, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sourceFilename.replace(/\.[^.]+$/, "")}_records.json`;
  a.click();
  URL.revokeObjectURL(url);
}

