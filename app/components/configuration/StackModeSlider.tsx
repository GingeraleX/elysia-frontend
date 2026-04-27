"use client";

import React from "react";
import { StackMode, ModelOverrides } from "@/app/api/modeToggle";
import { useStackMode } from "@/app/components/contexts/StackModeContext";
import LoadingDots from "./LoadingDots";

interface Segment {
  value: StackMode;
  label: string;
  icon: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  hint: string | ((overrides?: ModelOverrides) => string);
}

// ─── OCR Model Routing Classification ────────────────────────────────────────
// These are the OCR model aliases from Settings → Local → Extraction Model.
// Each set determines how the Ingest button routes under the hood.

/**
 * Solo OCR models — too large to co-exist with the Flash slot.
 * When configured as OCR model, clicking "Ingest" triggers `ocr-solo` mode
 * (only the OCR slot starts; Flash is NOT loaded).
 * The "Ingest" segment stays visually active.
 */
export const SOLO_OCR_ALIASES = ["gemini-vl-30b", "gemini-vl-30b-instruct"];

/**
 * Aliases that MUST run in big_brain mode — they ARE the 32B model.
 * Selecting one of these as the OCR model and clicking "Ingest" is redirected
 * to big_brain. Warning shown in ImportDataPage.
 */
export const BIG_BRAIN_OCR_ALIASES = ["gemini-big-brain", "gemini-vl-32b"];

/**
 * OCR model aliases that route text extraction through the brain slot (port 8081)
 * via the temp_router. In Ingest mode (Flash + OCR, no Brain), text-only files
 * (.txt, .csv, .md, .json) will fail because port 8081 is not running.
 * Images and PDFs (direct :8083) still work.
 *
 * NOTE: "" (empty / default) is NOT included here — empty resolves to the default
 * VL-8B vision model on port 8083, which IS running in Ingest mode.
 */
export const BRAIN_SLOT_OCR_ALIASES: string[] = [
  // "" removed — empty = default VL-8B on port 8083, NOT brain slot
  "gemini-2.5-pro",
  "gemini-2.5-pro-preview",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "deepseek-r1-7b",
  "deepseek-r1-8b",
  "deepseek-r1-llama-8b",
  "deepseek-r1-14b",
];

/**
 * Maps any internal StackMode (including hidden modes like ocr-solo, ingestion-full)
 * to the visible 3-way slider segment. The slider always shows exactly 3 segments
 * but routes to the right internal mode under the hood.
 */
export const VISUAL_SEGMENT_MAP: Record<string, "conversation" | "ingestion" | "big_brain"> = {
  conversation:     "conversation",
  flash:            "conversation",   // flash-only is closest to chat
  ingestion:        "ingestion",
  "ingestion-full": "ingestion",      // full stack ingestion still maps to Ingest
  "ocr-solo":       "ingestion",      // solo 30B OCR → visual "Ingest" stays active
  big_brain:        "big_brain",
};

/**
 * Resolves which actual StackMode to use when the user clicks "Ingest",
 * based on the configured OCR model. Keeps the 3-way slider invariant
 * while routing to the correct hidden mode under the hood.
 *
 * - Solo 30B OCR (vl-30b)   → ocr-solo  (Flash would OOM alongside 18 GB OCR)
 * - Big Brain OCR (32B/vl-32b) → big_brain (only the 32B model handles these)
 * - Everything else          → ingestion  (Flash + OCR, standard stack)
 */
export function resolveIngestionMode(overrides?: ModelOverrides): StackMode {
  const ocrAlias = overrides?.ocr_model ?? "";
  if (BIG_BRAIN_OCR_ALIASES.includes(ocrAlias)) return "big_brain";
  if (SOLO_OCR_ALIASES.includes(ocrAlias)) return "ocr-solo";
  return "ingestion";
}

