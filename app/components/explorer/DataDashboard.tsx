"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Collection } from "@/app/types/objects";
import { LoadingSpinner } from "@/app/components/loading/LoadingSpinner";

import { CollectionContext } from "../contexts/CollectionContext";
import { SessionContext } from "../contexts/SessionContext";
import { ToastContext } from "../contexts/ToastContext";
import { ProcessingContext } from "../contexts/ProcessingContext";
import { RouterContext } from "../contexts/RouterContext";

import {
  Search,
  X,
  Database,
  FileText,
  Sparkles,
  RotateCw,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  Upload,
  AlertTriangle,
} from "lucide-react";

import { deleteAllCollectionMetadata } from "@/app/api/deleteAllCollectionMetadata";
import { deleteCollection as deleteWeaviateCollection } from "@/app/api/deleteCollection";
import ImportDataPage from "@/app/pages/ImportDataPage";

const fmtNumber = (n: number) =>
  new Intl.NumberFormat("it-IT").format(Number.isFinite(n) ? n : 0);

type FilterTab = "all" | "ready" | "todo";

// ─── Section title ────────────────────────────────────────────────────────────
const SectionTitle: React.FC<{
  title: string;
  hint?: string;
  trailing?: React.ReactNode;
}> = ({ title, hint, trailing }) => (
  <div className="flex items-end justify-between gap-4 mb-3">
    <div className="min-w-0">
      <h2 className="text-[12.5px] font-medium text-primary tracking-tight leading-none">
        {title}
      </h2>
      {hint && (
        <p className="mt-1 text-[12px] text-secondary/80 leading-snug">{hint}</p>
      )}
    </div>
    {trailing && <div className="shrink-0">{trailing}</div>}
  </div>
);

// ─── Summary tile ─────────────────────────────────────────────────────────────
const SummaryTile: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "accent" | "muted";
  loading: boolean;
}> = ({ label, value, icon, tone, loading }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background_alt/25 backdrop-blur-sm px-4 py-3">
    <div
      className={`grid h-8 w-8 place-items-center rounded-md shrink-0 ${
        tone === "accent"
          ? "bg-accent/12 text-accent"
          : "bg-foreground_alt/40 text-secondary"
      }`}
    >
      {icon}
    </div>
    <div className="flex flex-col min-w-0">
      {loading ? (
        <div className="h-5 w-12 rounded bg-foreground_alt/30 animate-pulse" />
      ) : (
        <p className="text-[18px] font-medium text-primary leading-none tabular-nums">
          {fmtNumber(value)}
        </p>
      )}
      <p className="mt-1 text-[11.5px] text-secondary/80 leading-none">
        {label}
      </p>
    </div>
  </div>
);

