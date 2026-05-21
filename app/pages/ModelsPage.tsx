"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Cloud,
  KeyRound,
  Save,
  TriangleAlert,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import { getModels } from "../api/getModels";
import { SessionContext } from "../components/contexts/SessionContext";
import { ToastContext } from "../components/contexts/ToastContext";
import { useMode } from "../components/contexts/ModeContext";
import { BackendConfig, ModelProvider, UserConfig } from "../types/objects";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMMON_API_KEYS = ["openai", "google", "gemini", "anthropic"];

type ModeType = "local" | "cloud";
type ModelsMap = Record<string, ModelProvider>;

function modelLabel(id: string, providerData?: ModelProvider) {
  const model = providerData?.[id];
  if (!model) return id;
  if (!model.name || model.name === id) return id;
  return `${model.name} (${id})`;
}

function providerNeedsApiKey(providerData?: ModelProvider) {
  if (!providerData) return false;
  return Object.values(providerData).some((model) => (model.api_keys || []).length > 0);
}

function requiredKeysFromSelection(
  models: ModelsMap,
  provider: string,
  model: string
): string[] {
  if (!provider || !model) return [];
  const modelData = models?.[provider]?.[model];
  if (!modelData?.api_keys) return [];
  return modelData.api_keys;
}

export default function ModelsPage() {
  const {
    userConfig,
    updateConfig,
    loadingConfig,
    savingConfig,
    updateUnsavedChanges,
  } = useContext(SessionContext);
  const { showErrorToast } = useContext(ToastContext);
  const {
    mode: activeMode,
    switching: switchingMode,
    switchMode,
  } = useMode();

  const [modelsData, setModelsData] = useState<ModelsMap>({});
  const [loadingModels, setLoadingModels] = useState<boolean>(true);
  const [draftConfig, setDraftConfig] = useState<BackendConfig | null>(null);
  const [changedConfig, setChangedConfig] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const payload = await getModels();
        if (payload.error) {
          showErrorToast("Errore modelli", payload.error);
          setModelsData({});
          return;
        }
        setModelsData(payload.models || {});
      } catch (error) {
        showErrorToast("Errore modelli", String(error));
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [showErrorToast]);

  useEffect(() => {
    if (userConfig?.backend) {
      setDraftConfig({ ...userConfig.backend, settings: { ...userConfig.backend.settings } });
      setChangedConfig(false);
    }
  }, [userConfig]);

  useEffect(() => {
    updateUnsavedChanges(changedConfig);
  }, [changedConfig, updateUnsavedChanges]);

  const settings = draftConfig?.settings;
  const currentMode: ModeType = activeMode === "cloud" ? "cloud" : "local";

  const providers = useMemo(() => Object.keys(modelsData || {}), [modelsData]);

  const localProviders = useMemo(
    () => providers.filter((provider) => !providerNeedsApiKey(modelsData[provider])),
    [providers, modelsData]
  );

  const cloudProviders = useMemo(
    () => providers.filter((provider) => providerNeedsApiKey(modelsData[provider])),
    [providers, modelsData]
  );

  const availableLocalProviders = localProviders.length > 0 ? localProviders : providers;
  const availableCloudProviders = cloudProviders.length > 0 ? cloudProviders : providers;

  const requiredCloudKeys = useMemo(() => {
    const providerBase = settings?.CLOUD_BASE_PROVIDER || "";
    const modelBase = settings?.CLOUD_BASE_MODEL || "";
    const providerComplex = settings?.CLOUD_COMPLEX_PROVIDER || "";
    const modelComplex = settings?.CLOUD_COMPLEX_MODEL || "";

    const keys = new Set<string>();
    requiredKeysFromSelection(modelsData, providerBase, modelBase).forEach((key) => keys.add(key));
    requiredKeysFromSelection(modelsData, providerComplex, modelComplex).forEach((key) => keys.add(key));
    return Array.from(keys);
  }, [modelsData, settings]);

  const apiKeyFields = useMemo(() => {
    const merged = new Set<string>(COMMON_API_KEYS);
    requiredCloudKeys.forEach((key) => merged.add(key));
    Object.keys(settings?.API_KEYS || {}).forEach((key) => merged.add(key));
    return Array.from(merged);
  }, [requiredCloudKeys, settings]);

  const missingRequiredKeys = useMemo(
    () => requiredCloudKeys.filter((key) => !(settings?.API_KEYS?.[key] || "").trim()),
    [requiredCloudKeys, settings]
  );

  const updateSetting = (key: string, value: unknown) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          [key]: value,
        },
      };
    });
    setChangedConfig(true);
  };

  const updateProviderAndModel = (
    providerKey: string,
    modelKey: string,
    provider: string,
    mode: ModeType
  ) => {
    const providerData = modelsData[provider] || {};
    const firstModel = Object.keys(providerData)[0] || "";

    setDraftConfig((prev) => {
      if (!prev) return prev;
      const nextSettings = {
        ...prev.settings,
        [providerKey]: provider,
        [modelKey]: firstModel,
      } as Record<string, unknown>;

      if (mode === "local") {
        nextSettings.LOCAL_OCR_MODEL = nextSettings.LOCAL_OCR_MODEL || firstModel;
      }

      return {
        ...prev,
        settings: {
          ...prev.settings,
          ...nextSettings,
        },
      };
    });

    setChangedConfig(true);
  };

  const updateApiKey = (key: string, value: string) => {
    setDraftConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          API_KEYS: {
            ...(prev.settings.API_KEYS || {}),
            [key]: value,
          },
        },
      };
    });
    setChangedConfig(true);
  };

  const handleProcessingMode = async (nextMode: ModeType) => {
    if (nextMode === currentMode && settings?.PROCESSING_MODE === nextMode) return;
    await switchMode(nextMode);
    updateSetting("PROCESSING_MODE", nextMode);
  };

  const hasLocalSelection = Boolean(
    settings?.LOCAL_BASE_PROVIDER &&
      settings?.LOCAL_BASE_MODEL &&
      settings?.LOCAL_COMPLEX_PROVIDER &&
      settings?.LOCAL_COMPLEX_MODEL
  );

  const hasCloudSelection = Boolean(
    settings?.CLOUD_BASE_PROVIDER &&
      settings?.CLOUD_BASE_MODEL &&
      settings?.CLOUD_COMPLEX_PROVIDER &&
      settings?.CLOUD_COMPLEX_MODEL
  );

  const canSave =
    changedConfig &&
    (currentMode === "local" ? hasLocalSelection : hasCloudSelection) &&
    (currentMode === "local" || missingRequiredKeys.length === 0);

  const saveConfig = async () => {
    if (!draftConfig || !userConfig?.frontend) return;

    const nextSettings = {
      ...draftConfig.settings,
    } as Record<string, unknown>;

    nextSettings.PROCESSING_MODE = currentMode;

    const useCloud = (nextSettings.PROCESSING_MODE as string) === "cloud";

    nextSettings.BASE_PROVIDER = useCloud
      ? nextSettings.CLOUD_BASE_PROVIDER
      : nextSettings.LOCAL_BASE_PROVIDER;
    nextSettings.BASE_MODEL = useCloud
      ? nextSettings.CLOUD_BASE_MODEL
      : nextSettings.LOCAL_BASE_MODEL;
    nextSettings.COMPLEX_PROVIDER = useCloud
      ? nextSettings.CLOUD_COMPLEX_PROVIDER
      : nextSettings.LOCAL_COMPLEX_PROVIDER;
    nextSettings.COMPLEX_MODEL = useCloud
      ? nextSettings.CLOUD_COMPLEX_MODEL
      : nextSettings.LOCAL_COMPLEX_MODEL;

    const payload: UserConfig = {
      backend: {
        ...draftConfig,
        settings: nextSettings as BackendConfig["settings"],
      },
      frontend: userConfig.frontend,
    };

    const saved = await updateConfig(payload, false);
    if (saved) {
      setChangedConfig(false);
    }
  };

  const resetChanges = () => {
    if (!userConfig?.backend) return;
    setDraftConfig({ ...userConfig.backend, settings: { ...userConfig.backend.settings } });
    setChangedConfig(false);
  };

  if (!draftConfig || !settings) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-[12.5px] text-secondary">Caricamento…</p>
      </div>
    );
  }

  const isLocal = currentMode === "local";

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-6 lg:px-8 py-8 pb-32">
        {/* ── Page header ───────────────────────────── */}
        <header className="flex items-end justify-between gap-6 pb-5 mb-8 border-b border-border/40">
          <div className="min-w-0">
            <h1 className="text-[15px] font-medium text-primary tracking-tight leading-none">
              Modelli AI
            </h1>
            <p className="mt-1.5 text-[12.5px] text-secondary/85 leading-relaxed max-w-lg">
              Scegli dove Elysia esegue i modelli. Puoi cambiare quando vuoi.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 text-[11.5px] text-secondary">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  isOnline ? "bg-accent animate-ping opacity-60" : "bg-error"
                }`}
              />
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  isOnline ? "bg-accent" : "bg-error"
                }`}
              />
            </span>
            {isOnline ? "Online" : "Offline"}
          </div>
        </header>

        {/* ── Mode segmented control ─────────────── */}
        <section className="mb-10">
          <SectionTitle title="Modalità di esecuzione" />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <ModeCard
              active={isLocal}
              onClick={() => handleProcessingMode("local")}
              disabled={switchingMode}
              icon={<ShieldCheck className="h-[15px] w-[15px]" strokeWidth={1.7} />}
              title="Sul tuo computer"
              badge="Consigliato"
              description="Funziona anche offline. I dati restano locali."
              accentClass="accent"
            />
            <ModeCard
              active={!isLocal}
              onClick={() => handleProcessingMode("cloud")}
              disabled={switchingMode}
              icon={<Cloud className="h-[15px] w-[15px]" strokeWidth={1.7} />}
              title="Nel cloud"
              description="Modelli più potenti. Richiede internet e API key."
              accentClass="highlight"
            />
          </div>
        </section>

        {/* ── Models block ─────────────────────────── */}
        <section className="mb-10">
          <SectionTitle
            title="Selezione modelli"
            hint={
              isLocal
                ? "Veloce per le domande comuni, avanzato per i ragionamenti complessi."
                : "Veloce per risposte rapide, avanzato per ragionamenti complessi."
            }
          />

          <div className="rounded-xl border border-border/40 bg-background_alt/25 backdrop-blur-sm divide-y divide-border/30">
            <ModelRow
              icon={<Zap className="h-[15px] w-[15px]" strokeWidth={1.8} />}
              title="Modello veloce"
              hint="Per le risposte rapide del giorno per giorno"
              providerValue={
                isLocal
                  ? settings.LOCAL_BASE_PROVIDER || ""
                  : settings.CLOUD_BASE_PROVIDER || ""
              }
              modelValue={
                isLocal
                  ? settings.LOCAL_BASE_MODEL || ""
                  : settings.CLOUD_BASE_MODEL || ""
              }
              onProvider={(p) =>
                isLocal
                  ? updateProviderAndModel(
                      "LOCAL_BASE_PROVIDER",
                      "LOCAL_BASE_MODEL",
                      p,
                      "local"
                    )
                  : updateProviderAndModel(
                      "CLOUD_BASE_PROVIDER",
                      "CLOUD_BASE_MODEL",
                      p,
                      "cloud"
                    )
              }
              onModel={(m) =>
                updateSetting(
                  isLocal ? "LOCAL_BASE_MODEL" : "CLOUD_BASE_MODEL",
                  m
                )
              }
              providers={
                isLocal ? availableLocalProviders : availableCloudProviders
              }
              modelsData={modelsData}
              loadingModels={loadingModels}
            />

            <ModelRow
              icon={<Sparkles className="h-[15px] w-[15px]" strokeWidth={1.8} />}
              title="Modello avanzato"
              hint="Per ragionamenti complessi e domande tecniche"
              providerValue={
                isLocal
                  ? settings.LOCAL_COMPLEX_PROVIDER || ""
                  : settings.CLOUD_COMPLEX_PROVIDER || ""
              }
              modelValue={
                isLocal
                  ? settings.LOCAL_COMPLEX_MODEL || ""
                  : settings.CLOUD_COMPLEX_MODEL || ""
              }
              onProvider={(p) =>
                isLocal
                  ? updateProviderAndModel(
                      "LOCAL_COMPLEX_PROVIDER",
                      "LOCAL_COMPLEX_MODEL",
                      p,
                      "local"
                    )
                  : updateProviderAndModel(
                      "CLOUD_COMPLEX_PROVIDER",
                      "CLOUD_COMPLEX_MODEL",
                      p,
                      "cloud"
                    )
              }
              onModel={(m) =>
                updateSetting(
                  isLocal ? "LOCAL_COMPLEX_MODEL" : "CLOUD_COMPLEX_MODEL",
                  m
                )
              }
              providers={
                isLocal ? availableLocalProviders : availableCloudProviders
              }
              modelsData={modelsData}
              loadingModels={loadingModels}
            />
          </div>

          {/* Advanced — endpoint URL */}
          <details className="mt-4 group/adv">
            <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 text-[11.5px] text-secondary hover:text-primary transition-colors">
              <ChevronDown className="h-3 w-3 transition-transform group-open/adv:rotate-180" strokeWidth={2} />
              Server personalizzato
            </summary>
            <div className="mt-3 max-w-md">
              <Input
                placeholder={
                  isLocal
                    ? "http://localhost:11434/v1"
                    : "https://api.openai.com/v1"
                }
                value={
                  isLocal
                    ? settings.LOCAL_MODEL_API_BASE || ""
                    : settings.MODEL_API_BASE || ""
                }
                onChange={(e) =>
                  updateSetting(
                    isLocal ? "LOCAL_MODEL_API_BASE" : "MODEL_API_BASE",
                    e.target.value
                  )
                }
                className="h-9 text-[12.5px] font-mono-soft bg-background_alt/40 border-border/50"
              />
            </div>
          </details>
        </section>

        {/* ── API keys (cloud only) ────────────────── */}
        {!isLocal && (
          <section className="mb-10">
            <SectionTitle
              title="Chiavi API"
              hint="Credenziali per i provider cloud. Le trovi nei rispettivi dashboard."
            />

            {missingRequiredKeys.length > 0 && (
              <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-warning/30 bg-warning/8 px-3.5 py-2.5">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-warning" strokeWidth={1.8} />
                <p className="text-[12.5px] text-primary">
                  Chiavi mancanti:{" "}
                  <span className="font-mono-soft text-warning">
                    {missingRequiredKeys.join(", ")}
                  </span>
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border/40 bg-background_alt/25 backdrop-blur-sm divide-y divide-border/30">
              {apiKeyFields.map((keyName) => (
                <ApiKeyRow
                  key={keyName}
                  name={keyName}
                  required={requiredCloudKeys.includes(keyName)}
                  value={settings.API_KEYS?.[keyName] || ""}
                  onChange={(v) => updateApiKey(keyName, v)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Offline warning while in cloud ─────── */}
        {!isLocal && !isOnline && (
          <div className="mb-10 flex items-center gap-2.5 rounded-lg border border-error/30 bg-error/8 px-3.5 py-2.5">
            <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-error" strokeWidth={1.8} />
            <p className="text-[12.5px] text-primary">
              Sei in modalità cloud senza internet. Passa a{" "}
              <span className="text-accent">Sul tuo computer</span> per continuare.
            </p>
          </div>
        )}
      </div>

      {/* ── Sticky save bar ─────────────────────────── */}
      <div
        className={cn(
          "sticky bottom-0 z-20 mt-auto border-t border-border/50 bg-background/85 backdrop-blur-xl transition-all duration-300",
          changedConfig ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
      >
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <p className="text-[12.5px] text-primary">
              Modifiche non salvate
              {!canSave && currentMode === "cloud" && missingRequiredKeys.length > 0 && (
                <span className="text-warning"> · mancano chiavi API</span>
              )}
              {!canSave && currentMode === "local" && !hasLocalSelection && (
                <span className="text-warning"> · seleziona i modelli</span>
              )}
              {!canSave && currentMode === "cloud" && !hasCloudSelection && (
                <span className="text-warning"> · seleziona i modelli</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChanges}
              disabled={!changedConfig || loadingConfig || savingConfig}
              className="h-8 text-[12.5px]"
            >
              Annulla
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveConfig}
              disabled={!canSave || loadingConfig || savingConfig}
              className="h-8 text-[12.5px]"
            >
              <Save className="h-3 w-3" strokeWidth={2} />
              {savingConfig ? "Salvataggio…" : "Salva"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Sub-components
   ──────────────────────────────────────────────── */

function SectionTitle({
  title,
  hint,
  trailing,
}: {
  title: string;
  hint?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <div className="min-w-0">
        <h2 className="text-[12.5px] font-medium text-primary tracking-tight leading-none">
          {title}
        </h2>
        {hint && (
          <p className="mt-1 text-[12px] text-secondary/80 leading-snug">
            {hint}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  disabled,
  icon,
  title,
  badge,
  description,
  accentClass,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  badge?: string;
  description: string;
  accentClass: "accent" | "highlight";
}) {
  const tint = accentClass === "accent" ? "accent" : "highlight";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "group/mode relative flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        active
          ? `border-${tint}/40 bg-${tint}/[0.06]`
          : "border-border/40 bg-background_alt/25 hover:border-border/70 hover:bg-background_alt/45"
      )}
    >
      <span
        className={cn(
          "grid h-7 w-7 place-items-center rounded-md shrink-0 transition-colors",
          active
            ? accentClass === "accent"
              ? "bg-accent/15 text-accent"
              : "bg-highlight/15 text-highlight"
            : "bg-foreground_alt/40 text-secondary group-hover/mode:text-primary"
        )}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-primary">
            {title}
          </span>
          {badge && (
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded",
                accentClass === "accent"
                  ? "bg-accent/10 text-accent"
                  : "bg-highlight/10 text-highlight"
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12px] text-secondary/85 leading-snug">
          {description}
        </p>
      </div>
      {active && (
        <CheckCircle2
          className={cn(
            "h-4 w-4 shrink-0 mt-0.5",
            accentClass === "accent" ? "text-accent" : "text-highlight"
          )}
          strokeWidth={1.8}
        />
      )}
    </button>
  );
}

function ModelRow({
  icon,
  title,
  hint,
  providerValue,
  modelValue,
  onProvider,
  onModel,
  providers,
  modelsData,
  loadingModels,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  providerValue: string;
  modelValue: string;
  onProvider: (p: string) => void;
  onModel: (m: string) => void;
  providers: string[];
  modelsData: ModelsMap;
  loadingModels: boolean;
}) {
  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3.5">
      <div className="col-span-12 md:col-span-5 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/10 text-accent shrink-0">
          {icon}
        </span>
        <div className="flex flex-col min-w-0">
          <p className="text-[13px] font-medium text-primary leading-tight">
            {title}
          </p>
          <p className="text-[11.5px] text-secondary/80 leading-tight mt-0.5">
            {hint}
          </p>
        </div>
      </div>
      <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-1.5">
        <Select value={providerValue} onValueChange={onProvider}>
          <SelectTrigger className="h-9 text-[12.5px] bg-background_alt/40 border-border/50">
            <SelectValue
              placeholder={loadingModels ? "Caricamento…" : "Provider"}
            />
          </SelectTrigger>
          <SelectContent>
            {providers.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={modelValue} onValueChange={onModel}>
          <SelectTrigger className="h-9 text-[12.5px] bg-background_alt/40 border-border/50">
            <SelectValue placeholder={providerValue ? "Modello" : "—"} />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(modelsData[providerValue] || {}).map((id) => (
              <SelectItem key={id} value={id}>
                {modelLabel(id, modelsData[providerValue])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ApiKeyRow({
  name,
  required,
  value,
  onChange,
}: {
  name: string;
  required: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-2.5">
      <div className="col-span-12 md:col-span-5 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground_alt/40 text-secondary shrink-0">
          <KeyRound className="h-[12px] w-[12px]" strokeWidth={1.8} />
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-[12.5px] font-medium text-primary capitalize">
            {name}
          </p>
          {required && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">
              richiesta
            </span>
          )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-7 flex items-center gap-1.5">
        <Input
          type={revealed ? "text" : "password"}
          value={value}
          placeholder={`Chiave ${name}…`}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 bg-background_alt/40 border-border/50 font-mono-soft text-[12px]"
        />
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="text-[11.5px] text-secondary hover:text-primary transition-colors px-2 h-9"
        >
          {revealed ? "Nascondi" : "Mostra"}
        </button>
      </div>
    </div>
  );
}
