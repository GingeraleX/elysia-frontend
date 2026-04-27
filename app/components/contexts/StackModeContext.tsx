"use client";

/**
 * StackModeContext — single source of truth for the GPU stack mode
 * (conversation | ingestion | big_brain).
 *
 * Only meaningful when mode === "local". All components that render or
 * switch the stack slider subscribe here instead of calling getStackMode()
 * independently, so ImportDataPage and Settings always stay in sync.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  getStackMode,
  setStackMode as apiSetStackMode,
  applyModelConfig as apiApplyModelConfig,
  StackMode,
  ModelOverrides,
} from "@/app/api/modeToggle";
import { host } from "@/app/components/host";

// Re-export for consumers that import from here
export type { ModelOverrides };

interface StackModeContextValue {
  stackMode: StackMode;
  /** Brief lock while POST is in-flight (ms). */
  stackSwitching: boolean;
  /**
   * True from the moment the switch is requested until all required slots
   * report ready via /api/custom/model-status polling (30–90 s).
   */
  stackBooting: boolean;
  /** True only during the initial page-load fetch. */
  stackLoading: boolean;
  /**
   * True while a per-slot model apply (from Settings model dropdown) is in
   * flight. Used to show per-slot loading dots in ModelsSection.
   */
  slotApplying: boolean;
  /**
   * True when AGENTS_SCRIPT or SSH_AGENTS_CMD is configured in backend/.env.
   * When false, slider/Apply button changes are state-only — no process actually restarts.
   */
  scriptsConfigured: boolean;
  /** True when SSH_AGENTS_CMD is the active transport (remote GPU machine). */
  sshMode: boolean;
  /** True when SWAP_SCRIPT or SSH_SWAP_CMD is configured (hot-swap enabled). */
  swapConfigured: boolean;
  switchStack: (to: StackMode, overrides?: ModelOverrides) => Promise<boolean>;
  /**
   * Apply user model config immediately — only changed slots are restarted.
   * Starts the boot poll if any slot was spawned.
   */
  applyModels: (overrides: ModelOverrides) => Promise<boolean>;
  /** Warnings from the last stack switch (e.g. model file not found). Empty when none. */
  modelWarnings: string[];
}

export const StackModeContext = createContext<StackModeContextValue>({
  stackMode: "conversation",
  stackSwitching: false,
  stackBooting: false,
  stackLoading: true,
  slotApplying: false,
  scriptsConfigured: false,
  sshMode: false,
  swapConfigured: false,
  switchStack: async () => false,
  applyModels: async () => false,
  modelWarnings: [],
});

/** Returns true when all required slots for `mode` report ready. */
function checkSlotsReady(mode: StackMode, slots: Record<string, { ready: boolean } | undefined>): boolean {
  if (mode === "big_brain") {
    return !!slots.brain?.ready;
  }
  if (mode === "ingestion" || mode === "ingestion-full") {
    // Brain is NOT started in ingestion mode — only flash + ocr are required.
    return !!slots.flash?.ready && !!slots.ocr?.ready;
  }
  if (mode === "ocr-solo") {
    return !!slots.ocr?.ready;
  }
  if (mode === "flash") {
    return !!slots.flash?.ready;
  }
  // conversation (default) — flash + brain
  return !!slots.flash?.ready && !!slots.brain?.ready;
}

