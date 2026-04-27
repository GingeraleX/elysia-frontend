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
  mode: "cloud",
  switching: false,
  loading: true,
  switchMode: async () => false,
});

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<SystemMode>("cloud");
  const [switching, setSwitching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch the real mode once on mount — keeps it in sync after page refresh.
  useEffect(() => {
    getModeStatus()
      .then((res) => setMode(res.mode))
      .catch(() => {/* leave default "cloud" on network error */})
      .finally(() => setLoading(false));
  }, []);

  const switchMode = useCallback(async (to: SystemMode): Promise<boolean> => {
    if (to === mode || switching) return false;
    setSwitching(true);
    try {
      const res = await apiToggleMode(to);
      if (res.success) {
        setMode(res.mode);
        return true;
      }
      return false;
    } catch {
      return false;
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

