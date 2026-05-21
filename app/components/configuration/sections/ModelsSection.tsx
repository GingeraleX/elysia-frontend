import React, { useCallback, useEffect, useRef, useState } from "react";
import { TbManualGearboxFilled, TbArrowBackUp } from "react-icons/tb";
import { DeleteButton } from "@/app/components/navigation/DeleteButton";
import { FaRobot, FaServer, FaSpinner } from "react-icons/fa";
import { IoInformationCircle, IoWarningOutline } from "react-icons/io5";
import { MdCloudQueue } from "react-icons/md";
import {
  SettingCard,
  SettingHeader,
  SettingGroup,
  SettingItem,
  SettingTitle,
} from "../SettingComponents";
import SettingCombobox, { ComboboxOption } from "../SettingCombobox";
import SettingInput from "../SettingInput";
import WarningCard from "../WarningCard";
import ModelBadges from "../ModelBadge";
import { Button } from "@/components/ui/button";
import { BackendConfig, ModelProvider } from "@/app/types/objects";
import { SystemMode, ModelOverrides } from "@/app/api/modeToggle";
import { useMode } from "@/app/components/contexts/ModeContext";
import { useStackMode } from "@/app/components/contexts/StackModeContext";
import StackModeSlider from "../StackModeSlider";
import { useModelStatus } from "@/app/components/configuration/hooks/useModelStatus";
import { useModelCatalog } from "@/app/components/configuration/hooks/useModelCatalog";
import ModelMemoryBar, {
  type PlanResult,
  type Remediation,
} from "../ModelMemoryBar";
import { host } from "@/app/components/host";
import SlotStatusRow from "../SlotStatusRow";

// ── Default temp/ctx tables — previously from ModelMemoryBar, now local ──────
// These provide instant UI defaults when a model dropdown changes, without
// waiting for the plan-stack API round-trip.
const ALIAS_DEFAULT_TEMP: Record<string, number> = {
  "gemini-2.5-flash-lite": 0.7, "gemini-1.5-flash-8b": 0.7, "gemini-1.5-flash": 0.7,
  "gemini-2.0-flash": 0.7, "gemini-2.5-flash": 0.7, "deepseek-r1-1.5b": 0.6,
  "gemini-2.5-pro": 0.7, "gemini-2.5-pro-preview": 0.7,
  "deepseek-r1-7b": 0.6, "deepseek-r1-8b": 0.6, "deepseek-r1-llama-8b": 0.6, "deepseek-r1-14b": 0.6,
  "gemini-1.5-pro-vision": 1.0, "gemini-vl-2b": 0.7, "gemini-vl-2b-think": 1.0,
  "gemini-vl-4b": 0.7, "gemini-vl-4b-think": 1.0, "gemini-vl-8b": 0.7, "gemini-vl-8b-think": 1.0,
  "gemini-ocr-2": 0.0, "gemini-vl-30b": 1.0, "gemini-vl-30b-instruct": 0.7,
  "gemini-big-brain": 1.0,
  // Gemma 4 slot (port 8084) — Google-recommended defaults: temp=1.0, top_p=0.95, top_k=64
  "gemma-4-e2b": 1.0, "gemma-4-e4b": 1.0, "gemma-4-26b": 1.0, "gemma-4-31b": 1.0,
};

/**
 * Architecture maximum context window (modelMaxCtx) — upper bound for the context slider.
 * Qwen3.5 / Qwen3-VL = 262144 (256K), DeepSeek-R1 = 131072 (128K), OCR-2 = 8192 (8K).
 */
const ALIAS_MAX_CTX: Record<string, number> = {
  "gemini-2.5-flash-lite": 262144, "gemini-1.5-flash-8b": 262144, "gemini-1.5-flash": 262144,
  "gemini-2.0-flash": 262144, "gemini-2.5-flash": 262144, "deepseek-r1-1.5b": 131072,
  "gemini-2.5-pro": 262144, "gemini-2.5-pro-preview": 262144,
  "deepseek-r1-7b": 131072, "deepseek-r1-8b": 131072, "deepseek-r1-llama-8b": 131072, "deepseek-r1-14b": 131072,
  "gemini-1.5-pro-vision": 262144, "gemini-vl-2b": 262144, "gemini-vl-2b-think": 262144,
  "gemini-vl-4b": 262144, "gemini-vl-4b-think": 262144, "gemini-vl-8b": 262144, "gemini-vl-8b-think": 262144,
  "gemini-ocr-2": 8192, "gemini-vl-30b": 262144, "gemini-vl-30b-instruct": 262144,
  "gemini-big-brain": 262144,
  // Gemma 4 — E2B/E4B: 128K; 26B/31B: 256K
  "gemma-4-e2b": 131072, "gemma-4-e4b": 131072, "gemma-4-26b": 262144, "gemma-4-31b": 262144,
};

/**
 * Default runtime context size (ctxSize) — initial slider position and VRAM-safe default.
 * These match the ctxSize values in MODEL_SWAP_CATALOG.
 */
const ALIAS_DEFAULT_CTX: Record<string, number> = {
  "gemini-2.5-flash-lite": 32768, "gemini-1.5-flash-8b": 32768, "gemini-1.5-flash": 32768,
  "gemini-2.0-flash": 32768, "gemini-2.5-flash": 32768, "deepseek-r1-1.5b": 32768,
  "gemini-2.5-pro": 131072, "gemini-2.5-pro-preview": 131072,
  "deepseek-r1-7b": 65536, "deepseek-r1-8b": 65536, "deepseek-r1-llama-8b": 65536, "deepseek-r1-14b": 65536,
  "gemini-1.5-pro-vision": 32768, "gemini-vl-2b": 32768, "gemini-vl-2b-think": 32768,
  "gemini-vl-4b": 32768, "gemini-vl-4b-think": 32768, "gemini-vl-8b": 32768, "gemini-vl-8b-think": 32768,
  "gemini-ocr-2": 8192, "gemini-vl-30b": 32768, "gemini-vl-30b-instruct": 32768,
  "gemini-big-brain": 131072,
  // Gemma 4 — default 32K ctx (safe for most VRAM configs); E4B-brain uses 64K (has more VRAM headroom)
  "gemma-4-e2b": 32768, "gemma-4-e4b": 32768, "gemma-4-26b": 32768, "gemma-4-31b": 32768,
  // Gemma 4 Flash/Brain slot variants
  "gemma-4-e2b-flash": 32768, "gemma-4-e4b-brain": 65536,
};

