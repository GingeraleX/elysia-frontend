"use client";

import React, { useContext, useEffect, useState } from "react";
import { LuFolder, LuFile, LuExternalLink, LuRefreshCw, LuDownload, LuTrash2 } from "react-icons/lu";
import { motion } from "framer-motion";
import { CollectionContext } from "../components/contexts/CollectionContext";
import { RouterContext } from "../components/contexts/RouterContext";
import { SessionContext } from "../components/contexts/SessionContext";
import { ToastContext } from "../components/contexts/ToastContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  SettingCard,
  SettingHeader,
  SettingGroup,
} from "../components/configuration/SettingComponents";
import { MdOutlineFolder } from "react-icons/md";
import { downloadFileRecords } from "@/app/api/downloadFileRecords";
import { deleteFileRecords } from "@/app/api/deleteFileRecords";

interface FileEntry {
  filename: string;
  collection: string;
  ingestedAt?: string;
  recordCount?: number;
}

export default function FilesPage() {
  const { collections, loadingCollections, fetchCollections } =
    useContext(CollectionContext);
  const { changePage } = useContext(RouterContext);
  useContext(SessionContext); // ensure user is authenticated
  const { showErrorToast, showSuccessToast } = useContext(ToastContext);

  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMetadata, setHasMetadata] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ collection: string; filename: string } | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null); // "collection::filename"

  const loadFileEntries = () => {
    if (collections.length === 0) {
      setFileEntries([]);
      setHasMetadata(false);
      return;
    }
    setLoading(true);

    const entries: FileEntry[] = [];
    let foundAny = false;

    for (const col of collections) {
      try {
        if (!col.metadata_json) continue;
        let meta: Record<string, unknown>;
        try { meta = JSON.parse(col.metadata_json); } catch { continue; }
        const sourceFiles: string[] = (meta?.source_files as string[]) ?? [];
        const ingestedAt: string | undefined = meta?.ingested_at as string | undefined;
        const recordCount: number | undefined = col.total;

        if (sourceFiles.length > 0) {
          foundAny = true;
          for (const filename of sourceFiles) {
            entries.push({ filename, collection: col.name, ingestedAt, recordCount });
          }
        }
      } catch {
        // Skip collections with unparseable metadata
      }
    }

    setHasMetadata(foundAny);
    setFileEntries(entries);
    setLoading(false);
  };

  useEffect(() => {
    loadFileEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections]);

  const handleRefresh = () => {
    fetchCollections();
    loadFileEntries();
  };

  const viewCollection = (collectionName: string) => {
    changePage("collection", { source: collectionName }, true);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  const handleDownload = async (file: FileEntry) => {
    try {
      await downloadFileRecords(file.collection, file.filename);
    } catch (err) {
      console.error("[FilesPage] Download error:", err);
      showErrorToast("Download failed", (err as Error).message);
    }
  };

  const handleDeleteConfirm = async (file: FileEntry) => {
    const key = `${file.collection}::${file.filename}`;
    setDeletingFile(key);
    try {
      const result = await deleteFileRecords(file.collection, file.filename);
      if (result.success) {
        showSuccessToast("File deleted", `Removed ${result.deleted_count} records from "${file.filename}"`);
        // Optimistically remove entry from local state
        setFileEntries((prev) =>
          prev.filter(
            (e) => !(e.collection === file.collection && e.filename === file.filename)
          )
        );
        // Refresh collections to update record counts
        setTimeout(() => fetchCollections(), 500);
      } else {
        showErrorToast("Delete failed", result.error ?? "Unknown error");
      }
    } catch (err) {
      console.error("[FilesPage] Delete error:", err);
      showErrorToast("Delete failed", (err as Error).message);
    } finally {
      setDeletingFile(null);
      setDeleteConfirm(null);
    }
  };

  const isLoading = loading || loadingCollections;

  return (
    <div className="flex flex-col w-full h-full gap-4 p-2 lg:p-4 fade-in">
      <SettingCard>
        <SettingHeader
          icon={<MdOutlineFolder />}
          className="bg-accent"
          header="Ingested Files"
          buttonIcon={<LuRefreshCw />}
          buttonText="Refresh"
          onClick={handleRefresh}
        />

        <SettingGroup>
          <p className="text-secondary text-sm">
            Browse source files from your ingested collections. File-level
            metadata is populated when you import data — older collections may
            not show individual files until re-imported.
          </p>
        </SettingGroup>
      </SettingCard>

      <SettingCard>
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="w-full h-14" />
            <Skeleton className="w-full h-14" />
            <Skeleton className="w-full h-14" />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-secondary">
            <LuFolder size={48} className="opacity-40" />
            <p className="text-lg font-medium">No collections found</p>
            <p className="text-sm text-center max-w-md">
              Import some data first using the{" "}
              <span
                className="text-accent cursor-pointer underline"
                onClick={() => changePage("import", {}, true)}
              >
                Import Data
              </span>{" "}
              page.
            </p>
          </div>
        ) : !hasMetadata ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-secondary">
            <LuFile size={48} className="opacity-40" />
            <p className="text-lg font-medium">No file-level metadata available</p>
            <p className="text-sm text-center max-w-md">
              File-level metadata is stored when you import data. Re-import
              your files to populate this view. You have{" "}
              <strong className="text-primary">{collections.length}</strong>{" "}
              collection(s) total — use{" "}
              <span
                className="text-accent cursor-pointer underline"
                onClick={() => changePage("data", {}, true)}
              >
                Dashboard
              </span>{" "}
              to browse them.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {/* Group entries by collection */}
            {Object.entries(
              fileEntries.reduce(
                (acc, entry) => {
                  if (!acc[entry.collection]) acc[entry.collection] = [];
                  acc[entry.collection].push(entry);
                  return acc;
                },
                {} as Record<string, FileEntry[]>
              )
            ).map(([collectionName, files], colIdx) => (
              <motion.div
                key={collectionName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.05 }}
                className="flex flex-col gap-2 mb-4"
              >
                {/* Collection header */}
                <div className="flex items-center gap-2 px-2">
                  <LuFolder size={16} className="text-accent shrink-0" />
                  <p className="text-primary font-semibold text-sm">
                    {collectionName}
                  </p>
                  <Badge className="text-xs bg-accent/10 text-accent border-accent/20">
                    {files.length} file{files.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <Separator />

                {/* File rows */}
                {files.map((file, fileIdx) => {
                  const isConfirmingDelete =
                    deleteConfirm?.collection === file.collection &&
                    deleteConfirm?.filename === file.filename;
                  const isDeleting =
                    deletingFile === `${file.collection}::${file.filename}`;

                  return (
                    <motion.div
                      key={fileIdx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: colIdx * 0.05 + fileIdx * 0.03 }}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-md bg-background_alt border border-foreground hover:bg-foreground/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <LuFile size={14} className="text-secondary shrink-0" />
                        <p className="text-primary text-sm truncate">
                          {file.filename}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {file.ingestedAt && (
                          <Badge className="text-xs bg-background_alt text-secondary hidden sm:flex">
                            {formatDate(file.ingestedAt)}
                          </Badge>
                        )}
                        {file.recordCount !== undefined && (
                          <Badge className="text-xs bg-background_alt text-secondary hidden md:flex">
                            {file.recordCount} records
                          </Badge>
                        )}

                        {/* View collection */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-1 text-accent"
                          onClick={() => viewCollection(file.collection)}
                        >
                          <LuExternalLink size={12} />
                          <span className="hidden sm:inline text-xs">View</span>
                        </Button>

                        {/* Download extracted records as JSON */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-secondary hover:text-primary"
                          title="Download extracted records as JSON"
                          onClick={() => handleDownload(file)}
                        >
                          <LuDownload size={12} />
                        </Button>

                        {/* Delete file records */}
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-destructive">Delete?</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs h-6 px-2"
                              disabled={isDeleting}
                              onClick={() => handleDeleteConfirm(file)}
                            >
                              {isDeleting ? "…" : "Yes"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-6 px-2"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-secondary hover:text-destructive"
                            title="Delete all records from this file"
                            onClick={() =>
                              setDeleteConfirm({
                                collection: file.collection,
                                filename: file.filename,
                              })
                            }
                          >
                            <LuTrash2 size={12} />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        )}
      </SettingCard>
    </div>
  );
}

