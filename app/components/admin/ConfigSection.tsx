/**
 * ConfigSection Component - Reusable configuration section UI
 * Displays configuration fields with validation and save/cancel
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdEdit, MdSave, MdClose, MdCheckCircle, MdError } from "react-icons/md";

interface ConfigSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  config: Record<string, any>;
  fields: ConfigField[];
  onSave: (updates: Record<string, any>) => Promise<boolean>;
  saving: boolean;
  error?: string | null;
}

export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "textarea" | "password";
  description?: string;
  placeholder?: string;
  options?: { label: string; value: any }[];
  required?: boolean;
  masked?: boolean; // Hide value in UI (for sensitive data)
}

export default function ConfigSection({
  title,
  description,
  icon,
  config,
  fields,
  onSave,
  saving,
  error,
}: ConfigSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(config);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setLocalError(null);
      const updates: Record<string, any> = {};

      // Only include fields that have changed
      fields.forEach((field) => {
        if (formData[field.name] !== config[field.name]) {
          updates[field.name] = formData[field.name];
        }
      });

      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        return;
      }

      const success = await onSave(updates);
      if (success) {
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to save");
    }
  };

  const handleCancel = () => {
    setFormData(config);
    setIsEditing(false);
    setLocalError(null);
  };

  const renderField = (field: ConfigField) => {
    const value = formData[field.name];

    if (!isEditing) {
      // Display mode
      return (
        <div key={field.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</p>
            {field.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>
            )}
          </div>
          <div className="text-right">
            {field.type === "boolean" ? (
              <div className={`px-3 py-1 rounded text-sm font-medium ${
                value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {value ? "Enabled" : "Disabled"}
              </div>
            ) : field.masked && value ? (
              <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">***</code>
            ) : (
              <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs truncate max-w-xs">
                {typeof value === "object" ? JSON.stringify(value).slice(0, 50) : String(value)}
              </code>
            )}
          </div>
        </div>
      );
    }

    // Edit mode
    switch (field.type) {
      case "boolean":
        return (
          <div key={field.name} className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.checked })
                }
                className="w-5 h-5 rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </p>
                {field.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {field.description}
                  </p>
                )}
              </div>
            </label>
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </span>
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {field.description}
                </p>
              )}
              <select
                value={value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.value })
                }
                className="mt-2 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an option</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </span>
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {field.description}
                </p>
              )}
              <textarea
                value={value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.value })
                }
                placeholder={field.placeholder}
                className="mt-2 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
              />
            </label>
          </div>
        );

      case "password":
        return (
          <div key={field.name} className="mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </span>
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {field.description}
                </p>
              )}
              <input
                type="password"
                value={value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.value })
                }
                placeholder={field.placeholder}
                className="mt-2 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        );

      case "number":
        return (
          <div key={field.name} className="mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </span>
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {field.description}
                </p>
              )}
              <input
                type="number"
                value={value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: parseInt(e.target.value) })
                }
                placeholder={field.placeholder}
                className="mt-2 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        );

      case "text":
      default:
        return (
          <div key={field.name} className="mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </span>
              {field.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {field.description}
                </p>
              )}
              <input
                type="text"
                value={value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.value })
                }
                placeholder={field.placeholder}
                className="mt-2 w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-3">
          {icon && <div className="w-8 h-8 text-blue-600 dark:text-blue-400">{icon}</div>}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {success && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-600 dark:text-green-400"
            >
              <MdCheckCircle size={24} />
            </motion.div>
          )}
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400 disabled:opacity-50"
              >
                <MdSave size={20} />
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400"
              >
                <MdClose size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400"
            >
              <MdEdit size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {(localError || error) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-start gap-3"
        >
          <MdError className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
          <p className="text-sm text-red-800 dark:text-red-200">{localError || error}</p>
        </motion.div>
      )}

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">{fields.map((field) => renderField(field))}</div>
        ) : (
          <div className="space-y-2">{fields.map((field) => renderField(field))}</div>
        )}
      </div>
    </motion.div>
  );
}

