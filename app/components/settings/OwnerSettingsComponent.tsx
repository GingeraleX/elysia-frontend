/**
 * Componente impostazioni owner
 * Configurazione infrastrutturale e globale di sistema
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdEdit, MdSave, MdClose } from "react-icons/md";
import { OwnerSettings, OwnerSettingsTab } from "@/app/types/settings";

interface OwnerSettingsProps {
  settings: OwnerSettings | null;
  onUpdate: (updates: Partial<OwnerSettings>) => Promise<boolean>;
  saving: boolean;
  isOwner: boolean;
}

interface OwnerTabItem {
  id: OwnerSettingsTab;
  label: string;
  icon: string;
}

const ownerTabs: OwnerTabItem[] = [
  { id: "system", label: "Sistema", icon: "⚙️" },
  { id: "infrastructure", label: "Infrastruttura", icon: "🏗️" },
  { id: "features", label: "Funzionalita'", icon: "✨" },
  { id: "scaling", label: "Scalabilita'", icon: "📈" },
  { id: "monitoring", label: "Monitoraggio", icon: "📊" },
];

const environmentOptions: Array<{ value: OwnerSettings["environment"]; label: string }> = [
  { value: "development", label: "Development" },
  { value: "staging", label: "Staging" },
  { value: "production", label: "Production" },
];

const updateChannelOptions: Array<{ value: OwnerSettings["updateChannel"]; label: string }> = [
  { value: "stable", label: "Stable" },
  { value: "beta", label: "Beta" },
  { value: "dev", label: "Development" },
];

const loggingOptions: Array<{ value: OwnerSettings["loggingLevel"]; label: string }> = [
  { value: "debug", label: "Debug" },
  { value: "info", label: "Info" },
  { value: "warn", label: "Warn" },
  { value: "error", label: "Error" },
];

export default function OwnerSettingsComponent({
  settings,
  onUpdate,
  saving,
  isOwner,
}: OwnerSettingsProps) {
  const [editingSystem, setEditingSystem] = useState(false);
  const [formData, setFormData] = useState<Partial<OwnerSettings>>(settings || {});
  const [activeTab, setActiveTab] = useState<OwnerSettingsTab>("system");

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-6xl">🔐</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Accesso owner richiesto
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Solo i proprietari del sistema possono accedere a queste impostazioni
        </p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Caricamento impostazioni...
      </div>
    );
  }

  const handleSave = async () => {
    const success = await onUpdate(formData);
    if (success) {
      setEditingSystem(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-4">
        {ownerTabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex-1 overflow-y-auto space-y-6"
      >
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Configurazione sistema
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Impostazioni core e versionamento
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
                {editingSystem ? <MdSave size={24} /> : <MdEdit size={24} />}
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
                <p className="text-xs text-red-600 dark:text-red-400">Nome sistema</p>
                <p className="text-lg font-semibold text-red-900 dark:text-red-200">
                  {settings.systemName}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">Versione</p>
                <p className="text-lg font-semibold text-red-900 dark:text-red-200">
                  {settings.systemVersion}
                </p>
              </div>
            </div>

            {editingSystem && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome sistema
                  </span>
                  <input
                    type="text"
                    value={formData.systemName || ""}
                    onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Versione sistema
                  </span>
                  <input
                    type="text"
                    value={formData.systemVersion || ""}
                    onChange={(e) => setFormData({ ...formData, systemVersion: e.target.value })}
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ambiente
                  </span>
                  <select
                    value={formData.environment || "production"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        environment: e.target.value as OwnerSettings["environment"],
                      })
                    }
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {environmentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Modalita manutenzione
                  </span>
                  {settings.maintenanceMode && (
                    <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                      🚧 Attiva
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
                  placeholder="Messaggio di manutenzione..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "infrastructure" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  API endpoint
                </span>
                <input
                  type="text"
                  value={formData.apiEndpoint || ""}
                  onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  WebSocket endpoint
                </span>
                <input
                  type="text"
                  value={formData.wsEndpoint || ""}
                  onChange={(e) => setFormData({ ...formData, wsEndpoint: e.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cluster Weaviate
                </span>
                <input
                  type="text"
                  value={formData.weaviateCluster || ""}
                  onChange={(e) => setFormData({ ...formData, weaviateCluster: e.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL database
                </span>
                <input
                  type="text"
                  value={formData.databaseUrl || ""}
                  onChange={(e) => setFormData({ ...formData, databaseUrl: e.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === "features" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.enableNewFeatures || false}
                  onChange={(e) =>
                    setFormData({ ...formData, enableNewFeatures: e.target.checked })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Abilita nuove funzionalita
                </span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.enableAnalytics || false}
                  onChange={(e) => setFormData({ ...formData, enableAnalytics: e.target.checked })}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Abilita analytics
                </span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Canale aggiornamenti
                </span>
                <select
                  value={formData.updateChannel || "stable"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      updateChannel: e.target.value as OwnerSettings["updateChannel"],
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {updateChannelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {activeTab === "scaling" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tenant massimi
                </span>
                <input
                  type="number"
                  value={formData.maxTenants || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTenants: parseInt(e.target.value, 10) || 0 })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Utenti globali massimi
                </span>
                <input
                  type="number"
                  value={formData.maxUsersGlobal || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsersGlobal: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rate limit globale (req/min)
                </span>
                <input
                  type="number"
                  value={formData.globalRateLimit || 1000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      globalRateLimit: parseInt(e.target.value, 10) || 1000,
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rate limit utente (req/min)
                </span>
                <input
                  type="number"
                  value={formData.userRateLimit || 100}
                  onChange={(e) =>
                    setFormData({ ...formData, userRateLimit: parseInt(e.target.value, 10) || 100 })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === "monitoring" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.monitoringEnabled || false}
                  onChange={(e) =>
                    setFormData({ ...formData, monitoringEnabled: e.target.checked })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Abilita monitoraggio
                </span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Livello logging
                </span>
                <select
                  value={formData.loggingLevel || "info"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      loggingLevel: e.target.value as OwnerSettings["loggingLevel"],
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {loggingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={formData.alertingEnabled || false}
                  onChange={(e) => setFormData({ ...formData, alertingEnabled: e.target.checked })}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Abilita alerting
                </span>
              </label>
              {formData.alertingEnabled && (
                <input
                  type="email"
                  value={formData.alertEmail || ""}
                  onChange={(e) => setFormData({ ...formData, alertEmail: e.target.value })}
                  placeholder="alert@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}
            </div>
          </div>
        )}
      </motion.div>

      {editingSystem && (
        <motion.button
          onClick={handleSave}
          disabled={saving}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Salvataggio..." : "Salva modifiche"}
        </motion.button>
      )}
    </div>
  );
}
