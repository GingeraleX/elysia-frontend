"use client";

import React, { useEffect, useState } from "react";
import { MdCloudQueue } from "react-icons/md";
import { FaServer, FaSpinner } from "react-icons/fa";
import { IoInformationCircle } from "react-icons/io5";
import {
  SettingCard,
  SettingHeader,
  SettingGroup,
  SettingItem,
  SettingTitle,
} from "../SettingComponents";
import SettingCombobox from "../SettingCombobox";
import SettingInput from "../SettingInput";
import { Button } from "@/components/ui/button";
import ModelBadges from "../ModelBadge";
import { SystemMode } from "@/app/api/modeToggle";
import { useMode } from "@/app/components/contexts/ModeContext";
import { BackendConfig, ModelProvider } from "@/app/types/objects";


interface ProcessingModeSectionProps {
  currentUserConfig: BackendConfig | null;
  modelsData: { [key: string]: ModelProvider } | null;
  loadingModels: boolean;
  onUpdateSettings: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keyOrUpdates: string | Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any
  ) => void;
  onUpdateConfig: (config: BackendConfig) => void;
  setChangedConfig: (changed: boolean) => void;
  onModeChange?: (newMode: SystemMode) => void;
}

/**
 * ProcessingModeSection — Tab-based Online/Offline mode selector.
 *
 * Shows what each mode uses (models, providers, API keys).
 * Active mode is highlighted. The sidebar ModeToggle button handles fast switching;
 * this section gives full context and lets you switch from the settings page too.
 */
