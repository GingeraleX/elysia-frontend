"use client";

import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/components/contexts/AuthContext";
import { ToastContext } from "@/app/components/contexts/ToastContext";
import { FEATURE_FLAGS } from "@/lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Unified Auth Modal
 * Handles login, registration, and guest mode - all in one place
 * Uses ToastContext for error display
 * CSS fade-in animations for smooth transitions
 */
export function AuthModal() {
  const { login, register, continueAsGuest, isLoading } = useAuth();
  const { showErrorToast } = useContext(ToastContext);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

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

    try {
      await login(loginData.email, loginData.password);
      // Clear form on successful login
      setLoginData({ email: "", password: "" });
    } catch (err) {
      // Extract error message from ApiError or Error object
      const errorMessage = err instanceof Error ? err.message : String(err);
      showErrorToast("Accesso non riuscito", errorMessage);
      console.error("[AuthModal] Login error:", err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      showErrorToast("Errore di validazione", "Le password non coincidono");
      return;
    }

    try {
      await register(
        registerData.email,
        registerData.password,
        registerData.companyName
      );
      // Clear form on successful registration
      setRegisterData({ email: "", password: "", confirmPassword: "", companyName: "" });
    } catch (err) {
      // Extract error message from ApiError or Error object
      const errorMessage = err instanceof Error ? err.message : String(err);
      showErrorToast("Registrazione non riuscita", errorMessage);
      console.error("[AuthModal] Register error:", err);
    }
  };

  const handleGuestClick = () => {
    continueAsGuest();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 fade-in text-primary">
      <motion.div
        className="w-full max-w-sm md:max-w-md lg:max-w-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Card className="w-full bg-foreground border-border">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center">
                <span className="text-background font-bold">E</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Elysia</CardTitle>
            <CardDescription className="text-secondary">
              {activeTab === "login" ? "Accedi al tuo account" : "Crea il tuo account"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tab Selector with smooth transitions */}
            <div className="grid grid-cols-2 gap-1 bg-background_alt rounded-lg p-1 border border-border">
              <motion.button
                onClick={() => setActiveTab("login")}
                className={`py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "login"
                    ? "text-primary bg-accent/20"
                    : "text-secondary hover:text-primary"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                Accedi
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("register")}
                className={`py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === "register"
                    ? "text-primary bg-accent/20"
                    : "text-secondary hover:text-primary"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                Registrati
              </motion.button>
            </div>

            {/* Animated Form Container */}
            <AnimatePresence mode="wait">
              {activeTab === "login" ? (
                <motion.form
                  key="login"
                  onSubmit={handleLogin}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-primary">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      disabled={isLoading}
                      className="bg-background_alt border-border text-primary placeholder:text-secondary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-primary">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      disabled={isLoading}
                      className="bg-background_alt border-border text-primary placeholder:text-secondary"
                      required
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-highlight text-background mt-6">
                      {isLoading ? "Accesso in corso..." : "Accedi"}
                    </Button>
                  </motion.div>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  onSubmit={handleRegister}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-primary">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      disabled={isLoading}
                      className="bg-background_alt border-border text-primary placeholder:text-secondary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-primary">Nome azienda (opzionale)</Label>
                    <Input
                      id="company"
                      type="text"
                      placeholder="La tua azienda"
                      value={registerData.companyName}
                      onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                      disabled={isLoading}
                      className="bg-background_alt border-border text-primary placeholder:text-secondary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-primary">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      disabled={isLoading}
                      className="bg-background_alt border-border text-primary placeholder:text-secondary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-primary">Conferma password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      disabled={isLoading}
                      className="bg-background_alt border-border text-primary placeholder:text-secondary"
                      required
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-highlight text-background mt-6">
                      {isLoading ? "Creazione account..." : "Crea account"}
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Guest Continue Button */}
            <motion.div
              className="mt-6 pt-6 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  onClick={handleGuestClick}
                  disabled={isLoading}
                  className="w-full text-secondary hover:text-primary hover:bg-foreground_alt"
                >
                  Continua come ospite
                </Button>
              </motion.div>
              <p className="text-xs text-secondary text-center mt-3 opacity-75">
                Funzionalità limitate in modalità ospite
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
