// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — only used when NEXT_PUBLIC_MOCK_MODE=true
// Safe to leave in production: tree-shaken when env var is absent.
// HOW TO EXTEND: add export below, wire in mock-handlers.ts. That is all.
// ─────────────────────────────────────────────────────────────────────────────
import type { Collection, UserConfig, BackendConfig, Settings } from "@/app/types/objects";
import type { CorrectSettings, ConfigListEntry } from "@/app/types/payloads";
export const MOCK_USER_ID    = "mock-user-00000000-0000-0000-0000-000000000001";
export const MOCK_TENANT_ID  = "mock-tenant-0000-0000-0000-000000000001";
export const MOCK_USER_EMAIL = "demo@example.com";
export const MOCK_COLLECTIONS: Collection[] = [
  {
    name: "Company Knowledge Base",
    total: 1247,
    vectorizer: { fields: {}, global: { named_vector: "vector", vectorizer: "openai", model: "text-embedding-3-small" } },
    processed: true,
    prompts: [
      "What is the company refund policy?",
      "Summarise the onboarding process",
      "What are the product pricing tiers?",
      "Show me the most recent HR updates",
    ],
    metadata_json: JSON.stringify({
      record_count: 1247,
      source_files: ["company-handbook.pdf", "hr-policies-2025.pdf"],
      summary: "A comprehensive knowledge base covering HR policies, product documentation, and internal processes.",
    }),
  },
  {
    name: "Customer Support Tickets",
    total: 8392,
    vectorizer: { fields: {}, global: { named_vector: "vector", vectorizer: "local", model: "nomic-embed-text" } },
    processed: true,
    prompts: [
      "What are the most common support issues?",
      "Show me tickets about billing errors",
      "Which features do customers request most often?",
      "Which issues have the longest resolution time?",
    ],
    metadata_json: JSON.stringify({
      record_count: 8392,
      source_files: ["zendesk-export-2025-q1.csv"],
      summary: "Customer support ticket history from Q1 2025 including resolutions and sentiment.",
    }),
  },
  {
    name: "Product Research Notes",
    total: 234,
    vectorizer: { fields: {}, global: { named_vector: "vector", vectorizer: "openai", model: "text-embedding-3-large" } },
    processed: false,
    prompts: [],
    metadata_json: null,
  },
];
export const MOCK_CHAT_MESSAGES = [
  { id: "mock-msg-001", type: "human" as const, content: "What is the company remote work policy?" },
  { id: "mock-msg-002", type: "ai" as const, content: "Based on the **Company Knowledge Base**, employees are eligible for full remote work after completing their 90-day onboarding period.\n\n- Up to **3 days remote per week** for hybrid roles\n- **Fully remote** for roles designated as such\n\n> *Source: hr-policies-2025.pdf, p. 14*" },
  { id: "mock-msg-003", type: "human" as const, content: "What are the top 3 customer complaints this quarter?" },
  { id: "mock-msg-004", type: "ai" as const, content: "From the **Customer Support Tickets** collection (Q1 2025):\n\n1. **Billing discrepancies** - 23% of tickets (1,930 cases)\n2. **Login / authentication issues** - 18% of tickets (1,510 cases)\n3. **Slow export performance** - 11% of tickets (923 cases)\n\nAll three categories saw a 15% increase vs Q4 2024." },
];
export const MOCK_CONVERSATIONS = [
  { conversation_id: "mock-conv-001", name: "Remote work policy inquiry",  last_update_time: new Date(Date.now() - 1000*60*30).toISOString() },
  { conversation_id: "mock-conv-002", name: "Q1 support ticket analysis",  last_update_time: new Date(Date.now() - 1000*60*60*3).toISOString() },
  { conversation_id: "mock-conv-003", name: "Product roadmap discussion",  last_update_time: new Date(Date.now() - 1000*60*60*24).toISOString() },
];
const MOCK_SETTINGS: Settings = {
  API_KEYS: { openai: "sk-mock-redacted" },
  BASE_MODEL: "gpt-4o-mini", BASE_PROVIDER: "openai",
  COMPLEX_MODEL: "gpt-4o", COMPLEX_PROVIDER: "openai",
  CLOUD_BASE_PROVIDER: "openai", CLOUD_BASE_MODEL: "gpt-4o-mini",
  CLOUD_COMPLEX_PROVIDER: "openai", CLOUD_COMPLEX_MODEL: "gpt-4o",
  LOCAL_BASE_PROVIDER: "ollama", LOCAL_BASE_MODEL: "llama3.2:3b",
  LOCAL_COMPLEX_PROVIDER: "ollama", LOCAL_COMPLEX_MODEL: "qwen2.5:14b",
  LOCAL_MODEL_API_BASE: "http://localhost:11434",
  CLOUD_EMBED_PROVIDER: "openai", CLOUD_EMBED_MODEL: "text-embedding-3-small",
  LOCAL_EMBED_PROVIDER: "ollama", LOCAL_EMBED_MODEL: "nomic-embed-text",
  CLOUD_OCR_MODEL: null, LOCAL_OCR_MODEL: null,
  PROCESSING_MODE: "cloud",
  LOGGING_LEVEL: "INFO", LOGGING_LEVEL_INT: 2,
  MODEL_API_BASE: null, SETTINGS_ID: "mock-settings-001",
  USE_FEEDBACK: true,
  WCD_API_KEY: "", WCD_URL: "",
  WEAVIATE_IS_LOCAL: true, LOCAL_WEAVIATE_GRPC_PORT: 50051, LOCAL_WEAVIATE_PORT: 8080,
  WEAVIATE_IS_CUSTOM: false,
  CUSTOM_HTTP_HOST: "", CUSTOM_HTTP_PORT: 8080, CUSTOM_HTTP_SECURE: false,
  CUSTOM_GRPC_HOST: "", CUSTOM_GRPC_PORT: 50051, CUSTOM_GRPC_SECURE: false,
};
export const MOCK_USER_CONFIG: UserConfig = {
  backend: {
    name: "Default Config", style: "professional",
    agent_description: "An intelligent assistant that searches through your knowledge base to answer questions accurately and concisely.",
    end_goal: "Provide accurate, sourced answers from the organisation's data.",
    branch_initialisation: "Analyse the question and identify the best data source to query.",
    id: "mock-config-001", settings: MOCK_SETTINGS,
  } as BackendConfig,
  frontend: null,
};
export const MOCK_CONFIG_LIST: ConfigListEntry[] = [
  { config_id: "mock-config-001", name: "Default Config",  last_update_time: new Date(Date.now()-1000*60*60*24*2).toISOString(), default: true  },
  { config_id: "mock-config-002", name: "Research Mode",   last_update_time: new Date(Date.now()-1000*60*60*24*7).toISOString(), default: false },
];
export const MOCK_CORRECT_SETTINGS: CorrectSettings = {
  base_model: true, base_provider: true,
  complex_model: true, complex_provider: true,
  wcd_url: true, wcd_api_key: true,
};
export const MOCK_MODELS = {
  openai: {
    "gpt-4o":      { name: "GPT-4o",      api_keys: ["openai"], speed: "fast",      accuracy: "high"     },
    "gpt-4o-mini": { name: "GPT-4o Mini", api_keys: ["openai"], speed: "very fast", accuracy: "good"     },
  },
  ollama: {
    "llama3.2:3b": { name: "Llama 3.2 3B", api_keys: [], speed: "very fast", accuracy: "moderate" },
    "qwen2.5:14b": { name: "Qwen 2.5 14B", api_keys: [], speed: "moderate",  accuracy: "high"     },
  },
};
export const MOCK_FILES = [
  { id: "f1", name: "company-handbook.pdf",       size: 2400000,  status: "processed", created_at: new Date(Date.now()-1000*60*60*24*5).toISOString() },
  { id: "f2", name: "hr-policies-2025.pdf",        size: 980000,   status: "processed", created_at: new Date(Date.now()-1000*60*60*24*5).toISOString() },
  { id: "f3", name: "zendesk-export-2025-q1.csv",  size: 15000000, status: "processed", created_at: new Date(Date.now()-1000*60*60*24*3).toISOString() },
  { id: "f4", name: "product-research-notes.docx", size: 450000,   status: "pending",   created_at: new Date(Date.now()-1000*60*60*2).toISOString()    },
];
export const MOCK_FEEDBACK = [
  { id: "fb1", message_id: "mock-msg-002", value:  1, comment: "Very helpful answer",       created_at: new Date(Date.now()-1000*60*60*24).toISOString() },
  { id: "fb2", message_id: "mock-msg-004", value: -1, comment: "Could include more sources", created_at: new Date(Date.now()-1000*60*60*12).toISOString() },
];
export const MOCK_USER_SETTINGS = {
  id: "mock-usersettings-001",
  userId: MOCK_USER_ID,
  tenantId: MOCK_TENANT_ID,
  firstName: "Demo",
  lastName: "User",
  bio: "AI platform demo account",
  language: "en" as const,
  theme: "auto" as const,
  timezone: "UTC",
  emailNotifications: true,
  pushNotifications: false,
  digestFrequency: "weekly" as const,
  dataPrivacy: "normal" as const,
  shareAnalytics: false,
  reducedMotion: false,
  highContrast: false,
  fontSize: "normal" as const,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date(),
};

