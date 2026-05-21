/**
 * ModelMemoryBar — live VRAM/RAM estimate for the local GPU stack.
 *
 * Shows a stacked horizontal bar: Flash | Brain | OCR-VL | (KV) | Free
 * Driven by PlanResult from POST /api/custom/plan-stack.
 *
 * No chart library — pure CSS flex segments with smooth transitions.
 */
import React from "react";

// ── Types from ResourcePlanner ───────────────────────────────────────────────

interface SlotResult {
  slot: string;
  model: string;
  label: string;
  weightGb: number;
  kvGb: number;
  totalGb: number;
  ctx: number;
  runtime: string;
  defaultTemp: number;
}

export interface Remediation {
  action: "reduce_ctx" | "unload_slot";
  slot: string;
  newCtx?: number;
  savingsGb: number;
  message: string;
  shortLabel?: string;
}

export interface PlanResult {
  fits: boolean;
  gpuGb: number;
  safetyPct: number;
  budgetGb: number;
  usedGb: number;
  kvGb: number;
  totalGb: number;
  freeGb: number;
  perSlot: SlotResult[];
  remediations: Remediation[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtGb(gb: number | undefined | null): string {
  if (gb == null || !isFinite(gb) || gb <= 0) return "0";
  if (gb < 1)  return `${Math.round(gb * 1024)} MB`;
  return `${gb % 1 === 0 ? gb : gb.toFixed(1)} GB`;
}

const SLOT_COLORS: Record<string, string> = {
  flash: "#60a5fa",
  brain: "#a78bfa",
  ocr:   "#34d399",
};

// ── Remediation list ─────────────────────────────────────────────────────────

function RemediationList({
  remediations,
  onApply,
}: {
  remediations: Remediation[];
  onApply?: (r: Remediation) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const visible = expanded ? remediations : remediations.slice(0, 2);
  const hidden = remediations.length - 2;

  return (
    <div className="mt-1 p-2 rounded-md border border-amber-500/30 bg-amber-500/5">
      <div className="text-xs font-semibold text-amber-400 mb-1.5">
        ⚠ La stack supera il budget VRAM — correzioni suggerite:
      </div>
      <div className="flex flex-col gap-1.5">
        {visible.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-2 rounded bg-amber-500/5 px-2 py-1.5 border border-amber-500/15">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs text-primary truncate">
                {r.shortLabel ?? r.message}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400/80">
                risparmia {r.savingsGb.toFixed(1)} GB
              </span>
            </div>
            {onApply && (
              <button
                onClick={() => onApply(r)}
                className="text-[11px] px-2 py-0.5 rounded border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors shrink-0 whitespace-nowrap"
              >
                Applica
              </button>
            )}
          </div>
        ))}
      </div>
      {!expanded && hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-1.5 text-[11px] text-secondary/60 hover:text-secondary transition-colors underline"
        >
          Mostra tutti i {remediations.length} suggerimenti
        </button>
      )}
      {expanded && hidden > 0 && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-1.5 text-[11px] text-secondary/60 hover:text-secondary transition-colors underline"
        >
          Mostra meno
        </button>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface ModelMemoryBarProps {
  /** PlanResult from POST /api/custom/plan-stack. Null = loading state. */
  planResult: PlanResult | null;
  /** Show skeleton while loading */
  loading?: boolean;
  /** Error message when plan fetch failed */
  error?: string | null;
  /** Called when user clicks "Apply" on a remediation suggestion */
  onApplyRemediation?: (remediation: Remediation) => void;
}

export default function ModelMemoryBar({ planResult, loading, error, onApplyRemediation }: ModelMemoryBarProps) {
  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Stima VRAM</span>
          <span className="text-xs text-amber-500/70">{error}</span>
        </div>
        <div className="w-full rounded-full overflow-hidden bg-white/5 opacity-30" style={{ height: "14px" }} />
      </div>
    );
  }
  if (loading || !planResult) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Stima VRAM</span>
          <span className="text-xs text-secondary opacity-50">Caricamento…</span>
        </div>
        <div className="w-full rounded-full overflow-hidden bg-white/5 animate-pulse" style={{ height: "14px" }} />
      </div>
    );
  }


  const { fits, budgetGb, totalGb, freeGb, perSlot = [], remediations = [] } = planResult;
  const displayTotal = fits ? budgetGb : totalGb;

  const slots = perSlot.map((s) => ({
    key:   s.slot,
    label: s.slot === "brain" && s.label.includes("Big Brain") ? "Big Brain" : s.slot.charAt(0).toUpperCase() + s.slot.slice(1),
    gb:    s.weightGb,
    kv:    s.kvGb,
    color: SLOT_COLORS[s.slot] ?? "#94a3b8",
  })).filter((s) => s.gb > 0);

  const pctOf = (gb: number) =>
    `${Math.max(1.5, (gb / displayTotal) * 100).toFixed(2)}%`;

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Stima VRAM</span>
        <span className="text-xs font-mono">
          <span className={!fits ? "text-red-400 font-bold" : "text-primary"}>
            {fmtGb(totalGb)}
          </span>
          <span className="text-secondary opacity-50"> / {fmtGb(budgetGb)}</span>
          {!fits && (
            <span className="ml-2 text-red-400 font-bold text-[10px] uppercase tracking-wider">
              ⚠ rischio OOM
            </span>
          )}
        </span>
      </div>

      {/* Stacked bar */}
      <div
        className="relative flex w-full rounded-full overflow-hidden"
        style={{ height: "14px", gap: "1px", backgroundColor: "rgba(255,255,255,0.04)" }}
      >
        {slots.map(({ key, gb, kv, color, label }) => (
          <React.Fragment key={key}>
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{ width: pctOf(gb), backgroundColor: color, opacity: 0.78 }}
              title={`${label} weights: ${fmtGb(gb)}`}
            />
            {kv > 0.04 && (
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{ width: pctOf(kv), backgroundColor: color, opacity: 0.22 }}
                title={`${label} KV cache: ${fmtGb(kv)}`}
              />
            )}
          </React.Fragment>
        ))}
        {freeGb > 0.05 && (
          <div
            className="h-full flex-1 opacity-15"
            style={{ backgroundColor: "white" }}
            title={`Libera: ${fmtGb(freeGb)}`}
          />
        )}
        {!fits && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: "inset 0 0 0 1px rgba(239,68,68,0.55)" }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {slots.map(({ key, label, gb, kv, color }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ backgroundColor: color, opacity: 0.78 }}
            />
            <span className="text-xs text-secondary">{label}</span>
            <span className="text-xs font-mono text-primary">{fmtGb(gb)}</span>
            {kv > 0.04 && (
              <span className="text-xs font-mono text-secondary opacity-40">
                +{fmtGb(kv)} KV
              </span>
            )}
          </div>
        ))}
        {freeGb > 0.05 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm shrink-0 bg-white opacity-20" />
            <span className="text-xs text-secondary">Libera</span>
            <span className="text-xs font-mono text-primary">{fmtGb(freeGb)}</span>
          </div>
        )}
      </div>

      {/* Remediation banner — max 2 items shown by default, expandable */}
      {remediations.length > 0 && (
        <RemediationList remediations={remediations} onApply={onApplyRemediation} />
      )}
    </div>
  );
}
