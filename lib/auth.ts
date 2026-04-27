import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Utility to check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const token = localStorage.getItem("auth_token");
    return !!token;
  } catch {
    return false;
  }
}

/**
 * Get stored user information
 */
export function getUserInfo() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return {
      id: localStorage.getItem("user_id"),
      tenantId: localStorage.getItem("tenant_id"),
      role: localStorage.getItem("user_role"),
    };
  } catch {
    return null;
  }
}

/**
 * Clear authentication state (logout)
 */
export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("user_role");
  } catch {
    // localStorage might not be available
  }
}

