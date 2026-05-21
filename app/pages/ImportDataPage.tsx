"use client";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { SessionContext } from "../components/contexts/SessionContext";
import { ToastContext } from "../components/contexts/ToastContext";
import { CollectionContext } from "../components/contexts/CollectionContext";
import { LoadingSpinner } from "../components/loading/LoadingSpinner";
import { useMode } from "../components/contexts/ModeContext";
import { useStackMode } from "../components/contexts/StackModeContext";
import StackModeSlider, {
  BIG_BRAIN_OCR_ALIASES,
  BRAIN_SLOT_OCR_ALIASES,
} from "../components/configuration/StackModeSlider";
import { useModelStatus } from "../components/configuration/hooks/useModelStatus";
import SlotStatusRow from "../components/configuration/SlotStatusRow";
import LoadingDots from "../components/configuration/LoadingDots";
import { host } from "../components/host";
import { FaServer } from "react-icons/fa";
import { MdCloudQueue } from "react-icons/md";
import { IoCloudUploadOutline } from "react-icons/io5";
import { TbDatabaseImport } from "react-icons/tb";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import {
  SettingCard,
  SettingGroup,
} from "../components/configuration/SettingComponents";

// ─── Constants ───────────────────────────────────────────────────────────────
const ACCEPTED = ".pdf,.docx,.txt,.md,.csv,.xlsx,.jpg,.jpeg,.png";
const ACCEPT_LABEL = "PDF · DOCX · TXT · MD · CSV · XLSX · JPG · PNG";
const WS_URL = `${typeof window !== "undefined" ? host.replace(/^http/, "ws") : "ws://localhost:3000"}/ws/process_collection`;

