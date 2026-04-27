"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { UserConfig } from "@/app/types/settings";
import { host } from "@/app/components/host";
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

interface EmbedModelEntry {
  value: string;
  label: string;
  dims: number;
  provider?: string;
}

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

  // Embed models fetched from backend (source of truth: modelRegistry.ts)
  const [localEmbedModels, setLocalEmbedModels] = useState<EmbedModelEntry[]>([]);
  const [cloudEmbedModels, setCloudEmbedModels] = useState<EmbedModelEntry[]>([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Fetch embed models from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${host}/user/config/models`);
        if (res.ok) {
          const data = await res.json();
          if (data.embed_models) {
            setLocalEmbedModels(data.embed_models.local ?? []);
            setCloudEmbedModels(data.embed_models.cloud ?? []);
          }
        }
      } catch (err) {
        console.warn("[EmbedderConfigSection] Failed to fetch embed models:", err);
      } finally {
        setModelsLoaded(true);
      }
    })();
  }, []);

  // Pre-select based on user's settings (LOCAL_EMBED_MODEL / CLOUD_EMBED_MODEL)
  useEffect(() => {
    if (!modelsLoaded) return;
    const settings = (userConfig as any)?.backend?.settings;
    const userLocalEmbed = settings?.LOCAL_EMBED_MODEL as string | undefined;
    const userCloudEmbed = settings?.CLOUD_EMBED_MODEL as string | undefined;

    if (userLocalEmbed && localEmbedModels.some(m => m.value === userLocalEmbed)) {
      setSelectedProvider("local");
      setSelectedModel(userLocalEmbed);
    } else if (userCloudEmbed && cloudEmbedModels.some(m => m.value === userCloudEmbed)) {
      setSelectedProvider("cloud");
      setSelectedModel(userCloudEmbed);
    } else if (localEmbedModels.length > 0) {
      setSelectedProvider("local");
      setSelectedModel(localEmbedModels[0].value);
    }
  }, [modelsLoaded, userConfig, localEmbedModels, cloudEmbedModels]);

  const availableEmbedders = useMemo(() => {
    const embedders: { provider: string; model: string; label: string; dims: number; type: string }[] = [];
    for (const m of localEmbedModels) {
      embedders.push({ provider: "local", model: m.value, label: m.label, dims: m.dims, type: "local" });
    }
    for (const m of cloudEmbedModels) {
      embedders.push({ provider: m.provider ?? "cloud", model: m.value, label: m.label, dims: m.dims, type: "cloud" });
    }
    return embedders;
  }, [localEmbedModels, cloudEmbedModels]);

  const providers = useMemo(
    () => [...new Set(availableEmbedders.map((e) => e.provider))],
    [availableEmbedders]
  );

  const models = useMemo(
    () =>
      selectedProvider
        ? availableEmbedders
            .filter((e) => e.provider === selectedProvider)
            .map((e) => ({ value: e.model, label: e.label }))
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
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
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
            <li><span className="text-foreground font-medium">Model:</span> {models.find(m => m.value === selectedModel)?.label ?? selectedModel}</li>
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