export function StackModeProvider({ children }: { children: React.ReactNode }) {
  const [stackMode, setStackMode]       = useState<StackMode>("conversation");
  const [stackSwitching, setStackSwitching] = useState(false);
  const [stackBooting, setStackBooting]     = useState(false);
  const [stackLoading, setStackLoading]     = useState(true);
  const [slotApplying, setSlotApplying]     = useState(false);
  const [scriptsConfigured, setScriptsConfigured] = useState(false);
  const [sshMode, setSshMode]               = useState(false);
  const [swapConfigured, setSwapConfigured] = useState(false);
  const [modelWarnings, setModelWarnings]   = useState<string[]>([]);

  const bootIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bootTimeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const bootModeRef     = useRef<StackMode>("conversation");

  // Stop any running boot poll + timeout
  const stopBootPoll = useCallback(() => {
    if (bootIntervalRef.current) {
      clearInterval(bootIntervalRef.current);
      bootIntervalRef.current = null;
    }
    if (bootTimeoutRef.current) {
      clearTimeout(bootTimeoutRef.current);
      bootTimeoutRef.current = null;
    }
  }, []);

  // Poll model-status until required slots are ready, then clear stackBooting.
  // Gives up after 90 s (big_brain may crash / model file not found) and reverts
  // the displayed stack mode back to conversation so the UI doesn't spin forever.
  const startBootPoll = useCallback((mode: StackMode) => {
    stopBootPoll();
    bootModeRef.current = mode;
    setStackBooting(true);

    const poll = async () => {
      try {
        const r = await fetch(`${host}/api/custom/model-status`);
        if (!r.ok) return;
        const data = await r.json();
        if (checkSlotsReady(bootModeRef.current, data.slots ?? {})) {
          setStackBooting(false);
          stopBootPoll();
        }
      } catch { /* backend unreachable — keep polling */ }
    };

    // Hard timeout — give up after 90 s.
    // big_brain: if model file not found, start_agents.sh falls back to conversation and
    // the big_brain slots will never become ready. Stop the spinner and revert mode UI.
    bootTimeoutRef.current = setTimeout(() => {
      setStackBooting(false);
      // If the target mode was big_brain but it never became ready, revert to conversation
      // so the slider shows the correct active state instead of spinning forever.
      if (bootModeRef.current === "big_brain") {
        setStackMode("conversation");
      }
      stopBootPoll();
    }, 90_000);

    // Poll immediately, then every 3 s
    poll();
    bootIntervalRef.current = setInterval(poll, 3000);
  }, [stopBootPoll]);

  // Cleanup on unmount
  useEffect(() => () => stopBootPoll(), [stopBootPoll]);

  // Initial load — get current stack mode from backend
  useEffect(() => {
    getStackMode()
      .then((res) => {
        setStackMode(res.stack_mode);
        setScriptsConfigured(res.scripts_configured ?? false);
        setSshMode(res.ssh_mode ?? false);
        setSwapConfigured(res.swap_configured ?? false);
      })
      .catch(() => {/* leave default on network error */})
      .finally(() => setStackLoading(false));
  }, []);

  const switchStack = useCallback(async (
    to: StackMode,
    overrides?: ModelOverrides,
  ): Promise<boolean> => {
    if (stackSwitching) return false;
    setStackSwitching(true);
    try {
      // If re-clicking the same mode, force-restart — the user is likely
      // trying to bring up slots that are "Not running" even though the backend
      // already thinks it's in this mode (e.g. fresh page load default).
      const needsForce = to === stackMode;
      const mergedOverrides = needsForce
        ? { ...overrides, force: true }
        : overrides;
      const res = await apiSetStackMode(to, mergedOverrides);
      if (res.success) {
        setStackMode(res.stack_mode);
        // Surface model file warnings (e.g. OCR GGUF not downloaded yet)
        setModelWarnings(Array.isArray(res.model_warnings) ? res.model_warnings : []);
        // Sync control-plane config status from response
        if (res.scripts_configured !== undefined) setScriptsConfigured(res.scripts_configured);
        if (res.spawn_error) {
          console.error("[StackMode] Spawn error reported by backend:", res.spawn_error);
        }
        if (res.spawned) {
          // Stack script started — poll until slots are actually ready
          startBootPoll(res.stack_mode);
        } else {
          // No script (state-only update) or already same mode — no boot wait needed
          setStackBooting(false);
          stopBootPoll();
        }
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setStackSwitching(false);
    }
  }, [stackSwitching, stackMode, startBootPoll, stopBootPoll]);

  /**
   * Apply user model config from Settings — only changed slots are swapped.
   * If any slot was spawned, reuse the boot poll to track readiness.
   */
  const applyModels = useCallback(async (overrides: ModelOverrides): Promise<boolean> => {
    if (slotApplying) return false;
    setSlotApplying(true);
    try {
      const res = await apiApplyModelConfig(overrides);
      if (res.success && res.spawned) {
        // Reuse the existing boot poll — it checks all slots, not just the switched one
        startBootPoll(stackMode);
      }
      return res.success;
    } catch {
      return false;
    } finally {
      setSlotApplying(false);
    }
  }, [slotApplying, stackMode, startBootPoll]);

  return (
    <StackModeContext.Provider value={{ stackMode, stackSwitching, stackBooting, stackLoading, slotApplying, scriptsConfigured, sshMode, swapConfigured, switchStack, applyModels, modelWarnings }}>
      {children}
    </StackModeContext.Provider>
  );
}

/** Convenience hook — throws if used outside StackModeProvider. */
export function useStackMode(): StackModeContextValue {
  return useContext(StackModeContext);
}
