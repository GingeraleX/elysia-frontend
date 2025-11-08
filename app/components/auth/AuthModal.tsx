"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/components/contexts/AuthContext";
import { FEATURE_FLAGS } from "@/lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Unified Auth Modal
 * Handles login, registration, and guest mode - all in one place
 * No page navigation required
 * 
 * Features:
 * - Uses ENABLE_ANIMATIONS flag for transitions
 * - Uses ENABLE_EFFECTS flag for shadows and visual effects
 */
export function AuthModal() {
  const { login, register, continueAsGuest, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(loginData.email, loginData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      await register(
        registerData.email,
        registerData.password,
        registerData.companyName
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleGuestClick = () => {
    setError(null);
    continueAsGuest();
  };

  return (
    <div className={`flex items-center justify-center min-h-screen px-4 ${
      FEATURE_FLAGS.ENABLE_ANIMATIONS ? "transition-all duration-300" : ""
    }`}>
      <Card className={`w-full max-w-md ${
        FEATURE_FLAGS.ENABLE_EFFECTS ? "shadow-2xl" : "shadow-md"
      } ${
        FEATURE_FLAGS.ENABLE_ANIMATIONS ? "animate-in fade-in zoom-in duration-300" : ""
      }`}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Elysia</CardTitle>
          <CardDescription>AI-powered platform with multi-tenant support</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className={`mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 ${
              FEATURE_FLAGS.ENABLE_ANIMATIONS ? "animate-in shake" : ""
            }`}>
              {error}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="mt-6 space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="mt-6 space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company Name (Optional)</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Your company"
                    value={registerData.companyName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        companyName: e.target.value,
                      })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Guest Continue Button */}
          <div className="mt-6 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleGuestClick}
              disabled={isLoading}
              className="w-full"
            >
              Continue as Guest
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Limited features available in guest mode
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

