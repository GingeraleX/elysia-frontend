/**
 * useModelStatus — polls GET /api/custom/model-status
 *
 * Works for both cloud (returns configured model names, always ready) and
 * local (probes temp_router :8090/v1/models — compatible with SSH tunnel dev).
 *
 * Usage:
 *   const { status, fetching } = useModelStatus(isLocal, 5000);
 */
import { useEffect, useState, useRef, useCallback } from "react";
import { host } from "@/app/components/host";

export interface ModelSlot {
  ready: boolean;
  port?: number;
  model?: string;
  alias?: string;
  provider?: string;
}

export interface ModelStatusData {
  mode: "cloud" | "local";
  stack_mode?: string;
  ready: boolean;
  /** True when AGENTS_SCRIPT or SSH_AGENTS_CMD is configured */
  scripts_configured?: boolean;
  /** True when SWAP_SCRIPT or SSH_SWAP_CMD is configured */
  swap_configured?: boolean;
  /** True when AGENTS_ROUTER_CONTROL_URL is configured (Docker deploy) */
  router_control_configured?: boolean;
  /** True when the router at LOCAL_MODEL_API_BASE responded OK */
  router_reachable?: boolean;
  /** The URL that was probed (e.g. http://127.0.0.1:8090/v1) */
  router_url?: string;
  /** Human-readable error when router is unreachable */
  router_error?: string;
  slots: {
    router?:    ModelSlot;
    flash?:     ModelSlot;
    brain?:     ModelSlot;
    ocr?:       ModelSlot;
    base?:      ModelSlot;
    complex?:   ModelSlot;
    embedding?: ModelSlot;
    extraction?: ModelSlot;
  };
}

export function useModelStatus(enabled: boolean, pollMs = 5000) {
  const [status, setStatus]   = useState<ModelStatusData | null>(null);
  const [fetching, setFetching] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`${host}/api/custom/model-status`);
      if (r.ok) setStatus(await r.json() as ModelStatusData);
    } catch { /* backend unreachable — keep last known state */ }
  }, []);

  useEffect(() => {
    if (!enabled) { setStatus(null); return; }
    setFetching(true);
    refresh().finally(() => setFetching(false));
    intervalRef.current = setInterval(refresh, pollMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [enabled, pollMs, refresh]);

  return { status, fetching };
}

