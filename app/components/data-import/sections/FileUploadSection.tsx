"use client";

import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { MdCloudUpload, MdError } from "react-icons/md";
import { Collection } from "@/app/types/objects";

interface FileUploadSectionProps {
  onFileUpload: (file: File, preview: any[]) => void;
  existingCollections: Collection[];
}

const SUPPORTED_FORMATS = [".csv", ".json", ".jsonl", ".txt"];
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function FileUploadSection({
  onFileUpload,
  existingCollections,
}: FileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const parseFile = async (file: File): Promise<any[]> => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    setError("");
    setLoading(true);

    try {
      if (ext === ".csv") {
        const text = await file.text();
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length < 2) throw new Error("Il CSV deve avere intestazioni e almeno una riga");
        const headers = lines[0].split(",").map(h => h.trim());
        return lines.slice(1, 11).map((line) => {
          const values = line.split(",").map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, idx) => {
            obj[header] = values[idx] || "";
          });
          return obj;
        });
      } else if (ext === ".json") {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error("Il JSON deve essere un array");
        return data.slice(0, 10);
      } else if (ext === ".jsonl") {
        const text = await file.text();
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length === 0) throw new Error("Il JSONL è vuoto");
        return lines.slice(0, 10).map((line) => JSON.parse(line));
      } else if (ext === ".txt") {
        const text = await file.text();
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length === 0) throw new Error("Il TXT è vuoto");
        return lines.slice(0, 10).map((line, idx) => ({
          id: idx + 1,
          content: line,
        }));
      }
      throw new Error("Formato non supportato");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Parsing non riuscito";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!SUPPORTED_FORMATS.includes(ext)) {
      setError(`Formato non supportato. Usa: ${SUPPORTED_FORMATS.join(", ")}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File troppo grande (max 100MB)");
      return;
    }

    try {
      const parsed = await parseFile(file);
      if (parsed.length === 0) {
        setError("Il file è vuoto");
        return;
      }
      onFileUpload(file, parsed);
    } catch (err) {
      // Error already set in parseFile
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  }, [handleFile]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      if (files?.length) handleFile(files[0]);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Upload Card */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-lg border-2 border-dashed transition-all ${
          isDragging
            ? "border-accent bg-accent/5"
            : error
            ? "border-error bg-background_error/5"
            : "border-border hover:border-accent/50"
        }`}
      >
        <input
          type="file"
          accept={SUPPORTED_FORMATS.join(",")}
          onChange={handleFileInput}
          disabled={loading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        <motion.div
          animate={{ scale: isDragging ? 1.1 : 1 }}
          className={`p-3 rounded-full ${
            error ? "bg-background_error/20" : "bg-accent/20"
          }`}
        >
          {error ? (
            <MdError className="text-2xl text-error" />
          ) : (
            <MdCloudUpload className="text-2xl text-accent" />
          )}
        </motion.div>

        <div className="text-center">
          <h3 className="font-semibold text-base text-primary">
            {loading ? "Analisi..." : error ? "Errore" : "Trascina qui il file"}
          </h3>
          <p className="text-sm text-secondary mt-1">
            {error || "oppure clicca per selezionare (CSV, JSON, JSONL, TXT)"}
          </p>
        </div>

        {error && (
          <button
            onClick={() => setError("")}
            className="text-xs px-3 py-1 rounded bg-accent text-background hover:bg-highlight transition-colors"
          >
            Riprova
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-foreground">
          <h4 className="font-semibold text-base text-primary mb-3">Requisiti</h4>
          <ul className="space-y-2 text-xs text-secondary">
            <li className="flex gap-2">
              <span className="text-accent">✓</span> Max 100MB
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span> CSV, JSON, JSONL, TXT
            </li>
            <li className="flex gap-2">
              <span className="text-accent">✓</span> Intestazioni per CSV/JSON
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-lg border border-border bg-foreground">
          <h4 className="font-semibold text-base text-primary mb-3">Collezioni</h4>
          <p className="text-xs text-secondary">
            Totale: <span className="text-accent font-semibold">{existingCollections.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
