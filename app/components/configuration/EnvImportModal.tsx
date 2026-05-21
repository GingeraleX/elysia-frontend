"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EnvImportModalProps {
  isOpen: boolean;
  envContent: string;
  onOpenChange: (open: boolean) => void;
  onEnvContentChange: (content: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Modal component for importing API keys from .env file format
 * Supports both KEY=value and KEY="value" formats with comment filtering
 */
export default function EnvImportModal({
  isOpen,
  envContent,
  onOpenChange,
  onEnvContentChange,
  onSubmit,
  onCancel,
}: EnvImportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importa API key da .env</DialogTitle>
          <DialogDescription>
            Incolla qui sotto il contenuto del tuo file .env. Lo parseremo
            automaticamente e aggiungeremo le API key. Supporta sia il formato{" "}
            <code>KEY=value</code> che <code>KEY=&quot;value&quot;</code>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="env-content" className="text-sm font-medium">
              Contenuto .env
            </label>
            <textarea
              id="env-content"
              value={envContent}
              onChange={(e) => onEnvContentChange(e.target.value)}
              placeholder={`OPENAI_API_KEY=la_tua_chiave
ANTHROPIC_API_KEY="la_tua_chiave"
GOOGLE_API_KEY=la_tua_chiave`}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              I commenti (righe che iniziano con `#`) verranno ignorati
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!envContent.trim()}
            className="bg-accent/10 text-accent hover:bg-accent/20"
          >
            Importa chiavi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
