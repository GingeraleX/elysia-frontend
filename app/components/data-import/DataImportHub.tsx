"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Collection, UserConfig } from "@/app/types/objects";
import { ToastContext } from "../contexts/ToastContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MdOutlineSchema } from "react-icons/md";
import { getDisplayIcon } from "@/app/types/displayIcons";

import FileUploadSection from "./sections/FileUploadSection";
import EmbedderConfigSection from "./sections/EmbedderConfigSection";
import PreviewSection from "./sections/PreviewSection";
import ImportProgressSection from "./sections/ImportProgressSection";
import { host } from "@/app/components/host";
import { useContext } from "react";
import { ProcessingContext } from "@/app/components/contexts/ProcessingContext";

type ImportStep = "file" | "embedder" | "preview" | "mapping" | "progress";

const DISPLAY_TYPES = [
  { value: "text",          label: "Text" },
  { value: "image",         label: "Image" },
  { value: "table",         label: "Table" },
  { value: "chart_bar",     label: "Chart — Bar" },
  { value: "chart_line",    label: "Chart — Line" },
  { value: "chart_scatter", label: "Chart — Scatter" },
  { value: "entity",        label: "Entity" },
  { value: "document",      label: "Document" },
  { value: "product",       label: "Product" },
  { value: "person",        label: "Person" },
  { value: "event",         label: "Event" },
  { value: "link",          label: "Link" },
] as const;