export default function ProcessingModeSection({
  currentUserConfig,
  modelsData,
  loadingModels,
  onUpdateSettings,
  onUpdateConfig,
  setChangedConfig,
  onModeChange,
}: ProcessingModeSectionProps) {
  // ── Mode state from shared context ──────────────────────────────────────────
  const { mode: activeMode, switching, switchMode } = useMode();

  // viewTab tracks which tab the user is viewing (can differ from activeMode).
  // Snaps to the real active mode whenever an external switch occurs.
  const [viewTab, setViewTab] = useState<SystemMode>(activeMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setViewTab(activeMode); }, [activeMode]);

  async function handleSwitch(to: SystemMode) {
    if (to === activeMode || switching) return;
    setError(null);
    const ok = await switchMode(to);
    if (ok) {
      onUpdateSettings("PROCESSING_MODE", to);
      onModeChange?.(to);
    } else {
      setError("Switch failed — is the backend running?");
    }
  }

  const isCloud = viewTab === "cloud";
  const isViewingActive = viewTab === activeMode;

  // Key prefixes for settings fields
  const providerBaseKey = isCloud ? "CLOUD_BASE_PROVIDER" : "LOCAL_BASE_PROVIDER";
  const modelBaseKey = isCloud ? "CLOUD_BASE_MODEL" : "LOCAL_BASE_MODEL";
  const providerComplexKey = isCloud ? "CLOUD_COMPLEX_PROVIDER" : "LOCAL_COMPLEX_PROVIDER";
  const modelComplexKey = isCloud ? "CLOUD_COMPLEX_MODEL" : "LOCAL_COMPLEX_MODEL";

  const baseProvider = currentUserConfig?.settings?.[providerBaseKey] || "";
  const baseModel = currentUserConfig?.settings?.[modelBaseKey] || "";
  const complexProvider = currentUserConfig?.settings?.[providerComplexKey] || "";
  const complexModel = currentUserConfig?.settings?.[modelComplexKey] || "";

  const providers = modelsData ? Object.keys(modelsData) : [];
  const baseModels = modelsData && baseProvider ? Object.keys(modelsData[baseProvider] || {}) : [];
  const complexModels = modelsData && complexProvider ? Object.keys(modelsData[complexProvider] || {}) : [];

  const borderCls = isCloud ? "border-blue-400/60" : "border-green-400/60";
  const accentText = isCloud ? "text-blue-400" : "text-green-400";
  const accentBg = isCloud ? "bg-blue-400/10" : "bg-green-400/10";

  return (
    <SettingCard>
      <SettingHeader
        icon={activeMode === "cloud" ? <MdCloudQueue /> : <FaServer />}
        className={activeMode === "cloud" ? "bg-blue-500/20" : "bg-green-500/20"}
        header="Processing Mode"
      />

      <SettingGroup>
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-background rounded-lg border border-foreground/20 w-fit">
          {(["cloud", "local"] as SystemMode[]).map((tab) => {
            const isSelected = tab === viewTab;
            const isActive = tab === activeMode;
            return (
              <button
                key={tab}
                onClick={() => setViewTab(tab)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${isSelected
                    ? tab === "cloud"
                      ? "bg-blue-400/15 text-blue-400 border border-blue-400/40"
                      : "bg-green-400/15 text-green-400 border border-green-400/40"
                    : "text-secondary hover:text-primary hover:bg-foreground/10"
                  }
                `}
              >
                {tab === "cloud" ? <MdCloudQueue size={14} /> : <FaServer size={12} />}
                {tab === "cloud" ? "Online (Cloud)" : "Offline (Local)"}
                {isActive && (
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ml-1
                    ${tab === "cloud" ? "bg-blue-400/20 text-blue-400" : "bg-green-400/20 text-green-400"}`}>
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mode detail panel */}
        <div className={`rounded-lg border ${borderCls} ${accentBg} p-4 flex flex-col gap-5`}>
            {/* Mode label + active hint */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className={`font-semibold text-sm ${accentText}`}>
                {isCloud ? "☁️ Online — Cloud providers" : "🔒 Offline — Local GPU inference"}
              </p>
              {isViewingActive ? (
                <span className={`text-xs font-medium ${accentText}`}>✓ Currently active</span>
              ) : (
                <Button
                  disabled={switching}
                  onClick={() => handleSwitch(viewTab)}
                  className={`text-xs flex items-center gap-1.5 h-7 px-3
                    ${isCloud
                      ? "bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 border border-blue-400/40"
                      : "bg-green-400/10 text-green-400 hover:bg-green-400/20 border border-green-400/40"
                    }`}
                >
                  {switching ? <FaSpinner className="animate-spin" size={11} /> : isCloud ? <MdCloudQueue size={12} /> : <FaServer size={11} />}
                  {switching ? "Switching..." : `Switch to ${isCloud ? "Online" : "Offline"}`}
                </Button>
              )}
            </div>

            {/* ── Base Model ── */}
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-primary font-bold text-sm">Base Model</p>
                <p className="text-secondary text-xs mt-0.5">
                  Used for fast tasks, decision routing and simple tool calls.
                </p>
              </div>

              <SettingItem>
                <SettingTitle title="Provider" description="" />
                <SettingCombobox
                  value={baseProvider}
                  values={providers}
                  onChange={(value) => {
                    if (currentUserConfig) {
                      onUpdateConfig({
                        ...currentUserConfig,
                        settings: {
                          ...currentUserConfig.settings,
                          [providerBaseKey]: value,
                          [modelBaseKey]: "",
                        },
                      });
                      setChangedConfig(true);
                    }
                  }}
                  placeholder={loadingModels ? "Loading..." : "Select provider..."}
                  searchPlaceholder="Search providers..."
                />
              </SettingItem>

              {baseProvider && (
                <SettingItem>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <SettingTitle title="Model" description="" />
                    <ModelBadges
                      modelsData={modelsData}
                      provider={baseProvider}
                      model={baseModel}
                    />
                  </div>
                  <SettingCombobox
                    value={baseModel}
                    values={baseModels}
                    onChange={(value) => onUpdateSettings(modelBaseKey, value)}
                    placeholder={loadingModels ? "Loading..." : "Select model..."}
                    searchPlaceholder="Search models..."
                  />
                </SettingItem>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-foreground/10" />

            {/* ── Complex Model ── */}
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-primary font-bold text-sm">Complex Model</p>
                <p className="text-secondary text-xs mt-0.5">
                  Used for reasoning-heavy tasks, aggregation and deep analysis.
                </p>
              </div>

              <SettingItem>
                <SettingTitle title="Provider" description="" />
                <SettingCombobox
                  value={complexProvider}
                  values={providers}
                  onChange={(value) => {
                    if (currentUserConfig) {
                      onUpdateConfig({
                        ...currentUserConfig,
                        settings: {
                          ...currentUserConfig.settings,
                          [providerComplexKey]: value,
                          [modelComplexKey]: "",
                        },
                      });
                      setChangedConfig(true);
                    }
                  }}
                  placeholder={loadingModels ? "Loading..." : "Select provider..."}
                  searchPlaceholder="Search providers..."
                />
              </SettingItem>

              {complexProvider && (
                <SettingItem>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <SettingTitle title="Model" description="" />
                    <ModelBadges
                      modelsData={modelsData}
                      provider={complexProvider}
                      model={complexModel}
                    />
                  </div>
                  <SettingCombobox
                    value={complexModel}
                    values={complexModels}
                    onChange={(value) => onUpdateSettings(modelComplexKey, value)}
                    placeholder={loadingModels ? "Loading..." : "Select model..."}
                    searchPlaceholder="Search models..."
                  />
                </SettingItem>
              )}
            </div>

            {/* Local-only: API base override */}
            {!isCloud && (
              <>
                <div className="border-t border-foreground/10" />
                <SettingItem>
                  <SettingTitle
                    title="Local API Base URL"
                    description="Endpoint for your local inference server (e.g. temp_router on :8090)."
                  />
                  <SettingInput
                    isProtected={false}
                    value={currentUserConfig?.settings?.LOCAL_MODEL_API_BASE || ""}
                    onChange={(value) => onUpdateSettings("LOCAL_MODEL_API_BASE", value)}
                  />
                </SettingItem>
              </>
            )}

            {/* Required API key hint */}
            <div className={`flex items-start gap-2 text-xs ${accentText} rounded-md border ${borderCls} px-3 py-2`}>
              <IoInformationCircle className="mt-0.5 flex-shrink-0" size={14} />
              <span>
                {isCloud
                  ? "Cloud providers require API keys — configure them in the API Keys section below."
                  : "Local inference requires no API keys. GPU inference server must be running on the configured ports."}
              </span>
            </div>
          </div>

        {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}
      </SettingGroup>
    </SettingCard>
  );
}
