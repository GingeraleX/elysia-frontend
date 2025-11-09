"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Full-screen loading overlay with professional styling
 * Reusable across the entire app
 * Features: Animated spinner, custom message, backdrop blur
 */
export function FullScreenLoader({ 
  message = "Loading...",
  icon = "default"
}: { 
  message?: string;
  icon?: "default" | "config" | "import" | "data";
}) {
  const getIcon = () => {
    switch(icon) {
      case "config":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-5xl"
          >
            ⚙️
          </motion.div>
        );
      case "import":
        return (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-5xl"
          >
            📥
          </motion.div>
        );
      case "data":
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-5xl"
          >
            📊
          </motion.div>
        );
      default:
        return (
          <div className="h-14 w-14 rounded-full border-4 border-border border-t-accent border-r-accent animate-spin" />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50 flex-col gap-6"
    >
      {/* Logo/Icon Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Spinner or Icon */}
        <div className="text-6xl">
          {getIcon()}
        </div>

        {/* Elysia Branding */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Enterprise AI
          </h2>
          <p className="text-xl font-medium shine">
            {message}
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-accent"
            />
          ))}
        </div>
      </motion.div>

      {/* Optional subtle info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-xs text-secondary/50">
          Please wait...
        </p>
      </motion.div>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-3"
    >
      <div className={`${sizeClasses[size]} rounded-full border-3 border-border border-t-accent border-r-accent animate-spin`} />
      {message && (
        <motion.p
          animate={{ opacity: [0.6, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-secondary text-sm"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

