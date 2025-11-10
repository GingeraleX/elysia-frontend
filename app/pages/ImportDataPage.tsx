﻿﻿﻿﻿"use client";

import React, { useContext, useEffect, useState } from "react";
import { SessionContext } from "../components/contexts/SessionContext";
import { ToastContext } from "../components/contexts/ToastContext";
import { CollectionContext } from "../components/contexts/CollectionContext";
import { LoadingSpinner } from "../components/loading/LoadingSpinner";

// Import components
import DataImportHub from "../components/data-import/DataImportHub";

/**
 * Import Data Page - 3-Step Data Import Wizard
 * Step 1: File Upload
 * Step 2: Data Preview & Configuration
 * Step 3: Review & Import
 */
export default function ImportDataPage() {
  const { id, userConfig } = useContext(SessionContext);
  const { showErrorToast, showSuccessToast } = useContext(ToastContext);
  const { collections, fetchCollections } = useContext(CollectionContext);

  // Step management
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isReady, setIsReady] = useState(false);

  // Step 1: File Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [collectionName, setCollectionName] = useState("");

  // Step 2: Data Preview
  const [dataRecords, setDataRecords] = useState<any[]>([]);
  const [selectedEmbedder, setSelectedEmbedder] = useState({
    provider: "local",
    model: "sentence-transformers/all-mpnet-base-v2",
  });

  // Step 3: Import Status
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !userConfig) {
      showErrorToast("Not authenticated", "Please log in to use data import");
      return;
    }
    setIsReady(true);
  }, [id, userConfig, showErrorToast]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setCollectionName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension

    // Parse file based on type
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let records: any[] = [];

        if (file.type === "application/json") {
          records = JSON.parse(content);
        } else if (file.type === "text/csv") {
          // Simple CSV parser
          const lines = content.split("\n");
          const headers = lines[0].split(",");
          records = lines.slice(1).map((line) => {
            const values = line.split(",");
            return headers.reduce((obj, header, idx) => {
              obj[header.trim()] = values[idx]?.trim();
              return obj;
            }, {} as Record<string, string>);
          });
        } else if (file.type === "text/plain") {
          // Split text by paragraphs
          records = content
            .split("\n\n")
            .filter((p) => p.trim())
            .map((p, idx) => ({ id: idx + 1, content: p.trim() }));
        }

        setDataRecords(records.filter((r) => r)); // Remove empty records
        setCurrentStep(2);
      } catch (error) {
        showErrorToast("Parse Error", `Failed to parse ${file.type}`);
      }
    };
    reader.readAsText(file);
  };

  // Handle import
  const handleImport = async () => {
    if (!id || !collectionName.trim() || dataRecords.length === 0) {
      showErrorToast("Invalid Input", "Please fill all required fields");
      return;
    }

    setIsImporting(true);
    setImportError(null);
    setImportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 500);

      const response = await fetch("http://localhost:3000/api/import/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: id,
          collection_name: collectionName,
          data_records: dataRecords,
          embedder_config: selectedEmbedder,
        }),
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Import failed");
      }

      showSuccessToast(
        "Import Complete",
        `${result.summary.records_imported} records imported successfully`
      );

      // Reset form
      setTimeout(() => {
        setCurrentStep(1);
        setUploadedFile(null);
        setCollectionName("");
        setDataRecords([]);
        setImportProgress(0);
        fetchCollections();
      }, 2000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Import failed";
      setImportError(errorMsg);
      showErrorToast("Import Error", errorMsg);
    } finally {
      setIsImporting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden fade-in bg-background">
      {/* Header - Elysia Styled */}
      <div className="flex flex-col gap-4 p-6 border-b border-border bg-background_alt/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-1">Import Data</h1>
            <p className="text-sm text-muted-foreground">
              Upload files and generate embeddings with local AI
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent rounded-lg">
            <span className="text-xs font-medium text-accent">Step {currentStep}/3</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/20"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className="flex gap-2">
          <div className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'
          }`}>
            ① Upload
          </div>
          <div className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'
          }`}>
            ② Configure
          </div>
          <div className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'
          }`}>
            ③ Import
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-background">
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <div 
                onClick={() => document.getElementById("fileInput")?.click()}
                className="relative p-12 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group bg-background_alt/30"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="text-6xl group-hover:scale-110 transition-transform">📁</div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground text-lg">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">Supported: TXT, CSV, JSON • Max 100 MB</p>
                  </div>
                </div>
                <input
                  id="fileInput"
                  type="file"
                  hidden
                  accept=".txt,.csv,.json"
                  onChange={handleFileUpload}
                />
              </div>

              {uploadedFile && (
                <div className="p-4 rounded-lg border border-accent bg-accent/5 flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">✓</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{uploadedFile.name}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span>📦 {(uploadedFile.size / 1024).toFixed(2)} KB</span>
                      <span>📄 {dataRecords.length} records</span>
                      <span>🏷️ Type: {uploadedFile.type.split('/')[1]?.toUpperCase() || 'TXT'}</span>
                    </div>
                  </div>
                </div>
              )}

              {dataRecords.length > 0 && (
                <div className="p-4 bg-accent/5 border border-accent rounded-lg">
                  <p className="text-sm text-accent">
                    ✓ {dataRecords.length} records ready to review
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configure */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              {/* Configuration Card */}
              <div className="space-y-6 p-6 border border-border rounded-xl bg-background_alt/30">
                {/* Collection Name */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    📦 Collection Name
                  </label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="my_collection"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used as Weaviate collection name</p>
                </div>

                {/* Embedder Selection */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    🧠 Embedding Model
                  </label>
                  <select
                    value={selectedEmbedder.model}
                    onChange={(e) =>
                      setSelectedEmbedder({
                        ...selectedEmbedder,
                        model: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  >
                    <option value="sentence-transformers/all-mpnet-base-v2">
                      All-MPNet-Base-v2 (Best for general text, 384-dim)
                    </option>
                    <option value="sentence-transformers/all-minilm-l6-v2">
                      All-MiniLM-L6-v2 (Faster, lighter, 384-dim)
                    </option>
                    <option value="Xenova/gte-small">
                      GTE-Small (Best for structured data, 384-dim)
                    </option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Local inference • No API keys needed</p>
                </div>
              </div>

              {/* Data Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-foreground">
                    👀 Data Preview
                  </label>
                  <span className="text-xs px-2 py-1 rounded-md bg-accent/10 text-accent font-medium">
                    {dataRecords.length} records
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto border border-border rounded-lg p-4 bg-background_alt/30 space-y-2">
                  {dataRecords.slice(0, 3).map((record, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-secondary pb-2 border-b border-border/50 last:border-0"
                    >
                      <p className="font-mono">
                        {JSON.stringify(record).substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                  {dataRecords.length > 3 && (
                    <p className="text-xs text-muted-foreground pt-2">
                      +{dataRecords.length - 3} more records
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Import */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6">
              {/* Summary Card */}
              <div className="p-6 border border-border rounded-xl bg-background_alt/30 space-y-4">
                <h3 className="font-semibold text-foreground text-lg">📋 Import Summary</h3>
                
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-xs text-muted-foreground">Collection</p>
                    <p className="text-sm font-mono font-semibold text-foreground mt-1 truncate">{collectionName}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="text-xs text-muted-foreground">Total Records</p>
                    <p className="text-sm font-mono font-semibold text-foreground mt-1">{dataRecords.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-highlight/10 border border-highlight/30">
                    <p className="text-xs text-muted-foreground">Embedder</p>
                    <p className="text-xs font-mono font-semibold text-foreground mt-1 truncate">
                      {selectedEmbedder.model.split('/')[1] || selectedEmbedder.model}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/10 border border-muted/30">
                    <p className="text-xs text-muted-foreground">Provider</p>
                    <p className="text-xs font-mono font-semibold text-foreground mt-1">Local (No API)</p>
                  </div>
                </div>
              </div>

              {/* Import Progress */}
              {isImporting && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-foreground">⏳ Processing...</p>
                      <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded">
                        {Math.round(importProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 transition-all duration-300 shadow-lg shadow-purple-500/20"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-xs text-accent">
                      🚀 Generating embeddings and storing in Weaviate...
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {importError && (
                <div className="p-4 rounded-lg bg-error/10 border border-error/30">
                  <p className="text-sm font-semibold text-error mb-1">❌ Import Failed</p>
                  <p className="text-xs text-error/80">{importError}</p>
                </div>
              )}

              {/* Success Message */}
              {!isImporting && !importError && importProgress === 100 && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <p className="text-sm font-semibold text-accent">✓ Import Complete!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Navigation */}
      <div className="flex justify-between items-center p-6 border-t border-border bg-background_alt/50">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3)}
          disabled={currentStep === 1}
          className="px-6 py-2 rounded-lg border border-border text-muted-foreground hover:bg-background hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          ← Back
        </button>

        {currentStep === 1 && (
          <button
            onClick={() => dataRecords.length > 0 && setCurrentStep(2)}
            disabled={dataRecords.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            Next →
          </button>
        )}

        {currentStep === 2 && (
          <button
            onClick={() => setCurrentStep(3)}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all font-medium"
          >
            Review →
          </button>
        )}

        {currentStep === 3 && (
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isImporting ? "⏳ Importing..." : "🚀 Import Now"}
          </button>
        )}
      </div>
    </div>
  );
}

