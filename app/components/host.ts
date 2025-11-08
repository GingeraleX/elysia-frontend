"use client";

/**
 * Configuration for backend connectivity
 * Uses environment variables for flexibility across environments
 */

// Parse backend URL from environment, fallback to localhost:3000
const getBackendUrl = (): string => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl !== "") {
    return backendUrl;
  }
  // Fallback for development
  return "http://localhost:3000";
};

// Parse WebSocket protocol from backend URL
const getWebSocketProtocol = (): string => {
  if (typeof window === "undefined") return "ws";
  const backendUrl = getBackendUrl();
  if (backendUrl.startsWith("https")) return "wss";
  return "ws";
};

// Parse host from backend URL
const getHostFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.host;
  } catch {
    // Fallback if URL parsing fails
    return "localhost:3000";
  }
};

export const host = process.env.NEXT_PUBLIC_IS_STATIC !== "true" ? getBackendUrl() : "";

export const public_path =
  process.env.NEXT_PUBLIC_IS_STATIC !== "true" ? "/" : "/static/";

export const getWebsocketHost = () => {
  if (process.env.NEXT_PUBLIC_IS_STATIC === "true") {
    // If serving directly through backend, use current location
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const current_host = window.location.host;
    return `${protocol}//${current_host}/ws/`;
  }
  
  // Use configured backend URL
  const backendUrl = getBackendUrl();
  const protocol = getWebSocketProtocol();
  const host = getHostFromUrl(backendUrl);
  return `${protocol}://${host}/ws/`;
};
