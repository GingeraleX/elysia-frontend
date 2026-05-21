"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  GitBranch,
  Trash2,
  X,
  Settings2,
  Sparkles,
} from "lucide-react";
import CollectionSelection from "./components/CollectionSelection";
import { Button } from "@/components/ui/button";

interface QueryInputProps {
  handleSendQuery: (query: string, route?: string, mimick?: boolean) => void;
  query_length: number;
  currentStatus: string;
  addDisplacement: (value: number) => void;
  addDistortion: (value: number) => void;
  selectSettings: () => void;
}

const QueryInput: React.FC<QueryInputProps> = ({
  handleSendQuery,
  query_length,
  currentStatus,
  addDisplacement,
  addDistortion,
  selectSettings,
}) => {
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState<string>("");
  const [mimick, setMimick] = useState<boolean>(false);
  const [showRoute, setShowRoute] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const isBusy = currentStatus !== "";

  const triggerQuery = (_query: string) => {
    if (_query.trim() === "" || isBusy) return;
    handleSendQuery(_query, route, mimick);
    setQuery("");
  };

  useEffect(() => {
    addDisplacement(0.035);
    addDistortion(0.02);
  }, [query]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [query]);

  const canSubmit = query.trim().length > 0 && !isBusy;

  return (
    <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 w-full md:w-[60vw] lg:w-[44vw] px-3 md:px-0 flex flex-col items-center gap-2">
      {/* Status pill */}
      {isBusy && (
        <div className="fade-in flex items-center gap-2 rounded-full border border-accent/30 bg-background_alt/60 backdrop-blur px-3 py-1 mb-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <p className="text-[11px] text-accent font-mono-soft tracking-wider">
            {currentStatus}
          </p>
        </div>
      )}

      {/* Route bar (dev only) */}
      {showRoute && (
        <div className="fade-in w-full flex items-center gap-2 rounded-xl border border-border/40 bg-background_alt/70 backdrop-blur px-3 py-2">
          <GitBranch className="h-3.5 w-3.5 text-secondary shrink-0" strokeWidth={1.8} />
          <input
            className="flex-1 bg-transparent outline-none text-[12px] text-primary placeholder:text-secondary/60"
            value={route}
            placeholder="Route: es. search/query/text_response"
            onChange={(e) => setRoute(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setMimick(!mimick)}
            className={`text-[11px] font-mono-soft tracking-wider px-2 py-1 rounded-md transition-colors ${
              mimick
                ? "bg-accent/15 text-accent"
                : "text-secondary hover:bg-foreground_alt/40"
            }`}
          >
            mimick
          </button>
          <button
            type="button"
            onClick={() => setRoute("")}
            className="grid h-6 w-6 place-items-center rounded-md text-secondary hover:bg-foreground_alt/40 hover:text-primary"
            aria-label="Pulisci route"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => setShowRoute(false)}
            className="grid h-6 w-6 place-items-center rounded-md text-secondary hover:bg-foreground_alt/40 hover:text-primary"
            aria-label="Chiudi"
          >
            <X className="h-3 w-3" strokeWidth={1.8} />
          </button>
        </div>
      )}

      {/* Composer */}
      <div
        className={`relative w-full rounded-2xl border bg-background_alt/55 backdrop-blur-xl transition-all duration-300 ${
          focused
            ? "border-accent/50 shadow-[0_8px_40px_-16px_hsl(var(--accent)/0.55)]"
            : "border-border/45 hover:border-border/70"
        }`}
      >
        {/* Aurora trace */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-4 -top-px h-px transition-opacity duration-500 ${
            focused ? "opacity-80" : "opacity-0"
          }`}
          style={{ background: "var(--grad-aurora)" }}
        />

        <textarea
          ref={textareaRef}
          placeholder={
            query_length !== 0
              ? "Continua la conversazione…"
              : "Cosa vuoi chiedere a Elysia?"
          }
          className="w-full bg-transparent px-5 pt-4 pb-2 outline-none text-[14px] leading-relaxed text-primary placeholder:text-secondary/55 resize-none min-h-[52px] max-h-[160px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              triggerQuery(query);
            }
          }}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-1">
            <CollectionSelection />
            {query_length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => selectSettings()}
                className="h-8 w-8 text-secondary hover:text-primary"
                aria-label="Impostazioni avanzate"
                title="Impostazioni risposta"
              >
                <Settings2 className="h-3.5 w-3.5" strokeWidth={1.8} />
              </Button>
            )}
            {process.env.NODE_ENV === "development" && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${
                  showRoute && !route
                    ? "text-primary"
                    : route
                    ? "text-accent"
                    : "text-secondary/70 hover:text-primary"
                }`}
                onClick={() => setShowRoute(!showRoute)}
                aria-label="Route avanzato"
                title="Route (dev)"
              >
                <GitBranch className="h-3.5 w-3.5" strokeWidth={1.8} />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden md:inline-flex items-center gap-1 font-mono-soft text-[10px] text-secondary/60 tracking-wider">
              <span>↵</span>
              <span>invia</span>
            </kbd>
            <button
              type="button"
              onClick={() => triggerQuery(query)}
              disabled={!canSubmit}
              className={`relative grid h-9 w-9 place-items-center rounded-full transition-all duration-200 ${
                canSubmit
                  ? "text-background"
                  : "bg-foreground_alt/40 text-secondary/50 cursor-not-allowed"
              }`}
              style={
                canSubmit
                  ? {
                      background: "var(--grad-aurora)",
                      boxShadow:
                        "0 6px 20px -8px hsl(var(--accent) / 0.6), inset 0 0 0 1px hsl(var(--accent) / 0.4)",
                    }
                  : undefined
              }
              aria-label="Invia"
            >
              {isBusy ? (
                <Sparkles className="h-4 w-4 animate-pulse" strokeWidth={1.8} />
              ) : (
                <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="hidden md:block font-mono-soft text-[10px] tracking-wider text-secondary/50 mt-1">
        Elysia può commettere errori. Verifica le informazioni importanti.
      </p>
    </div>
  );
};

export default QueryInput;
