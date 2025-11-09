﻿"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/components/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

/**
 * User Profile Component - Elysia styled profile menu
 * Shows user email/avatar in top-right corner using design system colors
 * Provides logout and settings access
 */
export function UserProfile() {
  const { user, isGuest, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user && !isGuest) {
    return null;
  }

  // Generate avatar initials
  const initials = user
    ? user.email.substring(0, 2).toUpperCase()
    : "GU";

  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      {/* Avatar Button - Elysia neon accent gradient */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center text-background font-semibold text-sm hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 cursor-pointer border border-accent/30 scale-100 hover:scale-105 active:scale-95"
        title={user ? user.email : "Guest Mode"}
      >
        {initials}
      </button>

      {/* Dropdown Menu - Elysia style popup */}
      {isOpen && (
        <div className="absolute top-12 right-0 mt-2 w-56 bg-foreground border border-border rounded-lg shadow-lg overflow-hidden fade-in">
          {/* User Info Section */}
          <div className="p-4 border-b border-border">
            <p className="text-xs text-secondary">
              {isGuest ? "Guest Mode" : "Logged In"}
            </p>
            <p className="text-sm font-medium text-primary truncate mt-1">
              {user?.email || "Guest"}
            </p>
            {user?.role && (
              <p className="text-xs text-accent mt-2 capitalize">
                {user.role.toLowerCase()}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-1">
            {user && (
              <>
                <button
                  onClick={() => {
                    // TODO: Navigate to settings
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-background_alt text-sm text-secondary hover:text-primary transition-colors duration-200"
                >
                  <Settings size={16} />
                  Settings
                </button>
              </>
            )}

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-background_error/20 text-sm text-error hover:text-error transition-colors duration-200"
            >
              <LogOut size={16} />
              {isGuest ? "Exit Guest Mode" : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

