"use client";

import React, { useContext, useRef, useState } from "react";
import { FaCircle } from "react-icons/fa";

import { ConversationContext } from "../contexts/ConversationContext";

import { FaPlus } from "react-icons/fa6";
import { GoTrash } from "react-icons/go";
import { MdEdit } from "react-icons/md";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenuAction,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SlOptionsVertical } from "react-icons/sl";

// ── Inline-editable title row ─────────────────────────────────────────────────
function ConversationTitleRow({
  convId,
  title,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: {
  convId: string;
  title: string;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) onRename(trimmed);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { setEditing(false); setDraft(title); }
  }

  return (
    <SidebarMenuItem className="list-none fade-in" key={convId}>
      {editing ? (
        <div className="flex items-center gap-1 px-2 py-1">
          <input
            ref={inputRef}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            className="flex-1 text-sm bg-background border border-secondary/40 rounded px-1.5 py-0.5 text-primary focus:outline-none focus:border-highlight truncate"
            maxLength={120}
          />
        </div>
      ) : (
        <>
          <SidebarMenuButton
            variant={isActive ? "active" : "default"}
            onClick={onSelect}
          >
            <p className="truncate max-w-[10rem]">{title}</p>
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction>
                <SlOptionsVertical />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem onClick={startEdit}>
                <MdEdit className="text-secondary" />
                <span>Rinomina</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete}>
                <GoTrash className="text-error" />
                <span className="text-error">Elimina</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </SidebarMenuItem>
  );
}

const HomeSubMenu: React.FC = () => {
  const {
    startNewConversation,
    currentConversation,
    removeConversation,
    selectConversation,
    conversationPreviews,
    loadingConversations,
    creatingNewConversation,
    loadingConversation,
    renameConversation,
  } = useContext(ConversationContext);

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between">
        <SidebarGroupLabel className="flex items-center">
          <div
            className={`flex items-center ${loadingConversations || creatingNewConversation || loadingConversation ? "shine" : ""}`}
          >
            {creatingNewConversation && (
              <FaCircle className="text-secondary pulsing mr-2" />
            )}
            {loadingConversations ||
              (loadingConversation && <p>Caricamento conversazioni...</p>)}
            {!loadingConversations && !loadingConversation && (
              <p>
                {creatingNewConversation
                  ? "Inizializzazione conversazione..."
                  : "Conversazioni"}
              </p>
            )}
          </div>
        </SidebarGroupLabel>
        <SidebarGroupAction
          title="Aggiungi conversazione"
          onClick={() => startNewConversation()}
          disabled={creatingNewConversation}
        >
          <FaPlus /> <span className="sr-only">Aggiungi conversazione</span>
        </SidebarGroupAction>
      </div>
      <SidebarGroupContent>
        {/* TODO Add Timestamp Sorting when backend supports it */}
        {Object.entries(conversationPreviews)
          ?.sort(
            ([, a], [, b]) =>
              new Date(b.last_update_time).getTime() -
              new Date(a.last_update_time).getTime()
          )
          .map(([key, value]) => (
            <ConversationTitleRow
              key={key}
              convId={key}
              title={value.title}
              isActive={currentConversation === key}
              onSelect={() => selectConversation(key)}
              onDelete={() => removeConversation(key)}
              onRename={(newTitle) => renameConversation(key, newTitle)}
            />
          ))}
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default HomeSubMenu;
