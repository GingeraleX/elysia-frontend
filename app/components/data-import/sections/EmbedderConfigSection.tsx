"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { UserConfig } from "@/app/types/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmbedderConfigSectionProps {
  userConfig: UserConfig;
  filePreviewData: any[] | null;
  collectionName: string;
  onConfig: (config: any) => void;
  onCollectionNameChange: (name: string) => void;
}

export default function EmbedderConfigSection({
  userConfig,
  filePreviewData,
  collectionName,
  onConfig,
  onCollectionNameChange,
}: EmbedderConfigSectionProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [vectorField, setVectorField] = useState<string>("content");
  const [editingName, setEditingName] = useState(collectionName);
  const [isValid, setIsValid] = useState(false);

  const availableEmbedders = useMemo(() => {
    const embedders: any[] = [];
    embedders.push(
      { provider: "local", model: "all-minilm-l6-v2", type: "local" },
      { provider: "local", model: "sentence-transformers/all-mpnet-base-v2", type: "local" }
    );
    return embedders;
  }, []);

  const providers = useMemo(
    () => [...new Set(availableEmbedders.map((e) => e.provider))],
    [availableEmbedders]
  );

  const models = useMemo(
    () =>
      selectedProvider
        ? availableEmbedders
            .filter((e) => e.provider === selectedProvider)
            .map((e) => e.model)
        : [],
    [selectedProvider, availableEmbedders]
  );

  const availableFields = useMemo(() => {
    if (!filePreviewData?.length) return [];
    return Object.keys(filePreviewData[0]);
  }, [filePreviewData]);

  useEffect(() => {
    const valid =
      selectedProvider &&
      selectedModel &&
      vectorField &&
      editingName &&
      /^[a-zA-Z0-9_-]+$/.test(editingName);
    setIsValid(valid);
  }, [selectedProvider, selectedModel, vectorField, editingName]);

  const handleApplyConfig = useCallback(() => {
    if (isValid) {
      onCollectionNameChange(editingName);
      onConfig({
        embedder: {
          provider: selectedProvider,
          model: selectedModel,
          vectorField: vectorField,
        },
        vectorizer: {
          type: selectedProvider === "local" ? "transformers" : "api",
          provider: selectedProvider,
          model: selectedModel,
        },
      });
    }
  }, [isValid, editingName, selectedProvider, selectedModel, vectorField, onCollectionNameChange, onConfig]);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Collection Name */}
      <div className="p-4 rounded-lg border border-border">
        <Label className="text-base font-semibold mb-2 block text-white">Collection Name</Label>
        <Input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          placeholder="my_collection"
          className={
            editingName && !/^[a-zA-Z0-9_-]+$/.test(editingName)
              ? "border-destructive"
              : ""
          }
        />
        {editingName && !/^[a-zA-Z0-9_-]+$/.test(editingName) && (
          <p className="text-xs text-destructive mt-2">
            Only alphanumeric, dash, and underscore allowed
          </p>
        )}
      </div>

      {/* Provider Selection */}
      <div className="p-4 rounded-lg border border-border">
        <Label className="text-base font-semibold mb-2 block text-white">Embedding Provider</Label>
        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                <span className="capitalize">{provider}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Selection */}
      {selectedProvider && (
        <div className="p-4 rounded-lg border border-border">
          <Label className="text-base font-semibold mb-2 block text-white">Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Vector Field Selection */}
      {availableFields.length > 0 && (
        <div className="p-4 rounded-lg border border-border">
          <Label className="text-base font-semibold mb-2 block text-white">Field to Vectorize</Label>
          <Select value={vectorField} onValueChange={setVectorField}>
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            This field will be converted to vectors
          </p>
        </div>
      )}

      {/* Summary */}
      {selectedProvider && selectedModel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-border"
        >
          <h4 className="font-semibold text-base text-white mb-3">Configuration Summary</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><span className="text-foreground font-medium">Provider:</span> {selectedProvider}</li>
            <li><span className="text-foreground font-medium">Model:</span> {selectedModel}</li>
            <li><span className="text-foreground font-medium">Vector Field:</span> {vectorField}</li>
            <li><span className="text-foreground font-medium">Records:</span> {filePreviewData?.length || 0}</li>
          </ul>
        </motion.div>
      )}

      {/* Button */}
      <Button
        onClick={handleApplyConfig}
        disabled={!isValid}
        className="w-full mt-auto"
      >
        Continue to Preview
      </Button>
    </div>
  );
}