// MIME fallback — used when file.type is empty (common for .md, .docx on some browsers)
function guessMimeFromExtension(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, string> = {
    pdf:  "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc:  "application/msword",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls:  "application/vnd.ms-excel",
    csv:  "text/csv",
    txt:  "text/plain",
    md:   "text/markdown",
    json: "application/json",
    png:  "image/png",
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  return map[ext] ?? "application/octet-stream";
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({
  percent,
  label,
  visionActive,
}: {
  percent: number;
  label: string;
  visionActive: boolean | null;
}) {
  const done = percent >= 100;
  const barColor = done ? "#6bd4a1" : "#5ea5cf";
  return (
    <div style={{ marginTop: "12px" }}>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-sm font-semibold text-primary truncate">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          {/* Vision indicator — only shown while actively processing pages */}
          {visionActive !== null && (
            <span
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-all ${
                visionActive
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                  : "border-foreground bg-background text-secondary"
              }`}
            >
              {visionActive ? <BsEye size={11} /> : <BsEyeSlash size={11} />}
              <span>{visionActive ? "Vision" : "Text"}</span>
            </span>
          )}
          <span className="text-sm font-mono" style={{ color: barColor }}>{percent}%</span>
        </div>
      </div>
      <div className="w-full h-[3px] rounded-sm overflow-hidden" style={{ backgroundColor: "#2e2e2e" }}>
        <div
          className="h-full rounded-sm"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${barColor}, #89cff0)`,
            boxShadow: `0 0 10px ${done ? "rgba(107,212,161,0.4)" : "rgba(94,165,207,0.4)"}`,
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({
  total,
  duration,
  collectionName,
  onClose,
}: {
  total: number;
  duration: number;
  collectionName: string;
  onClose: () => void;
}) {
  const hasRecords = total > 0;
  return (
    <div className="mt-4 flex flex-col gap-0 border border-foreground rounded-md overflow-hidden">
      <div className={`flex items-center justify-between px-4 py-3 border-b border-foreground ${hasRecords ? "bg-background_alt" : "bg-background"}`}>
        <span className={`font-bold text-sm ${hasRecords ? "text-primary" : "text-secondary"}`}>
          {hasRecords ? `✓ ${total} record importati` : "⚠ Nessun record estratto"}
        </span>
        <button
          onClick={onClose}
          className="text-xs px-3 py-1 rounded border border-foreground text-secondary hover:text-primary transition-colors bg-background"
        >
          Reimposta
        </button>
      </div>
      <div className="px-4 py-3 bg-background_alt">
        {hasRecords ? (
          <p className="text-sm text-secondary">
            Salvati in <span className="text-primary font-mono">{collectionName}</span>{" "}
            · <span className="text-primary font-semibold">{duration.toFixed(1)}s</span>
          </p>
        ) : (
          <p className="text-sm text-secondary">
            Pipeline completata in <span className="text-primary font-semibold">{duration.toFixed(1)}s</span> but non sono stati prodotti record strutturati.
            Prova un file diverso o controlla il modello di estrazione nelle Impostazioni.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── User-friendly error mapping ─────────────────────────────────────────────
// Translates technical backend error messages to plain-English copy
// visible to non-technical users on the Import Data page.
function toFriendlyError(raw: string, mode: string, stackMode: string): string {
  const lower = raw.toLowerCase();

  // Big Brain not ready
  if (lower.includes("big brain") || (stackMode === "big_brain" && (lower.includes("brain") || lower.includes("not ready") || lower.includes("not running")))) {
    return "🧠 Il modello Big Brain è ancora in caricamento: attendi 1-2 minuti e riprova.";
  }
  // OCR / image reader not running
  if (lower.includes("ocr vision") || lower.includes("ocr slot") || lower.includes(":8083") || lower.includes("image reader")) {
    return "📄 Il lettore immagini non è in esecuzione. Passa la stack in modalità Ingestion (slider sopra), attendi il caricamento e riprova.";
  }
  // Flash not running
  if (lower.includes("flash") && lower.includes("not reachable")) {
    if (stackMode === "big_brain") {
      return "🧠 Il modello Big Brain è ancora in caricamento: attendi 1-2 minuti e riprova.";
    }
    return "⚡ Il motore di elaborazione non è in esecuzione. Passa alla modalità Ingestion, attendi il caricamento e riprova.";
  }
  // Generic "model not running / not reachable"
  if (lower.includes("not reachable") || lower.includes("not running") || lower.includes("not ready")) {
    return mode === "local"
      ? "Il modello AI non è pronto. Controlla lo slider della stack e attendi il caricamento dei modelli."
      : "Impossibile raggiungere il servizio AI. Controlla connessione internet e API key nelle Impostazioni.";
  }
  // Rate / quota errors
  if (lower.includes("quota") || lower.includes("rate limit") || lower.includes("429")) {
    return "⏱ Limite API raggiunto: attendi qualche secondo e riprova.";
  }
  // Context length
  if (lower.includes("context limit") || lower.includes("context length") || lower.includes("too large")) {
    return "📃 Il documento è troppo grande per essere elaborato in una volta sola. Prova a caricare meno pagine per volta.";
  }
  // Timeout
  if (lower.includes("timed out") || lower.includes("timeout")) {
    return "⏳ Il modello ha impiegato troppo tempo a rispondere: potrebbe essere ancora in caricamento. Attendi e riprova.";
  }
  return raw;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ImportDataPage({
  embedded = false,
}: {
  embedded?: boolean;
} = {}) {
  const { id, userConfig } = useContext(SessionContext);
  const { showErrorToast, showSuccessToast } = useContext(ToastContext);
  const { fetchCollections } = useContext(CollectionContext);

  // Mirrors backend toWeaviateClassName — Weaviate class names must start with [A-Z]
  // and contain only [A-Za-z0-9_]. No leading underscores or digits.
  const sanitizeClassName = (raw: string): string => {
    const name = raw
      .trim()
      .replace(/[^a-zA-Z0-9_]+/g, "_")  // non-alphanumeric → _
      .replace(/^[_0-9]+/, "")           // strip leading underscores/digits
      .slice(0, 200);
    if (!name) return `Collection_${Date.now()}`;
    return name[0].toUpperCase() + name.slice(1);
  };

  const [isReady, setIsReady] = useState(false);
  // mode comes from shared ModeContext — stays in sync with ModeToggle & Settings
  const { mode } = useMode();

  // Form
  const [files, setFiles] = useState<File[]>([]);
  const [collectionName, setCollectionName] = useState("");
  const [context, setContext] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Pipeline
  const [running, setRunning] = useState(false);
  const [percent, setPercent] = useState(0);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ total: number; duration: number } | null>(null);
  // null = not processing, true/false = vision on/off for the current page
  const [visionActive, setVisionActive] = useState<boolean | null>(null);
  // Per-file extraction progress driven by ingestion_progress WSeventi
  const [fileProgress, setFileProgress] = useState<Map<string, { step: string; count?: number }>>(new Map());
  // Non-fatal warnings from the backend (0-records, model routing issues, etc.)
  const [warnings, setAvvisi] = useState<string[]>([]);

  // Stack mode from shared context — stays in sync with Settings page
  const { stackMode, stackBooting, slotApplying } = useStackMode();

  // Compute model overrides from user settings so the stack toggle on this page
  // loads the same models the user configured in Settings, not start_agents.sh defaults.
  // Reads from userConfig directly (settings const is defined later after early return).
  const stackOverrides = (() => {
    const s = userConfig?.backend?.settings as Record<string, unknown> | undefined;
    if (!s) return undefined;
    return {
      base_model:    (s.LOCAL_BASE_MODEL    as string) || undefined,
      complex_model: (s.LOCAL_COMPLEX_MODEL as string) || undefined,
      ocr_model:     (s.LOCAL_OCR_MODEL     as string) || undefined,
    };
  })();

  // ── Traccia pipeline (debug) ────────────────────────────────────────────────
  // Records every WS event with a timestamp + summary so you can see the full
  // pipeline flow in the UI without opening DevTools.
  // Alleventi are ALSO logged to console with [FRONTEND PIPELINE] prefix.
  const [pipelineLogs, setPipelineLogs] = useState<
    Array<{ ts: string; type: string; summary: string; raw: string }>
  >([]);
  const [showPipelineLog, setShowPipelineLog] = useState(false);

  function logPipelineEvent(msg: Record<string, unknown>) {
    const now = new Date();
    const ts = now.toLocaleTimeString("en-US", {
      hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
    }) + "." + now.getMilliseconds().toString().padStart(3, "0");

    const type = (msg.type as string) ?? "?";
    let summary = "";
    if (msg.type === "progress") {
      summary = `${msg.percent ?? 0}% — ${msg.label ?? ""}`;
    } else if (msg.type === "record") {
      const d = msg.data as Record<string, unknown> | undefined;
      summary = `cat=${d?.category ?? "?"} content_len=${String(d?.content ?? "").length}`;
    } else if (msg.type === "extraction_warning") {
      summary = String(msg.message ?? "");
    } else if (msg.type === "ingestion_progress") {
      summary = `${msg.file ?? ""} → ${msg.step ?? ""}${msg.count != null ? ` (${msg.count} rec)` : ""}`;
    } else if (msg.type === "error") {
      summary = String(msg.message ?? "");
    } else if (msg.type === "done") {
      summary = `total=${msg.total} duration=${msg.duration_s}s`;
    } else {
      summary = JSON.stringify(msg).slice(0, 100);
    }

    // Console output — always visible in DevTools and SSR server logs
    console.log(`[FRONTEND PIPELINE ${ts}] ${type.toUpperCase().padEnd(20)} │ ${summary}`);

    setPipelineLogs((prev) => [
      ...prev,
      { ts, type, summary, raw: JSON.stringify(msg, null, 2) },
    ]);
  }

  const wsRef = useRef<WebSocket | null>(null);
  const startTsRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id || !userConfig) return;
    setIsReady(true);
  }, [id, userConfig]);

  const isBigBrain = stackMode === "big_brain";

  // isLocal and settings must be declared BEFORE ocrAlias (which reads both).
  // Previously placed below the early return, causing a TDZ crash on every render.
  const isLocal = mode === "local";
  const settings = userConfig?.backend?.settings as Record<string, unknown> | undefined;

  // ── OCR combo analysis ────────────────────────────────────────────────────
  // Used to show targeted warnings in the "Pipeline attiva" card for non-tech users.
  const ocrAlias: string = isLocal
    ? ((settings?.LOCAL_OCR_MODEL as string) || "")
    : "";

  // Solo 30B OCR models — require ocr-solo mode (Flash can't co-exist)
  // (When these are selected and user clicks Ingest, StackModeSlider auto-routes to ocr-solo)
  // 32B OCR aliases — require big_brain mode
  const ocrNeedsBigBrain = BIG_BRAIN_OCR_ALIASES.includes(ocrAlias);
  // Brain-slot text routing: text files (.txt, .csv, .md, .json) routed to port 8081
  // which is NOT started in ingestion mode → text extraction fails for these combos.
  // Images/PDFs still work via direct :8083.
  const ocrUsesBrainForText = BRAIN_SLOT_OCR_ALIASES.includes(ocrAlias);
  // DeepSeek-OCR-2 — 8k context limit (no mmproj VL, text-based doc OCR)
  const ocrIsDeepSeekOcr2 = ocrAlias === "gemini-ocr-2";
  // Currently in ingestion or ingestion-full mode
  const isIngestionMode = stackMode === "ingestion" || stackMode === "ingestion-full";


  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  function addFiles(incoming: File[]) {
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...incoming.filter((f) => !names.has(f.name))];
    });
    if (!collectionName && incoming[0]) {
      setCollectionName(sanitizeClassName(incoming[0].name.replace(/\.[^/.]+$/, "")));
    }
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  async function handleIngest() {
    if (!files.length || !collectionName.trim()) {
      showErrorToast("Campi mancanti", "Carica almeno un file e inserisci un nome collezione.");
      return;
    }
    if (running) return;

    setRunning(true);
    setError(null);
    setResult(null);
    setPercent(2);
    setLabel("Inizializzazione…");
    setVisionActive(null);
    setAvvisi([]);
    setPipelineLogs([]); // clear previous run's log
    startTsRef.current = Date.now();

    // Build file payloads — ALL preprocessing (PDF→text, DOCX→text, XLSX→CSV)
    // happens server-side in FilePreprocessor.ts. The frontend just sends raw bytes.
    // This eliminates all browser-side pdfjs-dist usage (and its webpack breakage).
    const filePayloads: { filename: string; content_b64: string; mime_type: string }[] = [];

    setLabel("Preparazione file…");
    setPercent(3);

    for (const file of files) {
      const b64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      // Prefer the browser-detected MIME; fall back to extension mapping
      const mime = file.type || guessMimeFromExtension(file.name);
      filePayloads.push({ filename: file.name, content_b64: b64, mime_type: mime });
    }

    setPercent(5);
    setLabel(`Sending ${filePayloads.length} file(s)…`);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      logPipelineEvent({
        type: "ws_open",
        message: `WebSocket opened — sending ${filePayloads.length} file(s) to backend`,
        mode,
        collection_name: collectionName,
        files: filePayloads.map(f => `${f.filename} (${f.mime_type})`),
      } as unknown as Record<string, unknown>);
      ws.send(JSON.stringify({
        type: "start",
        mode,
        user_id: id,
        collection_name: collectionName,
        context: context || collectionName,
        files: filePayloads,
      }));
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string);
        // Log every WS event to the pipeline trace (visible in UI + DevTools console)
        logPipelineEvent(msg as Record<string, unknown>);
        if (msg.type === "progress") {
          setPercent(msg.percent ?? 0);
          setLabel(msg.label ?? "Elaborazione…");
          // Update vision indicator only when backend tells us (pages being analyzed)
          if (typeof msg.vision === "boolean") {
            setVisionActive(msg.vision);
          }
        } else if (msg.type === "extraction_warning") {
          // Non-fatal warning — model returned 0 records for a file
          const warnMsg: string = msg.message ?? "Nessun record estratto da un file";
          setAvvisi((prev) => [...prev, warnMsg]);
        } else if (msg.type === "ingestion_progress") {
          // Per-file granular progress: step = "extracting" | "parsed" | "stored"
          const filename: string = msg.file ?? "";
          if (filename) {
            setFileProgress((prev) => {
              const next = new Map(prev);
              next.set(filename, { step: msg.step ?? "extracting", count: msg.count });
              return next;
            });
          }
        } else if (msg.type === "error") {
          setError(msg.message ?? "Errore sconosciuto");
          setPercent(0);
          setLabel("Errore");
          setVisionActive(null);
          setRunning(false);
          ws.close();
        } else if (msg.type === "done") {
          const duration = (Date.now() - startTsRef.current) / 1000;
          const total = msg.total ?? 0;
          setPercent(100);
          setLabel("Completato");
          setVisionActive(null);
          setFileProgress(new Map());
          setResult({ total, duration });
          if (total > 0) {
            showSuccessToast("Import completato", `${total} record importati`);
            setTimeout(() => fetchCollections(), 1500);
          }
          setRunning(false);
          ws.close();
        }
      } catch { /* malformed frame — skip */ }
    };

    ws.onerror = () => {
      logPipelineEvent({ type: "ws_error", message: "Connessione WebSocket non riuscita: il backend è attivo?" } as unknown as Record<string, unknown>);
      setError("Connessione WebSocket non riuscita: il backend è attivo sulla porta 3000?");
      setVisionActive(null);
      setRunning(false);
    };
  }

  function handleReimposta() {
    wsRef.current?.close();
    setFiles([]);
    setCollectionName("");
    setContext("");
    setPercent(0);
    setLabel("");
    setError(null);
    setResult(null);
    setRunning(false);
    setVisionActive(null);
    setFileProgress(new Map());
    setAvvisi([]);
  }

  // Model readiness — poll router :8090 when in local mode (works over SSH tunnel)
  // NOTE: must be called unconditionally BEFORE any early returns (Rules of Hooks)
  const { status: modelStatus } = useModelStatus(isLocal, 5000);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner size="medium" />
      </div>
    );
  }


  // Derive displayed model names — always in sync with current stackMode + settings
  // (settings is already declared above, before ocrAlias)

  /** Maps raw local model aliases → short human-readable labels for the "Pipeline attiva" UI. */
  const LOCAL_OCR_DISPLAY: Record<string, string> = {
    "gemini-ocr-2":           "DeepSeek OCR 2",
    "gemini-1.5-pro-vision":  "Qwen3-VL-8B Thinking",
    "gemini-vl-8b":           "Qwen3-VL-8B",
    "gemini-vl-8b-think":     "Qwen3-VL-8B Thinking",
    "gemini-vl-4b":           "Qwen3-VL-4B",
    "gemini-vl-4b-think":     "Qwen3-VL-4B Thinking",
    "gemini-vl-2b":           "Qwen3-VL-2B",
    "gemini-vl-2b-think":     "Qwen3-VL-2B Thinking",
    "gemini-vl-30b":          "Qwen3-VL-30B",
    "gemini-vl-32b":          "Qwen3-VL-32B Thinking",
    "gemini-big-brain":       "Qwen3-VL-32B Thinking",
    // Text-only OCR aliases
    "gemini-2.5-pro":         "Qwen3.5 9B",
    "gemini-1.5-pro":         "DeepSeek R1 14B",
    "gemini-1.5-flash":       "Qwen3.5 4B",
    "gemini-1.5-flash-8b":    "Qwen3.5 2B",
    "gemini-2.5-flash-lite":  "Qwen3.5 0.8B",
    // Gemma 4 — spread across all three slots (flash/brain/ocr) like any other family
    "gemma-4-e2b-flash":      "Gemma 4 E2B (Flash · 4 GB)",
    "gemma-4-e4b-brain":      "Gemma 4 E4B (Brain · 6 GB)",
    "gemma-4-e2b":            "Gemma 4 E2B (OCR · 4 GB)",
    "gemma-4-e4b":            "Gemma 4 E4B (OCR · 6 GB)",
    "gemma-4-26b":            "Gemma 4 26B-A4B MoE (18 GB)",
    "gemma-4-31b":            "Gemma 4 31B (20 GB)",
  };

  const LOCAL_EMBED_DISPLAY: Record<string, string> = {
    "Xenova/all-MiniLM-L6-v2":                         "MiniLM-L6 v2",
    "Xenova/all-mpnet-base-v2":                         "MPNet Base v2",
    "Xenova/gte-small":                                  "GTE Small",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2":     "Multilingual MiniLM",
    "gemini-embedding-001":                              "Gemini Embedding 001",
    "text-embedding-3-small":                            "OpenAI Embed 3 Small",
    "text-embedding-3-large":                            "OpenAI Embed 3 Large",
  };

  const ocrModel: string = isLocal
    ? isBigBrain
      ? (() => {
          // Brain mode uses the Complex Model — show its display name
          const raw = (settings?.LOCAL_COMPLEX_MODEL as string) || "gemini-big-brain";
          const display = LOCAL_OCR_DISPLAY[raw] ?? raw;
          return `${display} (Brain)`;
        })()
      : (() => {
          const raw = (settings?.LOCAL_OCR_MODEL as string) || "";
          if (!raw) {
            // "Auto — same as Complex model" — resolve and display the complex model
            const complexRaw = (settings?.LOCAL_COMPLEX_MODEL as string) || "gemini-1.5-flash";
            return (LOCAL_OCR_DISPLAY[complexRaw] ?? complexRaw) + " (same as Complex)";
          }
          return LOCAL_OCR_DISPLAY[raw] ?? raw;
        })()
    : (settings?.CLOUD_OCR_MODEL as string) ||
      (settings?.CLOUD_COMPLEX_MODEL as string) ||
      "Gemini 2.5 Pro";

  const embedModel: string = isLocal
    ? (() => {
        const raw = (settings?.LOCAL_EMBED_MODEL as string) || "Xenova/all-MiniLM-L6-v2";
        return LOCAL_EMBED_DISPLAY[raw] ?? raw.replace("Xenova/", "");
      })()
    : (() => {
        const raw = (settings?.CLOUD_EMBED_MODEL as string) || "gemini-embedding-001";
        return LOCAL_EMBED_DISPLAY[raw] ?? raw;
      })();

  return (
    <div
      className={
        embedded
          ? "flex flex-col w-full gap-4 fade-in"
          : "flex flex-col w-full h-full overflow-auto fade-in p-2 lg:p-4"
      }
    >
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between gap-4 py-4 flex-shrink-0 border-b border-foreground mb-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 bg-alt_color_a rounded-md flex items-center justify-center">
              <TbDatabaseImport className="text-background" size={14} />
            </div>
            <div>
              <p className="text-primary text-lg">Ingestione dati</p>
              <p className="text-sm text-secondary">Pipeline estrazione → embedding → indicizzazione</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-foreground rounded-md text-sm font-medium text-secondary">
            {isLocal ? <FaServer size={12} /> : <MdCloudQueue size={14} />}
            <span>{isLocal ? "Locale" : "Cloud"}</span>
          </div>
        </div>
      )}

      {/* 3-column grid in full page, stacked cards in embedded mode */}
      <div
        className={
          embedded
            ? "grid grid-cols-1 gap-3"
            : "grid grid-cols-1 gap-4 lg:grid-cols-3"
        }
      >

        {/* 01 / Sorgente */}
        <SettingCard>
          <SettingGroup>
            <div>
              <p className="text-secondary text-xs font-semibold uppercase tracking-widest">01 / Sorgente</p>
              <p className="text-primary text-base font-semibold mt-0.5">Carica file</p>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex min-h-[9rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-6 cursor-pointer transition-colors
                ${isDragging ? "border-highlight bg-highlight/10" : "border-border/70 bg-background/35 hover:border-highlight/60 hover:bg-highlight/5"}`}
            >
              <IoCloudUploadOutline size={24} className="text-secondary" />
              <span className="text-xs text-secondary text-center">Clicca o trascina qui</span>
              <span className="text-xs text-secondary opacity-50">{ACCEPT_LABEL}</span>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                multiple
                accept={ACCEPTED}
                onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
              />
            </div>

            {files.length > 0 && (
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                {files.map((f) => (
                  <div key={f.name} className="flex min-h-8 items-center gap-2 text-xs border border-border/60 rounded-md px-2.5 py-1.5 bg-background">
                    <span className="truncate text-secondary flex-1">{f.name}</span>
                    <span className="text-secondary opacity-50 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(f.name); }}
                      className="text-secondary opacity-40 hover:opacity-100 transition-opacity shrink-0 ml-1"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </SettingGroup>
        </SettingCard>

        {/* 02 / Destinazione */}
        <SettingCard>
          <SettingGroup>
            <div>
              <p className="text-secondary text-xs font-semibold uppercase tracking-widest">02 / Destinazione</p>
              <p className="text-primary text-base font-semibold mt-0.5">Collezione di destinazione</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs text-secondary">Nome collezione</p>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(sanitizeClassName(e.target.value))}
                placeholder="e.g. Finance_Docs_2024"
                className="h-9 w-full rounded-md border border-border/70 bg-background px-3 py-2 text-sm text-primary placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs text-secondary">Etichetta contesto <span className="opacity-50">(opzionale)</span></p>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. Aurora Studio 2024"
                className="h-9 w-full rounded-md border border-border/70 bg-background px-3 py-2 text-sm text-primary placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {!embedded && (
              <div className="flex flex-col gap-1 border border-foreground rounded px-3 py-2.5">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-0.5">Pipeline attiva</p>

                {/* Big Brain mode notice */}
                {isLocal && isBigBrain && (
                  <p className="text-[11px] text-purple-400/80 mb-1 leading-snug">
                    🧠 Modalità Brain: un unico modello gestisce tutti i passaggi (configurato in Impostazioni → Modello complesso)
                  </p>
                )}

                {/* Router unreachable hint (non-big-brain) */}
                {isLocal && !isBigBrain && modelStatus?.mode === "local" && modelStatus.router_reachable === false && (
                  <p className="text-[11px] text-amber-500/60 mb-1 leading-snug">
                    ⚠ Router unreachable — open SSH tunnel
                  </p>
                )}

                {/* Extraction row
                    · big_brain: uses brain slot (Qwen3-VL-32B handles vision + text)
                    · ingestion / ingestion-full / ocr-solo: uses OCR slot
                    · conversation / flash: OCR slot not started — text extraction routes
                      through the Complex/Brain model on :8081 */}
                {isBigBrain ? (
                  <SlotStatusRow
                    variant="user"
                    label="Extraction"
                    ready={modelStatus?.slots?.brain?.ready ?? false}
                    model={ocrModel}
                    loading={isLocal && (stackBooting || slotApplying) && !(modelStatus?.slots?.brain?.ready)}
                  />
                ) : isLocal && (stackMode === "conversation" || stackMode === "flash") ? (
                  // Chat-only stack modes: OCR slot is not running, but text extraction
                  // still works via the Complex model (Brain slot :8081).
                  <SlotStatusRow
                    variant="user"
                    label="Extraction"
                    ready={modelStatus?.slots?.brain?.ready ?? false}
                    model={(() => {
                      const raw = (settings?.LOCAL_COMPLEX_MODEL as string) || "gemini-1.5-flash";
                      return (LOCAL_OCR_DISPLAY[raw] ?? raw) + " (Complex)";
                    })()}
                    loading={isLocal && (stackBooting || slotApplying) && !(modelStatus?.slots?.brain?.ready)}
                  />
                ) : (
                  <SlotStatusRow
                    variant="user"
                    label="Extraction"
                    ready={!isLocal || (modelStatus?.slots?.ocr?.ready ?? false)}
                    model={ocrModel}
                    loading={isLocal && (stackBooting || slotApplying) && !(modelStatus?.slots?.ocr?.ready)}
                  />
                )}

                {/* Embedding row — always "ready" (runs in-process) */}
                <SlotStatusRow
                  variant="user"
                  label="Embedding"
                  ready={true}
                  model={embedModel}
                />

                {/* Flash / Processing row (local only)
                    · big_brain: brain handles everything → not applicable
                    · ocr-solo: flash not started → not applicable
                    · otherwise: show flash slot status */}
                {isLocal && (
                  <SlotStatusRow
                    variant="user"
                    label="Elaborazione"
                    ready={modelStatus?.slots?.flash?.ready ?? false}
                    model={modelStatus?.slots?.flash?.ready
                      ? (modelStatus.slots.flash?.model ?? LOCAL_OCR_DISPLAY[(settings?.LOCAL_BASE_MODEL as string) || "gemini-1.5-flash"] ?? "Qwen3.5 4B")
                      : LOCAL_OCR_DISPLAY[(settings?.LOCAL_BASE_MODEL as string) || "gemini-1.5-flash"] ?? "Qwen3.5 4B"}
                    loading={(stackBooting || slotApplying) && !(modelStatus?.slots?.flash?.ready)}
                    notApplicable={stackMode === "ocr-solo" || stackMode === "big_brain"}
                  />
                )}

                {/* ── Combo warnings — non-technical language ─────────────────────
                    Shown when the current stack mode + OCR model combination has
                    a known limitation the user needs to know about. */}
                {isLocal && !isBigBrain && (
                  <>
                    {/* Case 1: Auto OCR or brain-slot model in Ingest mode
                        Text-only files (CSV, TXT, MD, JSON) route to the Complex model
                        which is on the Brain slot (port 8081) — NOT started in Ingest.
                        PDFs and images still work because they go directly to port 8083. */}
                    {isIngestionMode && ocrUsesBrainForText && (
                      <p className="text-[11px] text-amber-400/80 mt-1.5 leading-snug">
                        ⚠️ I <strong>file testuali</strong> (.txt, .csv, .md) non verranno estratti in modalità Ingest
                        {ocrAlias === "" ? " with the default OCR model" : ` with "${ocrAlias}"`}.
                        Usa la <strong>modalità Chat</strong> per documenti solo testo,
                        oppure scegli un modello OCR vision (es. VL-8B).
                      </p>
                    )}

                    {/* Case 2: Solo OCR mode is active (30B model, Flash not loaded)
                        The Ingest button auto-routed to ocr-solo. User should know Flash isn't running. */}
                    {stackMode === "ocr-solo" && (
                      <p className="text-[11px] text-green-400/70 mt-1.5 leading-snug">
                        📡 <strong>Modalità Solo OCR</strong>: è attivo solo il modello vision
                        (~18 GB). Flash non è caricato. Formattazione e post-processing
                        sono gestiti direttamente dal modello OCR.
                      </p>
                    )}

                    {/* Case 3: Big Brain OCR alias selected but stack is not big_brain
                        (already narrowed by !isBigBrain parent condition)
                        gemini-big-brain / gemini-vl-32b require Brain mode. */}
                    {ocrNeedsBigBrain && (
                      <p className="text-[11px] text-purple-400/80 mt-1.5 leading-snug">
                        🧠 Il tuo modello OCR richiede la <strong>modalità Brain</strong>
                        (il modello 32B richiede tutta la VRAM). Premi <strong>Brain</strong>
                        nello slider sopra, oppure scegli un OCR più leggero.
                      </p>
                    )}

                    {/* Case 4: DeepSeek-OCR-2 — text-based document OCR, 8k context limit */}
                    {ocrIsDeepSeekOcr2 && (
                      <p className="text-[11px] text-blue-400/60 mt-1.5 leading-snug">
                        📄 <strong>DeepSeek OCR 2</strong> è ottimizzato per documenti scansionati
                        ma ha un limite di contesto a 8k: pagine molto lunghe possono essere tagliate.
                      </p>
                    )}
                  </>
                )}

                <p className="text-xs text-secondary opacity-40 mt-1">Impostazioni → Modelli per cambiare</p>
              </div>
            )}
          </SettingGroup>
        </SettingCard>

        {/* 03 / Esecuzione */}
        <SettingCard unstyled={embedded}>
          <SettingGroup>
            {!embedded && (
              <div>
                <p className="text-secondary text-xs font-semibold uppercase tracking-widest">03 / Esecuzione</p>
                <p className="text-primary text-base font-semibold mt-0.5">Esegui pipeline</p>
              </div>
            )}

            {/* Stack mode slider — local only */}
            {isLocal && !embedded && <StackModeSlider compact overrides={stackOverrides} />}

            {/* Slot readiness guard — show a loading state while local models boot */}
            {isLocal && stackBooting && !embedded && (
              <div className="flex items-center gap-2 text-xs text-secondary py-1">
                <LoadingDots />
                <span>Attendo il caricamento dei modelli: può richiedere 30–90 secondi…</span>
              </div>
            )}

            {/* Determine whether it's safe to ingest:
                - Cloud mode: always safe (no local models to wait for)
                - Local mode text-only files: safe in any mode (no OCR slot needed)
                - Local mode with images/PDFs: requires an ingestion-capable stack mode */}
            {(() => {
              // Text-only MIME types that don't need the OCR vision slot
              const TEXT_MIMES = new Set(["text/plain", "text/markdown", "text/csv", "application/json"]);
              const PDF_MIME = "application/pdf";
              const allFilesAreText = files.length > 0 && files.every((f) => {
                const mime = f.type || guessMimeFromExtension(f.name);
                return TEXT_MIMES.has(mime);
              });
              const hasNonTextFiles = files.some((f) => {
                const mime = f.type || guessMimeFromExtension(f.name);
                return !TEXT_MIMES.has(mime);
              });
              // PDFs (and text) are processable in chat/flash mode — backend uses pdf-parse (text path)
              const allFilesArePdfOrText = files.length > 0 && files.every((f) => {
                const mime = f.type || guessMimeFromExtension(f.name);
                return TEXT_MIMES.has(mime) || mime === PDF_MIME;
              });
              const hasPdfInChatMode = isLocal &&
                (stackMode === "conversation" || stackMode === "flash") &&
                files.some((f) => (f.type || guessMimeFromExtension(f.name)) === PDF_MIME);
              // Images still require an OCR-capable stack
              const hasImageFiles = files.some((f) => {
                const mime = f.type || guessMimeFromExtension(f.name);
                return mime.startsWith("image/");
              });

              // Soft warning: text-only upload in non-ingestion mode (quality may be lower)
              const showSoftWarning = isLocal && !stackBooting && allFilesAreText &&
                stackMode !== "ingestion" && stackMode !== "ingestion-full" && stackMode !== "big_brain";

              const safeToIngest = !isLocal || (
                !stackBooting && (
                  allFilesAreText ||  // text-only: safe in any running mode
                  // PDFs + text in chat/flash: processed via text path (pdf-parse), no OCR slot needed
                  (allFilesArePdfOrText && (stackMode === "conversation" || stackMode === "flash")) ||
                  stackMode === "ingestion" || stackMode === "ingestion-full" ||
                  stackMode === "ocr-solo" || stackMode === "big_brain"
                )
              );
              return (
                <>
                  {showSoftWarning && !embedded && (
                    <p className="text-[11px] text-amber-400/80 leading-snug">
                      ⚠️ Solo file testuali: elaborazione in modalità <strong>{stackMode}</strong>.
                      La qualità può essere inferiore rispetto a Ingestion, ma l&apos;import è consentito.
                    </p>
                  )}
                  {hasPdfInChatMode && !embedded && (
                    <p className="text-[11px] text-amber-400/80 leading-snug">
                      ⚠️ PDF in modalità <strong>{stackMode}</strong>: il testo sarà estratto via pdf-parse (senza vision).
                      Usa <strong>Ingestion</strong> per pagine PDF basate su immagini.
                    </p>
                  )}
                  {isLocal && !safeToIngest && hasImageFiles && !embedded && (
                    <p className="text-[11px] text-red-400/80 leading-snug">
                      🔴 Le immagini richiedono lo slot OCR: passa a <strong>Ingestion</strong>.
                    </p>
                  )}
                  {isLocal && !safeToIngest && !hasImageFiles && hasNonTextFiles && !embedded && (
                    <p className="text-[11px] text-red-400/80 leading-snug">
                      🔴 Immagini/PDF richiedono modalità Ingestion e slot OCR attivo.
                    </p>
                  )}
                  <button
                    onClick={handleIngest}
                    disabled={running || !files.length || !collectionName.trim() || !safeToIngest}
                    title={
                      !safeToIngest
                        ? isLocal && stackBooting
                          ? "I modelli sono ancora in caricamento: attendi"
                          : "Le immagini richiedono modalità Ingestion e slot OCR attivo"
                        : undefined
                    }
                    className={`${embedded ? "h-11 rounded-lg" : "h-9 rounded-md"} w-full border border-highlight/50 text-sm font-semibold text-highlight hover:bg-highlight/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {running
                      ? "Importazione…"
                      : isLocal && stackBooting
                      ? "Caricamento modelli…"
                      : "Analizza e importa"}
                  </button>
                </>
              );
            })()}

            {/* Progress + vision indicator */}
            {(running || (percent > 0 && !result && !error)) && (
              <ProgressBar percent={percent} label={label} visionActive={visionActive} />
            )}

            {/* Per-file extraction status rows (driven by ingestion_progress WSeventi) */}
            {running && fileProgress.size > 0 && (
              <div className="flex flex-col gap-0.5 mt-1">
                {Array.from(fileProgress.entries()).map(([filename, fp]) => {
                  const shortName = filename.length > 40 ? `…${filename.slice(-37)}` : filename;
                  const isDone = fp.step === "parsed" || fp.step === "stored";
                  const icon = fp.step === "extracting" ? "⏳" : fp.count === 0 ? "⚠️" : "✓";
                  const countLabel = fp.step === "parsed" && fp.count !== undefined
                    ? ` · ${fp.count} record${fp.count === 1 ? "" : "s"}`
                    : "";
                  return (
                    <div key={filename}
                      className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded ${isDone ? "text-secondary" : "text-secondary/70"}`}
                    >
                      <span className="shrink-0">{icon}</span>
                      <span className="truncate">{shortName}</span>
                      <span className="shrink-0 opacity-60">{countLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="flex flex-col gap-1 border border-foreground rounded px-3 py-2.5">
                <p className="text-xs font-semibold text-primary">Qualcosa è andato storto</p>
                <p className="text-xs text-secondary">{toFriendlyError(error, mode, stackMode)}</p>
              </div>
            )}

            {/* Avvisi di estrazione — non-fatal issues like 0-records per file */}
            {warnings.length > 0 && (
              <div className="flex flex-col gap-1 border border-amber-500/30 rounded px-3 py-2.5 bg-amber-500/5">
                <p className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wide">Avvisi di estrazione</p>
                {warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-amber-300/70 leading-snug">{w}</p>
                ))}
              </div>
            )}

            {result && (
              <ResultCard
                total={result.total}
                duration={result.duration}
                collectionName={collectionName}
                onClose={handleReimposta}
              />
            )}

            {(files.length > 0 || error) && !running && !result && !embedded && (
              <button
                onClick={handleReimposta}
                className="text-xs text-secondary opacity-50 hover:opacity-100 transition-opacity underline text-left"
              >
                Reimposta
              </button>
            )}
          </SettingGroup>
        </SettingCard>

        {/* ── Traccia pipeline debug panel ──────────────────────────────────── */}
        {/* Shows after the first WS event — always visible during active run and stays
            until Reimposta. Alleventi also go to console with [FRONTEND PIPELINE] prefix. */}
        {pipelineLogs.length > 0 && (
          <SettingCard>
            <SettingGroup>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
                    Traccia pipeline
                  </span>
                    <span className="text-[10px] text-secondary/50 bg-background_alt px-1.5 py-0.5 rounded">
                    {pipelineLogs.length} eventi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const text = pipelineLogs
                        .map(l => `[${l.ts}] ${l.type.toUpperCase().padEnd(20)} │ ${l.summary}`)
                        .join("\n");
                      navigator.clipboard?.writeText(text).catch(() => {});
                    }}
                    className="text-[10px] text-secondary/60 hover:text-secondary transition-colors"
                    title="Copia log testuale"
                  >
                    Copia
                  </button>
                  <button
                    onClick={() => setShowPipelineLog((v) => !v)}
                    className="text-[10px] text-secondary/60 hover:text-secondary transition-colors"
                  >
                    {showPipelineLog ? "Nascondi" : "Mostra"}
                  </button>
                </div>
              </div>

              {showPipelineLog && (
                <div
                  className="mt-2 max-h-64 overflow-y-auto rounded border border-foreground bg-black/30 p-2 font-mono"
                  style={{ fontSize: "10px", lineHeight: "1.5" }}
                >
                  {pipelineLogs.map((log, i) => {
                    const isError = log.type === "error" || log.type === "ws_error";
                    const isWarn = log.type === "extraction_warning";
                    const isDone = log.type === "done";
                    const isRecord = log.type === "record";
                    const isOpen = log.type === "ws_open";
                    const typeColor = isError
                      ? "text-red-400"
                      : isWarn
                      ? "text-amber-400"
                      : isDone
                      ? "text-emerald-400"
                      : isRecord
                      ? "text-blue-400/70"
                      : isOpen
                      ? "text-emerald-300/70"
                      : "text-secondary/70";
                    return (
                      <div key={i} className="flex gap-2 py-[1px] border-b border-white/5">
                        <span className="text-secondary/30 shrink-0 w-24">{log.ts}</span>
                        <span className={`shrink-0 w-28 ${typeColor}`}>
                          {log.type.toUpperCase()}
                        </span>
                        <span className="text-primary/70 truncate">{log.summary}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick counters row — always visible */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-secondary/60">
                <span>
                  📄 File inviati:{" "}
                  <span className="text-secondary">
                    {pipelineLogs.find(l => l.type === "ws_open")
                      ? String(files.length)
                      : "—"}
                  </span>
                </span>
                <span>
                  📋 Record estratti:{" "}
                  <span className="text-secondary">
                    {pipelineLogs.filter(l => l.type === "record").length || "—"}
                  </span>
                </span>
                <span>
                  ✅ Salvati:{" "}
                  <span className="text-secondary">
                    {(() => {
                      const done = pipelineLogs.find(l => l.type === "done");
                      if (!done) return "—";
                      const m = done.summary.match(/total=(\d+)/);
                      return m ? m[1] : "?";
                    })()}
                  </span>
                </span>
                <span>
                  ⚠ Avvisi:{" "}
                  <span className={warnings.length > 0 ? "text-amber-400" : "text-secondary"}>
                    {warnings.length || "0"}
                  </span>
                </span>
                {pipelineLogs.find(l => l.type === "done") && (
                  <span>
                    ⏱ Durata:{" "}
                    <span className="text-secondary">
                      {(() => {
                        const done = pipelineLogs.find(l => l.type === "done");
                        const m = done?.summary.match(/duration=([\d.]+)s/);
                        return m ? `${m[1]}s` : "?";
                      })()}
                    </span>
                  </span>
                )}
              </div>
            </SettingGroup>
          </SettingCard>
        )}

      </div>
    </div>
  );
}
