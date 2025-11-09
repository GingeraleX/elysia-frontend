﻿"use client";

import React from "react";

/**
 * Elysia Loading Spinner Component
 * Uses the design system's neon accent colors and animations
 * Professional loading state that matches Elysia's aesthetic
 */
export function LoadingSpinner({ size = "medium", fullScreen = false }: { size?: "small" | "medium" | "large"; fullScreen?: boolean }) {
  const sizeClasses = {
    small: "h-6 w-6 border-2",
    medium: "h-10 w-10 border-3",
    large: "h-16 w-16 border-4",
  };

  const dotSizes = {
    small: "h-1.5 w-1.5",
    medium: "h-2 w-2",
    large: "h-3 w-3",
  };

  const spinnerContent = (
    <div className="flex flex-col items-center gap-3">
      {/* Spinner ring with neon accent */}
      <div className={`${sizeClasses[size]} rounded-full border-border border-t-accent border-r-accent animate-spin relative`}>
        {/* Pulsing dot in center */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${dotSizes[size]} rounded-full bg-accent`} style={{ animation: "pulsing_color 2s ease-in-out infinite" }} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
        <div className="bg-foreground border border-border rounded-lg p-8 text-center">
          {spinnerContent}
          <p className="text-secondary text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center">{spinnerContent}</div>;
}

/**
 * Page Transition Loading Component
 * Shown when dynamically importing pages (between subpage transitions)
 * Uses the original Elysia "shine" animation for elegant loading text
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <p className="text-primary text-lg shine">Loading...</p>
    </div>
  );
}

/**
 * Inline Loading Button State
 * For use inside buttons during async operations
 */
export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-1 items-center ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current pulsing" />
      <span className="h-1.5 w-1.5 rounded-full bg-current pulsing" style={{ animationDelay: "0.1s" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-current pulsing" style={{ animationDelay: "0.2s" }} />
    </div>
  );
}

/**
 * Skeleton Loader - for content placeholders
 * Mimics the shape of content while loading
 */
export function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-foreground_alt rounded-lg animate-pulse ${className}`} />
  );
}

