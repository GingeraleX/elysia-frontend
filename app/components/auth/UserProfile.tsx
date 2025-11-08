"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/components/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

/**
 * User Profile Component - Minimal sleek profile menu
 * Shows user email/avatar in top-right corner
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
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer border border-blue-400/30"
        title={user ? user.email : "Guest Mode"}
      >
        {initials}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
          {/* User Info */}
          <div className="p-4 border-b border-slate-700">
            <p className="text-xs text-gray-400">
              {isGuest ? "Guest Mode" : "Logged In"}
            </p>
            <p className="text-sm font-medium text-white truncate">
              {user?.email || "Guest"}
            </p>
            {user?.role && (
              <p className="text-xs text-blue-400 mt-1 capitalize">
                {user.role.toLowerCase()}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {user && (
              <>
                <button
                  onClick={() => {
                    // TODO: Navigate to settings
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-800 text-sm text-gray-300 hover:text-white transition-colors"
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
              className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-red-900/20 text-sm text-red-400 hover:text-red-300 transition-colors"
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