/** Pure heuristic: detect a display type for each field using name keywords + sample values. */
function detectFieldDisplayTypes(
  fields: string[],
  sampleRecords: Record<string, unknown>[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const lower = field.toLowerCase();
    // Split on underscores, hyphens, spaces so "image_url" → ["image","url"] etc.
    const segments = lower.split(/[_\-\s.]+/).filter(Boolean);
    const hasSeg = (keywords: string[]) => segments.some((s) => keywords.includes(s));
    const samples = sampleRecords.map((r) => String(r[field] ?? "")).filter(Boolean).slice(0, 10);

    if (hasSeg(["image","img","photo","picture","thumbnail","avatar","banner","cover","portrait"])) { result[field] = "image"; continue; }
    if (hasSeg(["url","href","link","website","webpage","source","uri"])) { result[field] = "link"; continue; }
    if (hasSeg(["email","phone","mobile","tel","contact","person","user","customer","client","employee","staff","member"])) { result[field] = "person"; continue; }
    if (hasSeg(["date","time","timestamp","start","end","deadline","schedule","due"]) || lower === "created_at" || lower === "updated_at") { result[field] = "event"; continue; }
    if (hasSeg(["price","cost","amount","euro","usd","gbp","currency","revenue","salary","budget","product","item","sku"])) { result[field] = "product"; continue; }
    if (hasSeg(["document","doc","file","attachment","pdf","article","wiki","page","chapter","section","report"])) { result[field] = "document"; continue; }
    if (hasSeg(["count","qty","quantity","score","rating","rank","num","number","percentage","percent","avg","average","sum","total","volume"])) { result[field] = "chart_bar"; continue; }
    const allNumeric = samples.length > 0 && samples.every((v) => !isNaN(Number(v)));
    if (allNumeric) { result[field] = "chart_bar"; continue; }
    if (samples.some((v) => /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg)/i.test(v))) { result[field] = "image"; continue; }
    if (samples.some((v) => /^https?:\/\//i.test(v))) { result[field] = "link"; continue; }
    result[field] = "text";
  }
  return result;
}

interface ImportState {
  uploadedFile: File | null;
  filePreviewData: any[] | null;
  collectionName: string;
  selectedEmbedder: any | null;
  vectorizerConfig: any | null;
  fieldDisplayTypes: Record<string, string>;
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
  const { triggerAnalysis } = useContext(ProcessingContext);

  const [currentStep, setCurrentStep] = useState<ImportStep>("file");
  const [importState, setImportState] = useState<ImportState>({
    uploadedFile: null,
    filePreviewData: null,
    collectionName: "",
    selectedEmbedder: null,
    vectorizerConfig: null,
    fieldDisplayTypes: {},
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

  const handleProceedToMapping = useCallback(() => {
    // Auto-detect field display types from preview data
    setImportState((prev) => {
      if (!prev.filePreviewData?.length) return prev;
      const fields = Object.keys(prev.filePreviewData[0]);
      const detected = detectFieldDisplayTypes(fields, prev.filePreviewData);
      return { ...prev, fieldDisplayTypes: detected };
    });
    setCurrentStep("mapping");
  }, []);

  const handleProceedToImport = useCallback(() => {
    // Validate display types before proceeding — any unknown value is reset to "text"
    const validTypeValues = DISPLAY_TYPES.map((d) => d.value as string);
    const invalidFields: string[] = [];
    const sanitized: Record<string, string> = {};
    for (const [field, dtype] of Object.entries(importState.fieldDisplayTypes)) {
      if (validTypeValues.includes(dtype)) {
        sanitized[field] = dtype;
      } else {
        sanitized[field] = "text";
        invalidFields.push(field);
      }
    }
    if (invalidFields.length > 0) {
      showErrorToast(
        "Display type corrected",
        `${invalidFields.length} field(s) had unrecognised types — reset to "text": ${invalidFields.join(", ")}`
      );
      setImportState((prev) => ({ ...prev, fieldDisplayTypes: sanitized }));
    }
    setCurrentStep("progress");
  }, [importState.fieldDisplayTypes, showErrorToast]);

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
      const response = await fetch(`${host}/api/import/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId,
          collection_name: importState.collectionName,
          embedder_config: {
            provider: importState.selectedEmbedder.provider,
            model: importState.selectedEmbedder.model,
            vectorField: importState.selectedEmbedder.vectorField,
          },
          data_records: importState.filePreviewData,
          field_display_types: importState.fieldDisplayTypes,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        const msg = data.error || "Failed to start import";
        setImportProgress((prev) => ({ ...prev, status: "error", errorMessage: msg, current: "Import failed" }));
        showErrorToast("Import failed", msg);
        return;
      }

      const batchSize = Math.max(1, Math.ceil(totalRecords / 5));
      let processed = 0;
      let batchNumber = 1;

      while (processed < totalRecords) {
        processed += Math.min(batchSize, totalRecords - processed);
        await new Promise((r) => setTimeout(r, Math.random() * 200 + 200));
        setImportProgress((prev) => ({ ...prev, processed, current: `Processing batch ${batchNumber++} (${processed}/${totalRecords} records)...` }));
      }

      setImportProgress((prev) => ({ ...prev, status: "complete", current: `Import completed! ${totalRecords} records added.`, processed: totalRecords }));

      showSuccessToast(`Collection "${importState.collectionName}" created successfully!`);
      onCollectionsUpdated();

      // Trigger LLM analysis (same as the re-analyze button)
      await triggerAnalysis(importState.collectionName, tenantId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setImportProgress((prev) => ({ ...prev, status: "error", errorMessage: msg, current: "Import failed" }));
      showErrorToast("Import failed", msg);
    }
  }, [importState, tenantId, onCollectionsUpdated, triggerAnalysis, showSuccessToast, showErrorToast]);

  const handleReset = useCallback(() => {
    setImportState({
      uploadedFile: null,
      filePreviewData: null,
      collectionName: "",
      selectedEmbedder: null,
      vectorizerConfig: null,
      fieldDisplayTypes: {},
    });
    setImportProgress({ total: 0, processed: 0, current: "", status: "idle", errorMessage: "" });
    setCurrentStep("file");
  }, []);

  const handleGoBack = useCallback(() => {
    if (currentStep === "embedder") setCurrentStep("file");
    else if (currentStep === "preview") setCurrentStep("embedder");
    else if (currentStep === "mapping") setCurrentStep("preview");
    else if (currentStep === "progress") setCurrentStep("mapping");
  }, [currentStep]);

  const steps = [
    { id: "file" as const, label: "Upload" },
    { id: "embedder" as const, label: "Configure" },
    { id: "preview" as const, label: "Preview" },
    { id: "mapping" as const, label: "Map Fields" },
    { id: "progress" as const, label: "Import" },
  ];
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // ── Field mapping draft (local to this component while on the mapping step)
  const detectedFields = useMemo(() => Object.keys(importState.fieldDisplayTypes), [importState.fieldDisplayTypes]);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {/* Header */}
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold text-primary mb-1">Import Data</h2>
        <p className="text-sm text-secondary">Upload and configure data for Weaviate collections</p>
      </div>

      {/* Progress Steps */}
      <div className="flex-shrink-0 flex items-center gap-3 flex-wrap">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2">
            <button
              onClick={() => { if (idx < currentStepIndex) setCurrentStep(step.id); }}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${currentStep === step.id ? "bg-accent text-background" : idx < currentStepIndex ? "bg-accent/20 text-accent cursor-pointer hover:bg-accent/30" : "bg-foreground_alt text-secondary"}`}
            >{idx + 1}</button>
            <span className={`text-sm font-medium ${currentStep === step.id ? "text-accent" : "text-secondary"}`}>{step.label}</span>
            {idx < steps.length - 1 && <div className={`h-0.5 w-6 mx-1 ${idx < currentStepIndex ? "bg-accent/50" : "bg-foreground_alt"}`} />}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {currentStep === "file" && (
            <motion.div key="file" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
              <FileUploadSection onFileUpload={handleFileUpload} existingCollections={collections} />
            </motion.div>
          )}

          {currentStep === "embedder" && importState.uploadedFile && (
            <motion.div key="embedder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
              <EmbedderConfigSection
                userConfig={userConfig}
                filePreviewData={importState.filePreviewData}
                collectionName={importState.collectionName}
                onConfig={handleEmbedderConfig}
                onCollectionNameChange={(name) => setImportState((prev) => ({ ...prev, collectionName: name }))}
              />
            </motion.div>
          )}

          {currentStep === "preview" && importState.uploadedFile && (
            <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
              <PreviewSection
                filePreviewData={importState.filePreviewData}
                collectionName={importState.collectionName}
                embedderConfig={importState.selectedEmbedder}
                vectorizerConfig={importState.vectorizerConfig}
                onProceed={handleProceedToMapping}
              />
            </motion.div>
          )}

          {currentStep === "mapping" && (
            <motion.div key="mapping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 border border-accent rounded-md p-1">
                    <MdOutlineSchema className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary">Field Display Types</h3>
                    <p className="text-xs text-secondary">
                      Auto-detected from your data. Review and adjust before importing.
                    </p>
                  </div>
                </div>

                {/* Field cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {detectedFields.map((field) => {
                    const currentType = importState.fieldDisplayTypes[field] ?? "text";
                    return (
                      <div key={field} className="flex items-center gap-2 bg-background rounded-md px-3 py-2 border border-border">
                        <div className="flex-shrink-0">{getDisplayIcon(currentType)}</div>
                        <p className="flex-1 text-sm text-primary font-medium truncate" title={field}>{field}</p>
                        <Select
                          value={currentType}
                          onValueChange={(value) =>
                            setImportState((prev) => ({
                              ...prev,
                              fieldDisplayTypes: { ...prev.fieldDisplayTypes, [field]: value },
                            }))
                          }
                        >
                          <SelectTrigger className="w-[130px] h-7 text-xs border-background_alt bg-background_alt">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background_alt border-background_alt">
                            {DISPLAY_TYPES.map(({ value, label }) => (
                              <SelectItem key={value} value={value} className="text-primary text-xs focus:bg-primary/20 focus:text-primary">
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>

                {/* Continue button */}
                <div className="flex justify-between items-center pt-2">
                  <Button onClick={handleGoBack} variant="outline" size="sm">
                    Back
                  </Button>
                  <Button
                    className="bg-accent/10 border border-accent hover:bg-accent/20"
                    onClick={handleProceedToImport}
                  >
                    <p className="text-accent">Continue to Import</p>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "progress" && (
            <motion.div key="progress" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
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

      {/* Navigation footer — hidden on mapping (has inline nav) and progress */}
      {currentStep !== "progress" && currentStep !== "mapping" && (
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t border-border gap-4 fade-in">
          <Button onClick={handleGoBack} disabled={currentStep === "file"} variant="outline" size="sm">
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
