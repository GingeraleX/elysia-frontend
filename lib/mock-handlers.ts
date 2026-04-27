// frontend/lib/mock-handlers.ts
// ─────────────────────────────────────────────────────────────────────────────
// Intercepts fetch requests and returns fixture data.
// Patterns must match the actual URLs used in app/api/*.ts.
// ─────────────────────────────────────────────────────────────────────────────

import {
  MOCK_COLLECTIONS, MOCK_CONVERSATIONS, MOCK_USER_CONFIG,
  MOCK_CONFIG_LIST, MOCK_CORRECT_SETTINGS, MOCK_MODELS,
  MOCK_USER_ID, MOCK_TENANT_ID, MOCK_FILES, MOCK_FEEDBACK,
  MOCK_MAPPING_TYPES, MOCK_CHAT_MESSAGES,
  MOCK_USER_SETTINGS, MOCK_ADMIN_SETTINGS, MOCK_OWNER_SETTINGS,
  MOCK_COLLECTION_METADATA,
} from "./mock-data";

// Mock conversation rebuild messages (role/content format the backend returns)
const MOCK_CONVERSATION_REBUILD: Record<string, Array<{ role: "user" | "assistant"; content: string; query_id: string }>> = {
  "mock-conv-001": [
    { role: "user",      content: "What is the company remote work policy?",                    query_id: "mock-qid-001" },
    { role: "assistant", content: "Based on the **Company Knowledge Base**, employees are eligible for full remote work after completing their 90-day onboarding period.\n\n- Up to **3 days remote per week** for hybrid roles\n- **Fully remote** for roles designated as such\n\n> *Source: hr-policies-2025.pdf, p. 14*", query_id: "mock-qid-001" },
  ],
  "mock-conv-002": [
    { role: "user",      content: "What are the top 3 customer complaints this quarter?",      query_id: "mock-qid-002" },
    { role: "assistant", content: "From the **Customer Support Tickets** collection (Q1 2025):\n\n1. **Billing discrepancies** – 23% of tickets (1,930 cases)\n2. **Login / authentication issues** – 18% of tickets (1,510 cases)\n3. **Slow export performance** – 11% of tickets (923 cases)\n\nAll three categories saw a 15% increase vs Q4 2024.", query_id: "mock-qid-002" },
  ],
  "mock-conv-003": [
    { role: "user",      content: "What features are planned for the next release?",            query_id: "mock-qid-003" },
    { role: "assistant", content: "According to the **Product Research Notes**, the next release (v2.4) is planned to include:\n\n1. **Bulk export** — CSV and PDF\n2. **Advanced filtering** — multi-field, saved filters\n3. **API rate-limit dashboard** — real-time usage\n\n*Note: This collection has not been fully analysed yet.*", query_id: "mock-qid-003" },
  ],
};

// Mock collection records for the data table view
const MOCK_COLLECTION_RECORDS: Record<string, { properties: Record<string, string>; items: Record<string, string>[] }> = {
  "Company Knowledge Base": {
    properties: { title: "string", content: "text", source: "string" },
    items: Array.from({ length: 20 }, (_, i) => ({
      title:   i % 2 === 0 ? "Company Handbook" : "HR Policy 2025",
      content: `This is a sample document excerpt number ${i + 1}. It contains policy text and guidelines for employees.`,
      source:  i % 2 === 0 ? "company-handbook.pdf" : "hr-policies-2025.pdf",
    })),
  },
  "Customer Support Tickets": {
    properties: { title: "string", content: "text", status: "string", priority: "string" },
    items: Array.from({ length: 20 }, (_, i) => ({
      title:    `Ticket #${10000 + i}: ${["Billing issue", "Login problem", "Export slow", "Feature request", "Bug report"][i % 5]}`,
      content:  `Customer reported: ${["Charged twice for subscription.", "Cannot log in after password reset.", "CSV export takes >5 minutes.", "Please add dark mode.", "App crashes on mobile."][i % 5]}`,
      status:   ["open", "resolved", "in_progress", "closed"][i % 4],
      priority: ["low", "medium", "high", "critical"][i % 4],
    })),
  },
  "Product Research Notes": {
    properties: { title: "string", content: "text" },
    items: Array.from({ length: 5 }, (_, i) => ({
      title:   `Research Note ${i + 1}`,
      content: `Preliminary research note ${i + 1} — awaiting analysis.`,
    })),
  },
};