/** KV cache cost in GB per 1000 context tokens — used for inline cost display */
const ALIAS_KV_PER_KTOKEN: Record<string, number> = {
  "gemini-2.5-flash-lite": 0.014, "gemini-1.5-flash-8b": 0.028, "gemini-1.5-flash": 0.046,
  "gemini-2.0-flash": 0.046, "gemini-2.5-flash": 0.046, "deepseek-r1-1.5b": 0.018,
  "gemini-2.5-pro": 0.115, "gemini-2.5-pro-preview": 0.115,
  "deepseek-r1-7b": 0.079, "deepseek-r1-8b": 0.090, "deepseek-r1-llama-8b": 0.090, "deepseek-r1-14b": 0.140,
  "gemini-1.5-pro-vision": 0.090, "gemini-vl-2b": 0.028, "gemini-vl-2b-think": 0.028,
  "gemini-vl-4b": 0.046, "gemini-vl-4b-think": 0.046, "gemini-vl-8b": 0.090, "gemini-vl-8b-think": 0.090,
  "gemini-ocr-2": 0.040, "gemini-vl-30b": 0.034, "gemini-vl-30b-instruct": 0.034,
  "gemini-big-brain": 0.250,
  // Gemma 4 — approximate GQA KV cost (per Google architecture)
  "gemma-4-e2b": 0.032, "gemma-4-e4b": 0.064, "gemma-4-26b": 0.046, "gemma-4-31b": 0.110,
};

// ── Temperature slider ──────────────────────────────────────────────────────
function TempSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const presets = [0.0, 0.6, 0.7, 1.0, 1.5];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-secondary">{label}</span>
        <span className="text-xs font-mono text-primary w-8 text-right">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={200}
        step={5}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(parseInt(e.target.value, 10) / 100)}
        className="w-full h-[3px] rounded-full appearance-none cursor-pointer bg-foreground/20
          [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary"
      />
      <div className="flex gap-1">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
              Math.abs(value - p) < 0.03
                ? "border-primary/50 bg-foreground/15 text-primary"
                : "border-foreground/25 text-secondary/60 hover:text-primary hover:border-foreground/50"
            }`}
          >
            {p.toFixed(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Context length selector ─────────────────────────────────────────────────
const CTX_OPTIONS = [
  { v: 2048,   l: "2k" },
  { v: 4096,   l: "4k" },
  { v: 8192,   l: "8k" },
  { v: 16384,  l: "16k" },
  { v: 32768,  l: "32k" },
  { v: 65536,  l: "64k" },
  { v: 131072, l: "128k" },
  { v: 262144, l: "256k" },
];

function CtxSelector({
  label,
  value,
  maxCtx,
  defaultCtx,
  kvPerKToken,
  onChange,
}: {
  label: string;
  value: number;
  maxCtx: number;
  defaultCtx?: number;
  kvPerKToken?: number;
  onChange: (v: number) => void;
}) {
  const kvGb = kvPerKToken ? kvPerKToken * (value / 1000) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-secondary">{label}</span>
        <span className="text-xs font-mono text-primary">
          {value >= 1024 ? `${(value / 1024).toFixed(0)}k` : value}
          {kvGb > 0.05 && (
            <span className="text-secondary opacity-50 ml-1.5">+{kvGb < 1 ? `${Math.round(kvGb * 1024)} MB` : `${kvGb.toFixed(1)} GB`} KV</span>
          )}
        </span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {CTX_OPTIONS.filter((o) => o.v <= maxCtx * 1.05).map(({ v, l }) => {
          const isDefault = defaultCtx !== undefined && v === defaultCtx;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                value === v
                  ? "border-primary/50 bg-foreground/15 text-primary"
                  : isDefault
                    ? "border-foreground/35 text-secondary/80 hover:text-primary hover:border-foreground/50"
                    : "border-foreground/25 text-secondary/60 hover:text-primary hover:border-foreground/50"
              }`}
            >
              {l}{isDefault && " ★"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ModelsSectionProps {
  currentUserConfig: BackendConfig | null;
  modelsData: { [key: string]: ModelProvider } | null;
  loadingModels: boolean;
  modelsIssues: string[];
  missingApiKeys?: string[];
  baseProviderValid?: boolean;
  baseModelValid?: boolean;
  complexProviderValid?: boolean;
  complexModelValid?: boolean;
  onUpdateSettings: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyOrUpdates: string | Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any
  ) => void;
  onUpdateConfig: (config: BackendConfig) => void;
  setChangedConfig: (changed: boolean) => void;
  showDocumentation?: boolean;
  title?: string;
  onResetConfig?: () => void;
  onModeChange?: (newMode: SystemMode) => void;
}

/**
 * Component for configuring AI models settings
 * Handles base and complex model selection, provider settings, and API base URL
 */
