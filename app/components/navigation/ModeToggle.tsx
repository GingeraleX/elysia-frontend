"use client";

import React, { useCallback, useContext } from "react";
import { motion } from "framer-motion";
import { useMode } from "@/app/components/contexts/ModeContext";
import { getModeStatus } from "@/app/api/modeToggle";
import { ToastContext } from "@/app/components/contexts/ToastContext";

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

  const handleToggle = useCallback(async () => {
    const targetMode = mode === "cloud" ? "local" : "cloud";
    const ok = await switchMode(targetMode);
    if (ok && targetMode === "cloud") {
      // Check if any cloud API key is configured — warn if not.
      try {
        const status = await getModeStatus();
        if (!(status).has_cloud_api_keys) {
          showWarningToast(
            "⚠️ No API keys configured",
            "You switched to Online mode but no cloud API key is set. Go to Settings → API Keys to add one."
          );
        }
      } catch {
        // Non-fatal — key check failed, skip reminder
      }
    }
  }, [mode, switchMode, showWarningToast]);

  const isLocal = mode === "local";

  return (
    <motion.button
      onClick={handleToggle}
      disabled={switching}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold
        transition-all duration-200 border
        ${isLocal
          ? "bg-green-900/20 border-green-700/50 text-green-400 hover:bg-green-900/30"
          : "bg-blue-900/20 border-blue-700/50 text-blue-400 hover:bg-blue-900/30"
        }
        ${switching ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      whileTap={{ scale: 0.95 }}
      title={
        isLocal
          ? "Offline mode — AI runs locally on your machine"
          : "Online mode — Using cloud AI providers"
      }
    >
      <span className="text-sm">{isLocal ? "🔒" : "🌐"}</span>
      <span>{switching ? "..." : isLocal ? "Offline" : "Online"}</span>
    </motion.button>
  );
}



