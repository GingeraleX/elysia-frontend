﻿"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiClient, ApiError } from "@/lib/api-client";

interface LoginResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiClient.request<LoginResponse>("/auth/login", {
        method: "POST",
        body: formData,
      });

      // Store JWT token in localStorage
      if (response.access_token) {
        localStorage.setItem("auth_token", response.access_token);
        localStorage.setItem("user_id", response.user.id);
        localStorage.setItem("tenant_id", response.user.tenantId);
        localStorage.setItem("user_role", response.user.role);

        // Update API client to include token in future requests
        apiClient.setAuthToken(response.access_token);

        // Initialize user in UserManager backend (creates user config/tree manager)
        try {
          const initResponse = await apiClient.request("/init/user/" + response.user.id, {
            method: "POST",
          });
          console.log("User initialized in backend:", initResponse);
        } catch (initError) {
          console.warn("User initialization succeeded but optional init endpoint call failed:", initError);
          // Don't block login if init fails, it might already be initialized
        }

        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange("password")}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 px-3 py-2">
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !formData.email || !formData.password} 
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link 
            href="/register" 
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

