"use client";

import { createContext, useCallback, useContext } from "react";
import { ToastContext } from "./ToastContext";
import { CollectionContext } from "./CollectionContext";
import { analyzeCollection as analyzeCollectionApi, type AnalyzeCollectionResult } from "@/app/api/analyzeCollection";

export const ProcessingContext = createContext<{
  triggerAnalysis: (collectionName: string, userId: string) => Promise<void>;
}>({
  triggerAnalysis: async () => {},
});

export const ProcessingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { showSuccessToast, showErrorToast } = useContext(ToastContext);
  const { fetchCollections } = useContext(CollectionContext);

  const triggerAnalysis = useCallback(
    async (collectionName: string, userId: string) => {
      if (!userId) {
        showErrorToast("Errore durante l'elaborazione della collezione", "ID utente non trovato");
        return;
      }

      try {
        showSuccessToast(
          `Analisi di ${collectionName}…`,
          "Analisi campi con LLM in corso — può richiedere 30-60 s"
        );

        const result = await analyzeCollectionApi(userId, collectionName);

        if (result.success) {
          const fieldCount =
            result.field_count ??
            result.field_metadata?.length ??
            result.fields?.length ??
            0;

          showSuccessToast(
            `✓ ${collectionName} analizzata`,
            fieldCount
              ? `${fieldCount} campi mappati — metadati aggiornati`
              : "Metadati collezione aggiornati"
          );

          // Refresh the collection list so processed flag / metadata_json updates
          await fetchCollections();

          // Notify DataExplorer (if open) to reload its metadata panel
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("collection-analysis-complete", {
                detail: { collectionName },
              })
            );
          }
        } else {
          showErrorToast(
            `Errore durante l'analisi di ${collectionName}`,
            result.error || "Errore sconosciuto"
          );
        }
      } catch (error) {
        console.error("[triggerAnalysis] Error:", error);
        showErrorToast(
          `Errore durante l'analisi di ${collectionName}`,
          error instanceof Error ? error.message : "Errore sconosciuto"
        );
      }
    },
    [showSuccessToast, showErrorToast, fetchCollections]
  );

  return (
    <ProcessingContext.Provider value={{ triggerAnalysis }}>
      {children}
    </ProcessingContext.Provider>
  );
};
