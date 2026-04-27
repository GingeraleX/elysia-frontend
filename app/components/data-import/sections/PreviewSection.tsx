"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PreviewSectionProps {
  filePreviewData: any[] | null;
  collectionName: string;
  embedderConfig: any;
  vectorizerConfig: any;
  onProceed: () => void;
}

export default function PreviewSection({
  filePreviewData,
  collectionName,
  embedderConfig,
  vectorizerConfig,
  onProceed,
}: PreviewSectionProps) {
  const columns = useMemo(
    () => (filePreviewData?.length ? Object.keys(filePreviewData[0]) : []),
    [filePreviewData]
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Info Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">Collection</p>
          <p className="font-semibold text-sm truncate text-foreground">{collectionName}</p>
        </div>
        <div className="p-3 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">Provider</p>
          <p className="font-semibold text-sm text-foreground">{embedderConfig?.provider}</p>
        </div>
        <div className="p-3 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">Model</p>
          <p className="font-semibold text-sm truncate text-xs text-foreground">{embedderConfig?.model}</p>
        </div>
        <div className="p-3 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">Records</p>
          <p className="font-semibold text-sm text-foreground">{filePreviewData?.length || 0}</p>
        </div>
      </div>

      {/* Data Preview */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <h3 className="font-semibold text-base text-white">Data Preview</h3>
        <div className="flex-1 overflow-auto rounded-lg border border-border p-4 min-h-0">
          <div className="text-xs space-y-2">
            {filePreviewData?.slice(0, 5).map((row, idx) => (
              <div key={idx} className="p-3 rounded border border-border/50">
                {Object.entries(row).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex gap-2 mb-1 last:mb-0">
                    <span className="text-muted-foreground font-medium">{key}:</span>
                    <span className={`${key === embedderConfig?.vectorField ? "text-primary font-semibold" : "text-foreground"}`}>
                      {String(value).substring(0, 50)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 rounded-lg border border-border">
        <h4 className="font-semibold text-base text-white mb-3">Statistics</h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• <span className="text-foreground font-medium">Fields:</span> {columns.length}</li>
          <li>• <span className="text-foreground font-medium">Vector Field:</span> {embedderConfig?.vectorField}</li>
          <li>• <span className="text-foreground font-medium">Preview Rows:</span> {Math.min(5, filePreviewData?.length || 0)}</li>
        </ul>
      </div>

      {/* Button */}
      <Button onClick={onProceed} className="w-full">
        Proceed to Import
      </Button>
    </div>
  );
}