// Short display labels for the ingestion hint line.
// Keys are Gemini aliases; values are ≤14-char labels for the compact hint.
const OCR_SHORT: Record<string, string> = {
  "":                       "Default VL-8B",  // "" = default OCR (Qwen3-VL-8B on port 8083)
  "gemini-ocr-2":           "DeepSeek OCR 2",
  "gemini-1.5-pro-vision":  "VL-8B OCR",
  "gemini-vl-8b":           "VL-8B OCR",
  "gemini-vl-8b-think":     "VL-8B OCR",
  "gemini-vl-4b":           "VL-4B OCR",
  "gemini-vl-4b-think":     "VL-4B OCR",
  "gemini-vl-2b":           "VL-2B OCR",
  "gemini-vl-2b-think":     "VL-2B OCR",
  "gemini-vl-30b":          "VL-30B OCR",
  "gemini-vl-30b-instruct": "VL-30B OCR",
  "gemini-big-brain":       "VL-32B (solo)",
  "gemini-vl-32b":          "VL-32B (solo)",
  // Text-only OCR — run on flash or brain slots, not OCR-VL slot
  "gemini-2.5-pro":         "9B (brain)",
  "gemini-1.5-pro":         "R1-14B (brain)",
  "gemini-1.5-flash":       "4B (flash)",
  "gemini-1.5-flash-8b":    "2B (flash)",
  "gemini-2.5-flash-lite":  "0.8B (flash)",
};

const BASE_SHORT: Record<string, string> = {
  "gemini-2.5-flash-lite": "0.8B Flash",
  "gemini-1.5-flash-8b":   "2B Flash",
  "gemini-1.5-flash":      "4B Flash",
  "deepseek-r1-1.5b":      "R1-1.5B",
  "gemini-2.5-pro":        "9B Brain",
  "gemini-1.5-pro":        "R1-14B",
  "deepseek-r1-7b":        "R1-7B",
  "deepseek-r1-8b":        "R1-8B",
  "deepseek-r1-14b":       "R1-14B",
};

function ingestionHint(overrides?: ModelOverrides): string {
  const ocrAlias  = overrides?.ocr_model ?? "";
  const baseAlias = overrides?.base_model || "gemini-1.5-flash";

  // Solo 30B OCR — Flash NOT loaded, only OCR slot
  if (SOLO_OCR_ALIASES.includes(ocrAlias)) {
    const ocrName = OCR_SHORT[ocrAlias] ?? ocrAlias;
    return `Solo OCR · ${ocrName} · ~18 GB · no Flash`;
  }

  // Big Brain OCR alias selected — clicking Ingest → big_brain mode
  if (BIG_BRAIN_OCR_ALIASES.includes(ocrAlias)) {
    return `→ Brain mode · 32B handles ingest`;
  }

  // OCR model is a brain-slot model (gemini-2.5-pro etc.) — text-only files route
  // to port 8081 (brain slot) which is NOT started in standard Ingest mode.
  // Images/PDFs still work via :8083 direct. Warning shown in ImportDataPage too.
  if (BRAIN_SLOT_OCR_ALIASES.includes(ocrAlias)) {
    const ocrName  = OCR_SHORT[ocrAlias]  ?? ocrAlias;
    const baseName = BASE_SHORT[baseAlias] ?? baseAlias;
    return `⚠ Ingest · ${ocrName} · ${baseName} · text→Chat`;
  }

  // Standard vision OCR model + flash → normal ingestion stack
  // Includes the default empty alias ("" = VL-8B on :8083)
  const ocrName  = OCR_SHORT[ocrAlias]  ?? ocrAlias;
  const baseName = BASE_SHORT[baseAlias] ?? baseAlias;
  return `Ingest · ${ocrName} + ${baseName}`;
}

// Short display labels for brain mode hint — maps complex model aliases
const COMPLEX_SHORT: Record<string, string> = {
  "gemini-2.5-pro":          "9B Thinking",
  "gemini-2.5-pro-preview":  "9B Thinking",
  "gemini-1.5-pro":          "R1-14B Expert",
  "gemini-big-brain":        "VL-32B Thinking",
  "deepseek-r1-7b":          "R1-7B",
  "deepseek-r1-8b":          "R1-8B",
  "deepseek-r1-14b":         "R1-14B",
};

function brainHint(overrides?: ModelOverrides): string {
  const complexAlias = overrides?.complex_model || "gemini-2.5-pro";
  const label = COMPLEX_SHORT[complexAlias] ?? complexAlias;
  return `Brain · ${label} solo · all tasks`;
}

const SEGMENTS: Segment[] = [
  {
    value: "conversation",
    label: "Chat",
    icon: "💬",
    activeBg: "bg-blue-400/15",
    activeBorder: "border-blue-400/50",
    activeText: "text-blue-300",
    hint: "Chat · Flash + Brain stack",
  },
  {
    value: "ingestion",
    label: "Ingest",
    icon: "📥",
    activeBg: "bg-green-400/15",
    activeBorder: "border-green-400/50",
    activeText: "text-green-300",
    hint: ingestionHint,  // dynamic — uses overrides
  },
  {
    value: "big_brain",
    label: "Brain",
    icon: "🧠",
    activeBg: "bg-purple-400/15",
    activeBorder: "border-purple-400/50",
    activeText: "text-purple-300",
    hint: brainHint,
  },
];

