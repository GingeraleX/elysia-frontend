/**
 * Agent Configuration Page
 * Manages agent behavior, style, and feedback settings
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";
import ConfigSection, { ConfigField } from "@/app/components/admin/ConfigSection";
import { useSystemConfig } from "@/hooks/useSystemConfig";

export default function AgentConfigPage() {
  const { sections, updateSection, saving, error, loading } = useSystemConfig();

  const agentConfig = sections.agent || {};

  const fields: ConfigField[] = [
    {
      name: "description",
      label: "Agent Description",
      type: "textarea",
      description: "System prompt and general behavior instructions for the agent",
      placeholder: "You are a helpful AI assistant...",
    },
    {
      name: "endGoal",
      label: "End Goal",
      type: "textarea",
      description: "The primary objective or end goal for the agent",
      placeholder: "Provide accurate information and insights...",
    },
    {
      name: "style",
      label: "Communication Style",
      type: "select",
      description: "How the agent should communicate",
      options: [
        { label: "Professional", value: "professional" },
        { label: "Casual", value: "casual" },
        { label: "Technical", value: "technical" },
        { label: "Conversational", value: "conversational" },
        { label: "Formal", value: "formal" },
      ],
    },
    {
      name: "improveOverTime",
      label: "Improve Over Time",
      type: "boolean",
      description: "Allow agent to learn and improve from feedback",
    },
    {
      name: "useFeedback",
      label: "Use Feedback",
      type: "boolean",
      description: "Enable feedback mechanism for model improvement",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <FaRobot size={32} />
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
            <FaRobot className="text-blue-600" />
            Agent Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure agent behavior, communication style, and learning capabilities
          </p>
        </div>

        <ConfigSection
          title="Agent Behavior"
          description="Configure how your agent behaves and communicates"
          icon={<FaRobot />}
          config={agentConfig}
          fields={fields}
          onSave={(updates) => updateSection("agent", updates)}
          saving={saving}
          error={error}
        />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -4 }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Tips</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Keep descriptions concise but informative</li>
              <li>• Style affects how responses are formatted</li>
              <li>• Feedback helps improve accuracy over time</li>
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
          >
            <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">🎯 Current Settings</h4>
            <div className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
              <p>Style: <span className="font-mono">{agentConfig.style || "Not set"}</span></p>
              <p>Learning: <span className="font-mono">{agentConfig.improveOverTime ? "Enabled" : "Disabled"}</span></p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

