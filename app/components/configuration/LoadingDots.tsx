"use client";

/**
 * LoadingDots — three staggered bouncing dots.
 *
 * Used as a unified "in-progress" indicator across all stack-status viewers:
 *   - StackModeSlider status line
 *   - ModelsSection GPU Stack Status card
 *   - ImportDataPage Active pipeline card
 *
 * Color is inherited from the parent's `color` / `text-*` class so it can be
 * amber (loading), emerald (booting-to-ready), etc.
 */
import React from "react";

interface LoadingDotsProps {
  /** Extra Tailwind classes applied to the wrapper <span>. Use text-* for colour. */
  className?: string;
  /** Dot size in pixels (default 4 = 1rem / 4 = 4px w-1 h-1). */
  size?: "xs" | "sm";
}

export default function LoadingDots({ className = "", size = "xs" }: LoadingDotsProps) {
  const dotCls = size === "sm" ? "w-1.5 h-1.5" : "w-1 h-1";
  return (
    <span
      className={`flex items-center gap-0.5 ${className}`}
      aria-label="Loading"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`${dotCls} rounded-full bg-current animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

