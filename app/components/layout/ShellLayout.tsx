"use client";

import React, { Suspense } from "react";
import { FEATURE_FLAGS } from "@/lib/config";

/**
 * App shell — iridescent violet ambient backdrop.
 */
export function ShellLayout({ children }: { children: React.ReactNode }) {
  const ThreejsBackground = React.lazy(
    () => import("./ThreejsBackground").then((mod) => ({ default: mod.ThreejsBackground }))
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Ambient violet mesh — restrained */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            "radial-gradient(900px 700px at 95% 110%, hsl(268 65% 28% / 0.18), transparent 65%)",
            "radial-gradient(900px 700px at 50% 0%, hsl(240 50% 18% / 0.18), transparent 70%)",
          ].join(", "),
        }}
      />

      {/* Soft grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(250 25% 96% / 0.7) 1px, transparent 1px), linear-gradient(to bottom, hsl(250 25% 96% / 0.7) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 80%)",
        }}
      />

      {FEATURE_FLAGS.ENABLE_THREEJS && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 z-0 opacity-60">
            <ThreejsBackground />
          </div>
        </Suspense>
      )}

      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
