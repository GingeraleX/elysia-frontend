"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BiCheckCircle } from "react-icons/bi";

interface CollectionInfoSectionProps {
  filePreviewData: any[] | null;
  collectionName: string;
  selectedEmbedder: any;
}

export default function CollectionInfoSection({
  filePreviewData,
  collectionName,
  selectedEmbedder,
}: CollectionInfoSectionProps) {
  const columns = useMemo(
    () => (filePreviewData && filePreviewData.length > 0 ? Object.keys(filePreviewData[0]) : []),
    [filePreviewData]
  );

  const fieldTypes = useMemo(() => {
    if (!filePreviewData || filePreviewData.length === 0) return {};
    
    const types: { [key: string]: string } = {};
    const sample = filePreviewData[0];
    
    for (const [key, value] of Object.entries(sample)) {
      types[key] = typeof value === "number" 
        ? "number" 
        : Array.isArray(value) 
        ? "array" 
        : typeof value === "boolean" 
        ? "boolean" 
        : "text";
    }
    
    return types;
  }, [filePreviewData]);

  return (
    <div className="sticky top-0 flex flex-col gap-4 h-fit">
      {/* Collection Summary */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 rounded-lg bg-muted/50 space-y-3"
      >
        <div className="flex items-center gap-2">
          <AiOutlineInfoCircle className="text-primary" />
          <h4 className="font-semibold text-sm">Collection Info</h4>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-semibold break-all">{collectionName}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Records</p>
            <p className="font-semibold">{filePreviewData?.length || 0}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Fields</p>
            <p className="font-semibold">{columns.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Embedder Info */}
      {selectedEmbedder && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3"
        >
          <div className="flex items-center gap-2">
            <BiCheckCircle className="text-primary" />
            <h4 className="font-semibold text-sm">Embedder Config</h4>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <p className="text-muted-foreground">Provider</p>
              <p className="font-semibold capitalize">{selectedEmbedder.provider}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Model</p>
              <p className="font-semibold text-xs break-all">{selectedEmbedder.model}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Vector Field</p>
              <p className="font-semibold">{selectedEmbedder.vectorField}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fields List */}
      {columns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-4 rounded-lg bg-muted/50 space-y-2"
        >
          <h4 className="font-semibold text-sm">Fields ({columns.length})</h4>
          <div className="space-y-1 text-xs max-h-64 overflow-y-auto">
            {columns.map((col) => (
              <div
                key={col}
                className={`flex items-center gap-2 p-2 rounded hover:bg-background/50 transition-colors ${
                  col === selectedEmbedder?.vectorField ? "bg-primary/10" : ""
                }`}
              >
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-muted-foreground"></span>
                <span className="flex-1 truncate">
                  <strong>{col}</strong>
                </span>
                <span className="flex-shrink-0 px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs capitalize">
                  {fieldTypes[col] || "unknown"}
                </span>
                {col === selectedEmbedder?.vectorField && (
                  <span className="flex-shrink-0 text-primary font-bold ml-1">✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Display mappings note */}
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            Display mappings auto-detected — review in next step
          </p>
        </motion.div>
      )}

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 space-y-2"
      >
        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
          💡 Tips
        </p>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-3 list-disc">
          <li>All fields are indexed and searchable</li>
          <li>Text fields can be vectorized for semantic search</li>
          <li>Numeric and boolean fields enable filtering</li>
          <li>Choose descriptive field names for better UX</li>
        </ul>
      </motion.div>
    </div>
  );
}