export default function ModelsSection({
  currentUserConfig,
  modelsData,
  loadingModels,
  modelsIssues,
  missingApiKeys = [],
  baseProviderValid = true,
  baseModelValid = true,
  complexProviderValid = true,
  complexModelValid = true,
  onUpdateSettings,
  onUpdateConfig,
  setChangedConfig,
  showDocumentation = true,
  title = "Modelli",
  onResetConfig,
  onModeChange,
}: ModelsSectionProps) {
  // ── Mode from shared context — syncs with sidebar ModeToggle, ImportDataPage, etc.
  const { mode: activeMode, switching, switchMode } = useMode();

  // viewTab: which tab the user is *viewing* (can differ from activeMode
  // when browsing the inactive tab). Snaps to activeMode on external switch.
  const [viewTab, setViewTab] = useState<SystemMode>(activeMode);
  const [modeError, setModeError] = useState<string | null>(null);

  // Stack mode from shared StackModeContext — syncs with ImportDataPage
  const { stackMode, stackSwitching, stackBooting, slotApplying, switchStack, applyModels, scriptsConfigured, swapConfigured, sshMode, modelWarnings } = useStackMode();

  // Poll model readiness when viewing local tab
  const { status: modelStatus } = useModelStatus(viewTab === "local", 5000);

  // ── Dynamic catalog maps — fetched from backend, override static fallback tables ──
  // Enables any new model added to MODEL_SWAP_CATALOG to immediately get correct
  // ctx/temp slider behaviour without a frontend code change.
  const { maps: catalogMaps } = useModelCatalog(viewTab === "local");

  // Merged lookup helpers — dynamic catalog wins, static tables are the fallback
  const maxCtxFor     = (alias: string): number =>
    catalogMaps.maxCtx[alias]     ?? ALIAS_MAX_CTX[alias]     ?? 32768;
  const defaultCtxFor = (alias: string): number =>
    catalogMaps.defaultCtx[alias] ?? ALIAS_DEFAULT_CTX[alias] ?? 32768;
  const defaultTempFor = (alias: string): number =>
    catalogMaps.defaultTemp[alias] ?? ALIAS_DEFAULT_TEMP[alias] ?? 0.7;
  const kvPerKTokenFor = (alias: string): number | undefined =>
    catalogMaps.kvPerKToken[alias] ?? ALIAS_KV_PER_KTOKEN[alias];


  // ── Local inference param state ────────────────────────────────────────
  const s = (currentUserConfig?.settings ?? {}) as Record<string, unknown>;

  // GPU memory for chart (persisted to settings)
  const [gpuMemGb, setGpuMemGb] = useState<number>(
    (s.LOCAL_GPU_MEM_GB as number) || 16
  );

  // Temperature per slot — seeded from settings or catalog defaults
  const [flashTemp, setFlashTemp] = useState<number>(
    (s.LOCAL_FLASH_TEMPERATURE as number) ??
    ALIAS_DEFAULT_TEMP[(s.LOCAL_BASE_MODEL as string) || "gemini-1.5-flash"] ??
    0.7
  );
  const [brainTemp, setBrainTemp] = useState<number>(
    (s.LOCAL_BRAIN_TEMPERATURE as number) ??
    ALIAS_DEFAULT_TEMP[(s.LOCAL_COMPLEX_MODEL as string) || "gemini-2.5-pro"] ??
    0.7
  );
  const [ocrTemp, setOcrTemp] = useState<number>(
    (s.LOCAL_OCR_TEMPERATURE as number) ??
    ALIAS_DEFAULT_TEMP[(s.LOCAL_OCR_MODEL as string) || "gemini-1.5-pro-vision"] ??
    1.0
  );

  // Context window per slot — seeded from settings or catalog defaults
  const [flashCtx, setFlashCtx] = useState<number>(
    (s.LOCAL_FLASH_CTX as number) ||
    ALIAS_DEFAULT_CTX[(s.LOCAL_BASE_MODEL as string) || "gemini-1.5-flash"] ||
    32768
  );
  const [brainCtx, setBrainCtx] = useState<number>(
    (s.LOCAL_BRAIN_CTX as number) ||
    ALIAS_DEFAULT_CTX[(s.LOCAL_COMPLEX_MODEL as string) || "gemini-2.5-pro"] ||
    131072
  );
  const [ocrCtx, setOcrCtx] = useState<number>(
    (s.LOCAL_OCR_CTX as number) ||
    ALIAS_DEFAULT_CTX[(s.LOCAL_OCR_MODEL as string) || "gemini-1.5-pro-vision"] ||
    32768
  );

  // Pending changes flag — set whenever any local model/param changes, cleared on Apply
  const [pendingChanges, setPendingChanges] = useState(false);
  // Ref used to reset pendingChanges after a successful Apply without extra renders
  const pendingRef = useRef(false);

  // ── VRAM plan state — driven by POST /api/custom/plan-stack ──────────────
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const planTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced plan-stack fetch — fires 300ms after the last model/ctx/gpu change
  const fetchPlan = useCallback(() => {
    if (planTimerRef.current) clearTimeout(planTimerRef.current);
    planTimerRef.current = setTimeout(async () => {
      if (viewTab === "cloud") return; // Only relevant for local mode
      setPlanLoading(true);
      setPlanError(null);
      try {
        const ns = (currentUserConfig?.settings ?? {}) as Record<string, unknown>;
        const res = await fetch(`${host}/api/custom/plan-stack`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flash: (ns.LOCAL_BASE_MODEL as string) || "gemini-1.5-flash",
            brain: (ns.LOCAL_COMPLEX_MODEL as string) || "gemini-2.5-pro",
            ocr: (ns.LOCAL_OCR_MODEL as string) || "gemini-1.5-pro-vision",
            flash_ctx: flashCtx,
            brain_ctx: brainCtx,
            ocr_ctx: ocrCtx,
            gpu_gb: gpuMemGb,
            safety_pct: 15,
            stack_mode: stackMode,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPlanResult(data as PlanResult);
        } else {
          setPlanError(`Plan API returned ${res.status}`);
        }
      } catch {
        setPlanError("Plan API unreachable — is the backend running?");
      } finally {
        setPlanLoading(false);
      }
    }, 300);
  }, [viewTab, currentUserConfig?.settings, flashCtx, brainCtx, ocrCtx, gpuMemGb, stackMode]);

  // Trigger plan-stack on model/ctx/gpu changes
  useEffect(() => {
    fetchPlan();
    return () => { if (planTimerRef.current) clearTimeout(planTimerRef.current); };
  }, [fetchPlan]);

  // Sync viewTab when global mode changes
  useEffect(() => { setViewTab(activeMode); }, [activeMode]);

  // Reseed temp/ctx state when config loads (e.g. user switches config)
  useEffect(() => {
    const ns = (currentUserConfig?.settings ?? {}) as Record<string, unknown>;
    setGpuMemGb((ns.LOCAL_GPU_MEM_GB as number) || 16);
    setFlashTemp((ns.LOCAL_FLASH_TEMPERATURE as number) ?? defaultTempFor((ns.LOCAL_BASE_MODEL as string) || "gemini-1.5-flash"));
    setBrainTemp((ns.LOCAL_BRAIN_TEMPERATURE as number) ?? defaultTempFor((ns.LOCAL_COMPLEX_MODEL as string) || "gemini-2.5-pro"));
    setOcrTemp  ((ns.LOCAL_OCR_TEMPERATURE   as number) ?? defaultTempFor((ns.LOCAL_OCR_MODEL as string) || "gemini-1.5-pro-vision"));
    setFlashCtx ((ns.LOCAL_FLASH_CTX as number) || defaultCtxFor((ns.LOCAL_BASE_MODEL as string) || "gemini-1.5-flash"));
    setBrainCtx ((ns.LOCAL_BRAIN_CTX as number) || defaultCtxFor((ns.LOCAL_COMPLEX_MODEL as string) || "gemini-2.5-pro"));
    setOcrCtx   ((ns.LOCAL_OCR_CTX   as number) || defaultCtxFor((ns.LOCAL_OCR_MODEL as string) || "gemini-1.5-pro-vision"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserConfig?.id]);

  // Stack mode is GPU-only — managed by StackModeContext, no local fetch needed

  async function handleSwitch(to: SystemMode) {
    if (to === activeMode || switching) return;
    setModeError(null);
    const ok = await switchMode(to);
    if (ok) {
      onUpdateSettings("PROCESSING_MODE", to);
      onModeChange?.(to);
    } else {
      setModeError("Switch failed — is the backend running?");
    }
  }

  // Apply all pending local changes (models + temp + ctx) to the running stack.
  // Uses per-slot swap — only restarts slots that actually changed.
  // Full stack restart is only triggered by the mode slider (StackModeSlider).
  async function handleApply() {    if (stackBooting || stackSwitching || slotApplying) return;
    const curS = (currentUserConfig?.settings ?? {}) as Record<string, unknown>;
    const overrides: ModelOverrides = {
      base_model:        (curS.LOCAL_BASE_MODEL    as string) || undefined,
      complex_model:     (curS.LOCAL_COMPLEX_MODEL as string) || undefined,
      ocr_model:         (curS.LOCAL_OCR_MODEL     as string) || undefined,
      flash_temperature: flashTemp,
      brain_temperature: brainTemp,
      ocr_temperature:   ocrTemp,
      flash_ctx:         flashCtx,
      brain_ctx:         brainCtx,
      ocr_ctx:           ocrCtx,
    };
    const ok = await applyModels(overrides);
    if (ok) {
      setPendingChanges(false);
      pendingRef.current = false;
    }
  }

  function markPending() {
    if (!pendingRef.current) {
      pendingRef.current = true;
      setPendingChanges(true);
    }
  }

  /**
   * Handle an "Apply" click on a VRAM remediation suggestion.
   * - reduce_ctx: lower the context slider for the affected slot to newCtx, then apply.
   * - unload_slot: deselect the slot's model (set to ""), then apply.
   */
  async function handleApplyRemediation(r: Remediation) {
    if (r.action === "reduce_ctx" && r.newCtx) {
      if (r.slot === "flash") setFlashCtx(r.newCtx);
      else if (r.slot === "brain") setBrainCtx(r.newCtx);
      else if (r.slot === "ocr") setOcrCtx(r.newCtx);
      markPending();
    } else if (r.action === "unload_slot") {
      if (r.slot === "flash") { onUpdateSettings("LOCAL_BASE_MODEL",    ""); markPending(); }
      else if (r.slot === "brain") { onUpdateSettings("LOCAL_COMPLEX_MODEL", ""); markPending(); }
      else if (r.slot === "ocr")   { onUpdateSettings("LOCAL_OCR_MODEL",     ""); markPending(); }
    }
    await handleApply();
  }


  // Big brain locks local model fields — everything routes to the 32B model
  const isCloud = viewTab === "cloud";
  const isBigBrain = !isCloud && stackMode === "big_brain";

  // Build model overrides from current settings — forwarded to start_agents.sh as GGUF env vars
  const stackOverrides: ModelOverrides | undefined = !isCloud ? {
    base_model:    (currentUserConfig?.settings?.LOCAL_BASE_MODEL    as string) || undefined,
    complex_model: (currentUserConfig?.settings?.LOCAL_COMPLEX_MODEL as string) || undefined,
    ocr_model:     (currentUserConfig?.settings?.LOCAL_OCR_MODEL     as string) || undefined,
  } : undefined;

  const isViewingActive = viewTab === activeMode;

  /**
   * Handle a model change on the local tab — updates Settings state only.
   * No immediate stack restart; user must click "Apply to stack" explicitly.
   */
  function handleLocalModelChange(settingsKey: string, value: string) {
    onUpdateSettings(settingsKey, value);
    markPending();
    // Also update the ctx/temp defaults when the model alias changes
    if (settingsKey === "LOCAL_BASE_MODEL" && value) {
      const defCtx  = defaultCtxFor(value);
      const defTemp = defaultTempFor(value);
      const prevAlias = (currentUserConfig?.settings?.LOCAL_BASE_MODEL as string) || "";
      if (flashCtx  === (defaultCtxFor(prevAlias)  || 32768))  setFlashCtx(defCtx);
      if (Math.abs(flashTemp - (defaultTempFor(prevAlias) ?? 0.7)) < 0.01) setFlashTemp(defTemp);
    }
    if (settingsKey === "LOCAL_COMPLEX_MODEL" && value) {
      const defCtx  = defaultCtxFor(value);
      const defTemp = defaultTempFor(value);
      const prevAlias = (currentUserConfig?.settings?.LOCAL_COMPLEX_MODEL as string) || "";
      if (brainCtx  === (defaultCtxFor(prevAlias)  || 131072)) setBrainCtx(defCtx);
      if (Math.abs(brainTemp - (defaultTempFor(prevAlias) ?? 0.7)) < 0.01) setBrainTemp(defTemp);
    }
    if (settingsKey === "LOCAL_OCR_MODEL" && value) {
      const defCtx  = defaultCtxFor(value);
      const defTemp = defaultTempFor(value);
      const prevAlias = (currentUserConfig?.settings?.LOCAL_OCR_MODEL as string) || "";
      if (ocrCtx   === (defaultCtxFor(prevAlias)  || 32768))  setOcrCtx(defCtx);
      if (Math.abs(ocrTemp  - (defaultTempFor(prevAlias) ?? 1.0)) < 0.01) setOcrTemp(defTemp);
    }
  }

  // Per-mode settings keys
  const providerBaseKey  = isCloud ? "CLOUD_BASE_PROVIDER"    : "LOCAL_BASE_PROVIDER";
  const modelBaseKey     = isCloud ? "CLOUD_BASE_MODEL"        : "LOCAL_BASE_MODEL";
  const providerCmplxKey = isCloud ? "CLOUD_COMPLEX_PROVIDER"  : "LOCAL_COMPLEX_PROVIDER";
  const modelCmplxKey    = isCloud ? "CLOUD_COMPLEX_MODEL"     : "LOCAL_COMPLEX_MODEL";

  const baseProvider    = (currentUserConfig?.settings?.[providerBaseKey]  as string) || "";
  const baseModel       = (currentUserConfig?.settings?.[modelBaseKey]     as string) || "";
  const complexProvider = (currentUserConfig?.settings?.[providerCmplxKey] as string) || "";
  const complexModel    = (currentUserConfig?.settings?.[modelCmplxKey]    as string) || "";

  const providers    = modelsData ? Object.keys(modelsData) : [];

  function modelOptions(provider: string): ComboboxOption[] {
    if (!modelsData || !provider || !modelsData[provider]) return [];
    return Object.entries(modelsData[provider]).map(([id, info]) => ({
      value: id,
      label: info.name && info.name !== id ? info.name : id,
    }));
  }

  const baseModels    = modelOptions(baseProvider);
  const complexModels = modelOptions(complexProvider);

  // Validation applies to the active mode's fields
  const tabBaseProviderValid    = isViewingActive ? baseProviderValid    : true;
  const tabBaseModelValid       = isViewingActive ? baseModelValid       : true;
  const tabComplexProviderValid = isViewingActive ? complexProviderValid : true;
  const tabComplexModelValid    = isViewingActive ? complexModelValid    : true;

  const borderCls  = isCloud ? "border-blue-400/40"  : "border-green-400/40";
  const accentText = isCloud ? "text-blue-400"        : "text-green-400";
  const accentBg   = isCloud ? "bg-blue-400/10"       : "bg-green-400/10";

  return (
    <SettingCard>
      <SettingHeader
        icon={<TbManualGearboxFilled />}
        className="bg-alt_color_a"
        header={title}
        buttonIcon={showDocumentation ? <FaRobot /> : undefined}
        buttonText={showDocumentation ? "Modelli disponibili" : undefined}
        onClick={
          showDocumentation
            ? () => window.open("https://openrouter.ai/models", "_blank")
            : undefined
        }
      />

      {/* Warning Card for Models Issues */}
      {modelsIssues.length > 0 && (
        <WarningCard
          title="Configurazione modelli richiesta"
          issues={modelsIssues}
        />
      )}

      <SettingGroup>
        {/* ── Mode tab switcher ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1 p-1 bg-background rounded-lg border border-foreground/20 w-fit">
              {(["cloud", "local"] as SystemMode[]).map((tab) => {
                const isSelected = tab === viewTab;
                const isActive   = tab === activeMode;
                return (
                  <button
                    key={tab}
                    onClick={() => setViewTab(tab)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                      ${isSelected
                        ? tab === "cloud"
                          ? "bg-blue-400/15 text-blue-400 border border-blue-400/40"
                          : "bg-green-400/15 text-green-400 border border-green-400/40"
                        : "text-secondary hover:text-primary hover:bg-foreground/10"
                      }
                    `}
                  >
                    {tab === "cloud" ? <MdCloudQueue size={14} /> : <FaServer size={12} />}
                    {tab === "cloud" ? "Online (Cloud)" : "Offline (Locale)"}
                    {isActive && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ml-1
                        ${tab === "cloud" ? "bg-blue-400/20 text-blue-400" : "bg-green-400/20 text-green-400"}`}>
                        ATTIVO
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Switch button — only on inactive tab */}
            {isViewingActive ? (
                <span className={`text-xs font-medium ${accentText}`}>
                  ✓ Attualmente attivo
                </span>
              ) : (
                <Button
                  disabled={switching}
                  onClick={() => handleSwitch(viewTab)}
                  className={`text-xs flex items-center gap-1.5 h-7 px-3
                    ${isCloud
                      ? "bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 border border-blue-400/40"
                      : "bg-green-400/10 text-green-400 hover:bg-green-400/20 border border-green-400/40"
                    }`}
                >
                  {switching
                    ? <FaSpinner className="animate-spin" size={11} />
                    : isCloud ? <MdCloudQueue size={12} /> : <FaServer size={11} />}
                  {switching ? "Cambio..." : `Passa a ${isCloud ? "Online" : "Offline"}`}
                </Button>
              )
            }
          </div>

          {modeError && <p className="text-red-400 text-xs">⚠️ {modeError}</p>}
        </div>

        {/* ── Cloud API key warning ── */}
        {isCloud && missingApiKeys.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-yellow-400 rounded-md border border-yellow-400/40 bg-yellow-400/10 px-3 py-2">
            <IoWarningOutline className="mt-0.5 flex-shrink-0" size={14} />
            <span>
              API {missingApiKeys.length === 1 ? "key mancante" : "keys mancanti"}:{" "}
              <strong>{missingApiKeys.join(", ")}</strong>.
              Aggiungi {missingApiKeys.length === 1 ? "la chiave" : "le chiavi"} nella sezione{" "}
              <strong>API Keys</strong> qui sotto per usare i modelli cloud.
            </span>
          </div>
        )}

        {/* ── GPU stack mode (local tab only) ── */}
        {!isCloud && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Modalità stack</p>
            <StackModeSlider overrides={stackOverrides} />
            {/* Model file warnings from the last stack switch (e.g. OCR model not downloaded) */}
            {modelWarnings.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2">
                <p className="text-xs font-semibold text-yellow-400">⚠ Avvisi file modello</p>
                {modelWarnings.map((w, i) => (
                  <p key={i} className="text-xs text-yellow-300/80 font-mono break-all">{w}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VRAM / RAM estimate chart (local tab only) ── */}
        {!isCloud && (
          <div className="flex flex-col gap-2 rounded-md border border-foreground/20 px-3 py-2.5 bg-background_alt">
            {/* GPU total input inline with chart header */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Stima memoria
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-secondary opacity-50">GPU / RAM</span>
                <input
                  type="number"
                  min={4}
                  max={128}
                  step={2}
                  value={gpuMemGb}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (v > 0) {
                      setGpuMemGb(v);
                      onUpdateSettings("LOCAL_GPU_MEM_GB", v);
                    }
                  }}
                  className="w-12 px-1.5 py-0.5 text-xs font-mono bg-background border border-foreground/30 rounded text-primary text-right focus:outline-none focus:border-secondary"
                />
                <span className="text-xs text-secondary opacity-50">GB</span>
              </div>
            </div>
            <ModelMemoryBar
              planResult={planResult}
              loading={planLoading}
              error={planError}
              onApplyRemediation={handleApplyRemediation}
            />
          </div>
        )}

        {/* ── Apply button (local tab only) ─────────────────────────────── */}
        {!isCloud && (
          <button
            type="button"
            disabled={stackBooting || stackSwitching || slotApplying || (planResult !== null && !planResult.fits)}
            onClick={handleApply}
            title={
              planResult !== null && !planResult.fits
                ? "La stack supera il budget VRAM: modifica modelli o contesto"
                : !scriptsConfigured ? "Nessuno script GPU configurato: le impostazioni saranno salvate per il prossimo riavvio manuale" : undefined
            }
            className={[
              "w-full py-2 text-sm font-semibold rounded-md border transition-all flex items-center justify-center gap-2",
              planResult !== null && !planResult.fits
                ? "border-red-400/50 text-red-400/80 bg-red-400/5 cursor-not-allowed"
                : pendingChanges && !stackBooting && !stackSwitching && !slotApplying
                ? scriptsConfigured
                  ? "border-green-400/60 text-green-400 bg-green-400/8 hover:bg-green-400/12"
                  : "border-amber-400/50 text-amber-400/80 bg-amber-400/5 hover:bg-amber-400/10"
                : "border-foreground/30 text-secondary hover:text-primary hover:border-foreground/50",
              (stackBooting || stackSwitching || slotApplying) ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {stackBooting || slotApplying ? (
              <><FaSpinner className="animate-spin" size={12} /> Applicazione…</>
            ) : pendingChanges && !scriptsConfigured ? (
              "💾 Salva impostazioni (senza riavvio live)"
            ) : pendingChanges ? (
              "⚡ Applica alla stack"
            ) : (
              "↺ Riavvia con impostazioni correnti"
            )}
          </button>
        )}

        {/* ── GPU slot status (local tab only) ── */}
        {!isCloud && (
          <div className="flex flex-col gap-1.5 rounded-md border border-foreground/20 px-3 py-2.5 bg-background_alt">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Stato stack GPU</p>
              {scriptsConfigured && sshMode && (
                <span className="text-[10px] text-secondary/40 font-mono">SSH</span>
              )}
            </div>

            {/* Not configured warning */}
            {!scriptsConfigured && (
              <p className="text-xs text-amber-500/70 leading-relaxed">
                ⚠ Controllo GPU non configurato: imposta{" "}
                <code className="font-mono text-amber-400/80">AGENTS_ROUTER_CONTROL_URL</code> (Docker) or{" "}
                <code className="font-mono text-amber-400/80">SSH_AGENTS_CMD</code> (SSH) in{" "}
                <code className="font-mono text-amber-400/80">backend/.env</code>
              </p>
            )}

            {/* Router unreachable hint (only in local mode when router probe failed) */}
            {modelStatus?.mode === "local" && modelStatus.router_reachable === false && scriptsConfigured && (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-amber-500/60 leading-relaxed">
                  {sshMode
                    ? <>⚠ Stack non in esecuzione: clicca <strong>Avvia</strong> per lanciare via SSH, poi apri il tunnel se serve: <code className="font-mono text-amber-400/70">ssh -N -L 8090:localhost:8090 ssh-wally</code></>
                    : <>⚠ Stack non in esecuzione: clicca <strong>Avvia</strong> per lanciare via API di controllo.</>
                  }
                </p>
                <button
                  type="button"
                  disabled={stackBooting || stackSwitching || slotApplying}
                  onClick={async () => {
                    const curS = (currentUserConfig?.settings ?? {}) as Record<string, unknown>;
                    await switchStack(stackMode, {
                      force: true,
                      base_model:        (curS.LOCAL_BASE_MODEL    as string) || undefined,
                      complex_model:     (curS.LOCAL_COMPLEX_MODEL as string) || undefined,
                      ocr_model:         (curS.LOCAL_OCR_MODEL     as string) || undefined,
                      flash_temperature: flashTemp,
                      brain_temperature: brainTemp,
                      ocr_temperature:   ocrTemp,
                      flash_ctx:         flashCtx,
                      brain_ctx:         brainCtx,
                      ocr_ctx:           ocrCtx,
                    });
                  }}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-green-400/50
                    text-green-400 bg-green-400/8 hover:bg-green-400/15 transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {(stackBooting || stackSwitching)
                    ? <><FaSpinner className="animate-spin" size={10} /> Avvio…</>
                    : <>▶ Avvia</>
                  }
                </button>
              </div>
            )}

            {/* Router unreachable — no control mechanism configured at all */}
            {modelStatus?.mode === "local" && modelStatus.router_reachable === false && !scriptsConfigured && (
              <p className="text-xs text-amber-500/60 leading-relaxed">
                ⚠ Router non raggiungibile e nessun controllo configurato: imposta{" "}
                <code className="font-mono text-amber-400/70">AGENTS_ROUTER_CONTROL_URL</code> (Docker) or{" "}
                <code className="font-mono text-amber-400/70">SSH_AGENTS_CMD</code> (SSH) in{" "}
                <code className="font-mono text-amber-400/70">backend/.env</code>, poi riavvia il backend.
              </p>
            )}

            {!modelStatus && (
              <p className="text-xs text-secondary/50 animate-pulse">Controllo server di inferenza…</p>
            )}
            {modelStatus && (
              <div className="flex flex-col gap-1 mt-0.5">
                {(
                  [
                    { key: "router", label: "Router :8090" },
                    { key: "flash",  label: "Flash  :8082" },
                    { key: "brain",  label: "Brain  :8081" },
                    { key: "ocr",    label: "OCR-VL :8083" },
                  ] as { key: keyof typeof modelStatus.slots; label: string }[]
                ).map(({ key, label }) => {
                  const slot = modelStatus?.slots?.[key];
                  if (!slot) return null;
                  // Brain is not loaded in ingestion/ocr-solo modes
                  const notApplicable =
                    // Brain not started in ingestion, ocr-solo, or flash-only modes
                    (key === "brain" && (stackMode === "ingestion" || stackMode === "ocr-solo" || stackMode === "flash")) ||
                    // OCR not started in conversation, flash-only, or big_brain modes
                    // In big_brain mode the brain slot absorbs all OCR aliases — no separate :8083
                    (key === "ocr"   && (stackMode === "conversation" || stackMode === "flash" || stackMode === "big_brain")) ||
                    // Flash not started in big_brain or ocr-solo modes
                    (key === "flash" && (stackMode === "big_brain" || stackMode === "ocr-solo"));
                  return (
                    <SlotStatusRow
                      key={key}
                      label={label}
                      ready={slot.ready}
                      model={slot.model}
                      loading={(stackBooting || stackSwitching || slotApplying) && !slot.ready}
                      notApplicable={notApplicable}
                      variant="dev"
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Base Model ── */}
        <div className={`flex flex-col gap-3 ${isBigBrain ? "opacity-40 pointer-events-none select-none" : ""}`}>
          <div className="flex flex-col w-full">
            <p className="text-primary font-bold">Modello base</p>
            <p className="text-sm text-secondary">
              Usato dall'agente decisionale e dagli strumenti che richiedono task semplici, dove la velocità è più importante della precisione.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 w-full">
            <div className="w-full">
              <p className="text-sm text-secondary mb-2">Provider</p>
              <SettingCombobox
                value={baseProvider}
                values={providers}
                onChange={(value) => {
                  if (currentUserConfig) {
                    onUpdateConfig({
                      ...currentUserConfig,
                      settings: {
                        ...currentUserConfig.settings,
                        [providerBaseKey]: value,
                        [modelBaseKey]: "",
                      },
                    });
                    setChangedConfig(true);
                  }
                }}
                placeholder={loadingModels ? "Caricamento provider..." : "Seleziona provider..."}
                searchPlaceholder="Cerca provider..."
                isInvalid={!tabBaseProviderValid}
              />
            </div>
              {baseProvider && (
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <p className="text-sm text-secondary">Modello</p>
                  <ModelBadges modelsData={modelsData} provider={baseProvider} model={baseModel} />
                </div>
                <SettingCombobox
                  value={baseModel}
                  values={baseModels}
                  onChange={(value) => {
                    if (!isCloud) {
                      handleLocalModelChange(modelBaseKey, value);
                    } else {
                      onUpdateSettings(modelBaseKey, value);
                    }
                  }}
                  placeholder={loadingModels ? "Caricamento modelli..." : "Seleziona modello..."}
                  searchPlaceholder="Cerca modelli..."
                  isInvalid={!tabBaseModelValid}
                />
              </div>
            )}
            {/* ── Flash slot tuning ── */}
            {!isCloud && baseModel && (
              <div className="flex flex-col gap-3 pl-1 pt-0.5 border-l border-foreground/15 ml-1">
                <TempSlider
                  label="Temperature"
                  value={flashTemp}
                  onChange={(v) => {
                    setFlashTemp(v);
                    onUpdateSettings("LOCAL_FLASH_TEMPERATURE", v);
                    markPending();
                  }}
                />
                <CtxSelector
                  label="Finestra contesto"
                  value={flashCtx}
                  maxCtx={maxCtxFor(baseModel)}
                  defaultCtx={defaultCtxFor(baseModel)}
                  kvPerKToken={kvPerKTokenFor(baseModel)}
                  onChange={(v) => {
                    setFlashCtx(v);
                    onUpdateSettings("LOCAL_FLASH_CTX", v);
                    markPending();
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Complex Model ── */}
        <div className="flex flex-col gap-3">
          {isBigBrain && (
            <div className="flex items-start gap-2 text-xs text-purple-400 rounded-md border border-purple-400/40 bg-purple-400/10 px-3 py-2">
              <span className="mt-0.5 shrink-0">🧠</span>
              <span>
                <strong>Modalità Brain attiva</strong>: questo modello gira da solo su tutti gli slot.
                Modificalo qui, poi clicca <strong>Applica alla stack</strong> per caricarlo.
              </span>
            </div>
          )}
          <div className="flex flex-col w-full">
            <p className="text-primary font-bold">{isBigBrain ? "🧠 Modello Brain" : "Modello complesso"}</p>
            <p className="text-sm text-secondary">
              {isBigBrain
                ? "Gira da solo su tutti gli slot: gestisce vision, testo e ragionamento. Modificalo qui, poi clicca Applica alla stack."
                : "Usato negli strumenti che richiedono task complessi e maggiore precisione/ragionamento (es. query e aggregazioni). Più lento, ma più accurato."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 w-full">
            <div className="w-full">
              <p className="text-sm text-secondary mb-2">Provider</p>
              <SettingCombobox
                value={complexProvider}
                values={providers}
                onChange={(value) => {
                  if (currentUserConfig) {
                    onUpdateConfig({
                      ...currentUserConfig,
                      settings: {
                        ...currentUserConfig.settings,
                        [providerCmplxKey]: value,
                        [modelCmplxKey]: "",
                      },
                    });
                    setChangedConfig(true);
                  }
                }}
                placeholder={loadingModels ? "Caricamento provider..." : "Seleziona provider..."}
                searchPlaceholder="Cerca provider..."
                isInvalid={!tabComplexProviderValid}
              />
            </div>
            {complexProvider && (
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <p className="text-sm text-secondary">Modello</p>
                  <ModelBadges modelsData={modelsData} provider={complexProvider} model={complexModel} />
                </div>
                <SettingCombobox
                  value={complexModel}
                  values={complexModels}
                  onChange={(value) => {
                    if (!isCloud) {
                      handleLocalModelChange(modelCmplxKey, value);
                    } else {
                      onUpdateSettings(modelCmplxKey, value);
                    }
                  }}
                  placeholder={loadingModels ? "Caricamento modelli..." : "Seleziona modello..."}
                  searchPlaceholder="Cerca modelli..."
                  isInvalid={!tabComplexModelValid}
                />
              </div>
            )}
            {/* ── Brain slot tuning ── */}
            {!isCloud && complexModel && (
              <div className="flex flex-col gap-3 pl-1 pt-0.5 border-l border-foreground/15 ml-1">
                <TempSlider
                  label="Temperature"
                  value={brainTemp}
                  onChange={(v) => {
                    setBrainTemp(v);
                    onUpdateSettings("LOCAL_BRAIN_TEMPERATURE", v);
                    markPending();
                  }}
                />
                <CtxSelector
                  label="Finestra contesto"
                  value={brainCtx}
                  maxCtx={maxCtxFor(complexModel)}
                  defaultCtx={defaultCtxFor(complexModel)}
                  kvPerKToken={kvPerKTokenFor(complexModel)}
                  onChange={(v) => {
                    setBrainCtx(v);
                    onUpdateSettings("LOCAL_BRAIN_CTX", v);
                    markPending();
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Embedding Model ── */}
        <SettingItem>
          <SettingTitle
            title="Modello embedding"
            description={isCloud
              ? "Vectorizer nativo Weaviate per ricerca semantica"
              : "Sentence-transformer via @xenova/transformers: nessuna API key necessaria"}
          />
          <SettingCombobox
            value={isCloud
              ? ((currentUserConfig?.settings?.CLOUD_EMBED_MODEL as string) || "gemini-embedding-001")
              : ((currentUserConfig?.settings?.LOCAL_EMBED_MODEL as string) || "Xenova/all-MiniLM-L6-v2")}
            values={isCloud
              ? [
                  { value: "gemini-embedding-001",   label: "Gemini Embedding 001  (3072-dim)" },
                  { value: "text-embedding-3-small", label: "OpenAI Embed 3 Small  (1536-dim)" },
                  { value: "text-embedding-3-large", label: "OpenAI Embed 3 Large  (3072-dim)" },
                ]
              : [
                  { value: "Xenova/all-MiniLM-L6-v2",                         label: "MiniLM-L6 v2  (Fast · 384-dim)" },
                  { value: "Xenova/all-mpnet-base-v2",                         label: "MPNet Base v2  (Best quality · 768-dim)" },
                  { value: "Xenova/gte-small",                                  label: "GTE Small  (Structured data · 384-dim)" },
                  { value: "Xenova/paraphrase-multilingual-MiniLM-L12-v2",     label: "Multilingual MiniLM  (96 langs · 384-dim)" },
                ]}
            onChange={(value) => onUpdateSettings(isCloud ? "CLOUD_EMBED_MODEL" : "LOCAL_EMBED_MODEL", value)}
            placeholder="Seleziona modello embedding…"
            searchPlaceholder="Cerca modelli…"
            allowCustom={true}
          />
        </SettingItem>

        {!isCloud && (
          <div className={isBigBrain ? "opacity-40 pointer-events-none select-none" : ""}>
          <SettingItem>
            <SettingTitle
              title="Modello estrazione"
              description={isBigBrain
                ? "In modalità Brain, tutta l'estrazione (testo, vision, OCR) passa dal modello Brain su :8081. Nessuno slot OCR separato."
                : "Modello usato per OCR documenti ed estrazione JSON sulla porta :8083. Per caricare un GGUF fisico diverso serve riavviare la stack con OCR_MODEL impostato in env.local."}
            />
            {isBigBrain && (
              <p className="text-xs text-secondary italic mt-1">🧠 Modalità Brain attiva: usa il modello Brain per tutta l'estrazione (nessuno slot OCR necessario)</p>
            )}
            <SettingCombobox
              value={(currentUserConfig?.settings?.LOCAL_OCR_MODEL as string) || ""}
              values={[
                { value: "",                      label: "Auto — uguale al modello complesso" },
                // ── With full stack (Flash + Brain + OCR, ~14 GB total) ───────
                { value: "gemini-1.5-pro-vision",  label: "★ Qwen3-VL-8B Thinking  (OCR · vision · 32k ctx)" },
                { value: "gemini-vl-8b",            label: "Qwen3-VL-8B Instruct  (~5.5 GB · with stack)" },
                { value: "gemini-vl-4b-think",      label: "Qwen3-VL-4B Thinking  (~3.5 GB · with stack)" },
                { value: "gemini-vl-4b",            label: "Qwen3-VL-4B Instruct  (~3.5 GB · with stack)" },
                { value: "gemini-vl-2b-think",      label: "Qwen3-VL-2B Thinking  (~2.2 GB · with stack)" },
                { value: "gemini-vl-2b",            label: "Qwen3-VL-2B Instruct  (~2.2 GB · with stack)" },
                // ── Gemma 4 multimodal (port :8084) ──────────────────────────
                { value: "gemma-4-e2b",             label: "Gemma 4 E2B  (~4 GB · 128k ctx · vision)" },
                { value: "gemma-4-e4b",             label: "Gemma 4 E4B  (~6 GB · 128k ctx · vision)" },
                // ── Heavy (needs most VRAM) ──────────────────────────────────
                { value: "gemini-vl-30b",           label: "Qwen3-VL-30B-A3B Thinking  (~18 GB)" },
                { value: "gemma-4-26b",             label: "Gemma 4 26B MoE  (~18 GB · 256k ctx · vision)" },
                { value: "gemma-4-31b",             label: "Gemma 4 31B  (~20 GB · 256k ctx · vision)" },
                // gemini-vl-32b removed — use Big Brain mode instead (stack mode slider)
                // ── Text-only (no vision, no mmproj) ─────────────────────────
                { value: "gemini-2.5-pro",          label: "Qwen3.5 9B  (Thinking · text only)" },
                { value: "gemini-1.5-pro",          label: "DeepSeek R1 14B  (Expert · text only)" },
                { value: "gemini-1.5-flash",        label: "Qwen3.5 4B  (Balanced · text only)" },
                { value: "gemini-1.5-flash-8b",     label: "Qwen3.5 2B  (Fast · text only)" },
                { value: "gemini-2.5-flash-lite",   label: "Qwen3.5 0.8B  (Ultra-fast · text only)" },
                // ── Dedicated OCR ─────────────────────────────────────────────
                { value: "gemini-ocr-2",            label: "DeepSeek OCR 2  (Document OCR · manual GGUF load)" },
              ]}
              onChange={(value) => handleLocalModelChange("LOCAL_OCR_MODEL", value || "")}
              placeholder="Auto (modello complesso)"
              searchPlaceholder="Cerca…"
              allowCustom={false}
            />
          </SettingItem>
          {/* OCR slot tuning */}
          {(currentUserConfig?.settings?.LOCAL_OCR_MODEL as string) && (
            <div className="flex flex-col gap-3 pl-1 pt-2 border-l border-foreground/15 ml-1 mt-2">
              <TempSlider
                label="Temperatura OCR"
                value={ocrTemp}
                onChange={(v) => {
                  setOcrTemp(v);
                  onUpdateSettings("LOCAL_OCR_TEMPERATURE", v);
                  markPending();
                }}
              />
              <CtxSelector
                label="Contesto OCR"
                value={ocrCtx}
                maxCtx={maxCtxFor((currentUserConfig?.settings?.LOCAL_OCR_MODEL as string) || "gemini-1.5-pro-vision")}
                defaultCtx={defaultCtxFor((currentUserConfig?.settings?.LOCAL_OCR_MODEL as string) || "gemini-1.5-pro-vision")}
                kvPerKToken={kvPerKTokenFor((currentUserConfig?.settings?.LOCAL_OCR_MODEL as string) || "gemini-1.5-pro-vision")}
                onChange={(v) => {
                  setOcrCtx(v);
                  onUpdateSettings("LOCAL_OCR_CTX", v);
                  markPending();
                }}
              />
            </div>
          )}
          </div>
        )}

        {isCloud && (
          <SettingItem>
            <SettingTitle
              title="Modello estrazione"
              description="Modello Gemini usato per OCR documenti ed estrazione JSON strutturata durante l'ingestione. Di default usa il tuo modello complesso."
            />
            <SettingCombobox
              value={(currentUserConfig?.settings?.CLOUD_OCR_MODEL as string) || ""}
              values={[
                { value: "",                      label: "Auto — uguale al modello complesso" },
                { value: "gemini-2.5-pro",         label: "Gemini 2.5 Pro  (Best quality)" },
                { value: "gemini-2.5-flash",       label: "Gemini 2.5 Flash  (Fast · recommended)" },
                { value: "gemini-2.0-flash-001",   label: "Gemini 2.0 Flash  (Lightweight)" },
                { value: "gemini-2.5-flash-lite",  label: "Gemini 2.5 Flash Lite  (Cheapest)" },
              ]}
              onChange={(value) => onUpdateSettings("CLOUD_OCR_MODEL", value || null)}
              placeholder="Auto (modello complesso)"
              searchPlaceholder="Cerca modelli…"
              allowCustom={true}
            />
          </SettingItem>
        )}

        {/* ── API Base URL ── */}
        {isCloud ? (
          <SettingItem>
            <SettingTitle
              title="URL base API"
              description="Usa questo campo per endpoint custom di accesso ai modelli (self-hosted o privati)"
            />
            <SettingInput
              isProtected={false}
              value={currentUserConfig?.settings.MODEL_API_BASE || ""}
              onChange={(value) => onUpdateSettings("MODEL_API_BASE", value)}
            />
          </SettingItem>
        ) : (
          <div className={isBigBrain ? "opacity-40 pointer-events-none select-none" : ""}>
          <SettingItem>
            <SettingTitle
              title="URL base API locale"
              description="Endpoint del server di inferenza locale (es. temp_router su :8090)."
            />
            <SettingInput
              isProtected={false}
              value={(currentUserConfig?.settings?.LOCAL_MODEL_API_BASE as string) || ""}
              onChange={(value) => onUpdateSettings("LOCAL_MODEL_API_BASE", value)}
            />
          </SettingItem>
          </div>
        )}

        {/* ── API key hint ── */}
        <div className={`flex items-start gap-2 text-xs ${accentText} rounded-md border ${borderCls} ${accentBg} px-3 py-2`}>
          <IoInformationCircle className="mt-0.5 flex-shrink-0" size={14} />
          <span>
            {isCloud
              ? "I provider cloud richiedono API keys: configurale nella sezione API Keys qui sotto."
              : "L'inferenza locale non richiede API keys. Il server GPU deve essere attivo sulle porte configurate."}
          </span>
        </div>

        {/* ── Note ── */}
        <div className="flex flex-col gap-2 bg-highlight/10 rounded-lg p-3 text-sm text-highlight">
          <div className="flex flex-row gap-1 items-center">
            <IoInformationCircle className="text-highlight" />
            <p className="font-bold text-highlight">Nota</p>
          </div>
          <p>
            Puoi usare lo stesso modello sia per i task base sia per quelli complessi. Usare modelli diversi
            permette di bilanciare velocità e qualità: modelli rapidi per task semplici, modelli più potenti per ragionamenti complessi.
          </p>
        </div>

        {/* ── Recommendation ── */}
        <div className="flex flex-col gap-2 bg-alt_color_b/10 rounded-lg p-3 text-sm text-alt_color_b">
          <div className="flex flex-row gap-1 items-center">
            <IoInformationCircle className="text-alt_color_b" />
            <p className="font-bold text-alt_color_b">Suggerimento</p>
          </div>
          <p>
            Elysia è ottimizzata per i modelli Gemini. Se possibile, consigliamo Gemini rispetto ai modelli OpenAI
            per ottenere le prestazioni migliori.
          </p>
        </div>

        {/* ── Reset (tree settings) ── */}
        {onResetConfig && (
          <div className="flex w-full items-center justify-center pt-4">
            <DeleteButton
              onClick={onResetConfig}
              text="Reimposta configurazione"
              icon={<TbArrowBackUp />}
              confirmText="Sei sicuro?"
            />
          </div>
        )}
      </SettingGroup>
    </SettingCard>
  );
}
