"use client";

/**
 * SlotStatusRow — unified slot status indicator used in BOTH:
 *   - Settings → Models → GPU Stack Status card   (variant="dev")
 *   - Import Data → Active pipeline card           (variant="user")
 *
 * Dot colour rules (same everywhere):
 *   • bg-emerald-400         — slot is ready / model loaded
 *   • bg-amber-400 animate-pulse — slot is booting / loading
 *   • bg-zinc-600            — slot not running
 *   • bg-zinc-500 opacity-40 — not applicable for current stack mode
 *
 * variant="dev"  → shows port label (e.g. "Router :8090") + GGUF model name
 * variant="user" → shows friendly role label (e.g. "Extraction") + short name
 */
import React from "react";
import LoadingDots from "./LoadingDots";

export interface SlotStatusRowProps {
  /** Display label — e.g. "Flash  :8082" (dev) or "Extraction" (user) */
  label: string;
  /** Whether the slot is currently ready (model loaded and responding). */
  ready: boolean;
  /** Model name / display string shown when ready. */
  model?: string;
  /**
   * True while a stack restart or slot-swap is in progress.
   * Shows amber pulse dot + LoadingDots animation instead of "Not running".
   */
  loading?: boolean;
  /**
   * True when the slot is intentionally not started in the current mode.
   * e.g. Brain in ingestion mode.  Shows a dimmed dash, not "Not running".
   */
  notApplicable?: boolean;
  /** "dev" shows more detail; "user" shows friendly minimal display. */
  variant?: "dev" | "user";
  /** Optional Tailwind classes applied to the row wrapper. */
  className?: string;
  /**
   * True when CUDA 13.2 is detected on this slot's llama-server.
   * Shows a warning badge — CUDA 13.2 causes garbled GGUF output.
   */
  cudaWarning?: boolean;
  /** CUDA version string reported by the slot's /props endpoint. */
  cudaVersion?: string | null;
}

export default function SlotStatusRow({
  label,
  ready,
  model,
  loading = false,
  notApplicable = false,
  variant = "dev",
  className = "",
  cudaWarning = false,
  cudaVersion,
}: SlotStatusRowProps) {
  // Dot colour
  const dotCls = notApplicable
    ? "bg-zinc-600 opacity-40"
    : ready
      ? "bg-emerald-400"
      : loading
        ? "bg-amber-400 animate-pulse"
        : "bg-zinc-600";

  // Status text / content
  let statusContent: React.ReactNode;
  if (notApplicable) {
    statusContent = <span className="text-xs text-secondary/30">—</span>;
  } else if (loading && !ready) {
    // Booting: show amber dots
    statusContent = <LoadingDots className="text-amber-400/80" />;
  } else if (ready) {
    const displayName = model ?? "Pronto";
    statusContent = (
      <span className="text-xs text-primary font-mono truncate" title={displayName}>
        {displayName}
      </span>
    );
  } else {
    // Not running
    statusContent = <span className="text-xs text-secondary/50">Non in esecuzione</span>;
  }

  if (variant === "user") {
    // Compact user-facing row: dot on left, label, status text on right
    return (
      <div className={`flex items-center justify-between gap-2 ${className}`}>
        <span className="text-xs text-secondary shrink-0">{label}</span>
        <div className="flex items-center gap-1.5 max-w-[58%]">
          {/* Show dot only in local mode (meaningful) */}
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
          <span className="text-xs text-primary font-mono truncate text-right">
            {notApplicable
              ? "—"
              : loading && !ready
                ? <LoadingDots className="text-amber-400/80" />
                : ready
                  ? (model ?? "Pronto")
                  : "Non in esecuzione"}
          </span>
        </div>
      </div>
    );
  }

  // Dev variant: wider label column, full status content
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className={`flex items-center gap-2`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotCls}`} />
        <span className="text-xs text-secondary w-24 shrink-0">{label}</span>
        {statusContent}
      </div>
      {cudaWarning && (
        <div className="ml-8 flex items-center gap-1 text-[10px] text-red-400/90 leading-snug">
          <span>⚠ Rilevata CUDA {cudaVersion} — gli output GGUF potrebbero essere errati.</span>
          <a
            href="https://unsloth.ai/docs/get-started/requirements"
            target="_blank"
            rel="noreferrer"
            className="underline opacity-70 hover:opacity-100"
          >
            Aggiorna a CUDA 12.4+
          </a>
        </div>
      )}
    </div>
  );
}
