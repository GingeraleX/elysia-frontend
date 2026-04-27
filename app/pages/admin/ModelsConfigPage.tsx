/**
 * Models Configuration Page
 * Manage AI model providers and model selection
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { TbManualGearboxFilled } from "react-icons/tb";
import ConfigSection, { ConfigField } from "@/app/components/admin/ConfigSection";
import { useSystemConfig } from "@/hooks/useSystemConfig";

export default function ModelsConfigPage() {
  const { sections, updateSection, saving, error, loading } = useSystemConfig();

  const modelsConfig = sections.models || {};

  const fields: ConfigField[] = [
    {
      name: "baseProvider",
      label: "Base Model Provider",
      type: "select",
      description: "Provider for simpler, faster tasks",
      options: [
        { label: "OpenAI", value: "openai" },
        { label: "Anthropic", value: "anthropic" },
        { label: "HuggingFace", value: "huggingface" },
        { label: "Local", value: "local" },
      ],
    },
    {
      name: "baseModel",
      label: "Base Model",
      type: "text",
      description: "Model name for base provider (e.g., gpt-3.5-turbo, claude-3-haiku)",
      placeholder: "gpt-3.5-turbo",
    },
    {
      name: "complexProvider",
      label: "Complex Model Provider",
      type: "select",
      description: "Provider for complex, accurate tasks",
      options: [
        { label: "OpenAI", value: "openai" },
        { label: "Anthropic", value: "anthropic" },
        { label: "HuggingFace", value: "huggingface" },
        { label: "Local", value: "local" },
      ],
    },
    {
      name: "complexModel",
      label: "Complex Model",
      type: "text",
      description: "Model name for complex provider (e.g., gpt-4, claude-3-opus)",
      placeholder: "gpt-4",
    },
    {
      name: "modelApiBase",
      label: "API Base URL",
      type: "text",
      description: "Custom API endpoint (optional)",
      placeholder: "https://api.openai.com/v1",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <TbManualGearboxFilled size={32} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <TbManualGearboxFilled className="text-purple-600" />
            Model Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select AI models for different types of tasks
          </p>
        </div>

        <ConfigSection
          title="Model Selection"
          description="Configure base and complex models for different task types"
          icon={<TbManualGearboxFilled />}
          config={modelsConfig}
          fields={fields}
          onSave={(updates) => updateSection("models", updates)}
          saving={saving}
          error={error}
        />

        {/* Model Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -4 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">⚡ Base Model</h4>
            <p className="text-sm text-green-800 dark:text-green-300 mb-2">
              Used for faster, simpler tasks that don't require high accuracy
            </p>
            <div className="text-xs font-mono text-green-700 dark:text-green-400 space-y-1">
              <p>Provider: {modelsConfig.baseProvider}</p>
              <p>Model: {modelsConfig.baseModel}</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
          >
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">🚀 Complex Model</h4>
            <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
              Used for complex tasks requiring high accuracy and reasoning
            </p>
            <div className="text-xs font-mono text-amber-700 dark:text-amber-400 space-y-1">
              <p>Provider: {modelsConfig.complexProvider}</p>
              <p>Model: {modelsConfig.complexModel}</p>
            </div>
          </motion.div>
        </div>

        {/* Provider Guide */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
        >
          <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">📚 Supported Providers</h4>
          <div className="grid grid-cols-2 gap-3 text-sm text-indigo-800 dark:text-indigo-300">
            <div>
              <p className="font-medium">OpenAI</p>
              <p className="text-xs">gpt-4, gpt-3.5-turbo</p>
            </div>
            <div>
              <p className="font-medium">Anthropic</p>
              <p className="text-xs">claude-3-opus, claude-3-sonnet</p>
            </div>
            <div>
              <p className="font-medium">HuggingFace</p>
              <p className="text-xs">Various open models</p>
            </div>
            <div>
              <p className="font-medium">Local</p>
              <p className="text-xs">Self-hosted models</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