export const MOCK_ADMIN_SETTINGS = {
  id: "mock-adminsettings-001",
  tenantId: MOCK_TENANT_ID,
  tenantName: "Demo Organization",
  maxKnowledgeBaseSize: 10,
  maxUsersPerTenant: 50,
  maxCollectionsPerUser: 20,
  allowGuestAccess: false,
  requireMfa: false,
  sessionTimeoutMinutes: 480,
  dataRetentionDays: 365,
  complianceMode: "standard",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date(),
};

export const MOCK_OWNER_SETTINGS = {
  id: "mock-ownersettings-001",
  backendUrl: "http://localhost:3000",
  weaviateUrl: "http://localhost:8080",
  maxTenantsPerInstance: 100,
  enableMultiTenancy: true,
  defaultProcessingMode: "cloud",
  maintenanceMode: false,
  logLevel: "INFO",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date(),
};

export const MOCK_COLLECTION_METADATA = {
  error: null,
  metadata: {
    name: "Company Knowledge Base",
    summary: "A comprehensive knowledge base covering HR policies, product documentation, and internal processes.",
    length: 1247,
    fields: {
      content:  { type: "text",   groups: [{ value: "Sample content A" }, { value: "Sample content B" }], mean: 0, range: [0, 0] },
      title:    { type: "string", groups: [{ value: "Handbook"          }, { value: "HR Policy"        }], mean: 0, range: [0, 0] },
      source:   { type: "string", groups: [{ value: "company-handbook.pdf" }],                             mean: 0, range: [0, 0] },
    },
    mappings: {
      document: { title: "title", content: "content", source: "source" },
    },
    field_display_types: {
      content: "text",
      title:   "string",
      source:  "string",
    },
    named_vectors: [
      { name: "vector", description: "Main semantic embedding vector", enabled: true },
    ],
    vectorizer: {
      vectorizer: "openai",
      model:      "text-embedding-3-small",
    },
  },
};

export const MOCK_MAPPING_TYPES = [
  { name: "document",  description: "Generic document - PDFs, Word files, text files", fields: { title: "string", content: "text", source: "string"                             } },
  { name: "ticket",    description: "Support or task ticket",                           fields: { title: "string", content: "text", status: "string", priority: "string"         } },
  { name: "message",   description: "Chat or email message",                            fields: { author: "string", content: "text", timestamp: "date"                           } },
  { name: "ecommerce", description: "Product or order record",                          fields: { name: "string", description: "text", price: "number", category: "string"       } },
];
