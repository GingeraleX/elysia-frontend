/**
 * Componente impostazioni utente
 * Profilo, preferenze, notifiche, privacy e accessibilita'
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdEdit, MdSave, MdClose } from "react-icons/md";
import { UserSettings, UserSettingsTab } from "@/app/types/settings";

interface UserSettingsProps {
  settings: UserSettings | null;
  onUpdate: (updates: Partial<UserSettings>) => Promise<boolean>;
  saving: boolean;
}

interface UserTabItem {
  id: UserSettingsTab;
  label: string;
  icon: string;
}

const userTabs: UserTabItem[] = [
  { id: "profile", label: "Profilo", icon: "👤" },
  { id: "preferences", label: "Preferenze", icon: "⚙️" },
  { id: "notifications", label: "Notifiche", icon: "🔔" },
  { id: "privacy", label: "Privacy", icon: "🔒" },
  { id: "accessibility", label: "Accessibilita'", icon: "♿" },
];

const themeOptions: Array<{ value: UserSettings["theme"]; label: string; icon: string }> = [
  { value: "light", label: "Chiaro", icon: "☀️" },
  { value: "dark", label: "Scuro", icon: "🌙" },
  { value: "auto", label: "Automatico", icon: "🔄" },
];

const digestOptions: Array<{ value: UserSettings["digestFrequency"]; label: string }> = [
  { value: "none", label: "Mai" },
  { value: "daily", label: "Ogni giorno" },
  { value: "weekly", label: "Ogni settimana" },
  { value: "monthly", label: "Ogni mese" },
];

const privacyOptions: Array<{ value: UserSettings["dataPrivacy"]; label: string }> = [
  { value: "strict", label: "Rigido" },
  { value: "normal", label: "Normale" },
  { value: "loose", label: "Permissivo" },
];

const fontSizeOptions: Array<{ value: UserSettings["fontSize"]; label: string }> = [
  { value: "small", label: "Piccolo" },
  { value: "normal", label: "Normale" },
  { value: "large", label: "Grande" },
];

export default function UserSettingsComponent({ settings, onUpdate, saving }: UserSettingsProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState<Partial<UserSettings>>(settings || {});
  const [activeTab, setActiveTab] = useState<UserSettingsTab>("profile");

  const handleSave = async () => {
    const success = await onUpdate(formData);
    if (success) {
      setEditingProfile(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Caricamento impostazioni...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full p-6">
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-4">
        {userTabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex-1 overflow-y-auto"
      >
        {activeTab === "profile" && (
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={
                      settings.avatar ||
                      `https://ui-avatars.com/api/?name=${settings.firstName}+${settings.lastName}`
                    }
                    alt="Profilo"
                    className="w-16 h-16 rounded-full border-2 border-blue-200 dark:border-blue-700"
                  />
                  {editingProfile && (
                    <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      📷
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  {editingProfile ? (
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={formData.firstName || ""}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Nome"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={formData.lastName || ""}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Cognome"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={formData.bio || ""}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Bio (opzionale)"
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {settings.firstName} {settings.lastName}
                      </h3>
                      {settings.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{settings.bio}</p>
                      )}
                    </div>
                  )}
                </div>

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
                  {editingProfile ? <MdSave size={24} /> : <MdEdit size={24} />}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Account creato</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(settings.createdAt).toLocaleDateString("it-IT")}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Ultimo aggiornamento</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(settings.updatedAt).toLocaleDateString("it-IT")}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lingua</span>
                <select
                  value={formData.language || "en"}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value as UserSettings["language"] })
                  }
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Espanol</option>
                  <option value="fr">Francais</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">Nihongo</option>
                  <option value="zh">Zhongwen</option>
                </select>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
                <div className="mt-2 flex gap-3">
                  {themeOptions.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setFormData({ ...formData, theme: theme.value })}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        formData.theme === theme.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {theme.icon} {theme.label}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fuso orario</span>
                <input
                  type="text"
                  value={formData.timezone || "UTC"}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  placeholder="UTC"
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications || false}
                    onChange={(e) =>
                      setFormData({ ...formData, emailNotifications: e.target.checked })
                    }
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notifiche email
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ricevi aggiornamenti su account e attivita via email
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.pushNotifications || false}
                    onChange={(e) =>
                      setFormData({ ...formData, pushNotifications: e.target.checked })
                    }
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notifiche push
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ricevi notifiche push in tempo reale sul dispositivo
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Frequenza riepilogo
                </span>
                <select
                  value={formData.digestFrequency || "weekly"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      digestFrequency: e.target.value as UserSettings["digestFrequency"],
                    })
                  }
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {digestOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Livello privacy dati
                </span>
                <div className="mt-3 space-y-2">
                  {privacyOptions.map((level) => (
                    <label key={level.value} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="dataPrivacy"
                        value={level.value}
                        checked={formData.dataPrivacy === level.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dataPrivacy: e.target.value as UserSettings["dataPrivacy"],
                          })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">{level.label}</span>
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
                  onChange={(e) => setFormData({ ...formData, shareAnalytics: e.target.checked })}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Condividi dati analitici
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Aiutaci a migliorare condividendo dati di utilizzo anonimi
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {activeTab === "accessibility" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.reducedMotion || false}
                  onChange={(e) => setFormData({ ...formData, reducedMotion: e.target.checked })}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Riduci animazioni
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Minimizza animazioni e transizioni
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.highContrast || false}
                  onChange={(e) => setFormData({ ...formData, highContrast: e.target.checked })}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contrasto elevato
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Aumenta il contrasto dei colori per una visibilita migliore
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dimensione testo
                </span>
                <div className="mt-3 space-y-2">
                  {fontSizeOptions.map((size) => (
                    <label key={size.value} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="fontSize"
                        value={size.value}
                        checked={formData.fontSize === size.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fontSize: e.target.value as UserSettings["fontSize"],
                          })
                        }
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">{size.label}</span>
                    </label>
                  ))}
                </div>
              </label>
            </div>
          </div>
        )}
      </motion.div>

      {editingProfile && (
        <motion.button
          onClick={handleSave}
          disabled={saving}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Salvataggio..." : "Salva modifiche"}
        </motion.button>
      )}
    </div>
  );
}
