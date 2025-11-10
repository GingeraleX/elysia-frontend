"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Collection } from "@/app/types/objects";
import { getCollections } from "@/app/api/getCollections";
import { SessionContext } from "./SessionContext";
import { deleteCollectionMetadata } from "@/app/api/deleteCollectionMetadata";
import { ToastContext } from "./ToastContext";

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
    const allPrompts = collections.reduce((acc: string[], collection) => {
      return acc.concat(collection.prompts || []);
    }, []);

    const shuffled = allPrompts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, amount);
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
