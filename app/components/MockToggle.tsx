"use client";
// frontend/app/components/MockToggle.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Floating mock-mode toggle — only renders when NEXT_PUBLIC_MOCK_MODE is set.
// When active, overrides window.fetch globally so ALL API calls (including raw
// fetch in app/api/*.ts) are intercepted — no backend required.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { handleMockRequest } from "@/lib/mock-handlers";
import { MOCK_USER_ID, MOCK_TENANT_ID } from "@/lib/mock-data";

const LS_KEY = "mockMode";

// Full session data written to localStorage when mock mode is enabled
const MOCK_SESSION = {
  auth_token:  "mock.jwt.token",
  user_id:     MOCK_USER_ID,
  user_email:  "demo@example.com",
  user_role:   "ADMIN",
  tenant_id:   MOCK_TENANT_ID,
  tenant_name: "Demo Organization",
};

// ── Early fetch override ─────────────────────────────────────────────────────
// Installed at MODULE-LOAD TIME so it is in place before any component mounts.
// This prevents the race condition where SessionContext.initUser() fires its
// raw fetch() before MockToggle's useEffect has had a chance to install the
// override — which caused "Failed to initialize user" error toasts on every load.
// Only activates when both the env flag AND the localStorage toggle are set.
function makeMockFetch(original: typeof fetch): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let endpoint: string;
    try {
      const urlStr =
        typeof input === "string" ? input
        : input instanceof URL    ? input.href
        : (input as Request).url;
      const parsed = new URL(urlStr, window.location.href);
      endpoint = parsed.pathname + parsed.search;
    } catch {
      endpoint = typeof input === "string" ? input : "";
    }
    const method =
      init?.method ||
      (typeof input !== "string" && !(input instanceof URL)
        ? (input as Request).method : "GET") || "GET";
    let body: unknown;
    if (init?.body) {
      try { body = JSON.parse(init.body as string); } catch { body = init.body; }
    }
    const data = await handleMockRequest(endpoint, method, body);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}

if (
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_MOCK_MODE === "true" &&
  localStorage.getItem(LS_KEY) === "true"
) {
  window.fetch = makeMockFetch(window.fetch);
}
// ─────────────────────────────────────────────────────────────────────────────

export function MockToggle() {
  // If the feature flag env var is absent, this component is invisible.
  // In production builds without NEXT_PUBLIC_MOCK_MODE, this returns null.
  if (process.env.NEXT_PUBLIC_MOCK_MODE !== "true") return null;

  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setActive(localStorage.getItem(LS_KEY) === "true");
    setMounted(true);
  }, []);

  // ── Keep override in sync if toggle changes at runtime ──────────────────
  // (Module-level already handles the initial install; this handles the case
  //  where someone toggles mock on/off without a full reload in future.)
  useEffect(() => {
    if (!active) return;
    const orig = window.fetch;
    window.fetch = makeMockFetch(orig);
    return () => { window.fetch = orig; };
  }, [active]);

  if (!mounted) return null;

  const toggle = () => {
    const next = !active;
    if (next) {
      localStorage.setItem(LS_KEY, "true");
      // Seed a complete session so AuthContext + SessionContext both
      // read the mock user immediately — no login step required.
      Object.entries(MOCK_SESSION).forEach(([k, v]) => localStorage.setItem(k, v));
      // Remove guest_mode: we're acting as a logged-in ADMIN, not a guest
      localStorage.removeItem("guest_mode");
    } else {
      localStorage.removeItem(LS_KEY);
      Object.keys(MOCK_SESSION).forEach((k) => localStorage.removeItem(k));
      localStorage.removeItem("guest_mode");
    }
    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      title={active ? "Mock mode ON — click to disable" : "Mock mode OFF — click to enable"}
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: 600,
        fontFamily: "monospace",
        letterSpacing: "0.05em",
        cursor: "pointer",
        border: "1.5px solid",
        transition: "all 0.15s ease",
        // Inline styles so this works regardless of Tailwind purge settings
        backgroundColor: active ? "#16a34a" : "#1e293b",
        borderColor: active ? "#22c55e" : "#475569",
        color: active ? "#dcfce7" : "#94a3b8",
        boxShadow: active
          ? "0 0 0 3px rgba(34,197,94,0.25)"
          : "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      <span>{active ? "🟢" : "⚫"}</span>
      <span>MOCK {active ? "ON" : "OFF"}</span>
    </button>
  );
}