// ─── Filter tab pill ──────────────────────────────────────────────────────────
const TabPill: React.FC<{
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}> = ({ active, count, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group inline-flex items-center gap-1.5 rounded-md h-9 px-3 text-[12.5px] tracking-tight transition-all duration-200 ${
      active
        ? "bg-foreground_alt/60 text-primary"
        : "text-secondary hover:bg-foreground_alt/30 hover:text-primary"
    }`}
  >
    <span>{label}</span>
    <span
      className={`text-[11px] tabular-nums ${
        active ? "text-accent" : "text-secondary/60"
      }`}
    >
      {count}
    </span>
  </button>
);

// ─── Collection row ───────────────────────────────────────────────────────────
const CollectionRow: React.FC<{
  collection: Collection;
  processing: boolean;
  progress: number;
  onOpen: () => void;
  onAnalyze: () => void;
  onReanalyze: () => void;
  onDeleteAnalysis: () => void;
  onDeleteWeaviate: () => void;
}> = ({
  collection,
  processing,
  progress,
  onOpen,
  onAnalyze,
  onReanalyze,
  onDeleteAnalysis,
  onDeleteWeaviate,
}) => {
  const processed = collection.processed;

  return (
    <div className="group/row relative flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-foreground_alt/20">
      {/* Status dot */}
      <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
        {processing && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-highlight opacity-70" />
        )}
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
            processing
              ? "bg-highlight"
              : processed
              ? "bg-accent"
              : "bg-warning/80"
          }`}
        />
      </span>

      {/* Name + meta */}
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <span className="truncate text-[12.5px] text-primary font-medium tracking-tight">
          {collection.name}
        </span>
        <span className="hidden sm:inline text-[11px] text-secondary/65 tabular-nums">
          {fmtNumber(collection.total)} {collection.total === 1 ? "oggetto" : "oggetti"}
        </span>
      </button>

      {/* Status label */}
      <span
        className={`hidden md:inline text-[11px] shrink-0 ${
          processing
            ? "text-highlight"
            : processed
            ? "text-accent/85"
            : "text-warning"
        }`}
      >
        {processing ? `${progress}%` : processed ? "Pronta" : "Da analizzare"}
      </span>

      {/* Action */}
      <div className="flex shrink-0 items-center gap-1">
        {!processed && !processing && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze();
            }}
            className="h-7 px-2.5 text-[11.5px] bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30"
          >
            <Sparkles className="h-3 w-3" strokeWidth={2} />
            Analizza
          </Button>
        )}

        {processed && !processing && (
          <button
            type="button"
            onClick={onOpen}
            className="hidden sm:inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11.5px] text-secondary hover:text-primary opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            Apri
            <ChevronRight className="h-3 w-3" strokeWidth={2} />
          </button>
        )}

        {processing && (
          <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-highlight/10 px-2 text-[11.5px] text-highlight">
            <span className="h-1 w-1 rounded-full bg-highlight animate-pulse" />
            In corso
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-secondary hover:text-primary opacity-0 group-hover/row:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-52">
            {processed && (
              <DropdownMenuItem onClick={onReanalyze} className="text-[12.5px] text-secondary hover:text-primary gap-2">
                <RotateCw className="h-3 w-3" strokeWidth={1.8} />
                <span>Rianalizza</span>
              </DropdownMenuItem>
            )}
            {processed && (
              <DropdownMenuItem onClick={onDeleteAnalysis} className="text-[12.5px] text-secondary hover:text-error gap-2">
                <Trash2 className="h-3 w-3" strokeWidth={1.8} />
                <span>Cancella analisi</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDeleteWeaviate} className="text-[12.5px] text-secondary hover:text-destructive gap-2">
              <Trash2 className="h-3 w-3" strokeWidth={1.8} />
              <span>Elimina collezione</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const {
    collections,
    deleteCollection,
    fetchCollections,
    loadingCollections,
  } = useContext(CollectionContext);
  const { id } = useContext(SessionContext);
  const { currentToasts, showErrorToast } = useContext(ToastContext);
  const { triggerAnalysis } = useContext(ProcessingContext);
  const { changePage } = useContext(RouterContext);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [confirmWipe, setConfirmWipe] = useState(false);

  const loading = loadingCollections;

  // ── Derived counts ─────────────────────────────────────────────────────────
  const processedCount = useMemo(
    () => collections.filter((c) => c.processed).length,
    [collections]
  );
  const todoCount = useMemo(
    () => collections.filter((c) => !c.processed).length,
    [collections]
  );
  const processedObjects = useMemo(
    () =>
      collections
        .filter((c) => c.processed)
        .reduce((acc, c) => acc + c.total, 0),
    [collections]
  );

  // ── Auto-pivot the tab when the user clearly has one bucket ─────────────────
  useEffect(() => {
    if (!loading && processedCount === 0 && todoCount > 0) setTab("todo");
  }, [loading, processedCount, todoCount]);

  // ── Filter / sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collections
      .filter((c) => {
        if (tab === "ready" && !c.processed) return false;
        if (tab === "todo" && c.processed) return false;
        if (q && !c.name.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.processed === b.processed) return a.name.localeCompare(b.name);
        return a.processed ? -1 : 1;
      });
  }, [collections, tab, query]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const selectCollection = (c: Collection) =>
    changePage("collection", { source: c.name }, true);

  const handleAnalyze = async (name: string) => {
    if (!id) {
      showErrorToast("Errore durante l'analisi", "ID utente non trovato");
      return;
    }
    await triggerAnalysis(name, id);
  };

  const handleDeleteWeaviate = async (name: string) => {
    const res = await deleteWeaviateCollection(name);
    if (res.status === "success") await fetchCollections();
  };

  const handleWipeAll = async () => {
    const res = await deleteAllCollectionMetadata(id ?? "");
    if (res.error) {
      showErrorToast(
        "Errore durante l'eliminazione dei metadati",
        res.error
      );
    }
    fetchCollections();
    setConfirmWipe(false);
  };

  const progressFor = (name: string) =>
    currentToasts.find((t) => t.collection_name === name)?.progress ?? 0;
  const isProcessing = (name: string) =>
    currentToasts.some((t) => t.collection_name === name);

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto fade-in">
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex items-end justify-between gap-6 pb-5 mb-6 border-b border-border/40">
          <div className="min-w-0">
            <h1 className="text-[15px] font-medium text-primary tracking-tight leading-none">
              Dati
            </h1>
            <p className="mt-1.5 text-[12.5px] text-secondary/85 leading-relaxed">
              Le sorgenti che Elysia può consultare.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchCollections()}
              className="h-8 text-[12.5px]"
            >
              <RotateCw className="h-3 w-3" strokeWidth={1.8} />
              Aggiorna
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => changePage("files", {}, true)}
              className="h-8 text-[12.5px]"
            >
              <Upload className="h-3 w-3" strokeWidth={1.8} />
              Importa
            </Button>
          </div>
        </header>

        {/* ── Summary ────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8">
          <SummaryTile
            label="Sorgenti pronte"
            value={processedCount}
            icon={<Database className="h-3.5 w-3.5" strokeWidth={1.8} />}
            tone="accent"
            loading={loading}
          />
          <SummaryTile
            label="Documenti indicizzati"
            value={processedObjects}
            icon={<FileText className="h-3.5 w-3.5" strokeWidth={1.8} />}
            tone="accent"
            loading={loading}
          />
          <SummaryTile
            label="In attesa"
            value={todoCount}
            icon={<AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.8} />}
            tone="muted"
            loading={loading}
          />
        </section>

        {/* ── Collections ────────────────────────────────────────────────── */}
        <section className="mb-10">
          <SectionTitle
            title="Collezioni"
            hint="Filtra per stato, cerca per nome, apri per esplorare i contenuti."
          />

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Search */}
            <div className="group relative flex-1 min-w-[220px]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-secondary/70"
                strokeWidth={1.8}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca una sorgente…"
                className="w-full h-9 rounded-lg border border-border/40 bg-background_alt/30 pl-9 pr-8 text-[12.5px] text-primary placeholder:text-secondary/60 outline-none transition-all focus:border-accent/40 focus:bg-background_alt/45"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-md text-secondary/70 hover:bg-foreground_alt/40 hover:text-primary"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1">
              <TabPill
                label="Tutte"
                count={collections.length}
                active={tab === "all"}
                onClick={() => setTab("all")}
              />
              <TabPill
                label="Pronte"
                count={processedCount}
                active={tab === "ready"}
                onClick={() => setTab("ready")}
              />
              <TabPill
                label="Da analizzare"
                count={todoCount}
                active={tab === "todo"}
                onClick={() => setTab("todo")}
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl border border-border/40 bg-background_alt/15">
              <LoadingSpinner size="medium" />
              <p className="text-secondary text-[12px]">
                Caricamento collezioni…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/40 bg-background_alt/15 px-6 py-12 text-center">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
                <Database className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <p className="text-[13px] text-primary font-medium">
                {query
                  ? "Nessuna sorgente trovata"
                  : tab === "ready"
                  ? "Nessuna sorgente pronta"
                  : tab === "todo"
                  ? "Tutto pronto. Niente da analizzare."
                  : "Nessuna sorgente disponibile"}
              </p>
              <p className="text-[12px] text-secondary/80 max-w-sm">
                {query
                  ? `Nessun risultato per "${query}".`
                  : "Carica un file qui sotto per cominciare."}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/40 bg-background_alt/20 backdrop-blur-sm divide-y divide-border/30 overflow-hidden">
              {filtered.map((c) => (
                <CollectionRow
                  key={c.name}
                  collection={c}
                  processing={isProcessing(c.name)}
                  progress={progressFor(c.name)}
                  onOpen={() => selectCollection(c)}
                  onAnalyze={() => handleAnalyze(c.name)}
                  onReanalyze={() => handleAnalyze(c.name)}
                  onDeleteAnalysis={() => deleteCollection(c.name)}
                  onDeleteWeaviate={() => handleDeleteWeaviate(c.name)}
                />
              ))}
            </div>
          )}

          {/* Wipe-all (advanced) */}
          {collections.length > 0 && (
            <details className="mt-4 group/wipe">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[11.5px] text-secondary/70 hover:text-secondary transition-colors">
                <ChevronRight className="h-3 w-3 transition-transform group-open/wipe:rotate-90" strokeWidth={2} />
                Opzioni avanzate
              </summary>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-error/25 bg-error/5 px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="text-[12.5px] text-error font-medium">
                    Cancella tutti i metadati delle analisi
                  </p>
                  <p className="text-[11.5px] text-secondary/80 mt-0.5">
                    Le collezioni rimangono, ma andranno rianalizzate.
                  </p>
                </div>
                {confirmWipe ? (
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={handleWipeAll}
                      className="h-7 px-2.5 text-[11.5px] bg-error text-background hover:bg-error/90"
                    >
                      Conferma
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmWipe(false)}
                      className="h-7 px-2.5 text-[11.5px] text-secondary"
                    >
                      Annulla
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmWipe(true)}
                    className="h-7 px-2.5 text-[11.5px] text-error hover:bg-error/10"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={1.8} />
                    Cancella tutto
                  </Button>
                )}
              </div>
            </details>
          )}
        </section>

        {/* ── Import ─────────────────────────────────────────────────────── */}
        <section>
          <SectionTitle
            title="Carica file"
            hint="Trascina o seleziona documenti: Elysia li indicizza e li rende interrogabili."
            trailing={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changePage("files", {}, true)}
                className="h-8 text-[12px] text-secondary hover:text-primary gap-1.5"
              >
                <Upload className="h-3 w-3" strokeWidth={1.8} />
                Gestore file
              </Button>
            }
          />

          <div className="rounded-xl border border-border/40 bg-background_alt/20 backdrop-blur-sm p-4 lg:p-5">
            <ImportDataPage embedded />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
