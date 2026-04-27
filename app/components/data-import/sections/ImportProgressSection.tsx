"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/app/components/loading/LoadingSpinner";
import { MdCheckCircle, MdError, MdHourglassEmpty } from "react-icons/md";

interface ImportProgressSectionProps {
  progress: {
    total: number;
    processed: number;
    current: string;
    status: "idle" | "processing" | "complete" | "error";
    errorMessage: string;
  };
  collectionName: string;
  onStartImport: () => void;
  onReset: () => void;
}

export default function ImportProgressSection({
  progress,
  collectionName,
  onStartImport,
  onReset,
}: ImportProgressSectionProps) {
  const percentage =
    progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 h-full items-center justify-center">
      {/* Status Icon or Spinner */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`p-6 rounded-full ${
          progress.status === "error"
            ? "bg-background_error/10"
            : progress.status === "complete"
            ? "bg-accent/10"
            : "bg-accent/10"
        }`}
      >
        {progress.status === "processing" ? (
          <LoadingSpinner size="large" />
        ) : progress.status === "complete" ? (
          <MdCheckCircle className="text-4xl text-accent" />
        ) : progress.status === "error" ? (
          <MdError className="text-4xl text-error" />
        ) : (
          <MdHourglassEmpty className="text-4xl text-accent" />
        )}
      </motion.div>

      {/* Status Message */}
      <div className="text-center">
        <h3 className="font-semibold text-lg text-primary mb-1">
          {progress.status === "complete"
            ? "Import Complete"
            : progress.status === "error"
            ? "Import Failed"
            : progress.status === "processing"
            ? "Importing Data"
            : "Ready to Import"}
        </h3>
        <p className="text-sm text-secondary">{collectionName}</p>
      </div>

      {/* Progress Bar */}
      {(progress.status === "processing" || progress.status === "complete") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-xs space-y-2"
        >
          <div className="flex justify-between text-xs">
            <span className="text-secondary">{progress.current}</span>
            <span className="text-accent font-semibold">{percentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-foreground_alt overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {progress.status === "error" && progress.errorMessage && (
        <div className="w-full max-w-xs p-3 rounded-lg bg-background_error/10 border border-error/30">
          <p className="text-xs text-error">{progress.errorMessage}</p>
        </div>
      )}

      {/* Success Message */}
      {progress.status === "complete" && (
        <div className="w-full max-w-xs p-3 rounded-lg bg-accent/10 border border-accent/30">
          <p className="text-xs text-accent">
            Your data has been successfully imported and is ready for use.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {progress.status === "idle" && (
          <>
            <Button variant="outline" onClick={onReset}>
              Cancel
            </Button>
            <Button onClick={onStartImport} className="bg-accent hover:bg-highlight text-background">
              Start Import
            </Button>
          </>
        )}
        {progress.status === "processing" && (
          <Button disabled className="bg-accent/50 text-background">
            <div className="animate-spin mr-2 h-4 w-4">
              <div className="h-full w-full border-2 border-background border-t-transparent rounded-full"></div>
            </div>
            Importing...
          </Button>
        )}
        {(progress.status === "complete" || progress.status === "error") && (
          <>
            <Button variant="outline" onClick={onReset} className="border-border text-primary hover:bg-foreground_alt">
              Import Another
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

