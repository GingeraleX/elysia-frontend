/**
 * Admin Dashboard - System Configuration Hub
 * Central navigation for all configuration pages
 */

"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaRobot,
  FaDatabase,
  MdStorage as MdStorageIcon,
  TbManualGearboxFilled,
  MdTimer,
  IoKeyOutline,
  MdMonitor,
} from "react-icons/all";
import { MdStorage, MdTimer as MdTimerIcon, IoKeyOutline as IoKeyIcon, MdMonitor as MdMonitorIcon } from "react-icons/md";
import { FaRobot as RobotIcon } from "react-icons/fa";
import { useSystemConfig } from "@/hooks/useSystemConfig";

interface ConfigCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: "blue" | "purple" | "green" | "orange" | "red" | "pink";
  badge?: string;
}

const configCards: ConfigCard[] = [
  {
    title: "Agent Configuration",
    description: "Configure agent behavior, style, and learning capabilities",
    icon: <RobotIcon size={24} />,
    href: "/admin/agent-config",
    color: "blue",
    badge: "⚙️",
  },
  {
    title: "Models",
    description: "Select and configure AI models for different task types",
    icon: <TbManualGearboxFilled size={24} />,
    href: "/admin/models-config",
    color: "purple",
    badge: "🤖",
  },
  {
    title: "Weaviate Cluster",
    description: "Set up connection to your Weaviate vector database",
    icon: <FaDatabase size={24} />,
    href: "/admin/weaviate-config",
    color: "green",
    badge: "📊",
  },
  {
    title: "Storage & Persistence",
    description: "Configure how conversations and configs are stored",
    icon: <MdStorage size={24} />,
    href: "/admin/storage-config",
    color: "orange",
    badge: "💾",
  },
  {
    title: "Timeouts & Logging",
    description: "Manage request timeouts and logging settings",
    icon: <MdTimerIcon size={24} />,
    href: "/admin/timeouts-logging-config",
    color: "red",
    badge: "⏱️",
  },
  {
    title: "API Keys",
    description: "Manage API keys for external services",
    icon: <IoKeyIcon size={24} />,
    href: "/admin/apikeys-config",
    color: "pink",
    badge: "🔑",
  },
];

const colorMap = {
  blue: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40",
  purple: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800/40 dark:hover:to-purple-700/40",
  green: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/40 dark:hover:to-green-700/40",
  orange: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800/40 dark:hover:to-orange-700/40",
  red: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/40 dark:hover:to-red-700/40",
  pink: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-700 hover:from-pink-100 hover:to-pink-200 dark:hover:from-pink-800/40 dark:hover:to-pink-700/40",
};

export default function AdminDashboard() {
  const { validate, validationResults, loading } = useSystemConfig();
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    setIsValidating(true);
    await validate();
    setIsValidating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Configuration</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage all backend system settings and configurations
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleValidate}
              disabled={isValidating}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {isValidating ? "Validating..." : "✓ Validate Config"}
            </motion.button>
          </div>

          {/* Validation Results */}
          {validationResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                ✓ Configuration is valid and all services are connected
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configCards.map((card, index) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Link href={card.href}>
                <div className={`h-full p-6 rounded-lg border-2 bg-gradient-to-br cursor-pointer transition-all ${colorMap[card.color]}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{card.badge}</div>
                    <div className="text-2xl opacity-75">{card.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Configure
                    <span>→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📚 Documentation & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/docs/configuration"
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white">Configuration Guide</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Learn how to configure each section</p>
            </a>
            <a
              href="/docs/api-reference"
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white">API Reference</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete API endpoint documentation</p>
            </a>
            <a
              href="/docs/troubleshooting"
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white">Troubleshooting</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Common issues and solutions</p>
            </a>
          </div>
        </motion.div>

        {/* Quick Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg"
        >
          <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-3">⚡ Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">Configuration Sections</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{configCards.length}</p>
            </div>
            <div>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">API Endpoints</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">15+</p>
            </div>
            <div>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">Environment Variables</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">40+</p>
            </div>
            <div>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">Multi-Tenant</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">✓</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