interface StackModeSliderProps {
  compact?: boolean;
  /** Optional model aliases from settings — forwarded to start_agents.sh as GGUF overrides. */
  overrides?: ModelOverrides;
}

/**
 * StackModeSlider — 3-segment GPU stack mode control.
 *
 * Only render this when mode === "local".
 *
 * compact=true  → tight pill row with no subtitle (ImportDataPage)
 * compact=false → pill row + restart hint + active stack description (Settings)
 *
 * SMART ROUTING:
 * The slider always shows 3 segments, but under the hood routes to the correct
 * internal mode based on the configured OCR model:
 *   "Ingest" + Solo 30B OCR  → ocr-solo  (Flash would OOM)
 *   "Ingest" + 32B/Big Brain → big_brain  (only 32B handles this)
 *   "Ingest" + everything else → ingestion (Flash + OCR)
 * The correct segment is always highlighted based on VISUAL_SEGMENT_MAP.
 */
export default function StackModeSlider({ compact = false, overrides }: StackModeSliderProps) {
  const { stackMode, stackSwitching, stackBooting, switchStack, scriptsConfigured, sshMode } = useStackMode();

  // Map internal stack mode (including hidden modes) to the visible segment
  const visualSegment = VISUAL_SEGMENT_MAP[stackMode] ?? stackMode;

  const active = SEGMENTS.find((s) => s.value === visualSegment);
  const isLoading = stackSwitching || stackBooting;
  const resolvedHint = active?.hint
    ? typeof active.hint === "function"
      ? active.hint(overrides)
      : active.hint
    : "";

  // Extra context for hidden modes shown in the status line
  const hiddenModeNote =
    stackMode === "ocr-solo"       ? " (Solo OCR — Flash not loaded)" :
    stackMode === "ingestion-full" ? " (Full stack — Flash + Brain + OCR)" :
    stackMode === "flash"          ? " (Flash only)" :
    "";

  const statusText = stackSwitching
    ? "Sending restart signal…"
    : stackBooting
      ? `Stack restarting in ${stackMode} mode — takes 60–90 s`
      : !scriptsConfigured
        ? "⚠ GPU stack control not configured — set AGENTS_ROUTER_CONTROL_URL (Docker) or SSH_AGENTS_CMD (SSH) in backend/.env"
        : resolvedHint + hiddenModeNote;

  const statusColor = isLoading
    ? "text-amber-400/70 animate-pulse"
    : !scriptsConfigured
      ? "text-amber-500/60"
      : resolvedHint.startsWith("⚠")
        ? "text-amber-400/60"
        : "text-secondary/50";

  return (
    <div className={`flex flex-col gap-1.5 ${compact ? "" : "items-start"}`}>
      {/* Segmented pill row */}
      <div className="flex gap-1 p-1 rounded-lg border border-foreground/20 bg-background w-fit">
        {SEGMENTS.map(({ value, label, icon, activeBg, activeBorder, activeText }) => {
          // Use visual segment map so hidden modes (ocr-solo, ingestion-full) still
          // highlight the correct visible button
          const isActive = visualSegment === value;
          const isSwitching = stackSwitching && isActive;

          // When user clicks "Ingest", resolve to the correct internal mode
          // When user clicks "Brain", ensure the complex_model override is forwarded
          const handleClick = () => {
            const actualMode = value === "ingestion"
              ? resolveIngestionMode(overrides)
              : value;
            switchStack(actualMode, overrides);
          };

          return (
            <button
              key={value}
              disabled={stackSwitching}
              onClick={handleClick}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                isActive
                  ? `${activeBg} ${activeText} border ${activeBorder}`
                  : "text-secondary hover:text-primary hover:bg-foreground/10",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              <span>{icon}</span>
              {isSwitching ? <LoadingDots /> : <span>{label}</span>}
              {isActive && stackBooting && !isSwitching && <LoadingDots />}
            </button>
          );
        })}
      </div>

      {/* Status line — full variant only */}
      {!compact && (
        <div className="flex items-center gap-1.5">
          {isLoading && <LoadingDots className="text-amber-400/70" />}
          <p className={`text-xs transition-colors ${statusColor}`}>
            {statusText}
            {scriptsConfigured && sshMode && !isLoading && (
              <span className="ml-1.5 opacity-40">(SSH)</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
