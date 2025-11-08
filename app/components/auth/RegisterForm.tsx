﻿"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiClient, ApiError } from "@/lib/api-client";

interface RegisterResponse {
  message: string;
  tenant_id: string;
  user_id: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    company_name: "",
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
      const registerResponse = await apiClient.request<RegisterResponse>("/auth/register", {
        method: "POST",
        body: formData,
      });

      // After registration, auto-login the user by getting a token
      try {
        const loginResponse = await apiClient.request<any>("/auth/login", {
          method: "POST",
          body: {
            email: formData.email,
            password: formData.password,
          },
        });

        if (loginResponse.access_token) {
          localStorage.setItem("auth_token", loginResponse.access_token);
          localStorage.setItem("user_id", registerResponse.user_id);
          localStorage.setItem("tenant_id", registerResponse.tenant_id);
          localStorage.setItem("user_role", "ADMIN"); // First user is admin
          
          apiClient.setAuthToken(loginResponse.access_token);

          // Initialize user in UserManager backend
          try {
            await apiClient.request("/init/user/" + registerResponse.user_id, {
              method: "POST",
            });
            console.log("New user initialized in backend");
          } catch (initError) {
            console.warn("Init endpoint warning (non-blocking):", initError);
          }

          // Redirect to dashboard
          router.push("/dashboard");
        }
      } catch (loginError) {
        // Registration succeeded but auto-login failed, redirect to manual login
        console.warn("Auto-login after registration failed, redirecting to login page", loginError);
        router.push("/login");
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
          Create an account
        </CardTitle>
        <CardDescription>
          Enter your email and password to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              name="company_name"
              type="text"
              value={formData.company_name}
              onChange={handleInputChange("company_name")}
              placeholder="Your company name (optional)"
              disabled={loading}
            />
          </div>

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
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
              disabled={loading}
              minLength={6}
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
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link 
            href="/login" 
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

