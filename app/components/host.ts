"use client";

/**
 * Backend connectivity — three modes:
 *
 * PROXY_MODE  (NEXT_PUBLIC_PROXY_MODE=true)       ← Docker/nginx deploy
 *   HTTP API calls → "" (same-origin, nginx routes to backend:3000)
 *   WebSocket      → ws(s)://window.location.host/ws/
 *   Works with cloudflared, .local, direct IP — no URL baked in.
 *
 * DIRECT MODE (NEXT_PUBLIC_BACKEND_URL=http://...) ← local dev / run.ps1
 *   Both HTTP and WS use the explicit configured URL.
 *
 * STATIC MODE (NEXT_PUBLIC_IS_STATIC=true)         ← legacy static export
 *   HTTP → "" (same-origin), WS → window.location.host
 */
const IS_PROXY_MODE = process.env.NEXT_PUBLIC_PROXY_MODE === "true";

const getBackendUrl = (): string => {
  if (IS_PROXY_MODE) return "";   // same-origin — nginx proxies to backend
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl !== "") return backendUrl;
  return "http://localhost:3000"; // dev fallback
};

const getWebSocketProtocol = (): string => {
  if (typeof window === "undefined") return "ws";
  return getBackendUrl().startsWith("https") ? "wss" : "ws";
};

const getHostFromUrl = (url: string): string => {
  try { return new URL(url).host; }
  catch { return "localhost:3000"; }
};

// `host` is prepended to every API fetch call.
// In proxy mode it is "" so calls become relative paths that nginx routes.
export const host =
  IS_PROXY_MODE
    ? ""
    : process.env.NEXT_PUBLIC_IS_STATIC !== "true"
      ? getBackendUrl()
      : "";

export const public_path =
  process.env.NEXT_PUBLIC_IS_STATIC !== "true" ? "/" : "/static/";

// WebSocket base URL — called client-side only.
export const getWebsocketHost = () => {
  // In proxy or static mode: derive from the current browser location so
  // the same image works behind cloudflared, .local, or a direct IP.
  if (process.env.NEXT_PUBLIC_IS_STATIC === "true" || IS_PROXY_MODE) {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}/ws/`;
  }
  // Direct mode: use explicitly configured backend URL.
  const url = getBackendUrl();
  return `${getWebSocketProtocol()}://${getHostFromUrl(url)}/ws/`;
};
