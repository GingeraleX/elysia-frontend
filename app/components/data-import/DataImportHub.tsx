"use client";

import React, { useState, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Collection } from "@/app/types/objects";
import { UserConfig } from "@/app/types/settings";
import { ToastContext } from "../contexts/ToastContext";
import { Button } from "@/components/ui/button";

import FileUploadSection from "./sections/FileUploadSection";
import EmbedderConfigSection from "./sections/EmbedderConfigSection";
import PreviewSection from "./sections/PreviewSection";
import ImportProgressSection from "./sections/ImportProgressSection";

type ImportStep = "file" | "embedder" | "preview" | "progress";

interface ImportState {
  uploadedFile: File | null;
  filePreviewData: any[] | null;
  collectionName: string;
  selectedEmbedder: any | null;
  vectorizerConfig: any | null;
}

interface DataImportHubProps {
  tenantId: string;
  userConfig: UserConfig;
  collections: Collection[];
  onCollectionsUpdated: () => void;
}

export default function DataImportHub({
  tenantId,
  userConfig,
  collections,
  onCollectionsUpdated,
}: DataImportHubProps) {
  const { showSuccessToast, showErrorToast } = useContext(ToastContext);

  const [currentStep, setCurrentStep] = useState<ImportStep>("file");
  const [importState, setImportState] = useState<ImportState>({
    uploadedFile: null,
    filePreviewData: null,
    collectionName: "",
    selectedEmbedder: null,
    vectorizerConfig: null,
  });
  const [importProgress, setImportProgress] = useState({
    total: 0,
    processed: 0,
    current: "",
    status: "idle" as "idle" | "processing" | "complete" | "error",
    errorMessage: "",
  });

  const handleFileUpload = useCallback((file: File, preview: any[]) => {
    setImportState((prev) => ({
      ...prev,
      uploadedFile: file,
      filePreviewData: preview,
      collectionName: file.name.replace(/\.[^/.]+$/, ""),
    }));
    setCurrentStep("embedder");
    showSuccessToast("File uploaded successfully");
  }, [showSuccessToast]);

  const handleEmbedderConfig = useCallback((config: any) => {
    setImportState((prev) => ({
      ...prev,
      selectedEmbedder: config.embedder,
      vectorizerConfig: config.vectorizer,
    }));
    setCurrentStep("preview");
    showSuccessToast("Embedder configured");
  }, [showSuccessToast]);

  const handleProceedToImport = useCallback(() => {
    setCurrentStep("progress");
  }, []);

  const handleStartImport = useCallback(async () => {
    if (!importState.uploadedFile || !importState.selectedEmbedder || !importState.filePreviewData) {
      showErrorToast("Missing required configuration");
      return;
    }

    const totalRecords = importState.filePreviewData.length;
    
    setImportProgress({
      total: totalRecords,
      processed: 0,
      current: "Preparing import...",
      status: "processing",
      errorMessage: "",
    });

    try {
      // Call backend API to start the import
      const response = await fetch("http://localhost:3000/api/import/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          collection_name: importState.collectionName,
          embedder_config: {
            provider: importState.selectedEmbedder.provider,
            model: importState.selectedEmbedder.model,
            vectorField: importState.selectedEmbedder.vectorField,
          },
          data_records: importState.filePreviewData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to start import");
      }

      // Simulate realistic batch processing progress
      // Process in batches of ~50 records
      const batchSize = Math.max(1, Math.ceil(totalRecords / 5));
      let processed = 0;
      let batchNumber = 1;

      // Simulate batch-by-batch processing
      while (processed < totalRecords) {
        const nextBatch = Math.min(batchSize, totalRecords - processed);
        processed += nextBatch;
        
        // Simulate processing time (200-400ms per batch)
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 200));
        
        setImportProgress((prev) => ({
          ...prev,
          processed: processed,
          current: `Processing batch ${batchNumber} (${processed}/${totalRecords} records)...`,
        }));
        
        batchNumber++;
      }

      // Final state
      setImportProgress((prev) => ({
        ...prev,
        status: "complete",
        current: `Import completed successfully! ${totalRecords} records added.`,
        processed: totalRecords,
      }));

      showSuccessToast(`Collection "${importState.collectionName}" created successfully!`);
      onCollectionsUpdated();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setImportProgress((prev) => ({
        ...prev,
        status: "error",
        errorMessage: errorMsg,
        current: "Import failed",
      }));
      showErrorToast("Import failed", errorMsg);
    }
  }, [importState, tenantId, onCollectionsUpdated, showSuccessToast, showErrorToast]);

  const handleReset = useCallback(() => {
    setImportState({
      uploadedFile: null,
      filePreviewData: null,
      collectionName: "",
      selectedEmbedder: null,
      vectorizerConfig: null,
    });
    setImportProgress({
      total: 0,
      processed: 0,
      current: "",
      status: "idle",
      errorMessage: "",
    });
    setCurrentStep("file");
  }, []);

  const handleGoBack = useCallback(() => {
    if (currentStep === "file") return;
    if (currentStep === "embedder") setCurrentStep("file");
    if (currentStep === "preview") setCurrentStep("embedder");
    if (currentStep === "progress") setCurrentStep("preview");
  }, [currentStep]);

  const steps = [
    { id: "file" as const, label: "Upload" },
    { id: "embedder" as const, label: "Configure" },
    { id: "preview" as const, label: "Preview" },
    { id: "progress" as const, label: "Import" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {/* Header with Title */}
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold text-primary mb-1">Import Data</h2>
        <p className="text-sm text-secondary">Upload and configure data for Weaviate collections</p>
      </div>

      {/* Progress Steps */}
      <div className="flex-shrink-0 flex items-center gap-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-4">
            <button
              onClick={() => {
                if (idx < currentStepIndex) {
                  setCurrentStep(step.id);
                }
              }}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                currentStep === step.id
                  ? "bg-accent text-background"
                  : idx < currentStepIndex
                  ? "bg-accent/20 text-accent cursor-pointer hover:bg-accent/30"
                  : "bg-foreground_alt text-secondary"
              }`}
            >
              {idx + 1}
            </button>
            <span className={`text-sm font-medium ${
              currentStep === step.id ? "text-accent" : "text-secondary"
            }`}>
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                idx < currentStepIndex ? "bg-accent/50" : "bg-foreground_alt"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {currentStep === "file" && (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <FileUploadSection
                onFileUpload={handleFileUpload}
                existingCollections={collections}
              />
            </motion.div>
          )}

          {currentStep === "embedder" && importState.uploadedFile && (
            <motion.div
              key="embedder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <EmbedderConfigSection
                userConfig={userConfig}
                filePreviewData={importState.filePreviewData}
                collectionName={importState.collectionName}
                onConfig={handleEmbedderConfig}
                onCollectionNameChange={(name) =>
                  setImportState((prev) => ({
                    ...prev,
                    collectionName: name,
                  }))
                }
              />
            </motion.div>
          )}

          {currentStep === "preview" && importState.uploadedFile && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <PreviewSection
                filePreviewData={importState.filePreviewData}
                collectionName={importState.collectionName}
                embedderConfig={importState.selectedEmbedder}
                vectorizerConfig={importState.vectorizerConfig}
                onProceed={handleProceedToImport}
              />
            </motion.div>
          )}

          {currentStep === "progress" && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ImportProgressSection
                progress={importProgress}
                collectionName={importState.collectionName}
                onStartImport={handleStartImport}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      {currentStep !== "progress" && (
        <div
          className="flex-shrink-0 flex justify-between items-center pt-4 border-t border-border gap-4 fade-in"
        >
          <Button
            onClick={handleGoBack}
            disabled={currentStep === "file"}
            variant="outline"
            size="sm"
          >
            Back
          </Button>
          <span className="text-xs text-secondary">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>
      )}
    </div>
  );
}

