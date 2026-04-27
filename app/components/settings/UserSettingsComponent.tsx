/**
 * UserSettings Component - Personal preferences and profile
 * Sleek, minimal design with profile card, preferences, and accessibility options
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserSettings } from "@/app/types/settings";
import { MdEdit, MdSave, MdClose } from "react-icons/md";

interface UserSettingsProps {
  settings: UserSettings | null;
  onUpdate: (updates: Partial<UserSettings>) => Promise<boolean>;
  saving: boolean;
}

export default function UserSettingsComponent({
  settings,
  onUpdate,
  saving,
}: UserSettingsProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState(settings || {});
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "notifications" | "privacy" | "accessibility"
  >("profile");

  const handleSave = async () => {
    const success = await onUpdate(formData);
    if (success) {
      setEditingProfile(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Loading settings...
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "accessibility", label: "Accessibility", icon: "♿" },
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
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
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
        className="flex-1 overflow-y-auto"
      >
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={
                      settings.avatar ||
                      `https://ui-avatars.com/api/?name=${settings.firstName}+${settings.lastName}`
                    }
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-blue-200 dark:border-blue-700"
                  />
                  {editingProfile && (
                    <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      📷
                    </button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  {editingProfile ? (
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={formData.firstName || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        placeholder="First Name"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={formData.lastName || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Last Name"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={formData.bio || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Bio (optional)"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {settings.firstName} {settings.lastName}
                      </h3>
                      {settings.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {settings.bio}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit/Save Button */}
                <button
                  onClick={() => {
                    if (editingProfile) {
                      handleSave();
                    } else {
                      setEditingProfile(true);
                    }
                  }}
                  disabled={saving}
                  className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors text-blue-600 dark:text-blue-400 disabled:opacity-50"
                >
                  {editingProfile ? (
                    <MdSave size={24} />
                  ) : (
                    <MdEdit size={24} />
                  )}
                </button>

                {editingProfile && (
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      setFormData(settings);
                    }}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors text-red-600 dark:text-red-400"
                  >
                    <MdClose size={24} />
                  </button>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Account Created
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(settings.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last Updated
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(settings.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Language
                </span>
                <select
                  value={formData.language || "en"}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value as any })
                  }
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </span>
                <div className="mt-2 flex gap-3">
                  {["light", "dark", "auto"].map((theme) => (
                    <button
                      key={theme}
                      onClick={() =>
                        setFormData({ ...formData, theme: theme as any })
                      }
                      className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                        formData.theme === theme
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {theme === "light" && "☀️"}
                      {theme === "dark" && "🌙"}
                      {theme === "auto" && "🔄"}
                      {" " + theme}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Timezone
                </span>
                <input
                  type="text"
                  value={formData.timezone || "UTC"}
                  onChange={(e) =>
                    setFormData({ ...formData, timezone: e.target.value })
                  }
                  placeholder="UTC"
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Notifications
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive updates about your account and activity via email
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.pushNotifications || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pushNotifications: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Push Notifications
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive real-time push notifications on your device
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Digest Frequency
                </span>
                <select
                  value={formData.digestFrequency || "weekly"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      digestFrequency: e.target.value as any,
                    })
                  }
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* PRIVACY TAB */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data Privacy Level
                </span>
                <div className="mt-3 space-y-2">
                  {["strict", "normal", "loose"].map((level) => (
                    <label key={level} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="dataPrivacy"
                        value={level}
                        checked={formData.dataPrivacy === level}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dataPrivacy: e.target.value as any,
                          })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.shareAnalytics || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shareAnalytics: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Share Analytics
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Help us improve by sharing anonymous usage data
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ACCESSIBILITY TAB */}
        {activeTab === "accessibility" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.reducedMotion || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reducedMotion: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reduce Motion
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Minimize animations and transitions
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.highContrast || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      highContrast: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  High Contrast
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Increase color contrast for better visibility
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Size
                </span>
                <div className="mt-3 space-y-2">
                  {["small", "normal", "large"].map((size) => (
                    <label key={size} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="fontSize"
                        value={size}
                        checked={formData.fontSize === size}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fontSize: e.target.value as any,
                          })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm capitalize">{size}</span>
                    </label>
                  ))}
                </div>
              </label>
            </div>
          </div>
        )}
      </motion.div>

      {/* Save Button */}
      {editingProfile && (
        <motion.button
          onClick={handleSave}
          disabled={saving}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      )}
    </div>
  );
}

