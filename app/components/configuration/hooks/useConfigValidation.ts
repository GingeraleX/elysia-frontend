import { useMemo } from "react";
import {
  BackendConfig,
  FrontendConfig,
  ModelProvider,
} from "@/app/types/objects";

/**
 * Custom hook for validating configuration settings
 * Handles validation for Weaviate cluster, models, API keys, and storage settings
 */
export function useConfigValidation(
  currentUserConfig: BackendConfig | null,
  currentFrontendConfig: FrontendConfig | null,
  modelsData: { [key: string]: ModelProvider } | null
) {
  // Dynamic validation based on current config values
  const currentValidation = useMemo(() => {
    if (!currentUserConfig || !currentUserConfig.settings) {
      return {
        wcd_url: false,
        wcd_api_key: false,
        base_provider: false,
        base_model: false,
        complex_provider: false,
        complex_model: false,
        custom_weaviate_http_host: false,
        custom_weaviate_grpc_host: false,
        custom_storage_http_host: false,
        custom_storage_grpc_host: false,
      };
    }

    const s = currentUserConfig.settings;
    const mode = (s.PROCESSING_MODE as string) || "cloud";
    const isCloud = mode === "cloud";

    const isWeaviateLocal  = s.WEAVIATE_IS_LOCAL  as boolean;
    const isWeaviateCustom = s.WEAVIATE_IS_CUSTOM as boolean;
    const isStorageCustom  = currentFrontendConfig?.save_location_weaviate_is_custom as boolean;

    // Validate the active mode's provider/model fields
    const baseProvider    = isCloud ? s.CLOUD_BASE_PROVIDER    : s.LOCAL_BASE_PROVIDER;
    const baseModel       = isCloud ? s.CLOUD_BASE_MODEL        : s.LOCAL_BASE_MODEL;
    const complexProvider = isCloud ? s.CLOUD_COMPLEX_PROVIDER  : s.LOCAL_COMPLEX_PROVIDER;
    const complexModel    = isCloud ? s.CLOUD_COMPLEX_MODEL     : s.LOCAL_COMPLEX_MODEL;

    return {
      wcd_url: isWeaviateCustom
        ? true
        : Boolean(s.WCD_URL?.trim()),
      wcd_api_key: isWeaviateLocal || isWeaviateCustom
        ? true
        : Boolean(s.WCD_API_KEY?.trim()),
      base_provider:    Boolean((baseProvider    as string)?.trim()),
      base_model:       Boolean((baseModel       as string)?.trim()),
      complex_provider: Boolean((complexProvider as string)?.trim()),
      complex_model:    Boolean((complexModel    as string)?.trim()),
      custom_weaviate_http_host: isWeaviateCustom
        ? Boolean(s.CUSTOM_HTTP_HOST?.trim())
        : true,
      custom_weaviate_grpc_host: isWeaviateCustom
        ? Boolean(s.CUSTOM_GRPC_HOST?.trim())
        : true,
      custom_storage_http_host: isStorageCustom
        ? Boolean(currentFrontendConfig?.save_location_custom_http_host?.trim())
        : true,
      custom_storage_grpc_host: isStorageCustom
        ? Boolean(currentFrontendConfig?.save_location_custom_grpc_host?.trim())
        : true,
    };
  }, [currentUserConfig, currentFrontendConfig]);

  const getMissingApiKeys = useMemo(() => {
    if (!currentUserConfig || !currentUserConfig.settings || !modelsData) return [];

    const s = currentUserConfig.settings;
    const isCloud = ((s.PROCESSING_MODE as string) || "cloud") === "cloud";

    const baseProvider    = (isCloud ? s.CLOUD_BASE_PROVIDER    : s.LOCAL_BASE_PROVIDER)    as string;
    const baseModel       = (isCloud ? s.CLOUD_BASE_MODEL        : s.LOCAL_BASE_MODEL)        as string;
    const complexProvider = (isCloud ? s.CLOUD_COMPLEX_PROVIDER  : s.LOCAL_COMPLEX_PROVIDER)  as string;
    const complexModel    = (isCloud ? s.CLOUD_COMPLEX_MODEL     : s.LOCAL_COMPLEX_MODEL)     as string;

    const missingKeys: string[] = [];
    const availableKeysLower = Object.keys(s.API_KEYS || {}).map((k) => k.toLowerCase());

    const checkKeys = (provider: string, model: string) => {
      if (!provider || !model) return;
      const pData = modelsData?.[provider];
      if (!pData) return;
      const requiredKeys = pData[model]?.api_keys;
      if (!requiredKeys || !Array.isArray(requiredKeys)) return;
      requiredKeys.forEach((key) => {
        if (!availableKeysLower.includes(key.toLowerCase()) && !missingKeys.includes(key)) {
          missingKeys.push(key);
        }
      });
    };

    checkKeys(baseProvider, baseModel);
    checkKeys(complexProvider, complexModel);

    return missingKeys;
  }, [currentUserConfig, modelsData]);

  // Helper function to get storage validation issues
  const getStorageIssues = useMemo(() => {
    const issues: string[] = [];
    const needsStorageValidation =
      currentFrontendConfig?.save_configs_to_weaviate ||
      currentFrontendConfig?.save_trees_to_weaviate;

    if (needsStorageValidation) {
      const isStorageLocal =
        currentFrontendConfig?.save_location_weaviate_is_local;
      const isStorageCustom =
        currentFrontendConfig?.save_location_weaviate_is_custom;

      if (
        !isStorageCustom &&
        !currentFrontendConfig?.save_location_wcd_url?.trim()
      ) {
        issues.push("Storage URL required when saving is enabled");
      }
      if (
        !isStorageLocal &&
        !isStorageCustom &&
        !currentFrontendConfig?.save_location_wcd_api_key?.trim()
      ) {
        issues.push("Storage API Key required when saving is enabled");
      }
      if (
        isStorageCustom &&
        !currentFrontendConfig?.save_location_custom_http_host?.trim()
      ) {
        issues.push("Storage HTTP Host required when saving is enabled");
      }
      if (
        isStorageCustom &&
        !currentFrontendConfig?.save_location_custom_grpc_host?.trim()
      ) {
        issues.push("Storage GRPC Host required when saving is enabled");
      }
    }
    return issues;
  }, [currentFrontendConfig]);

  // Overall config validation status
  const isConfigValid = useMemo(() => {
    return (
      currentValidation.wcd_url &&
      currentValidation.wcd_api_key &&
      currentValidation.base_provider &&
      currentValidation.base_model &&
      currentValidation.complex_provider &&
      currentValidation.complex_model &&
      getMissingApiKeys.length === 0 &&
      getStorageIssues.length === 0
    );
  }, [currentValidation, getMissingApiKeys, getStorageIssues]);

  // Helper functions to get warning issues for each section
  const getWeaviateIssues = () => {
    const issues: string[] = [];
    const isWeaviateLocal = currentUserConfig?.settings
      ?.WEAVIATE_IS_LOCAL as boolean;
    const isWeaviateCustom = currentUserConfig?.settings
      ?.WEAVIATE_IS_CUSTOM as boolean;

    if (!isWeaviateCustom && !currentValidation.wcd_url)
      issues.push("Weaviate Cluster URL");
    if (
      !isWeaviateLocal &&
      !isWeaviateCustom &&
      !Boolean(currentUserConfig?.settings?.WCD_API_KEY?.trim())
    ) {
      issues.push("Weaviate API Key");
    }
    if (isWeaviateCustom && !currentValidation.custom_weaviate_http_host)
      issues.push("Custom Weaviate HTTP Host");
    if (isWeaviateCustom && !currentValidation.custom_weaviate_grpc_host)
      issues.push("Custom Weaviate GRPC Host");
    return issues;
  };

  const getModelsIssues = () => {
    const issues: string[] = [];
    if (!currentValidation.base_provider) issues.push("Base Provider");
    if (!currentValidation.base_model) issues.push("Base Model");
    if (!currentValidation.complex_provider) issues.push("Complex Provider");
    if (!currentValidation.complex_model) issues.push("Complex Model");
    return issues;
  };

  const getApiKeysIssues = () => {
    const issues: string[] = [];
    // Add missing API keys to issues
    const missingKeys = getMissingApiKeys;
    if (missingKeys.length > 0) {
      missingKeys.forEach((key) => {
        issues.push(`Missing API Key: ${key}`);
      });
    }
    return issues;
  };

  // Get all model issues including missing API keys (for TreeSettingsView compatibility)
  const getAllModelsIssues = () => {
    const issues: string[] = [];
    if (!currentValidation.base_provider) issues.push("Base Provider");
    if (!currentValidation.base_model) issues.push("Base Model");
    if (!currentValidation.complex_provider) issues.push("Complex Provider");
    if (!currentValidation.complex_model) issues.push("Complex Model");

    // Add missing API keys to issues (different format for TreeSettingsView)
    const missingKeys = getMissingApiKeys;
    if (missingKeys.length > 0) {
      missingKeys.forEach((key) => {
        issues.push(`API Key: ${key}`);
      });
    }
    return issues;
  };

  return {
    currentValidation,
    getMissingApiKeys,
    getStorageIssues,
    isConfigValid,
    getWeaviateIssues,
    getModelsIssues,
    getApiKeysIssues,
    getAllModelsIssues,
  };
}
