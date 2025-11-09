"use client";

import { createContext, useEffect, useRef, useState, useContext, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { initializeUser } from "@/app/api/initializeUser";
import { saveConfig } from "@/app/api/saveConfig";
import { UserConfig } from "@/app/types/objects";
import { getConfigList } from "@/app/api/getConfigList";
import { getConfig } from "@/app/api/getConfig";
import {
  BasePayload,
  ConfigListEntry,
  ConfigPayload,
  CorrectSettings,
} from "@/app/types/payloads";
import { createConfig } from "@/app/api/createConfig";
import { loadConfig } from "@/app/api/loadConfig";
import { deleteConfig } from "@/app/api/deleteConfig";
import { ToastContext } from "./ToastContext";
import { useDeviceId } from "@/app/getDeviceId";

export const SessionContext = createContext<{
  mode: string;
  id: string | null;
  showRateLimitDialog: boolean;
  enableRateLimitDialog: () => void;
  userConfig: UserConfig | null;
  savingConfig: boolean;
  fetchCurrentConfig: () => void;
  configIDs: ConfigListEntry[];
  updateConfig: (config: UserConfig, setDefault: boolean) => Promise<boolean>;
  handleCreateConfig: (user_id: string) => void;
  getConfigIDs: (user_id: string) => void;
  handleLoadConfig: (user_id: string, config_id: string) => void;
  handleDeleteConfig: (
    user_id: string,
    config_id: string,
    selectedConfig: boolean
  ) => void;
  loadingConfig: boolean;
  loadingConfigs: boolean;
  correctSettings: CorrectSettings | null;
  triggerFetchCollection: () => void;
  fetchCollectionFlag: boolean;
  initialized: boolean;
  triggerFetchConversation: () => void;
  fetchConversationFlag: boolean;
  updateUnsavedChanges: (unsaved: boolean) => void;
  unsavedChanges: boolean;
}>({
  mode: "home",
  id: "",
  showRateLimitDialog: false,
  enableRateLimitDialog: () => {},
  userConfig: null,
  savingConfig: false,
  fetchCurrentConfig: () => {},
  configIDs: [],
  updateConfig: async () => false,
  handleCreateConfig: () => {},
  getConfigIDs: () => {},
  handleLoadConfig: () => {},
  handleDeleteConfig: () => {},
  loadingConfig: false,
  loadingConfigs: false,
  correctSettings: null,
  triggerFetchCollection: () => {},
  fetchCollectionFlag: false,
  initialized: false,
  triggerFetchConversation: () => {},
  fetchConversationFlag: false,
  updateUnsavedChanges: () => {},
  unsavedChanges: false,
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { showErrorToast, showSuccessToast, showWarningToast } =
    useContext(ToastContext);

  const [mode, setMode] = useState<string>("home");

  const pathname = usePathname();

  const [showRateLimitDialog, setShowRateLimitDialog] =
    useState<boolean>(false);
  
  // Use device fingerprint for guests OR user_id from localStorage for authenticated users
  const deviceId = useDeviceId();
  const getActualUserId = () => {
    if (typeof window === "undefined") return null;
    
    // Check if user is authenticated (has JWT token)
    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
      // First, try to get user_id directly from localStorage (set by AuthContext)
      const storedUserId = localStorage.getItem("user_id");
      if (storedUserId) {
        return storedUserId;
      }
      
      // Fallback: Extract user_id from JWT token payload
      try {
        const payload = JSON.parse(
          atob(authToken.split('.')[1])
        );
        if (payload.userId) {
          return payload.userId;
        }
        if (payload.sub) {
          return payload.sub;
        }
      } catch (e) {
        // Silent fail on JWT parse
      }
    }
    
    // Fall back to device fingerprint for guests
    return deviceId;
  };
  
  const [userId, setUserId] = useState<string | null>(null);
  const previousUserIdRef = useRef<string | null>(null);
  
  // Update userId when auth token or user_id changes in localStorage
  useEffect(() => {
    const checkAuthState = () => {
      if (!deviceId) return;

      const token = localStorage.getItem("auth_token");
      const guestMode = localStorage.getItem("guest_mode");
      const isAuth = !!token;
      
      // If user has token, they're authenticated - clear guest mode flag
      if (isAuth && guestMode === "true") {
        localStorage.removeItem("guest_mode");
      }
      
      const actualId = getActualUserId();
      
      // Only update if userId actually changed (avoid cascading re-renders)
      if (actualId !== previousUserIdRef.current) {
        previousUserIdRef.current = actualId;
        setUserId(actualId);
      }
    };

    // Initial check on component mount
    checkAuthState();

    // Listen for storage changes (login/logout in other tabs or same-tab auth changes)
    // Using 'change' event which fires for ALL storage changes including same-tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token" || e.key === "user_id" || e.key === "guest_mode") {
        checkAuthState();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also manually check auth state periodically in case storage event misses same-tab changes
    // This is a fallback for when auth context updates localStorage directly
    const interval = setInterval(checkAuthState, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [deviceId]);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [configIDs, setConfigIDs] = useState<ConfigListEntry[]>([]);
  const [correctSettings, setCorrectSettings] =
    useState<CorrectSettings | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(false);
  const [loadingConfigs, setLoadingConfigs] = useState<boolean>(false);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const initialized = useRef(false);
  const [fetchCollectionFlag, setFetchCollectionFlag] =
    useState<boolean>(false);
  const [fetchConversationFlag, setFetchConversationFlag] =
    useState<boolean>(false);
  
  // Add tracking refs to prevent duplicate API calls
  const lastConfigFetchRef = useRef<{ userId: string; timestamp: number } | null>(null);
  const lastCurrentConfigFetchRef = useRef<{ userId: string; timestamp: number } | null>(null);
  const CONFIG_FETCH_DEBOUNCE = 1000; // 1 second debounce

  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const triggerFetchCollection = () => {
    setFetchCollectionFlag((prev) => !prev);
  };

  const triggerFetchConversation = () => {
    setFetchConversationFlag((prev) => !prev);
  };

  const getConfigIDs = useCallback(async (user_id: string) => {
    // Prevent duplicate fetches - if we fetched this user within 1 second, skip
    const now = Date.now();
    if (lastConfigFetchRef.current?.userId === user_id && 
        now - lastConfigFetchRef.current.timestamp < CONFIG_FETCH_DEBOUNCE) {
      return;
    }

    setLoadingConfigs(true);
    setConfigIDs([]);
    if (!user_id) {
      return;
    }
    const configList = await getConfigList(user_id);

    if (configList.error) {
      showErrorToast("Failed to Load Configuration List", configList.error);
    }

    // Sort configs by last_used date in descending order (most recent first)
    const sortedConfigs = configList.configs.sort((a, b) => {
      return (
        new Date(b.last_update_time).getTime() -
        new Date(a.last_update_time).getTime()
      );
    });
    setConfigIDs(sortedConfigs);
    setLoadingConfigs(false);
    
    // Update last fetch time
    lastConfigFetchRef.current = { userId: user_id, timestamp: now };
  }, [showErrorToast]);

  // TODO : Add fetching all possible model names from the API

  const fetchCurrentConfig = useCallback(async () => {
    // Prevent duplicate fetches - if we fetched this user within 1 second, skip
    const now = Date.now();
    if (lastCurrentConfigFetchRef.current?.userId === userId && 
        now - lastCurrentConfigFetchRef.current.timestamp < CONFIG_FETCH_DEBOUNCE) {
      return;
    }

    setLoadingConfig(true);
    if (!userId) {
      return;
    }
    const config = await getConfig(userId);
    if (config.error) {
      console.error(config.error);
      showErrorToast("Failed to Load Configuration", config.error);
      return;
    }
    setUserConfig({
      backend: config.config,
      frontend: config.frontend_config,
    });
    setLoadingConfig(false);
    
    // Update last fetch time
    lastCurrentConfigFetchRef.current = { userId, timestamp: now };
  }, [userId, showErrorToast]);

  const updateUnsavedChanges = (unsaved: boolean) => {
    setUnsavedChanges(unsaved);
  };

  // Reset initialization when user ID changes (e.g., guest → registered user)
  useEffect(() => {
    if (userId) {
      initialized.current = false; // Reset so we re-initialize
    }
  }, [userId]);

  useEffect(() => {
    if (initialized.current || !userId) return;
    initUser();
  }, [userId]);

  useEffect(() => {
    if (pathname === "/") {
      setMode("home");
    } else if (
      pathname.startsWith("/data") ||
      pathname.startsWith("/collection")
    ) {
      setMode("data-explorer");
    } else if (pathname.startsWith("/eval")) {
      setMode("evaluation");
    } else if (pathname.startsWith("/about/data")) {
      setMode("about-data");
    } else if (pathname.startsWith("/about")) {
      setMode("about");
    } else if (pathname.startsWith("/settings")) {
      setMode("settings");
    }
  }, [pathname]);

  const initUser = async () => {
    if (!userId) {
      return;
    }

    // Prevent duplicate initialization
    if (initialized.current) {
      console.log("User already initialized, skipping init");
      return;
    }

    const user_object = await initializeUser(userId);
    setLoadingConfig(true);

    if (user_object.error) {
      console.error("User initialization error:", user_object.error);
      // Don't show error toast on transient errors during page load
      if (!user_object.error.includes("not found")) {
        showErrorToast("Failed to Initialize User", user_object.error);
      }
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Initialized user with id: " + userId);
    }

    getConfigIDs(userId);
    setUserConfig({
      backend: user_object.config,
      frontend: user_object.frontend_config,
    });
    setCorrectSettings(user_object.correct_settings);
    setLoadingConfig(false);
    initialized.current = true;
  };

  const enableRateLimitDialog = () => {
    setShowRateLimitDialog(true);
  };

  const updateConfig = useCallback(async (
    config: UserConfig,
    setDefault: boolean = false
  ) => {
    setLoadingConfig(true);
    setSavingConfig(true);
    const response: ConfigPayload = await saveConfig(
      userId,
      config.backend,
      config.frontend,
      setDefault
    );
    if (response.error) {
      console.error(response.error);
      showErrorToast("Failed to Save Configuration", response.error);
      setLoadingConfig(false);
      setSavingConfig(false);
      return false;
    } else if (response.warnings.length > 0) {
      response.warnings.forEach((warning) => {
        showWarningToast("Configuration Saved with Warning", warning);
      });
    } else {
      showSuccessToast(
        "Configuration Saved",
        "Your configuration has been saved successfully."
      );
    }
    setUserConfig({
      backend: response.config,
      frontend: response.frontend_config,
    });
    getConfigIDs(userId || "");
    setLoadingConfig(false);
    triggerFetchCollection();
    triggerFetchConversation();
    setSavingConfig(false);
    return true;
  }, [userId, showErrorToast, showSuccessToast, showWarningToast]);

  const handleLoadConfig = useCallback(async (user_id: string, config_id: string) => {
    if (!user_id || !config_id) {
      return;
    }
    setLoadingConfig(true);
    const response: ConfigPayload = await loadConfig(user_id, config_id);
    if (response.error) {
      console.error(response.error);
      showErrorToast("Failed to Load Configuration", response.error);
    } else {
      showSuccessToast(
        "Configuration Loaded",
        "Configuration loaded successfully."
      );
    }
    setUserConfig({
      backend: response.config,
      frontend: response.frontend_config,
    });
    setLoadingConfig(false);
  }, [showErrorToast, showSuccessToast]);

  const handleCreateConfig = useCallback(async (user_id: string) => {
    if (!user_id) {
      return;
    }
    setLoadingConfig(true);
    const response: ConfigPayload = await createConfig(user_id);
    if (response.error) {
      console.error(response.error);
      showErrorToast("Failed to Create Configuration", response.error);
      setLoadingConfig(false);
      return;
    } else {
      showSuccessToast(
        "Configuration Created",
        "New configuration created successfully."
      );
    }

    // Check if name already exists and generate unique name if needed
    if (response.config) {
      const baseName = response.config.name || "New Config";
      let uniqueName = baseName;
      let counter = 1;

      while (configIDs.some((config) => config.name === uniqueName)) {
        uniqueName = `${baseName} ${counter}`;
        counter++;
      }

      // Update the config with unique name if needed
      if (uniqueName !== baseName) {
        response.config.name = uniqueName;
      }
    }

    setUserConfig({
      backend: response.config,
      frontend: response.frontend_config,
    });
    getConfigIDs(user_id);
    setLoadingConfig(false);
  }, [configIDs, showErrorToast, showSuccessToast]);

  const handleDeleteConfig = useCallback(async (
    user_id: string,
    config_id: string,
    selectedConfig: boolean
  ) => {
    if (!user_id || !config_id) {
      return;
    }
    setLoadingConfig(true);
    const response: BasePayload = await deleteConfig(user_id, config_id);
    if (response.error) {
      console.error(response.error);
      showErrorToast("Failed to Delete Configuration", response.error);
    } else {
      showSuccessToast(
        "Configuration Deleted",
        "Configuration deleted successfully."
      );
      if (selectedConfig) {
        // Find another config to load
        const otherConfig = configIDs.find(
          (config) => config.config_id !== config_id
        );
        if (otherConfig) {
          handleLoadConfig(user_id, otherConfig.config_id);
        } else {
          setUserConfig(null);
        }
      }
    }
    getConfigIDs(user_id);
    setLoadingConfig(false);
    triggerFetchConversation();
    triggerFetchCollection();
  }, [configIDs, showErrorToast, showSuccessToast]);

  return (
    <SessionContext.Provider
      value={useMemo(() => ({
        mode,
        id: userId || "",
        showRateLimitDialog,
        enableRateLimitDialog,
        userConfig,
        savingConfig,
        fetchCurrentConfig,
        configIDs,
        updateConfig,
        handleCreateConfig,
        getConfigIDs,
        handleLoadConfig,
        handleDeleteConfig,
        loadingConfig,
        loadingConfigs,
        correctSettings,
        fetchCollectionFlag,
        initialized: initialized.current,
        triggerFetchCollection,
        triggerFetchConversation,
        fetchConversationFlag,
        updateUnsavedChanges,
        unsavedChanges,
      }), [
        mode,
        userId,
        showRateLimitDialog,
        userConfig,
        savingConfig,
        fetchCurrentConfig,
        configIDs,
        updateConfig,
        handleCreateConfig,
        getConfigIDs,
        handleLoadConfig,
        handleDeleteConfig,
        loadingConfig,
        loadingConfigs,
        correctSettings,
        fetchCollectionFlag,
        triggerFetchCollection,
        triggerFetchConversation,
        fetchConversationFlag,
        unsavedChanges,
      ])}
    >
      {children}
    </SessionContext.Provider>
  );
};
