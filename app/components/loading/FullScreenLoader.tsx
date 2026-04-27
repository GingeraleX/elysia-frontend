"use client";

import React from "react";

/**
 * Simple full-screen loading overlay
 * Shows: spinner + "Loading..." with shine effect
 * No extra complexity
 */
export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Simple spinner ring */}
        <div className="h-12 w-12 rounded-full border-3 border-border border-t-accent border-r-accent animate-spin" />
        
        {/* Loading text with shine effect */}
        <p className="text-primary font-medium shine">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Compact version for in-page loading
 * Use within sections instead of full-screen
 */
export function CompactLoader({
  message = "Loading...",
  size = "medium"
}: {
  message?: string;
  size?: "small" | "medium" | "large";
}) {
  const sizeClasses = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} rounded-full border-3 border-border border-t-accent border-r-accent animate-spin`} />
      {message && (
        <p className="text-secondary text-sm shine">{message}</p>
      )}
    </div>
  );
}

