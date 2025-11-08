      )}
    </div>
  );
}
/**
 * AdminSettings Component - Tenant management and organization settings
 * Knowledge distribution, permissions, billing, and compliance
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AdminSettings } from "@/app/types/settings";
import { MdEdit, MdSave, MdClose } from "react-icons/md";

interface AdminSettingsProps {
  settings: AdminSettings | null;
  onUpdate: (updates: Partial<AdminSettings>) => Promise<boolean>;
  saving: boolean;
  isAdmin: boolean;
}

export default function AdminSettingsComponent({
  settings,
  onUpdate,
  saving,
  isAdmin,
}: AdminSettingsProps) {
  const [editingGeneral, setEditingGeneral] = useState(false);
  const [formData, setFormData] = useState(settings || {});
  const [activeTab, setActiveTab] = useState<
    "general" | "knowledge" | "permissions" | "billing" | "security" | "compliance"
  >("general");

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-6xl">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Admin Access Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You need admin permissions to view tenant settings
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
      setEditingGeneral(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: "🏢" },
    { id: "knowledge", label: "Knowledge", icon: "📚" },
    { id: "permissions", label: "Permissions", icon: "🔐" },
    { id: "billing", label: "Billing", icon: "💳" },
    { id: "security", label: "Security", icon: "🛡️" },
    { id: "compliance", label: "Compliance", icon: "✅" },
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
                ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600"
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
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingGeneral ? "Edit Tenant Info" : settings.tenantName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your organization details
                </p>
              </div>
              <button
                onClick={() => {
                  if (editingGeneral) {
                    handleSave();
                  } else {
                    setEditingGeneral(true);
                  }
                }}
                disabled={saving}
                className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors text-purple-600 dark:text-purple-400 disabled:opacity-50"
              >
                {editingGeneral ? (
                  <MdSave size={24} />
                ) : (
                  <MdEdit size={24} />
                )}
              </button>
              {editingGeneral && (
                <button
                  onClick={() => {
                    setEditingGeneral(false);
                    setFormData(settings);
                  }}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors text-red-600 dark:text-red-400"
                >
                  <MdClose size={24} />
                </button>
              )}
            </div>

            {editingGeneral && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tenant Name
                  </span>
                  <input
                    type="text"
                    value={formData.tenantName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, tenantName: e.target.value })
                    }
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tenant Logo URL
                  </span>
                  <input
                    type="text"
                    value={formData.tenantLogo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, tenantLogo: e.target.value })
                    }
                    className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </label>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Max Users
                </p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-200">
                  {settings.maxUsersPerTenant}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Knowledge Base Size
                </p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-200">
                  {settings.maxKnowledgeBaseSize}GB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KNOWLEDGE TAB */}
        {activeTab === "knowledge" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Knowledge Base Size (GB)
                </span>
                <input
                  type="number"
                  value={formData.maxKnowledgeBaseSize || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxKnowledgeBaseSize: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Collections Per User
                </span>
                <input
                  type="number"
                  value={formData.maxCollectionsPerUser || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxCollectionsPerUser: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* PERMISSIONS TAB */}
        {activeTab === "permissions" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.allowExternalDataSources || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowExternalDataSources: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow External Data Sources
                </span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.allowCustomIntegrations || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowCustomIntegrations: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Custom Integrations
                </span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.allowPublicCollections || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowPublicCollections: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Public Collections
                </span>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.requireTwoFactor || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requireTwoFactor: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Require Two-Factor Authentication
                </span>
              </label>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly Token Limit
                </span>
                <input
                  type="number"
                  value={formData.monthlyTokenLimit || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyTokenLimit: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Storage Quota (GB)
                </span>
                <input
                  type="number"
                  value={formData.storageQuota || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      storageQuota: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  API Calls Limit
                </span>
                <input
                  type="number"
                  value={formData.apiCallsLimit || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apiCallsLimit: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Session Timeout (minutes)
                </span>
                <input
                  type="number"
                  value={formData.sessionTimeout || 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sessionTimeout: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password Policy
                </span>
              </label>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Minimum Length
                  </span>
                  <input
                    type="number"
                    value={formData.passwordPolicy?.minLength || 8}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passwordPolicy: {
                          ...formData.passwordPolicy,
                          minLength: parseInt(e.target.value),
                        },
                      })
                    }
                    className="mt-1 w-full px-3 py-1 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.passwordPolicy?.requireUppercase || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passwordPolicy: {
                          ...formData.passwordPolicy,
                          requireUppercase: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Require Uppercase
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.passwordPolicy?.requireNumbers || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passwordPolicy: {
                          ...formData.passwordPolicy,
                          requireNumbers: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Require Numbers
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.passwordPolicy?.requireSpecialChars || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passwordPolicy: {
                          ...formData.passwordPolicy,
                          requireSpecialChars: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Require Special Characters
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* COMPLIANCE TAB */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.auditLogging || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      auditLogging: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Audit Logging
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Log all tenant activities for compliance
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data Retention (days)
                </span>
                <input
                  type="number"
                  value={formData.retentionDays || 90}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      retentionDays: parseInt(e.target.value),
                    })
                  }
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.gdprCompliant || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gdprCompliant: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  GDPR Compliant
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enforce GDPR compliance requirements
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Save Button */}
      {editingGeneral && (
        <motion.button
          onClick={handleSave}
          disabled={saving}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>

