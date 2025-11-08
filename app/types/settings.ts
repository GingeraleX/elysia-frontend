/**
 * Settings Types - Multi-tiered settings system
 * - USER: Personal preferences (language, theme, notifications)
 * - ADMIN: Tenant management (knowledge, permissions, billing)
 * - OWNER: System-level (endpoints, infrastructure, SaaS)
 */

// ============================================
// USER SETTINGS
// ============================================
export interface UserSettings {
  id: string;
  userId: string;
  tenantId: string;
  
  // Profile
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  
  // Preferences
  language: "en" | "es" | "fr" | "de" | "ja" | "zh";
  theme: "light" | "dark" | "auto";
  timezone: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  digestFrequency: "none" | "daily" | "weekly" | "monthly";
  
  // Privacy
  dataPrivacy: "strict" | "normal" | "loose";
  shareAnalytics: boolean;
  
  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: "small" | "normal" | "large";
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ADMIN SETTINGS
// ============================================
export interface AdminSettings {
  id: string;
  tenantId: string;
  
  // Tenant Info
  tenantName: string;
  tenantLogo?: string;
  
  // Knowledge Distribution
  maxKnowledgeBaseSize: number; // GB
  maxUsersPerTenant: number;
  maxCollectionsPerUser: number;
  
  // Permissions & Access
  allowExternalDataSources: boolean;
  allowCustomIntegrations: boolean;
  allowPublicCollections: boolean;
  requireTwoFactor: boolean;
  
  // Billing & Limits
  monthlyTokenLimit: number;
  storageQuota: number; // GB
  apiCallsLimit: number;
  maxConcurrentRequests: number;
  
  // Features
  enabledFeatures: string[];
  disabledFeatures: string[];
  betaFeatures: boolean;
  
  // Security
  ipWhitelist?: string[];
  sessionTimeout: number; // minutes
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  
  // Audit & Compliance
  auditLogging: boolean;
  retentionDays: number;
  gdprCompliant: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================
// OWNER SETTINGS (SaaS/Infrastructure)
// ============================================
export interface OwnerSettings {
  id: string;
  
  // System Configuration
  systemName: string;
  systemVersion: string;
  environment: "development" | "staging" | "production";
  
  // Infrastructure
  apiEndpoint: string;
  wsEndpoint: string;
  weaviateCluster: string;
  databaseUrl: string;
  
  // Feature Toggles
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  enableNewFeatures: boolean;
  enableAnalytics: boolean;
  
  // Rate Limiting
  globalRateLimit: number; // requests per minute
  userRateLimit: number; // requests per minute per user
  
  // Scaling
  maxTenants: number;
  maxUsersGlobal: number;
  
  // Monitoring
  monitoringEnabled: boolean;
  loggingLevel: "debug" | "info" | "warn" | "error";
  alertingEnabled: boolean;
  alertEmail?: string;
  
  // Updates
  autoUpdate: boolean;
  updateChannel: "stable" | "beta" | "dev";
  
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================
// SETTINGS TABS
// ============================================
export type UserSettingsTab = 
  | "profile" 
  | "preferences" 
  | "notifications" 
  | "privacy" 
  | "accessibility";

export type AdminSettingsTab = 
  | "general" 
  | "knowledge" 
  | "permissions" 
  | "billing" 
  | "security" 
  | "compliance";

export type OwnerSettingsTab = 
  | "system" 
  | "infrastructure" 
  | "features" 
  | "scaling" 
  | "monitoring";

// ============================================
// UNIFIED SETTINGS STATE
// ============================================
export interface SettingsState {
  userSettings: UserSettings | null;
  adminSettings: AdminSettings | null;
  ownerSettings: OwnerSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

