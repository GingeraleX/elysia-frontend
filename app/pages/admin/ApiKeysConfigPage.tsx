/**
 * API Keys Configuration Page
 * Manage API keys for external services
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoKeyOutline, IoAdd, IoClose } from "react-icons/io5";
import ConfigSection, { ConfigField } from "@/app/components/admin/ConfigSection";
import { useSystemConfig } from "@/hooks/useSystemConfig";

export default function ApiKeysConfigPage() {
  const { sections, updateSection, saving, error, loading } = useSystemConfig();
  const [newKey, setNewKey] = useState({ name: "", value: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  const apiKeysConfig = sections.apiKeys || {};

  const standardFields: ConfigField[] = [
    {
      name: "openaiKey",
      label: "OpenAI API Key",
      type: "password",
      description: "Your OpenAI API key for GPT models",
      masked: true,
    },
    {
      name: "anthropicKey",
      label: "Anthropic API Key",
      type: "password",
      description: "Your Anthropic API key for Claude models",
      masked: true,
    },
    {
      name: "huggingfaceKey",
      label: "HuggingFace API Key",
      type: "password",
      description: "Your HuggingFace API key for open models",
      masked: true,
    },
    {
      name: "weaviateApiKey",
      label: "Weaviate Query API Key",
      type: "password",
      description: "API key for your Weaviate query cluster",
      masked: true,
    },
    {
      name: "storageWeaviateApiKey",
      label: "Weaviate Storage API Key",
      type: "password",
      description: "API key for your Weaviate storage cluster",
      masked: true,
    },
  ];

  const handleAddCustomKey = async () => {
    if (!newKey.name || !newKey.value) return;

    const updated = await updateSection("apiKeys", {
      customKeys: {
        ...apiKeysConfig.customKeys,
        [newKey.name]: newKey.value,
      },
    });

    if (updated) {
      setNewKey({ name: "", value: "" });
      setShowAddForm(false);
    }
  };

  const handleRemoveCustomKey = async (keyName: string) => {
    const customKeys = { ...apiKeysConfig.customKeys };
    delete customKeys[keyName];

    await updateSection("apiKeys", {
      customKeys,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <IoKeyOutline size={32} />
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
            <IoKeyOutline className="text-red-600" />
            API Keys Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage API keys for external services and providers
          </p>
        </div>

        {/* Standard API Keys */}
        <ConfigSection
          title="Provider API Keys"
          description="Configure API keys for standard service providers"
          icon={<IoKeyOutline />}
          config={apiKeysConfig}
          fields={standardFields}
          onSave={(updates) => updateSection("apiKeys", updates)}
          saving={saving}
          error={error}
        />

        {/* Custom Keys Section */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom API Keys</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add keys for custom or third-party providers</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 rounded hover:bg-purple-100 dark:hover:bg-purple-800 text-purple-600 dark:text-purple-400"
            >
              <IoAdd size={24} />
            </motion.button>
          </div>

          <div className="p-6 space-y-4">
            {/* Add Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-dashed border-purple-300 dark:border-purple-700 rounded-lg space-y-4"
              >
                <input
                  type="text"
                  placeholder="Key name (e.g., custom_provider)"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="password"
                  placeholder="API key value"
                  value={newKey.value}
                  onChange={(e) => setNewKey({ ...newKey, value: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCustomKey}
                    disabled={!newKey.name || !newKey.value}
                    className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium disabled:opacity-50"
                  >
                    Add Key
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Custom Keys List */}
            {Object.keys(apiKeysConfig.customKeys || {}).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(apiKeysConfig.customKeys || {}).map(([keyName, _]) => (
                  <motion.div
                    key={keyName}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded"
                  >
                    <div className="flex-1">
                      <p className="font-mono text-sm">{keyName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Custom key</p>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomKey(keyName)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50 rounded"
                    >
                      <IoClose size={20} />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No custom keys added yet
              </p>
            )}
          </div>
        </motion.div>

        {/* Security Warning */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
        >
          <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">⚠️ Security Notice</h4>
          <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
            <li>• API keys are displayed as <code className="bg-red-100 dark:bg-red-900/50 px-1">***</code> in the UI</li>
            <li>• Never share your API keys in logs or with unauthorized users</li>
            <li>• Rotate keys regularly for enhanced security</li>
            <li>• Use environment variables in production</li>
          </ul>
        </motion.div>

        {/* Supported Providers */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">📚 Supported Providers</h4>
          <div className="grid grid-cols-2 gap-3 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <p className="font-medium">OpenAI</p>
              <p className="text-xs">GPT-4, GPT-3.5-turbo</p>
            </div>
            <div>
              <p className="font-medium">Anthropic</p>
              <p className="text-xs">Claude 3 models</p>
            </div>
            <div>
              <p className="font-medium">HuggingFace</p>
              <p className="text-xs">Open source models</p>
            </div>
            <div>
              <p className="font-medium">Weaviate</p>
              <p className="text-xs">Vector database</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

