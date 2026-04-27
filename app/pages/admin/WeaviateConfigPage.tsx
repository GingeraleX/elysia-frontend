/**
 * Weaviate Configuration Page
 * Manage Weaviate cluster connectivity for queries
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaDatabase } from "react-icons/fa";
import ConfigSection, { ConfigField } from "@/app/components/admin/ConfigSection";
import { useSystemConfig } from "@/hooks/useSystemConfig";

export default function WeaviateConfigPage() {
  const { sections, updateSection, validate, saving, error, loading } = useSystemConfig();
  const [clusterType, setClusterType] = useState<"cloud" | "local" | "custom">(
    sections.weaviate?.type || "cloud"
  );

  const weaviateConfig = sections.weaviate || {};

  const getFields = (): ConfigField[] => {
    const baseFields: ConfigField[] = [
      {
        name: "type",
        label: "Cluster Type",
        type: "select",
        description: "Choose between cloud-hosted, local, or custom Weaviate",
        options: [
          { label: "Cloud (Weaviate Cloud)", value: "cloud" },
          { label: "Local (Docker)", value: "local" },
          { label: "Custom", value: "custom" },
        ],
      },
    ];

    if (clusterType === "cloud") {
      return [
        ...baseFields,
        {
          name: "url",
          label: "Weaviate Cloud URL",
          type: "text",
          description: "Your Weaviate Cloud instance URL",
          placeholder: "https://my-cluster.weaviate.cloud",
        },
        {
          name: "apiKey",
          label: "API Key",
          type: "password",
          description: "Your Weaviate API key",
          masked: true,
        },
        {
          name: "grpcUrl",
          label: "gRPC URL",
          type: "text",
          description: "gRPC endpoint for the cluster",
          placeholder: "my-cluster.weaviate.cloud:50051",
        },
      ];
    }

    if (clusterType === "local") {
      return [
        ...baseFields,
        {
          name: "localHttpPort",
          label: "HTTP Port",
          type: "number",
          description: "Local Weaviate HTTP port",
          placeholder: "8080",
        },
        {
          name: "localGrpcPort",
          label: "gRPC Port",
          type: "number",
          description: "Local Weaviate gRPC port",
          placeholder: "50051",
        },
      ];
    }

    if (clusterType === "custom") {
      return [
        ...baseFields,
        {
          name: "customHttpHost",
          label: "HTTP Host",
          type: "text",
          description: "Custom cluster HTTP hostname",
          placeholder: "weaviate.example.com",
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
          description: "Custom cluster gRPC hostname",
          placeholder: "weaviate.example.com",
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
          <FaDatabase size={32} />
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
            <FaDatabase className="text-blue-600" />
            Weaviate Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure your Weaviate vector database cluster
          </p>
        </div>

        <ConfigSection
          title="Weaviate Cluster"
          description="Set up connection to your Weaviate instance"
          icon={<FaDatabase />}
          config={{
            ...weaviateConfig,
            type: clusterType,
          }}
          fields={getFields()}
          onSave={(updates) => {
            if (updates.type) setClusterType(updates.type);
            return updateSection("weaviate", updates);
          }}
          saving={saving}
          error={error}
        />

        {/* Connection Type Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ y: -4 }}
            className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              clusterType === "cloud"
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600"
                : "bg-gray-50 dark:bg-gray-700/20 border-gray-300 dark:border-gray-600"
            }`}
          >
            <h4 className="font-semibold mb-2">☁️ Cloud</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Weaviate Cloud Service hosted solution
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              clusterType === "local"
                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600"
                : "bg-gray-50 dark:bg-gray-700/20 border-gray-300 dark:border-gray-600"
            }`}
          >
            <h4 className="font-semibold mb-2">🐳 Local</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Docker instance on localhost
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
              clusterType === "custom"
                ? "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600"
                : "bg-gray-50 dark:bg-gray-700/20 border-gray-300 dark:border-gray-600"
            }`}
          >
            <h4 className="font-semibold mb-2">🔧 Custom</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Self-hosted or enterprise deployment
            </p>
          </motion.div>
        </div>

        {/* Validation Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={validate}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-colors"
        >
          ✓ Test Connection
        </motion.button>

        {/* Current Settings */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
        >
          <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">📋 Current Configuration</h4>
          <div className="text-sm text-indigo-800 dark:text-indigo-300 space-y-2">
            <p>Type: <span className="font-mono">{weaviateConfig.type || "cloud"}</span></p>
            {weaviateConfig.url && <p>URL: <span className="font-mono">{weaviateConfig.url}</span></p>}
            <p>gRPC Port: <span className="font-mono">{weaviateConfig.grpcPort || "50051"}</span></p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

