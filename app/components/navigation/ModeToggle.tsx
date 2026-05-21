"use client";

import React, { useCallback, useContext } from "react";
import { motion } from "framer-motion";
import { useMode } from "@/app/components/contexts/ModeContext";
import { getModeStatus, SystemMode } from "@/app/api/modeToggle";
import { ToastContext } from "@/app/components/contexts/ToastContext";
import { Cloud, HardDrive, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ModeToggle — Fast switch between Cloud (Online) and Local (Offline/Safe) mode.
 * Lives in the top-left sidebar header.
 *
 * When switching TO cloud mode, checks if any cloud API key is configured on
 * the backend. If none found, shows a warning toast directing the user to Settings.
 *
 * Reads from and writes to ModeContext so every other subscriber
 * (ModelsSection, ImportDataPage, etc.) updates in the same render cycle.
 */
export default function ModeToggle() {
  const { mode, switching, switchMode } = useMode();
  const { showWarningToast } = useContext(ToastContext);

  const handleSelect = useCallback(async (targetMode: SystemMode) => {
    if (targetMode === mode || switching) return;

    const ok = await switchMode(targetMode);
    if (ok && targetMode === "cloud") {
      // Check if any cloud API key is configured — warn if not.
      try {
        const status = await getModeStatus();
        if (!(status).has_cloud_api_keys) {
          showWarningToast(
            "⚠️ Nessuna API key configurata",
            "Hai attivato la modalità cloud ma non è impostata nessuna API key. Vai in Impostazioni → API Keys per aggiungerne una."
          );
        }
      } catch {
        // Non-fatal — key check failed, skip reminder
      }
    }
  }, [mode, switching, switchMode, showWarningToast]);

  const isLocal = mode === "local";

  return (
    <div
      className="w-full rounded-lg border border-border/60 bg-background_alt/30 p-1"
      title={
        isLocal
          ? "Modalità offline locale: i modelli girano sul computer o sulla rete locale"
          : "Modalità online cloud: usa provider AI esterni tramite internet"
      }
    >
      <div className="grid grid-cols-2 gap-1">
        <motion.button
          type="button"
          onClick={() => handleSelect("local")}
          disabled={switching}
          aria-pressed={isLocal}
          className={cn(
            "flex min-h-10 items-center justify-center gap-2 rounded-md px-2 text-left transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-60",
            isLocal
              ? "border border-accent/50 bg-accent/15 text-accent"
              : "border border-transparent text-secondary hover:bg-foreground/50 hover:text-primary"
          )}
          whileTap={{ scale: switching ? 1 : 0.98 }}
        >
          <HardDrive className="h-4 w-4 shrink-0" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-xs font-semibold">Offline</span>
            <span className="text-[10px] opacity-75">Locale</span>
          </span>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => handleSelect("cloud")}
          disabled={switching}
          aria-pressed={!isLocal}
          className={cn(
            "flex min-h-10 items-center justify-center gap-2 rounded-md px-2 text-left transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-60",
            !isLocal
              ? "border border-highlight/50 bg-highlight/15 text-highlight"
              : "border border-transparent text-secondary hover:bg-foreground/50 hover:text-primary"
          )}
          whileTap={{ scale: switching ? 1 : 0.98 }}
        >
          {switching ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <Cloud className="h-4 w-4 shrink-0" />
          )}
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="text-xs font-semibold">Online</span>
            <span className="text-[10px] opacity-75">Cloud</span>
          </span>
        </motion.button>
      </div>
    </div>
  );
}

