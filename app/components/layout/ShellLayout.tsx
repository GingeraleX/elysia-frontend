"use client";

import React, { Suspense } from "react";
import { FEATURE_FLAGS } from "@/lib/config";

/**
 * Background shell with optional Three.js
 * Renders Three.js scene in background if enabled
 */
export function ShellLayout({ children }: { children: React.ReactNode }) {
  const ThreejsBackground = React.lazy(
    () => import("./ThreejsBackground").then((mod) => ({ default: mod.ThreejsBackground }))
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Three.js Background - Optional */}
      {FEATURE_FLAGS.ENABLE_THREEJS && (
        <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />}>
          <div className="absolute inset-0 z-0">
            <ThreejsBackground />
          </div>
        </Suspense>
      )}

      {/* Main Content - Foreground */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

