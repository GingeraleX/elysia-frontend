"use client";

import React, { useContext, useEffect, useState } from "react";

import { SocketContext } from "../contexts/SocketContext";

import {
  MessageSquareText,
  Database,
  FolderClosed,
  Cpu,
  SlidersHorizontal,
  FlaskConical,
  BookOpenText,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import HomeSubMenu from "@/app/components/navigation/HomeSubMenu";
import ModeToggle from "@/app/components/navigation/ModeToggle";

import { public_path } from "@/app/components/host";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenu,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import SettingsSubMenu from "./SettingsSubMenu";
import { RouterContext } from "../contexts/RouterContext";
import { CollectionContext } from "../contexts/CollectionContext";
import { SessionContext } from "../contexts/SessionContext";
import { UserProfile } from "../auth/UserProfile";
import packageJson from "../../../package.json";

type NavItem = {
  title: string;
  mode: string[];
  icon: React.ReactNode;
  group: "primary" | "secondary";
  kbd?: string;
  warning?: boolean;
  loading?: boolean;
  onClick: () => void;
};

const SidebarComponent: React.FC = () => {
  const { socketOnline } = useContext(SocketContext);
  const { changePage, currentPage } = useContext(RouterContext);
  const { collections, loadingCollections } = useContext(CollectionContext);
  const { unsavedChanges, updateUnsavedChanges } = useContext(SessionContext);

  const [items, setItems] = useState<NavItem[]>([]);

  useEffect(() => {
    const _items: NavItem[] = [
      {
        title: "Chat",
        mode: ["chat"],
        icon: <MessageSquareText className="h-[15px] w-[15px]" strokeWidth={1.6} />,
        group: "primary",
        kbd: "1",
        onClick: () =>
          changePage("chat", {}, true, unsavedChanges, () =>
            updateUnsavedChanges(false)
          ),
      },
      {
        title: "Dati",
        mode: ["data", "collection"],
        icon: <Database className="h-[15px] w-[15px]" strokeWidth={1.6} />,
        warning: !collections?.some((c) => c.processed === true),
        loading: loadingCollections,
        group: "primary",
        kbd: "2",
        onClick: () =>
          changePage("data", {}, true, unsavedChanges, () =>
            updateUnsavedChanges(false)
          ),
      },
      {
        title: "File",
        mode: ["files"],
        icon: <FolderClosed className="h-[15px] w-[15px]" strokeWidth={1.6} />,
        group: "primary",
        kbd: "3",
        onClick: () =>
          changePage("files", {}, true, unsavedChanges, () =>
            updateUnsavedChanges(false)
          ),
      },
      {
        title: "Modelli AI",
        mode: ["models"],
        icon: <Cpu className="h-[15px] w-[15px]" strokeWidth={1.6} />,
        group: "primary",
        kbd: "4",
        onClick: () =>
          changePage("models", {}, true, unsavedChanges, () =>
            updateUnsavedChanges(false)
          ),
      },
      {
        title: "Avanzate",
        mode: ["settings", "elysia"],
        icon: <SlidersHorizontal className="h-[15px] w-[15px]" strokeWidth={1.6} />,
        group: "secondary",
        kbd: "5",
        onClick: () =>
          changePage("settings", {}, true, unsavedChanges, () =>
            updateUnsavedChanges(false)
          ),
      },
      {
        title: "Valutazione",
        mode: ["eval"],
        icon: <FlaskConical className="h-[15px] w-[15px]" strokeWidth={1.6} />,
        group: "secondary",
        kbd: "6",
        onClick: () =>
          changePage("eval", {}, true, unsavedChanges, () =>
            updateUnsavedChanges(false)
          ),
      },
      {
        title: "Documentazione",
        mode: ["documentation"],
        icon: <BookOpenText className="h-[15px] w-[15px]" strokeWidth={1.6} />,
        group: "secondary",
        kbd: "7",
        onClick: () =>
          changePage("documentation", {}, true, unsavedChanges, () =>
            updateUnsavedChanges(false)
          ),
      },
    ];
    setItems(_items);
  }, [collections, unsavedChanges]);

  const renderItem = (item: NavItem) => {
    const active = item.mode.includes(currentPage);
    return (
      <SidebarMenuItem key={item.title}>
        <button
          type="button"
          onClick={item.onClick}
          aria-current={active ? "page" : undefined}
          className={`group/nav relative flex w-full items-center gap-3 rounded-lg px-2 py-[7px] text-[13px] tracking-tight outline-none transition-all duration-200
            ${active
              ? "bg-foreground_alt/70 text-primary"
              : "text-secondary hover:bg-foreground_alt/40 hover:text-primary"}
            focus-visible:ring-2 focus-visible:ring-accent/50`}
        >
          {/* Glow trace bar (active) */}
          <span
            aria-hidden
            className={`absolute left-[-4px] top-1/2 h-6 -translate-y-1/2 rounded-full transition-all duration-500 ease-out ${
              active
                ? "w-[3px] opacity-100 shadow-[0_0_12px_2px_hsl(var(--accent)/0.7)]"
                : "w-0 opacity-0"
            }`}
            style={{
              background: active ? "var(--grad-aurora)" : undefined,
            }}
          />

          {/* Icon tile */}
          <span
            className={`relative grid h-[26px] w-[26px] place-items-center rounded-md transition-all duration-200 ${
              active
                ? "text-accent"
                : "text-secondary group-hover/nav:text-primary"
            }`}
            style={{
              background: active
                ? "hsl(var(--accent) / 0.12)"
                : "transparent",
              boxShadow: active
                ? "inset 0 0 0 1px hsl(var(--accent) / 0.3)"
                : undefined,
            }}
          >
            {item.loading ? (
              <Loader2 className="h-[14px] w-[14px] animate-spin text-accent" strokeWidth={1.8} />
            ) : item.warning ? (
              <AlertTriangle
                className="h-[14px] w-[14px] text-warning"
                strokeWidth={1.8}
              />
            ) : (
              item.icon
            )}
          </span>

          <span className="truncate text-left">{item.title}</span>

          {item.kbd && (
            <kbd
              className={`absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-border/50 bg-background/60 px-1 font-mono-soft text-[9px] tracking-normal transition-opacity ${
                active
                  ? "text-secondary/80 opacity-90"
                  : "text-secondary/70 opacity-0 group-hover/nav:opacity-100"
              }`}
            >
              ⌘{item.kbd}
            </kbd>
          )}
        </button>
      </SidebarMenuItem>
    );
  };

  const primary = items.filter((i) => i.group === "primary");
  const secondary = items.filter((i) => i.group === "secondary");

  return (
    <Sidebar className="fade-in border-r border-border/40 bg-background_alt/45 backdrop-blur-2xl">
      <SidebarHeader className="px-3 pt-4 pb-3">
        <div className="flex w-full flex-col gap-3">
          {/* Wordmark */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5">
              <div className="relative grid h-8 w-8 place-items-center">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[9px] opacity-80"
                  style={{ background: "var(--grad-aurora)" }}
                />
                <div className="absolute inset-[2px] rounded-[7px] bg-background_alt/90" />
                <img
                  src={`${public_path}logo.svg`}
                  alt="Elysia"
                  className="relative h-3.5 w-3.5"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display-italic text-[20px] text-primary">
                  Elysia
                </span>
                <span className="font-mono-soft text-[9px] uppercase tracking-[0.26em] text-secondary/80 mt-0.5">
                  Studio
                </span>
              </div>
            </div>
            <span className="font-mono-soft text-[10px] text-secondary/60">
              v{packageJson.version}
            </span>
          </div>

          <ModeToggle />

          {/* Server status pill */}
          <div className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-3 py-1.5 backdrop-blur-sm">
            <span className="font-mono-soft text-[10px] uppercase tracking-[0.22em] text-secondary/80">
              Server
            </span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2 items-center justify-center">
                {socketOnline && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                )}
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    socketOnline ? "bg-accent" : "bg-warning"
                  }`}
                />
              </span>
              <span
                className={`text-[11px] font-medium ${
                  socketOnline ? "text-accent" : "text-warning"
                }`}
              >
                {socketOnline ? "Connesso" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup className="px-1 py-2">
          <p className="eyebrow px-2 pb-2">Workspace</p>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">{primary.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mx-3 my-1 h-px bg-border/40" />

        <SidebarGroup className="px-1 py-2">
          <p className="eyebrow px-2 pb-2">Strumenti</p>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">{secondary.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentPage === "chat" && (
          <>
            <div className="mx-3 my-1 h-px bg-border/40" />
            <HomeSubMenu />
          </>
        )}
        {(currentPage === "settings" ||
          currentPage === "elysia" ||
          currentPage === "models") && (
          <>
            <div className="mx-3 my-1 h-px bg-border/40" />
            <SettingsSubMenu />
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserProfile inline variant="sidebar" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarComponent;
