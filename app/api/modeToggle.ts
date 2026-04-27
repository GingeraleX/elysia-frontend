import { host } from "@/app/components/host";

// The backend accepts "cloud" | "local". We expose the same internally.
export type SystemMode = "cloud" | "local";

export interface ModeStatusResponse {
  mode: SystemMode;
  label?: string;
  isOffline?: boolean;
  /** True when at least one cloud provider API key is configured on the backend */
  has_cloud_api_keys?: boolean;
}

export interface ModeToggleResponse {
  success: boolean;
  mode: SystemMode;
  label?: string;
}

/**
 * Normalise any legacy "online" value to "cloud".
 */
function normaliseMode(raw: string): SystemMode {
  return raw === "local" ? "local" : "cloud";
}

/**
 * Get the current system mode (cloud vs local).
 */
export async function getModeStatus(): Promise<ModeStatusResponse> {
  try {
    const response = await fetch(`${host}/api/custom/mode-status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error(`[getModeStatus] Error: ${response.status}`);
      return { mode: "cloud" };
    }

    const data = await response.json();
    return { ...data, mode: normaliseMode(data.mode ?? "cloud") };
  } catch (error) {
    console.error("[getModeStatus] Error:", error);
    return { mode: "cloud" };
  }
}

/**
 * Switch the system mode between cloud and local.
 */
export async function toggleMode(
  mode: SystemMode
): Promise<ModeToggleResponse> {
  try {
    const response = await fetch(`${host}/api/custom/toggle-mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });

    if (!response.ok) {
      console.error(`[toggleMode] Error: ${response.status}`);
      return { success: false, mode: "cloud" };
    }

    const data = await response.json();
    return { ...data, mode: normaliseMode(data.mode ?? "cloud") };
  } catch (error) {
    console.error("[toggleMode] Error:", error);
    return { success: false, mode: "cloud" };
  }
}

// ── GPU Stack Mode (conversation | ingestion | big_brain) ─────────────────────
// Controls which models are loaded on the local GPU.

export type StackMode = "conversation" | "ingestion" | "ingestion-full" | "ocr-solo" | "big_brain" | "flash";

/**
 * Optional model override aliases to pass to start_agents.sh env vars.
 * Each alias is translated server-side to a GGUF filename via MODEL_SWAP_CATALOG.
 */
export interface ModelOverrides {
  base_model?: string;    // e.g. "gemini-1.5-flash" → FLASH_MODEL env
  complex_model?: string; // e.g. "gemini-2.5-pro"   → BRAIN_MODEL env
  ocr_model?: string;     // e.g. "gemini-1.5-pro-vision" → OCR_MODEL env
  // Inference tuning — forwarded as FLASH_TEMP / BRAIN_TEMP / OCR_TEMP
  flash_temperature?: number;
  brain_temperature?: number;
  ocr_temperature?: number;
  // Context window overrides — forwarded as FLASH_CTX / BRAIN_CTX / OCR_CTX
  flash_ctx?: number;
  brain_ctx?: number;
  ocr_ctx?: number;
  /** Force restart even if the backend thinks it's already in this mode.
   *  Needed when slots show "Not running" but stackMode defaulted to the
   *  requested mode (e.g. initial "conversation" default). */
  force?: boolean;
}

export interface StackModeResponse {
  stack_mode: StackMode;
  label: string;
  big_brain_active: boolean;
  /** True when AGENTS_SCRIPT, SSH_AGENTS_CMD, or AGENTS_ROUTER_CONTROL_URL is configured */
  scripts_configured?: boolean;
  /** True when SSH_AGENTS_CMD is the active transport (remote GPU machine) */
  ssh_mode?: boolean;
  /** True when SWAP_SCRIPT, SSH_SWAP_CMD, or AGENTS_ROUTER_CONTROL_URL is configured */
  swap_configured?: boolean;
  /** True when AGENTS_ROUTER_CONTROL_URL is configured (Docker deploy — no SSH needed) */
  router_control_configured?: boolean;
}

export interface StackModeSetResponse {
  success: boolean;
  stack_mode: StackMode;
  spawned?: boolean;
  /** True when scripts are configured and the spawn succeeded */
  scripts_configured?: boolean;
  /** Human-readable diagnostic from the backend */
  message?: string;
  /** Populated when the spawn itself threw (ENOENT, EACCES, etc.) */
  spawn_error?: string;
  /** Warnings about missing model files — populated by preflight check in temp_router.py */
  model_warnings?: string[];
}

/** Get the current GPU stack mode. */
export async function getStackMode(): Promise<StackModeResponse> {
  try {
    const res = await fetch(`${host}/api/custom/stack-mode`);
    if (!res.ok) return { stack_mode: "conversation", label: "", big_brain_active: false };
    const data = await res.json();
    return {
      stack_mode:                data.stack_mode ?? "conversation",
      label:                     data.label ?? "",
      big_brain_active:          data.big_brain_active ?? false,
      scripts_configured:        data.scripts_configured ?? false,
      ssh_mode:                  data.ssh_mode ?? false,
      swap_configured:           data.swap_configured ?? false,
      router_control_configured: data.router_control_configured ?? false,
    };
  } catch {
    return { stack_mode: "conversation", label: "", big_brain_active: false };
  }
}

/** Switch the GPU stack mode. Returns immediately — restart takes 30–90 s. */
export async function setStackMode(mode: StackMode, overrides?: ModelOverrides): Promise<StackModeSetResponse> {
  try {
    const { force, ...modelFields } = overrides ?? {};
    const res = await fetch(`${host}/api/custom/stack-mode`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ mode, ...modelFields, force }),
    });
    if (!res.ok) return { success: false, stack_mode: "conversation" };
    return await res.json();
  } catch {
    return { success: false, stack_mode: "conversation" };
  }
}

// ── Per-slot model apply ───────────────────────────────────────────────────
// Called when the user changes a model in Settings → Offline (Local) tab.
// Only changed slots are restarted; env.local is updated for persistence.

export interface SlotSwapResult {
  slot:    "flash" | "brain" | "ocr";
  spawned: boolean;
  message: string;
}

export interface ApplyModelConfigResponse {
  success: boolean;
  spawned: boolean;  // true if at least one slot was restarted
  swaps:   SlotSwapResult[];
}

/**
 * Notify the backend to apply the user's current local model selections.
 * The backend resolves aliases → GGUFs, skips unchanged slots, and calls
 * swap_slot.sh only for slots that actually changed.
 *
 * Returns immediately — poll /api/custom/model-status to track readiness.
 */
export async function applyModelConfig(overrides: ModelOverrides): Promise<ApplyModelConfigResponse> {
  try {
    const res = await fetch(`${host}/api/custom/apply-model-config`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        flash: overrides.base_model,
        brain: overrides.complex_model,
        ocr:   overrides.ocr_model,
        flash_temperature: overrides.flash_temperature,
        brain_temperature: overrides.brain_temperature,
        ocr_temperature:   overrides.ocr_temperature,
        flash_ctx:         overrides.flash_ctx,
        brain_ctx:         overrides.brain_ctx,
        ocr_ctx:           overrides.ocr_ctx,
      }),
    });
    if (!res.ok) return { success: false, spawned: false, swaps: [] };
    return await res.json();
  } catch {
    return { success: false, spawned: false, swaps: [] };
  }
}
