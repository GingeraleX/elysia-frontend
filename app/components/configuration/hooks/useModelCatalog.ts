/**
 * useModelCatalog — fetches GET /api/custom/model-catalog once (when local mode is
 * visible) and returns alias-keyed lookup maps for the ctx/temp/kv sliders.
 *
 * These maps overlay the static fallback tables in ModelsSection.tsx so that any
 * new model added to the backend catalog is immediately reflected in the UI without
 * a frontend code change.
 *
 * Only fetches in local mode — cloud mode doesn't use these sliders.
 */
import { useEffect, useState, useRef } from "react";
import { host } from "@/app/components/host";

/** Shape of one entry from GET /api/custom/model-catalog */
interface CatalogEntry {
  key: string;
  alias: string;
  ctxSize: number;
  modelMaxCtx: number;
  kvGbPerKToken: number;
  genParams?: {
    temperature: number;
    topP?: number;
    topK?: number;
    presencePenalty?: number;
  };
}

export interface ModelCatalogMaps {
  /** alias → architecture max context tokens */
  maxCtx: Record<string, number>;
  /** alias → recommended default context size */
  defaultCtx: Record<string, number>;
  /** alias → recommended default temperature */
  defaultTemp: Record<string, number>;
  /** alias → KV cache GB per 1000 tokens */
  kvPerKToken: Record<string, number>;
}

const EMPTY_MAPS: ModelCatalogMaps = {
  maxCtx: {},
  defaultCtx: {},
  defaultTemp: {},
  kvPerKToken: {},
};

/**
 * @param enabled — pass `true` when the local tab is visible; `false` in cloud mode.
 *                  The hook will not fetch while disabled and clears its state.
 */
export function useModelCatalog(enabled: boolean): {
  maps: ModelCatalogMaps;
  loading: boolean;
  error: string | null;
} {
  const [maps, setMaps] = useState<ModelCatalogMaps>(EMPTY_MAPS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Prevent double-fetch in Strict Mode
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`${host}/api/custom/model-catalog`, {
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) {
          setError(`Catalog API returned ${res.status}`);
          return;
        }
        const data = await res.json() as { models?: CatalogEntry[] };
        const entries: CatalogEntry[] = data.models ?? [];

        const maxCtx: Record<string, number> = {};
        const defaultCtx: Record<string, number> = {};
        const defaultTemp: Record<string, number> = {};
        const kvPerKToken: Record<string, number> = {};

        for (const entry of entries) {
          // Key by alias — this matches what the frontend dropdowns use
          const key = entry.alias;
          if (!key) continue;
          if (entry.modelMaxCtx)    maxCtx[key]     = entry.modelMaxCtx;
          if (entry.ctxSize)        defaultCtx[key] = entry.ctxSize;
          if (entry.kvGbPerKToken)  kvPerKToken[key] = entry.kvGbPerKToken;
          if (entry.genParams?.temperature !== undefined)
            defaultTemp[key] = entry.genParams.temperature;
        }

        if (!cancelled) {
          setMaps({ maxCtx, defaultCtx, defaultTemp, kvPerKToken });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // Only re-fetch when enabled transitions false → true (e.g. switching to local tab)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Reset fetch guard when switching away so next local-tab visit refreshes
  useEffect(() => {
    if (!enabled) fetchedRef.current = false;
  }, [enabled]);

  return { maps, loading, error };
}

