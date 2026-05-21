"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/components/contexts/AuthContext";
import { Camera, KeyRound, LogOut, UserPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastContext } from "@/app/components/contexts/ToastContext";

/**
 * User Profile Component - Elysia styled profile menu
 * Shows user email/avatar using design system colors
 * Provides logout and settings access
 */
export function UserProfile({
  inline = false,
  variant = "avatar",
}: {
  inline?: boolean;
  variant?: "avatar" | "sidebar";
}) {
  const { user, isGuest, logout } = useAuth();
  const { showErrorToast, showSuccessToast } = useContext(ToastContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [draftDisplayName, setDraftDisplayName] = useState("");
  const [draftAvatarPreview, setDraftAvatarPreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Generate avatar initials
  const initials = user
    ? (displayName || user.email).substring(0, 2).toUpperCase()
    : "GU";
  const defaultName = user?.email?.split("@")[0] || "Ospite";
  const label = displayName || defaultName;
  const subtitle = user?.email || "Modalità ospite";
  const profileStorageKey = user?.id
    ? `elysia_profile_${user.id}`
    : "elysia_profile_guest";
  const menuPosition =
    variant === "sidebar"
      ? "absolute bottom-12 left-0 mb-1 w-full min-w-56"
      : "absolute top-11 right-0 mt-1 w-56";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawProfile = localStorage.getItem(profileStorageKey);
    if (!rawProfile) {
      setDisplayName(defaultName);
      setAvatarPreview(null);
      setDraftDisplayName(defaultName);
      setDraftAvatarPreview(null);
      return;
    }

    try {
      const profile = JSON.parse(rawProfile) as {
        displayName?: string;
        avatar?: string | null;
      };
      setDisplayName(profile.displayName || defaultName);
      setAvatarPreview(profile.avatar || null);
      setDraftDisplayName(profile.displayName || defaultName);
      setDraftAvatarPreview(profile.avatar || null);
    } catch {
      setDisplayName(defaultName);
      setAvatarPreview(null);
      setDraftDisplayName(defaultName);
      setDraftAvatarPreview(null);
    }
  }, [defaultName, profileStorageKey]);

  if (!user && !isGuest) {
    return null;
  }

  const renderAvatar = (
    size: "sm" | "lg" = "sm",
    source = avatarPreview,
    alt = label
  ) => {
    const sizeClass = size === "lg" ? "h-20 w-20 text-xl" : "h-8 w-8 text-sm";

    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/30 bg-gradient-to-br from-accent to-highlight font-semibold text-background",
          sizeClass
        )}
      >
        {source ? (
          <img
            src={source}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </span>
    );
  };

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Avatar non valido", "Carica un file immagine.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraftAvatarPreview(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const resetProfileForm = () => {
    setDraftDisplayName(label);
    setDraftAvatarPreview(avatarPreview);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const openProfileModal = () => {
    resetProfileForm();
    setIsOpen(false);
    setIsProfileOpen(true);
  };

  const saveProfile = () => {
    const wantsPasswordChange =
      currentPassword.trim() || newPassword.trim() || confirmPassword.trim();

    if (!draftDisplayName.trim()) {
      showErrorToast("Nome mancante", "Inserisci un nome da mostrare.");
      return;
    }

    if (wantsPasswordChange) {
      if (!currentPassword.trim()) {
        showErrorToast("Password attuale mancante", "Inserisci la password attuale.");
        return;
      }
      if (newPassword.length < 8) {
        showErrorToast("Password troppo corta", "Usa almeno 8 caratteri.");
        return;
      }
      if (newPassword !== confirmPassword) {
        showErrorToast("Password diverse", "La nuova password e la conferma non coincidono.");
        return;
      }
    }

    localStorage.setItem(
      profileStorageKey,
      JSON.stringify({
        displayName: draftDisplayName.trim(),
        avatar: draftAvatarPreview,
      })
    );

    setDisplayName(draftDisplayName.trim());
    setAvatarPreview(draftAvatarPreview);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsProfileOpen(false);
    showSuccessToast(
      "Profilo aggiornato",
      wantsPasswordChange
        ? "Dati profilo salvati. La password è pronta per il collegamento backend."
        : "Nome e avatar salvati."
    );
  };

  return (
    <div
      className={cn(
        inline ? "relative" : "fixed top-4 right-4 z-50",
        variant === "sidebar" && "w-full"
      )}
      ref={menuRef}
    >
      {/* Avatar Button */}
      {variant === "sidebar" ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-full items-center gap-3 rounded-md border border-border/60 bg-background_alt/20 px-2.5 text-left transition-colors hover:bg-foreground_alt"
          title={label}
        >
          {renderAvatar("sm")}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-semibold leading-tight text-primary">
              {label}
            </span>
            <span className="truncate text-xs leading-tight text-secondary">
              Account
            </span>
          </span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-highlight flex items-center justify-center text-background font-semibold text-sm hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 cursor-pointer border border-accent/30 scale-100 hover:scale-105 active:scale-95"
          title={label}
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt={label}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            menuPosition,
            "bg-foreground border border-border rounded-lg shadow-lg overflow-hidden fade-in z-50"
          )}
        >
          {/* User Info Section */}
          <div className="p-4 border-b border-border">
            <p className="text-xs text-secondary">
              {isGuest ? "Modalità ospite" : "Accesso effettuato"}
            </p>
            <p className="text-sm font-medium text-primary truncate mt-1">
              {label}
            </p>
            <p className="mt-1 truncate text-xs text-secondary">{subtitle}</p>
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
                  onClick={openProfileModal}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-background_alt text-sm text-secondary hover:text-primary transition-colors duration-200"
                >
                  <UserPen size={16} />
                  Modifica profilo
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
              {isGuest ? "Esci da modalità ospite" : "Esci"}
            </button>
          </div>
        </div>
      )}

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-xl rounded-lg border-border/70 bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <UserPen className="h-5 w-5 text-accent" />
              Modifica profilo
            </DialogTitle>
            <DialogDescription>
              Aggiorna nome, immagine profilo e password dell&apos;account.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[9rem_minmax(0,1fr)]">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-border/60 bg-background_alt/20 p-4">
              {renderAvatar("lg", draftAvatarPreview, draftDisplayName || label)}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                Avatar
              </Button>
              {draftAvatarPreview && (
                <button
                  type="button"
                  onClick={() => setDraftAvatarPreview(null)}
                  className="text-xs text-secondary underline-offset-2 hover:text-primary hover:underline"
                >
                  Rimuovi foto
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nome visualizzato</Label>
                <Input
                  id="profile-name"
                  value={draftDisplayName}
                  onChange={(event) => setDraftDisplayName(event.target.value)}
                  placeholder="Es. Marco"
                />
              </div>

              <div className="rounded-lg border border-border/60 bg-background_alt/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-primary">
                    Cambia password
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Password attuale</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      placeholder="Password attuale"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nuova password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Minimo 8 caratteri"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Conferma</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Ripeti password"
                      />
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-secondary">
                    Campo pronto per il collegamento backend. Per ora nome e
                    avatar vengono salvati localmente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProfileOpen(false)}
            >
              Annulla
            </Button>
            <Button type="button" onClick={saveProfile}>
              Salva profilo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
