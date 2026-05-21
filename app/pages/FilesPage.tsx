"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  FolderClosed,
  FileText,
  ExternalLink,
  RefreshCw,
  Download,
  Trash2,
  Upload,
  Search,
  X,
} from "lucide-react";
import { CollectionContext } from "../components/contexts/CollectionContext";
import { RouterContext } from "../components/contexts/RouterContext";
import { SessionContext } from "../components/contexts/SessionContext";
import { ToastContext } from "../components/contexts/ToastContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  useContext(SessionContext);
  const { showErrorToast, showSuccessToast } = useContext(ToastContext);

  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMetadata, setHasMetadata] = useState(false);
  const [query, setQuery] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<{
    collection: string;
    filename: string;
  } | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

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
        try {
          meta = JSON.parse(col.metadata_json);
        } catch {
          continue;
        }
        const sourceFiles: string[] = (meta?.source_files as string[]) ?? [];
        const ingestedAt: string | undefined = meta?.ingested_at as
          | string
          | undefined;
        const recordCount: number | undefined = col.total;

        if (sourceFiles.length > 0) {
          foundAny = true;
          for (const filename of sourceFiles) {
            entries.push({
              filename,
              collection: col.name,
              ingestedAt,
              recordCount,
            });
          }
        }
      } catch {
        // skip
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

  const handleImportNewFile = () => changePage("data", {}, true);
  const viewCollection = (collectionName: string) =>
    changePage("collection", { source: collectionName }, true);

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const handleDownload = async (file: FileEntry) => {
    try {
      await downloadFileRecords(file.collection, file.filename);
    } catch (err) {
      showErrorToast("Download non riuscito", (err as Error).message);
    }
  };

  const handleDeleteConfirm = async (file: FileEntry) => {
    const key = `${file.collection}::${file.filename}`;
    setDeletingFile(key);
    try {
      const result = await deleteFileRecords(file.collection, file.filename);
      if (result.success) {
        showSuccessToast(
          "File eliminato",
          `Rimossi ${result.deleted_count} record da "${file.filename}"`
        );
        setFileEntries((prev) =>
          prev.filter(
            (e) =>
              !(e.collection === file.collection && e.filename === file.filename)
          )
        );
        setTimeout(() => fetchCollections(), 500);
      } else {
        showErrorToast(
          "Eliminazione non riuscita",
          result.error ?? "Errore sconosciuto"
        );
      }
    } catch (err) {
      showErrorToast("Eliminazione non riuscita", (err as Error).message);
    } finally {
      setDeletingFile(null);
      setDeleteConfirm(null);
    }
  };

  const isLoading = loading || loadingCollections;

  const grouped = useMemo(() => {
    const filtered = query.trim()
      ? fileEntries.filter(
          (e) =>
            e.filename.toLowerCase().includes(query.toLowerCase()) ||
            e.collection.toLowerCase().includes(query.toLowerCase())
        )
      : fileEntries;
    return filtered.reduce(
      (acc, entry) => {
        (acc[entry.collection] ||= []).push(entry);
        return acc;
      },
      {} as Record<string, FileEntry[]>
    );
  }, [fileEntries, query]);

  const totalFiles = fileEntries.length;
  const totalShown = Object.values(grouped).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto fade-in">
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-8">
        {/* ── Header ────────────────────────────── */}
        <header className="flex items-end justify-between gap-6 pb-5 mb-6 border-b border-border/40">
          <div className="min-w-0">
            <h1 className="text-[15px] font-medium text-primary tracking-tight leading-none">
              File
            </h1>
            <p className="mt-1.5 text-[12.5px] text-secondary/85 leading-relaxed">
              I documenti indicizzati da Elysia.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 text-[12.5px]">
              <RefreshCw className="h-3 w-3" strokeWidth={1.8} />
              Aggiorna
            </Button>
            <Button variant="primary" size="sm" onClick={handleImportNewFile} className="h-8 text-[12.5px]">
              <Upload className="h-3 w-3" strokeWidth={1.8} />
              Importa
            </Button>
          </div>
        </header>

        {/* ── Search + count ─────────────────────── */}
        {totalFiles > 0 && (
          <div className="mb-6 flex items-center gap-2.5 rounded-lg border border-border/40 bg-background_alt/30 px-3 h-9 focus-within:border-accent/40 transition-colors">
            <Search className="h-3.5 w-3.5 text-secondary/70 shrink-0" strokeWidth={1.8} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca file o raccolta…"
              className="flex-1 bg-transparent text-[12.5px] text-primary placeholder:text-secondary/60 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-secondary hover:text-primary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <span className="text-[11px] text-secondary/70 tabular-nums">
              {totalShown}/{totalFiles}
            </span>
          </div>
        )}

        {/* ── Content states ─────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : collections.length === 0 ? (
          <EmptyState
            icon={<FolderClosed className="h-5 w-5" strokeWidth={1.6} />}
            title="Nessuna raccolta ancora"
            description="Carica il tuo primo set di dati per cominciare. Elysia si occuperà del resto."
            cta={{
              label: "Importa i primi file",
              onClick: () => changePage("data", {}, true),
            }}
          />
        ) : !hasMetadata ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" strokeWidth={1.6} />}
            title="File non ancora indicizzati"
            description={`Hai ${collections.length} raccolta/e ma i metadati dei singoli file non sono ancora disponibili. Reimporta per vederli qui.`}
            cta={{
              label: "Vai a Dati",
              onClick: () => changePage("data", {}, true),
            }}
          />
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState
            icon={<Search className="h-5 w-5" strokeWidth={1.6} />}
            title="Nessun risultato"
            description={`Nessun file corrisponde a "${query}". Prova un altro termine.`}
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([collectionName, files], idx) => (
              <section
                key={collectionName}
                className="fade-in"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Collection title row */}
                <button
                  type="button"
                  onClick={() => viewCollection(collectionName)}
                  className="group/col flex w-full items-center gap-3 text-left mb-2"
                >
                  <h2 className="text-[12.5px] font-medium text-primary tracking-tight">
                    {collectionName}
                  </h2>
                  <span className="text-[11px] text-secondary/70">
                    {files.length} file
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-secondary/70 group-hover/col:text-accent transition-colors opacity-0 group-hover/col:opacity-100">
                    Apri raccolta
                    <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
                  </span>
                </button>

                {/* File rows */}
                <ul className="rounded-xl border border-border/40 bg-background_alt/20 backdrop-blur-sm divide-y divide-border/30 overflow-hidden">
                  {files.map((file) => {
                    const isConfirming =
                      deleteConfirm?.collection === file.collection &&
                      deleteConfirm?.filename === file.filename;
                    const isDeleting =
                      deletingFile === `${file.collection}::${file.filename}`;
                    const date = formatDate(file.ingestedAt);

                    return (
                      <li
                        key={file.filename}
                        className="group/file flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-foreground_alt/20"
                      >
                        <FileText className="h-3.5 w-3.5 text-secondary/70 shrink-0" strokeWidth={1.6} />
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <p className="text-[12.5px] text-primary truncate">
                            {file.filename}
                          </p>
                          {file.recordCount !== undefined && (
                            <span className="hidden md:inline text-[11px] text-secondary/65 shrink-0 tabular-nums">
                              {file.recordCount} record
                            </span>
                          )}
                        </div>
                        {date && (
                          <span className="hidden sm:inline text-[11px] text-secondary/65 shrink-0 tabular-nums">
                            {date}
                          </span>
                        )}

                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 pl-2">
                            <span className="text-[11px] text-error">
                              Eliminare?
                            </span>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-6 px-2 text-[11px]"
                              disabled={isDeleting}
                              onClick={() => handleDeleteConfirm(file)}
                            >
                              {isDeleting ? "…" : "Sì"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-[11px]"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/file:opacity-100 pl-2">
                            <IconBtn
                              title="Apri raccolta"
                              onClick={() => viewCollection(file.collection)}
                            >
                              <ExternalLink className="h-3 w-3" strokeWidth={1.8} />
                            </IconBtn>
                            <IconBtn
                              title="Scarica i record"
                              onClick={() => handleDownload(file)}
                            >
                              <Download className="h-3 w-3" strokeWidth={1.8} />
                            </IconBtn>
                            <IconBtn
                              title="Elimina"
                              destructive
                              onClick={() =>
                                setDeleteConfirm({
                                  collection: file.collection,
                                  filename: file.filename,
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" strokeWidth={1.8} />
                            </IconBtn>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Sub-components ─────────────── */

function IconBtn({
  children,
  onClick,
  title,
  destructive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`grid h-6 w-6 place-items-center rounded-md text-secondary/80 transition-colors ${
        destructive
          ? "hover:bg-error/10 hover:text-error"
          : "hover:bg-foreground_alt/60 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  icon,
  title,
  description,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-background_alt/20 px-6 py-12 text-center backdrop-blur-sm">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="text-[13px] font-medium text-primary tracking-tight">
        {title}
      </h3>
      <p className="max-w-sm text-[12px] leading-relaxed text-secondary/85">
        {description}
      </p>
      {cta && (
        <Button variant="primary" size="sm" onClick={cta.onClick} className="mt-1 h-8 text-[12.5px]">
          {cta.label}
        </Button>
      )}
    </div>
  );
}
