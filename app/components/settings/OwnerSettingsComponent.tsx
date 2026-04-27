                  onChange={(e) =>
                    setFormData({ ...formData, maxTenants: parseInt(e.target.value) })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Global Users
                </span>
                <input
                  type="number"
                  value={formData.maxUsersGlobal || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsersGlobal: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Global Rate Limit (req/min)
                </span>
                <input
                  type="number"
                  value={formData.globalRateLimit || 1000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      globalRateLimit: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  User Rate Limit (req/min)
                </span>
                <input
                  type="number"
                  value={formData.userRateLimit || 100}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userRateLimit: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* MONITORING TAB */}
        {activeTab === "monitoring" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.monitoringEnabled || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monitoringEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Monitoring
                </span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Logging Level
                </span>
                <select
                  value={formData.loggingLevel || "info"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loggingLevel: e.target.value as any,
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                </select>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.alertingEnabled || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alertingEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Alerting
                </span>
              </label>
              {formData.alertingEnabled && (
                <input
                  type="email"
                  value={formData.alertEmail || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, alertEmail: e.target.value })
                  }
                  placeholder="alert@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Save Button */}
      {editingSystem && (
        <motion.button
          onClick={handleSave}
          disabled={saving}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      )}
    </div>
  );
}
/**
 * OwnerSettings Component - System-level SaaS configuration
 * Infrastructure, endpoints, monitoring, and global settings
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { OwnerSettings } from "@/app/types/settings";
import { MdEdit, MdSave, MdClose } from "react-icons/md";

interface OwnerSettingsProps {
  settings: OwnerSettings | null;
  onUpdate: (updates: Partial<OwnerSettings>) => Promise<boolean>;
  saving: boolean;
  isOwner: boolean;
}

export default function OwnerSettingsComponent({
  settings,
  onUpdate,
  saving,
  isOwner,
}: OwnerSettingsProps) {
  const [editingSystem, setEditingSystem] = useState(false);
  const [formData, setFormData] = useState(settings || {});
  const [activeTab, setActiveTab] = useState<
    "system" | "infrastructure" | "features" | "scaling" | "monitoring"
  >("system");

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-6xl">🔐</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Owner Access Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Only system owners can access infrastructure settings
        </p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading settings...
      </div>
    );
  }

  const handleSave = async () => {
    const success = await onUpdate(formData);
    if (success) {
      setEditingSystem(false);
    }
  };

  const tabs = [
    { id: "system", label: "System", icon: "⚙️" },
    { id: "infrastructure", label: "Infrastructure", icon: "🏗️" },
    { id: "features", label: "Features", icon: "✨" },
    { id: "scaling", label: "Scaling", icon: "📈" },
    { id: "monitoring", label: "Monitoring", icon: "📊" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-4">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-b-2 border-red-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content Sections */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex-1 overflow-y-auto space-y-6"
      >
        {/* SYSTEM TAB */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Configuration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Core system settings and versioning
                </p>
              </div>
              <button
                onClick={() => {
                  if (editingSystem) {
                    handleSave();
                  } else {
                    setEditingSystem(true);
                  }
                }}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors text-red-600 dark:text-red-400 disabled:opacity-50"
              >
                {editingSystem ? (
                  <MdSave size={24} />
                ) : (
                  <MdEdit size={24} />
                )}
              </button>
              {editingSystem && (
                <button
                  onClick={() => {
                    setEditingSystem(false);
                    setFormData(settings);
                  }}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors text-red-600 dark:text-red-400"
                >
                  <MdClose size={24} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">
                  System Name
                </p>
                <p className="text-lg font-semibold text-red-900 dark:text-red-200">
                  {settings.systemName}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">
                  Version
                </p>
                <p className="text-lg font-semibold text-red-900 dark:text-red-200">
                  {settings.systemVersion}
                </p>
              </div>
            </div>

            {editingSystem && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    System Name
                  </span>
                  <input
                    type="text"
                    value={formData.systemName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, systemName: e.target.value })
                    }
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    System Version
                  </span>
                  <input
                    type="text"
                    value={formData.systemVersion || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        systemVersion: e.target.value,
                      })
                    }
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Environment
                  </span>
                  <select
                    value={formData.environment || "production"}
                    onChange={(e) =>
                      setFormData({ ...formData, environment: e.target.value as any })
                    }
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </label>
              </div>
            )}

            {/* Maintenance Mode */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maintenance Mode
                  </span>
                  {settings.maintenanceMode && (
                    <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                      🚧 Active
                    </div>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenanceMode: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </label>
              {formData.maintenanceMode && (
                <input
                  type="text"
                  value={formData.maintenanceMessage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenanceMessage: e.target.value,
                    })
                  }
                  placeholder="Maintenance message..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}
            </div>
          </div>
        )}

        {/* INFRASTRUCTURE TAB */}
        {activeTab === "infrastructure" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  API Endpoint
                </span>
                <input
                  type="text"
                  value={formData.apiEndpoint || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, apiEndpoint: e.target.value })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  WebSocket Endpoint
                </span>
                <input
                  type="text"
                  value={formData.wsEndpoint || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, wsEndpoint: e.target.value })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weaviate Cluster
                </span>
                <input
                  type="text"
                  value={formData.weaviateCluster || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weaviateCluster: e.target.value,
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* FEATURES TAB */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.enableNewFeatures || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enableNewFeatures: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable New Features
                </span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.enableAnalytics || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enableAnalytics: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Analytics
                </span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Update Channel
                </span>
                <select
                  value={formData.updateChannel || "stable"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      updateChannel: e.target.value as any,
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="stable">Stable</option>
                  <option value="beta">Beta</option>
                  <option value="dev">Development</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* SCALING TAB */}
        {activeTab === "scaling" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Tenants
                </span>
                <input
                  type="number"
                  value={formData.maxTenants || 0}

