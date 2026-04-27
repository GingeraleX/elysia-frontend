/**
 * Timeouts & Logging Configuration Page
 * Manage request timeouts and logging settings
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { MdTimer, MdTextsms } from "react-icons/md";
import ConfigSection, { ConfigField } from "@/app/components/admin/ConfigSection";
import { useSystemConfig } from "@/hooks/useSystemConfig";

export default function TimeoutsLoggingConfigPage() {
  const { sections, updateSection, saving, error, loading } = useSystemConfig();

  const timeoutsConfig = sections.timeouts || {};
  const loggingConfig = sections.logging || {};

  const timeoutFields: ConfigField[] = [
    {
      name: "treeTimeout",
      label: "Tree/Conversation Timeout",
      type: "number",
      description: "Maximum time for conversation tree operations (milliseconds)",
      placeholder: "30000",
    },
    {
      name: "clientTimeout",
      label: "Client Request Timeout",
      type: "number",
      description: "Maximum time for client-side requests (milliseconds)",
      placeholder: "30000",
    },
    {
      name: "apiTimeout",
      label: "API Call Timeout",
      type: "number",
      description: "Maximum time for external API calls (milliseconds)",
      placeholder: "30000",
    },
  ];

  const loggingFields: ConfigField[] = [
    {
      name: "level",
      label: "Logging Level",
      type: "select",
      description: "Verbosity of application logging",
      options: [
        { label: "Debug (Most Verbose)", value: "debug" },
        { label: "Info (Standard)", value: "info" },
        { label: "Warn (Warnings Only)", value: "warn" },
        { label: "Error (Errors Only)", value: "error" },
      ],
    },
    {
      name: "enableDetailedLogging",
      label: "Enable Detailed Logging",
      type: "boolean",
      description: "Include additional context and stack traces in logs",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <MdTimer size={32} />
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
            <MdTimer className="text-orange-600" />
            Timeouts & Logging
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure request timeouts and logging behavior
          </p>
        </div>

        {/* Timeouts Section */}
        <ConfigSection
          title="Request Timeouts"
          description="Set timeout limits for different operation types"
          icon={<MdTimer />}
          config={timeoutsConfig}
          fields={timeoutFields}
          onSave={(updates) => updateSection("timeouts", updates)}
          saving={saving}
          error={error}
        />

        {/* Logging Section */}
        <ConfigSection
          title="Logging Configuration"
          description="Control application logging verbosity and detail level"
          icon={<MdTextsms />}
          config={loggingConfig}
          fields={loggingFields}
          onSave={(updates) => updateSection("logging", updates)}
          saving={saving}
          error={error}
        />

        {/* Timeout Info Cards */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">⏱️ Timeout Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ y: -4 }}
              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Tree Operations</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {timeoutsConfig.treeTimeout || "30000"}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">ms</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <p className="text-sm font-medium text-green-900 dark:text-green-200">Client Requests</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                {timeoutsConfig.clientTimeout || "30000"}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">ms</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
            >
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200">API Calls</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {timeoutsConfig.apiTimeout || "30000"}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">ms</p>
            </motion.div>
          </div>
        </div>

        {/* Logging Info Cards */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📝 Logging Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -4 }}
              className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
            >
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">Level</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  loggingConfig.level === "debug" ? "bg-purple-100 text-purple-800" :
                  loggingConfig.level === "info" ? "bg-blue-100 text-blue-800" :
                  loggingConfig.level === "warn" ? "bg-amber-100 text-amber-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {(loggingConfig.level || "info").toUpperCase()}
                </span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
            >
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">Detailed Logging</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  loggingConfig.enableDetailedLogging ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {loggingConfig.enableDetailedLogging ? "Enabled" : "Disabled"}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tips */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
        >
          <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">💡 Tips</h4>
          <ul className="text-sm text-indigo-800 dark:text-indigo-300 space-y-2">
            <li>• <span className="font-medium">Timeout values</span> are in milliseconds (1000ms = 1s)</li>
            <li>• <span className="font-medium">Debug level</span> is useful for development but impacts performance</li>
            <li>• <span className="font-medium">Detailed logging</span> includes stack traces for troubleshooting</li>
            <li>• Increase timeouts if you have slow networks or API calls</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}

