/**
 * useSettings Hook - Manage multi-tiered settings
 * Handles loading, updating, and validation of user/admin/owner settings
 */

import { useState, useCallback, useEffect } from "react";
import { 
  UserSettings, 
  AdminSettings, 
  OwnerSettings, 
  SettingsState 
} from "@/app/types/settings";

import { host } from "@/app/components/host";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || host;

export const useSettings = (userId: string | null, tenantId: string | null) => {
  const [state, setState] = useState<SettingsState>({
    userSettings: null,
    adminSettings: null,
    ownerSettings: null,
    loading: true,
    saving: false,
    error: null,
  });

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!userId || !tenantId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const [userRes, adminRes] = await Promise.all([
        fetch(`${API_BASE_URL}/settings/user/${userId}`),
        fetch(`${API_BASE_URL}/settings/admin/${tenantId}`),
      ]);

      if (!userRes.ok || !adminRes.ok) {
        throw new Error("Failed to load settings");
      }

      const userSettings = await userRes.json();
      const adminSettings = await adminRes.json();

      setState((prev) => ({
        ...prev,
        userSettings,
        adminSettings,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
    }
  }, [userId, tenantId]);

  // Update user settings
  const updateUserSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (!userId) return false;

      setState((prev) => ({ ...prev, saving: true, error: null }));

      try {
        const response = await fetch(`${API_BASE_URL}/settings/user/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update user settings");
        }

        const updated = await response.json();
        setState((prev) => ({
          ...prev,
          userSettings: { ...prev.userSettings, ...updated },
          saving: false,
        }));
        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          saving: false,
        }));
        return false;
      }
    },
    [userId]
  );

  // Update admin settings (admin only)
  const updateAdminSettings = useCallback(
    async (updates: Partial<AdminSettings>) => {
      if (!tenantId) return false;

      setState((prev) => ({ ...prev, saving: true, error: null }));

      try {
        const response = await fetch(
          `${API_BASE_URL}/settings/admin/${tenantId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update admin settings");
        }

        const updated = await response.json();
        setState((prev) => ({
          ...prev,
          adminSettings: { ...prev.adminSettings, ...updated },
          saving: false,
        }));
        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          saving: false,
        }));
        return false;
      }
    },
    [tenantId]
  );

  // Update owner settings (owner only)
  const updateOwnerSettings = useCallback(
    async (updates: Partial<OwnerSettings>) => {
      setState((prev) => ({ ...prev, saving: true, error: null }));

      try {
        const response = await fetch(`${API_BASE_URL}/settings/owner`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Failed to update owner settings");
        }

        const updated = await response.json();
        setState((prev) => ({
          ...prev,
          ownerSettings: { ...prev.ownerSettings, ...updated },
          saving: false,
        }));
        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          saving: false,
        }));
        return false;
      }
    },
    []
  );

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    ...state,
    loadSettings,
    updateUserSettings,
    updateAdminSettings,
    updateOwnerSettings,
  };
};

