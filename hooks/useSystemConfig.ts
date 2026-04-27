/**
 * useSystemConfig Hook - Load and manage system configuration
 * Loads from backend /system/config/* endpoints
 */

import { useState, useCallback, useEffect } from "react";

export interface SystemConfigSection {
  agent?: any;
  models?: any;
  weaviate?: any;
  storage?: any;
  timeouts?: any;
  logging?: any;
  apiKeys?: any;
  backend?: any;
  database?: any;
  auth?: any;
  embeddings?: any;
  agents?: any;
  vectorStore?: any;
  cache?: any;
  monitoring?: any;
  uploads?: any;
  features?: any;
}

interface UseSystemConfigState {
  config: SystemConfigSection | null;
  sections: Record<string, any>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  validationResults: Record<string, any> | null;
}

import { host } from "@/app/components/host";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || host;

export const useSystemConfig = () => {
  const [state, setState] = useState<UseSystemConfigState>({
    config: null,
    sections: {},
    loading: false,
    saving: false,
    error: null,
    validationResults: null,
  });

  // Load all configuration
  const loadConfig = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/system/config`);

      if (!response.ok) {
        throw new Error("Failed to load system configuration");
      }

      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          config: data.config,
          sections: data.config,
          loading: false,
        }));
      } else {
        throw new Error(data.error || "Failed to load configuration");
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
    }
  }, []);

  // Load specific section
  const loadSection = useCallback(async (section: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/system/config/${section}`);

      if (!response.ok) {
        throw new Error(`Failed to load ${section} configuration`);
      }

      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          sections: {
            ...prev.sections,
            [section]: data.config,
          },
          loading: false,
        }));
      } else {
        throw new Error(data.error || "Failed to load section");
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
    }
  }, []);

  // Update section
  const updateSection = useCallback(
    async (section: string, updates: Record<string, any>) => {
      setState((prev) => ({ ...prev, saving: true, error: null }));

      try {
        const response = await fetch(`${API_BASE_URL}/system/config/${section}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`Failed to update ${section}`);
        }

        const data = await response.json();

        if (data.success) {
          setState((prev) => ({
            ...prev,
            sections: {
              ...prev.sections,
              [section]: data.config,
            },
            saving: false,
          }));
          return true;
        } else {
          throw new Error(data.error || "Failed to update section");
        }
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

  // Validate configuration
  const validate = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${API_BASE_URL}/system/config/validate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to validate configuration");
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        validationResults: data.results,
        loading: false,
      }));

      return data.success;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        loading: false,
      }));
      return false;
    }
  }, []);

  // Get schema
  const getSchema = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/system/config/schema`);

      if (!response.ok) {
        throw new Error("Failed to load schema");
      }

      const data = await response.json();
      return data.sections;
    } catch (error) {
      console.error("Failed to get schema:", error);
      return null;
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    ...state,
    loadConfig,
    loadSection,
    updateSection,
    validate,
    getSchema,
  };
};

