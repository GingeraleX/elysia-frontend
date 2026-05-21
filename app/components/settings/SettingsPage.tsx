/**
 * Pagina Impostazioni unificata - sistema multi-livello
 * Utente | Admin | Owner
 */

"use client";

import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { MdSettings, MdPerson, MdBusiness, MdCode } from "react-icons/md";
import { SessionContext } from "../contexts/SessionContext";
import { useSettings } from "./hooks/useSettings";
import UserSettingsComponent from "./UserSettingsComponent";
import AdminSettingsComponent from "./AdminSettingsComponent";
import OwnerSettingsComponent from "./OwnerSettingsComponent";

type SettingsCategory = "user" | "admin" | "owner";

interface CategoryItem {
  id: SettingsCategory;
  label: string;
  description: string;
  available: boolean;
  icon: IconType;
}

export default function SettingsPage() {
  const { id: userId, tenantId, userRole } = useContext(SessionContext);
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("user");

  const isAdmin = userRole === "ADMIN" || userRole === "OWNER";
  const isOwner = userRole === "OWNER";

  const {
    userSettings,
    adminSettings,
    ownerSettings,
    loading,
    saving,
    error,
    updateUserSettings,
    updateAdminSettings,
    updateOwnerSettings,
  } = useSettings(userId || null, tenantId || null);

  const categories: CategoryItem[] = [
    {
      id: "user",
      label: "Impostazioni utente",
      icon: MdPerson,
      description: "Preferenze personali",
      available: true,
    },
    {
      id: "admin",
      label: "Impostazioni admin",
      icon: MdBusiness,
      description: "Gestione tenant",
      available: isAdmin,
    },
    {
      id: "owner",
      label: "Impostazioni owner",
      icon: MdCode,
      description: "Infrastruttura di sistema",
      available: isOwner,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <MdSettings className="w-8 h-8 text-gray-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Impostazioni</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestisci preferenze e configurazione
          </p>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 gap-2 overflow-y-auto"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                disabled={!category.available}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-left ${
                  activeCategory === category.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                } ${!category.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                whileHover={category.available ? { x: 4 } : {}}
                whileTap={category.available ? { scale: 0.98 } : {}}
              >
                <Icon
                  className={`w-5 h-5 ${
                    activeCategory === category.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      activeCategory === category.id
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {category.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
                </div>
                {!category.available && (
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-600">🔒</span>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="md:hidden px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as SettingsCategory)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id} disabled={!category.available}>
                {category.label} {!category.available ? "(Bloccato)" : ""}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900"
        >
          {activeCategory === "user" && (
            <UserSettingsComponent
              settings={userSettings}
              onUpdate={updateUserSettings}
              saving={saving}
            />
          )}

          {activeCategory === "admin" && (
            <AdminSettingsComponent
              settings={adminSettings}
              onUpdate={updateAdminSettings}
              saving={saving}
              isAdmin={isAdmin}
            />
          )}

          {activeCategory === "owner" && (
            <OwnerSettingsComponent
              settings={ownerSettings}
              onUpdate={updateOwnerSettings}
              saving={saving}
              isOwner={isOwner}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
