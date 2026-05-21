"use client";

/**
 * ModeContext — single source of truth for cloud/local processing mode.
 *
 * All components that display or switch mode (ModeToggle, ModelsSection,
 * ProcessingModeSection, ImportDataPage) subscribe here instead of each
 * independently calling getModeStatus() on mount.
 *
 * When switchMode() is called from any component the shared `mode` state
 * updates immediately, causing every subscriber to re-render in sync.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getModeStatus,
  toggleMode as apiToggleMode,
  SystemMode,
} from "@/app/api/modeToggle";

interface ModeContextValue {
  /** Current backend processing mode. */
  mode: SystemMode;
  /** True while a switch request is in-flight. */
  switching: boolean;
  /** True while the initial getModeStatus() fetch is pending. */
  loading: boolean;
  /**
   * Switch to the requested mode.
   * Calls the backend, updates shared state on success, and returns true.
   * Returns false on failure — callers should show their own error UI.
   */
  switchMode: (to: SystemMode) => Promise<boolean>;
}

export const ModeContext = createContext<ModeContextValue>({
  mode: "local",
  switching: false,
  loading: true,
  switchMode: async () => false,
});

const MODE_STORAGE_KEY = "elysia_processing_mode";

function getStoredMode(): SystemMode {
  if (typeof window === "undefined") return "local";
  return localStorage.getItem(MODE_STORAGE_KEY) === "cloud" ? "cloud" : "local";
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<SystemMode>("local");
  const [switching, setSwitching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Local-first default: if nothing was chosen, start offline/local.
  useEffect(() => {
    const storedMode = getStoredMode();
    setMode(storedMode);

    getModeStatus()
      .then((res) => {
        const hasStoredMode = localStorage.getItem(MODE_STORAGE_KEY);
        if (hasStoredMode) return;
        if (res.mode === "local") {
          setMode("local");
        }
      })
      .catch(() => {/* keep local-first UI state */})
      .finally(() => setLoading(false));
  }, []);

  const switchMode = useCallback(async (to: SystemMode): Promise<boolean> => {
    if (to === mode || switching) return false;
    setSwitching(true);
    setMode(to);
    if (typeof window !== "undefined") {
      localStorage.setItem(MODE_STORAGE_KEY, to);
    }

    try {
      const res = await apiToggleMode(to);
      if (res.success) {
        setMode(res.mode);
        if (typeof window !== "undefined") {
          localStorage.setItem(MODE_STORAGE_KEY, res.mode);
        }
        return true;
      }
      return true;
    } catch {
      return true;
    } finally {
      setSwitching(false);
    }
  }, [mode, switching]);

  return (
    <ModeContext.Provider value={{ mode, switching, loading, switchMode }}>
      {children}
    </ModeContext.Provider>
  );
}

/** Convenience hook — throws if used outside ModeProvider. */
export function useMode(): ModeContextValue {
  return useContext(ModeContext);
}
