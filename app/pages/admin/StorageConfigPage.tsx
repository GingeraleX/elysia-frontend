/**
 * Storage Configuration Page
 * Manage persistence settings for conversations and configurations
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdStorage } from "react-icons/md";
import ConfigSection, { ConfigField } from "@/app/components/admin/ConfigSection";
import { useSystemConfig } from "@/hooks/useSystemConfig";

export default function StorageConfigPage() {
  const { sections, updateSection, saving, error, loading } = useSystemConfig();
  const [storageType, setStorageType] = useState<"cloud" | "local" | "custom">(
    sections.storage?.type || "cloud"
  );

  const storageConfig = sections.storage || {};

  const getFields = (): ConfigField[] => {
    const baseFields: ConfigField[] = [
      {
        name: "saveConversationsToWeaviate",
        label: "Save Conversations",
        type: "boolean",
        description: "Persist chat conversations to Weaviate",
      },
      {
        name: "saveConfigurationsToWeaviate",
        label: "Save Configurations",
        type: "boolean",
        description: "Persist user configurations to Weaviate",
      },
      {
        name: "type",
        label: "Storage Type",
        type: "select",
        description: "Where to store persistence data",
        options: [
          { label: "Cloud (Weaviate Cloud)", value: "cloud" },
          { label: "Local (Docker)", value: "local" },
          { label: "Custom", value: "custom" },
        ],
      },
    ];

    if (storageType === "cloud") {
      return [
        ...baseFields,
        {
          name: "weaviateUrl",
          label: "Storage Cluster URL",
          type: "text",
          placeholder: "https://storage-cluster.weaviate.cloud",
        },
        {
          name: "apiKey",
          label: "API Key",
          type: "password",
          masked: true,
        },
      ];
    }

    if (storageType === "local") {
      return [
        ...baseFields,
        {
          name: "httpHost",
          label: "HTTP Host",
          type: "text",
          placeholder: "localhost",
        },
        {
          name: "httpPort",
          label: "HTTP Port",
          type: "number",
          placeholder: "8080",
        },
        {
          name: "grpcHost",
          label: "gRPC Host",
          type: "text",
          placeholder: "localhost",
        },
        {
          name: "grpcPort",
          label: "gRPC Port",
          type: "number",
          placeholder: "50051",
        },
      ];
    }

    if (storageType === "custom") {
      return [
        ...baseFields,
        {
          name: "customHttpHost",
          label: "HTTP Host",
          type: "text",
          placeholder: "storage.example.com",
        },
        {
          name: "customHttpPort",
          label: "HTTP Port",
          type: "number",
          placeholder: "8080",
        },
        {
          name: "customHttpSecure",
          label: "HTTP Secure (HTTPS)",
          type: "boolean",
        },
        {
          name: "customGrpcHost",
          label: "gRPC Host",
          type: "text",
          placeholder: "storage.example.com",
        },
        {
          name: "customGrpcPort",
          label: "gRPC Port",
          type: "number",
          placeholder: "50051",
        },
        {
          name: "customGrpcSecure",
          label: "gRPC Secure",
          type: "boolean",
        },
      ];
    }

    return baseFields;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <MdStorage size={32} />
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
            <MdStorage className="text-green-600" />
            Storage Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure how conversations and configurations are persisted
          </p>
        </div>

        <ConfigSection
          title="Storage Settings"
          description="Manage persistence and backup storage"
          icon={<MdStorage />}
          config={{
            ...storageConfig,
            type: storageType,
          }}
          fields={getFields()}
          onSave={(updates) => {
            if (updates.type) setStorageType(updates.type);
            return updateSection("storage", updates);
          }}
          saving={saving}
          error={error}
        />

        {/* Storage Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -4 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
          >
            <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">💬 Conversations</h4>
            <p className="text-sm text-green-800 dark:text-green-300">
              {storageConfig.saveConversationsToWeaviate ? "✓ Saving" : "✗ Not saving"} chat history
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">⚙️ Configurations</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {storageConfig.saveConfigurationsToWeaviate ? "✓ Saving" : "✗ Not saving"} user configs
            </p>
          </motion.div>
        </div>

        {/* Storage Type Comparison */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
        >
          <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-3">📊 Storage Options</h4>
          <div className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
            <div>
              <p className="font-medium">☁️ Cloud Storage</p>
              <p className="text-xs">Best for: Managed, scalable persistence</p>
            </div>
            <div className="mt-2">
              <p className="font-medium">🐳 Local Storage</p>
              <p className="text-xs">Best for: Development, single-server deployments</p>
            </div>
            <div className="mt-2">
              <p className="font-medium">🔧 Custom Storage</p>
              <p className="text-xs">Best for: Enterprise, self-hosted infrastructure</p>
            </div>
          </div>
        </motion.div>

        {/* Current Configuration */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">📋 Active Configuration</h4>
          <div className="text-sm text-purple-800 dark:text-purple-300 space-y-2">
            <p>Type: <span className="font-mono">{storageConfig.type || "cloud"}</span></p>
            <p>Conversations: <span className="font-mono">{storageConfig.saveConversationsToWeaviate ? "Enabled" : "Disabled"}</span></p>
            <p>Configurations: <span className="font-mono">{storageConfig.saveConfigurationsToWeaviate ? "Enabled" : "Disabled"}</span></p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

