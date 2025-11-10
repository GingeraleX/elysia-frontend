"use client";

import { createContext, useCallback, useContext } from "react";
import { ToastContext } from "./ToastContext";
import { SessionContext } from "./SessionContext";
import { analyzeCollection as analyzeCollectionApi } from "@/app/api/analyzeCollection";

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

  const triggerAnalysis = useCallback(
    async (collectionName: string, userId: string) => {
      if (!userId) {
        showErrorToast(
          "Error processing collection",
          "User ID not found"
        );
        return;
      }

      try {
        showSuccessToast(
          `Processing ${collectionName}...`,
          "Marking collection as analyzed"
        );

        const result = await analyzeCollectionApi(userId, collectionName);

        if (result.success) {
          showSuccessToast(
            `✓ ${collectionName}`,
            "Collection marked as processed"
          );
          console.log("[Processing Complete]", { collection: collectionName });
        } else {
          showErrorToast(
            `Error processing ${collectionName}`,
            result.error || "Unknown error"
          );
        }
      } catch (error) {
        console.error("[triggerAnalysis] Error:", error);
        showErrorToast(
          `Error processing ${collectionName}`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    [showSuccessToast, showErrorToast]
  );

  return (
    <ProcessingContext.Provider value={{ triggerAnalysis }}>
      {children}
    </ProcessingContext.Provider>
  );
};