// Simulates network latency so the UI loading states are visible
const delay = (ms = 150) => new Promise((res) => setTimeout(res, ms));

export async function handleMockRequest(endpoint: string, method: string, body?: unknown): Promise<unknown> {
  await delay();
  const m = method.toUpperCase();

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (endpoint.includes("/auth/login")) {
    return {
      access_token: "mock.jwt.token",
      user: { id: MOCK_USER_ID, email: "demo@example.com", role: "ADMIN", tenantId: MOCK_TENANT_ID, tenantName: "Demo Organization" },
    };
  }
  if (endpoint.includes("/auth/register")) return { success: true };
  if (endpoint.includes("/auth/me")) {
    return { id: MOCK_USER_ID, email: "demo@example.com", role: "ADMIN", tenantId: MOCK_TENANT_ID };
  }

  // ── User init — POST /init/user/:id ───────────────────────────────────────
  if (endpoint.includes("/init/user/")) {
    return {
      user_exists: true,
      config: MOCK_USER_CONFIG.backend,
      frontend_config: MOCK_USER_CONFIG.frontend,
      correct_settings: MOCK_CORRECT_SETTINGS,
      error: null,
    };
  }

  // ── Collection metadata — GET /collections/:id/metadata/:name ────────────
  if (endpoint.includes("/collections/") && endpoint.includes("/metadata/")) {
    return MOCK_COLLECTION_METADATA;
  }

  // ── Collection data view — POST /collections/:id/view/:name ─────────────
  if (endpoint.includes("/collections/") && endpoint.includes("/view/")) {
    const collectionName = decodeURIComponent(endpoint.split("/view/")[1]);
    const records = MOCK_COLLECTION_RECORDS[collectionName] ?? { properties: {}, items: [] };
    return { ...records, error: null };
  }

  // ── Collections — /collections/:id/list and /collections/mapping_types ────
  if (endpoint.includes("/collections/mapping_types")) {
    return { mapping_types: MOCK_MAPPING_TYPES, error: null };
  }
  if (endpoint.includes("/collections/") && endpoint.includes("/list")) {
    return { collections: MOCK_COLLECTIONS, error: null };
  }
  if (endpoint.includes("/collections") && m === "POST") {
    return { success: true, error: null };
  }
  if (endpoint.includes("/collections") && m === "DELETE") {
    return { success: true, error: null };
  }

  // ── Config list — GET /user/config/:id/list ───────────────────────────────
  if (endpoint.includes("/user/config/") && endpoint.endsWith("/list")) {
    return { configs: MOCK_CONFIG_LIST, warnings: [], error: null };
  }

  // ── Config models — GET /user/config/models ───────────────────────────────
  if (endpoint.includes("/user/config/models")) {
    return { models: MOCK_MODELS, error: null };
  }

  // ── Config load — POST /user/config/:userId/:configId/load ────────────────
  if (endpoint.includes("/user/config/") && endpoint.endsWith("/load")) {
    return { config: MOCK_USER_CONFIG.backend, frontend_config: MOCK_USER_CONFIG.frontend, warnings: [], error: null };
  }

  // ── Config new — POST /user/config/:id/new ────────────────────────────────
  if (endpoint.includes("/user/config/") && endpoint.endsWith("/new")) {
    return { config: MOCK_USER_CONFIG.backend, frontend_config: MOCK_USER_CONFIG.frontend, warnings: [], error: null };
  }

  // ── Config CRUD — /user/config/:userId/:configId ──────────────────────────
  if (endpoint.includes("/user/config/")) {
    if (m === "GET")    return { config: MOCK_USER_CONFIG.backend, frontend_config: MOCK_USER_CONFIG.frontend, error: null };
    if (m === "POST" || m === "PUT" || m === "PATCH")
      return { config: MOCK_USER_CONFIG.backend, frontend_config: MOCK_USER_CONFIG.frontend, warnings: [], error: null };
    if (m === "DELETE") return { success: true, error: null };
  }

  // ── Conversation load — GET /db/:id/load_tree/:conversationId ───────────
  if (endpoint.includes("/load_tree/")) {
    const convId = endpoint.split("/load_tree/")[1];
    const rebuild = MOCK_CONVERSATION_REBUILD[convId] ?? [];
    return { rebuild, error: null };
  }


  // ── Conversations — /db/:id/saved_trees ───────────────────────────────────
  if (endpoint.includes("/saved_trees") && m === "GET") {
    // ConversationContext reads data.trees as Record<id, {title, last_update_time}>
    return {
      trees: Object.fromEntries(
        MOCK_CONVERSATIONS.map((c) => [
          c.conversation_id,
          { title: c.name, last_update_time: c.last_update_time },
        ])
      ),
      error: null,
    };
  }
  if (endpoint.includes("/saved_trees") && m === "POST") {
    return { tree_id: "mock-tree-" + Date.now(), error: null };
  }
  if (endpoint.includes("/saved_trees")) {
    return { success: true, error: null };
  }

  // ── Suggestions ───────────────────────────────────────────────────────────
  if (endpoint.includes("/follow_up_suggestions") || endpoint.includes("/suggestions")) {
    return { suggestions: ["What is the remote work policy?", "Show top support issues", "Summarize Q1 data"], error: null };
  }

  // ── Feedback ─────────────────────────────────────────────────────────────
  if (endpoint.includes("/feedback/remove") && m === "POST") {
    return { success: true, error: null };
  }
  if (endpoint.includes("/feedback")) {
    return { feedback: MOCK_FEEDBACK, error: null };
  }

  // ── File records ─────────────────────────────────────────────────────────
  if (endpoint.includes("/api/files/records") || endpoint.includes("/api/files/download")) {
    return { files: MOCK_FILES, error: null };
  }

  // ── Model status — GET /api/custom/model-status ──────────────────────────
  if (endpoint.includes("/api/custom/model-status")) {
    return {
      mode: "cloud",
      stack_mode: "conversation",
      ready: true,
      scripts_configured: false,
      swap_configured: false,
      router_control_configured: false,
      router_reachable: false,
      slots: {
        base:      { ready: true, model: "gpt-4o-mini",             provider: "openai" },
        complex:   { ready: true, model: "gpt-4o",                  provider: "openai" },
        embedding: { ready: true, model: "text-embedding-3-small",  provider: "openai" },
      },
    };
  }

  // ── Mode / stack-mode ─────────────────────────────────────────────────────
  if (endpoint.includes("/api/custom/mode-status") || endpoint.includes("/api/custom/stack-mode")) {
    return { mode: "cloud", stack_mode: false, error: null };
  }
  if (endpoint.includes("/api/custom/toggle-mode") || endpoint.includes("/api/custom/apply-model-config")) {
    return { success: true, mode: "cloud", error: null };
  }
  if (endpoint.includes("/api/default_config")) {
    return { success: true, error: null };
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  if (endpoint.includes("/settings/owner")) {
    if (m === "GET")  return MOCK_OWNER_SETTINGS;
    return { ...MOCK_OWNER_SETTINGS, ...(body as object || {}) };
  }
  if (endpoint.includes("/settings/admin/")) {
    if (m === "GET")  return MOCK_ADMIN_SETTINGS;
    return { ...MOCK_ADMIN_SETTINGS, ...(body as object || {}) };
  }
  if (endpoint.includes("/settings/user/")) {
    if (m === "GET")  return MOCK_USER_SETTINGS;
    return { ...MOCK_USER_SETTINGS, ...(body as object || {}) };
  }

  // ── Catch-all ─────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.warn(`[MockHandler] Unhandled: ${m} ${endpoint} — returning empty success`);
  }
  return { error: null };
}
