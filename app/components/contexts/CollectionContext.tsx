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
  const { id } = useContext(SessionContext);
  const { showErrorToast, showSuccessToast } = useContext(ToastContext);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const toastRef = useRef({ showErrorToast, showSuccessToast });
  const lastFetchedIdRef = useRef<string | null>(null);

  // Keep toast functions in ref so effect doesn't depend on them
  useEffect(() => {
    toastRef.current = { showErrorToast, showSuccessToast };
  }, [showErrorToast, showSuccessToast]);

  // Only fetch when ID actually changes
  useEffect(() => {
    if (!id) {
      setCollections([]);
      lastFetchedIdRef.current = null;
      return;
    }

    // Skip if we already fetched this exact ID
    if (lastFetchedIdRef.current === id) {
      return;
    }

    lastFetchedIdRef.current = id;

    const loadCollections = async () => {
      setLoadingCollections(true);
      try {
        const result = await getCollections(id);
        setCollections(result);
        toastRef.current.showSuccessToast(`${result.length} Collections Loaded`);
      } catch (error) {
        toastRef.current.showErrorToast("Failed to load collections", String(error));
      } finally {
        setLoadingCollections(false);
      }
    };

    // Delay fetch slightly to let SessionContext/settings finish initializing
    const timer = setTimeout(() => {
      loadCollections();
    }, 100);

    return () => clearTimeout(timer);
  }, [id]);

  const fetchCollections = async () => {
    if (!id) return;
    
    setLoadingCollections(true);
    try {
      const result = await getCollections(id);
      setCollections(result);
      toastRef.current.showSuccessToast(`${result.length} Collections Loaded`);
    } catch (error) {
      toastRef.current.showErrorToast("Failed to load collections", String(error));
    } finally {
      setLoadingCollections(false);
    }
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
