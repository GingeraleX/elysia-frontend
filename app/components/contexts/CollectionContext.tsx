"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Collection } from "@/app/types/objects";
import { getCollections } from "@/app/api/getCollections";
import { SessionContext } from "./SessionContext";
import { deleteCollectionMetadata } from "@/app/api/deleteCollectionMetadata";
import { ToastContext } from "./ToastContext";
// example_prompts removed — replaced by context-aware generation in getRandomPrompts

export const CollectionContext = createContext<{
  collections: Collection[];
  fetchCollections: () => void;
  loadingCollections: boolean;
  deleteCollection: (collection_name: string) => void;
  getRandomPrompts: (amount: number) => string[];
}>({
  collections: [],
  fetchCollections: () => {},
  loadingCollections: false,
  deleteCollection: () => {},
  getRandomPrompts: () => [],
});

export const CollectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { id, fetchCollectionFlag } = useContext(SessionContext);
  const { showErrorToast, showSuccessToast } = useContext(ToastContext);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const toastRef = useRef({ showErrorToast, showSuccessToast });
  const lastFetchedIdRef = useRef<string | null>(null);

  // Keep toast functions in ref so effect doesn't depend on them
  useEffect(() => {
    toastRef.current = { showErrorToast, showSuccessToast };
  }, [showErrorToast, showSuccessToast]);

  // Core fetch logic shared by both triggers
  const fetchCollectionsInternal = async () => {
    if (!id) {
      console.log(`[CollectionContext] fetchCollectionsInternal called but id is empty`);
      return;
    }

    setLoadingCollections(true);
    try {
      console.log(`[CollectionContext] Calling getCollections API for id: ${id}`);
      const result = await getCollections(id);
      console.log(`[CollectionContext] Received ${result.length} collections`);
      setCollections(result);
      if (result.length > 0) {
        toastRef.current.showSuccessToast(`${result.length} Collections Loaded`);
      } else {
        console.log(`[CollectionContext] No collections found for user`);
      }
    } catch (error) {
      console.error(`[CollectionContext] Error fetching collections:`, error);
      toastRef.current.showErrorToast("Failed to load collections", String(error));
    } finally {
      setLoadingCollections(false);
    }
  };

  // Listen for fetchCollectionFlag from SessionContext (triggered on login/init)
  useEffect(() => {
    if (!id) {
      console.log(`[CollectionContext] fetchCollectionFlag received but id is empty, skipping`);
      return;
    }
    console.log(`[CollectionContext] fetchCollectionFlag triggered for id: ${id}`);
    fetchCollectionsInternal();
  }, [fetchCollectionFlag]);

  // Also fetch when ID initially changes (fallback for cases where flag isn't used)
  useEffect(() => {
    if (!id) {
      setCollections([]);
      lastFetchedIdRef.current = null;
      return;
    }

    // Skip if we already fetched this exact ID (but allow first fetch per component lifetime)
    if (lastFetchedIdRef.current === id) {
      console.log(`[CollectionContext] Skipping duplicate fetch for id: ${id}`);
      return;
    }

    console.log(`[CollectionContext] ID changed to: ${id}, will fetch via flag instead`);
    lastFetchedIdRef.current = id;
  }, [id]);

  const fetchCollections = async () => {
    if (!id) return;
    
    await fetchCollectionsInternal();
  };

  const deleteCollection = async (collection_name: string) => {
    if (!id) return;
    const result = await deleteCollectionMetadata(id, collection_name);

    if (result.error) {
      toastRef.current.showErrorToast("Failed to Remove Analysis", result.error);
    } else {
      toastRef.current.showSuccessToast(
        "Analysis Removed",
        `Analysis for "${collection_name}" has been removed successfully.`
      );
      // Refetch after deletion
      await fetchCollections();
    }
  };

  const getRandomPrompts = (amount: number = 4) => {
    // 1. Prefer per-collection prompts stored from analysis
    const collectionPrompts = collections.reduce((acc: string[], collection) => {
      return acc.concat(collection.prompts || []);
    }, []);
    if (collectionPrompts.length > 0) {
      return [...collectionPrompts].sort(() => 0.5 - Math.random()).slice(0, amount);
    }

    // 2. Derive questions from analyzed collections (have metadata_json)
    const analyzedCollections = collections.filter((c) => c.processed && c.metadata_json);
    if (analyzedCollections.length > 0) {
      const derived: string[] = [];
      for (const col of analyzedCollections) {
        // Human-readable collection label: strip tenant prefix, underscores → spaces, trim trailing _
        const label = col.name
          .replace(/^[a-f0-9-]{8,}_/i, "") // strip leading UUID-like prefix
          .replace(/_+/g, " ")
          .replace(/\s+$/, "")
          .trim();

        // Parse metadata for richer question generation
        let meta: Record<string, unknown> = {};
        try { meta = JSON.parse(col.metadata_json!); } catch { /* ignore */ }

        const recordCount = (meta.record_count as number | undefined) ?? col.total ?? 0;
        const sourceFile = (meta.source_files as string[] | undefined)?.[0] ?? "";

        derived.push(`What does the ${label} dataset contain?`);
        derived.push(`Summarize the key insights from ${label}`);
        if (recordCount > 0) derived.push(`Show me the most important records from ${label}`);
        if (sourceFile) derived.push(`What are the main findings in ${sourceFile.replace(/\.[^.]+$/, "")}?`);
        derived.push(`What trends can you identify in ${label}?`);
        derived.push(`Give me a breakdown of the data in ${label}`);
      }
      if (derived.length > 0) {
        return [...derived].sort(() => 0.5 - Math.random()).slice(0, amount);
      }
    }

    // 3. Collections exist but not yet analyzed — prompt to explore them
    if (collections.length > 0) {
      const names = collections.map((c) =>
        c.name.replace(/_+/g, " ").trim()
      );
      return [
        `What's in the ${names[0]} collection?`,
        "Summarize the available data sources",
        "What can you tell me about my imported data?",
        "Show me an overview of the knowledge base",
      ].slice(0, amount);
    }

    // 4. No collections at all — Elysia capability questions
    return [
      "What can you help me with?",
      "How do I import data into Elysia?",
      "What types of files can I upload for analysis?",
      "How does Elysia search through my documents?",
    ].slice(0, amount);
  };

  return (
    <CollectionContext.Provider
      value={{
        collections,
        fetchCollections,
        loadingCollections,
        deleteCollection,
        getRandomPrompts,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};
