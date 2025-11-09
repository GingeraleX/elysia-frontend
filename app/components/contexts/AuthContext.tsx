﻿﻿"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, companyName?: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const guestMode = localStorage.getItem("guest_mode");

    if (guestMode === "true") {
      setIsGuest(true);
      setIsLoading(false);
    } else if (token) {
      // User is logged in
      const userData = {
        id: localStorage.getItem("user_id") || "",
        email: localStorage.getItem("user_email") || "",
        role: localStorage.getItem("user_role") || "MEMBER",
        tenantId: localStorage.getItem("tenant_id") || "",
        tenantName: localStorage.getItem("tenant_name"),
      };
      setUser(userData);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.request<any>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (response.access_token) {
        localStorage.setItem("auth_token", response.access_token);
        localStorage.setItem("user_id", response.user.id);
        localStorage.setItem("user_email", response.user.email);
        localStorage.setItem("user_role", response.user.role);
        localStorage.setItem("tenant_id", response.user.tenantId);
        localStorage.setItem("tenant_name", response.user.tenantName || "");
        localStorage.removeItem("guest_mode");

        apiClient.setAuthToken(response.access_token);

        setUser(response.user);
        setIsGuest(false);

        // Soft redirect to chat page (no full reload)
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", "/?page=chat");
        }
      }
    } catch (error) {
      // Re-throw error so AuthModal can catch it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    companyName?: string
  ) => {
    setIsLoading(true);
    try {
      await apiClient.request<any>("/auth/register", {
        method: "POST",
        body: { email, password, company_name: companyName },
      });

      // After registration, auto-login
      await login(email, password);
    } catch (error) {
      // Re-throw error so AuthModal can catch it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    localStorage.removeItem("tenant_id");
    localStorage.removeItem("tenant_name");
    localStorage.removeItem("guest_mode");
    apiClient.clearAuthToken();
    setUser(null);
    setIsGuest(false);
    
    // Soft redirect to landing page (no full reload)
    if (typeof window !== "undefined") {
      // Use history.replaceState to not do a full page reload
      window.history.replaceState(null, "", "/");
    }
  };

  const continueAsGuest = () => {
    localStorage.setItem("guest_mode", "true");
    setIsGuest(true);
    
    // Soft redirect to chat page (no full reload)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/?page=chat");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest,
        login,
        register,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

