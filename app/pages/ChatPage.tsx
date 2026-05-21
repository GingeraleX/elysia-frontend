"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import { motion } from "framer-motion";

import { Query } from "@/app/types/chat";
import { Sparkles, RefreshCw, ArrowRight } from "lucide-react";

import QueryInput from "../components/chat/QueryInput";
import RenderChat from "../components/chat/RenderChat";
import { SocketContext } from "../components/contexts/SocketContext";
import { SessionContext } from "../components/contexts/SessionContext";
import { ConversationContext } from "../components/contexts/ConversationContext";
import { ChatProvider } from "../components/contexts/ChatContext";
import { v4 as uuidv4 } from "uuid";
import RateLimitDialog from "../components/navigation/RateLimitDialog";

import dynamic from "next/dynamic";
import { CollectionContext } from "../components/contexts/CollectionContext";
import TreeSettingsView from "../components/configuration/TreeSettingsView";

const AbstractSphereScene = dynamic(
  () => import("@/app/components/threejs/AbstractSphere"),
  {
    ssr: false,
  }
);

export default function ChatPage() {
  const { sendQuery, socketOnline } = useContext(SocketContext);
  const { id, showRateLimitDialog } = useContext(SessionContext);
  const {
    changeBaseToQuery,
    addTreeToConversation,
    addQueryToConversation,
    currentConversation,
    conversations,
    updateFeedbackForQuery,
    loadingConversation,
    addConversation,
  } = useContext(ConversationContext);

  const { getRandomPrompts, collections } = useContext(CollectionContext);

  const [currentQuery, setCurrentQuery] = useState<{
    [key: string]: Query;
  }>({});
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [mode, setMode] = useState<"chat" | "settings">("chat");
  // Ref for the scrollable chat container — used for jitter-free scroll-to-bottom
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displacementStrength = useRef(0.0);
  const distortionStrength = useRef(0.0);
  // Track query count to prevent scroll-to-bottom firing on feedback updates.
  // Scroll should only fire when a NEW query is added (count increases), not
  // when an existing query's feedback field changes.
  const queryCountRef = useRef(0);

  const addDisplacement = (value: number) => {
    displacementStrength.current += value;
    displacementStrength.current = Math.min(displacementStrength.current, 0.1);
  };

  const addDistortion = (value: number) => {
    distortionStrength.current += value;
    distortionStrength.current = Math.min(distortionStrength.current, 0.3);
  };

  const [randomPrompts, setRandomPrompts] = useState<string[]>([]);

  const handleSendQuery = async (
    query: string,
    route: string = "",
    mimick: boolean = false
  ) => {
    if (query.trim() === "" || currentStatus !== "") return;
    const trimmedQuery = query.trim();
    const query_id = uuidv4();

    const _conversation = conversations.find(
      (c) => c.id === currentConversation
    );

    if (_conversation === null || _conversation === undefined) {
      // No conversation in memory yet — auto-create one and send into it.
      // This covers: (a) fresh users before the context auto-selects, and
      // (b) any race where currentConversation is still null on first send.
      if (!id) return;
      const newConv = await addConversation(id);
      if (!newConv) return;
      const treeIndex = newConv.tree?.length ?? 0;
      const sent = await sendQuery(
        id,
        trimmedQuery,
        newConv.id,
        query_id,
        route,
        mimick,
        treeIndex
      );
      if (sent) {
        changeBaseToQuery(newConv.id, trimmedQuery);
        addTreeToConversation(newConv.id);
        addQueryToConversation(newConv.id, trimmedQuery, query_id);
      }
      return;
    } else {
      // tree_index = current tree count before addTreeToConversation is called.
      // After addTreeToConversation pushes a copy, it becomes c.tree[tree_index].
      // Fixes GAP-9: backend was always sending tree_index: 0 for all queries.
      const treeIndex = _conversation.tree?.length ?? 0;
      const sent = await sendQuery(
        id || "",
        trimmedQuery,
        _conversation.id,
        query_id,
        route,
        mimick,
        treeIndex
      );
      // Only mutate conversation state if the message was actually sent.
      // Skipping these when sendQuery returns false prevents dangling ghost
      // queries from appearing in the chat with no response.
      if (sent) {
        changeBaseToQuery(_conversation.id, trimmedQuery);
        addTreeToConversation(_conversation.id);
        addQueryToConversation(_conversation.id, trimmedQuery, query_id);
      }
    }
  };

  const selectSettings = () => {
    setMode("settings");
  };

  const selectChat = () => {
    setMode("chat");
  };

  useEffect(() => {
    setCurrentQuery(
      currentConversation && conversations.length > 0
        ? conversations.find((c) => c.id === currentConversation)?.queries || {}
        : {}
    );
    setCurrentStatus(
      currentConversation && conversations.length > 0
        ? conversations.find((c) => c.id === currentConversation)?.current || ""
        : ""
    );
  }, [currentConversation, conversations]);

  // Scroll to bottom only when a NEW query is added (count increases).
  // Feedback updates change currentQuery without increasing the count — those
  // must NOT trigger a scroll jump.
  useEffect(() => {
    const newCount = Object.keys(currentQuery).length;
    const countIncreased = newCount > queryCountRef.current;
    queryCountRef.current = newCount;
    if (countIncreased && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentQuery]);

  // Scroll to keep up with streaming tokens while the AI is responding.
  useEffect(() => {
    if (currentStatus && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentStatus]);

  // Instant jump to bottom when switching conversations (no animation needed).
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ block: "end" });
    }
  }, [currentConversation]);

  useEffect(() => {
    setMode("chat");
  }, [currentConversation]);

  // Auto-selection is handled by ConversationContext's URL-sync effect.
  // Do NOT duplicate it here — it races with programmatic selectConversation().

  useEffect(() => {
    setRandomPrompts(getRandomPrompts(4));
  }, [collections]);

  if (!socketOnline) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center fade-in">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 -z-30">
          <div className="lg:w-[28vw] lg:h-[28vw] w-[70vw] h-[70vw]">
            <AbstractSphereScene
              debug={false}
              displacementStrength={displacementStrength}
              distortionStrength={distortionStrength}
            />
          </div>
        </div>
        <p className="text-[13px] text-primary shine">Connessione a Elysia…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full items-center justify-start">
      {loadingConversation && (
        <div className="flex w-full h-screen justify-center items-center">
          <p className="text-[13px] text-primary shine">
            Caricamento conversazione…
          </p>
        </div>
      )}
      {mode === "chat" && !loadingConversation ? (
        <div ref={chatScrollRef} className="flex flex-col w-full max-h-[calc(100dvh-8rem)] lg:max-h-[calc(100dvh-5rem)] overflow-y-auto justify-center items-center">
          <div className="flex flex-col w-full md:w-[60vw] lg:w-[40vw] h-[80vh] ">
            {currentQuery &&
              Object.entries(currentQuery)
                .sort((a, b) => a[1].index - b[1].index)
                .map(([queryId, query], index, array) => (
                  <ChatProvider key={queryId}>
                    <RenderChat
                      key={queryId + index}
                      messages={query.messages}
                      conversationID={currentConversation || ""}
                      queryID={queryId}
                      finished={query.finished}
                      query_start={query.query_start}
                      query_end={query.query_end}
                      _collapsed={index !== array.length - 1}
                      NER={query.NER}
                      feedback={query.feedback}
                      updateFeedback={updateFeedbackForQuery}
                      addDisplacement={addDisplacement}
                      addDistortion={addDistortion}
                      handleSendQuery={handleSendQuery}
                      isLastQuery={index === array.length - 1}
                    />
                  </ChatProvider>
                ))}
            {/* Scroll anchor — always at the bottom of the message list */}
            <div ref={messagesEndRef} />
            {currentQuery && !(Object.keys(currentQuery).length === 0) && (
              <div>
                <hr className="w-full border-t border-transparent my-4 mb-20" />
              </div>
            )}
          </div>
          <div className="w-full justify-center items-center flex z-10">
            <QueryInput
              query_length={Object.keys(currentQuery).length}
              currentStatus={currentStatus}
              handleSendQuery={handleSendQuery}
              addDisplacement={addDisplacement}
              addDistortion={addDistortion}
              selectSettings={selectSettings}
            />
          </div>
          {Object.keys(currentQuery).length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 -z-30 fade-in">
              <div className="lg:w-[28vw] lg:h-[28vw] w-[80vw] h-[80vw]">
                <AbstractSphereScene
                  debug={false}
                  displacementStrength={displacementStrength}
                  distortionStrength={distortionStrength}
                />
              </div>
            </div>
          )}
          {Object.keys(currentQuery).length === 0 && (
            <div className="absolute inset-0 flex flex-col justify-center items-center px-6 pb-40 fade-in">
              <div className="w-full md:w-[60vw] lg:w-[44vw] max-w-2xl flex flex-col items-center text-center">
                <p className="text-[14px] text-primary font-medium">
                  Chiedi a Elysia
                </p>
                <p className="mt-1 text-[12.5px] text-secondary/80 max-w-sm">
                  Domanda in linguaggio naturale sui tuoi dati.
                </p>

                {randomPrompts.length > 0 && (
                  <div className="mt-7 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11.5px] text-secondary/70">
                        Suggerimenti
                      </span>
                      <button
                        type="button"
                        onClick={() => setRandomPrompts(getRandomPrompts(4))}
                        className="inline-flex items-center gap-1 text-[11px] text-secondary/70 hover:text-primary transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" strokeWidth={1.8} />
                        Rigenera
                      </button>
                    </div>

                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.04, delayChildren: 0.05 }}
                    >
                      {randomPrompts.map((prompt, index) => (
                        <motion.button
                          key={index + "prompt"}
                          onClick={() => handleSendQuery(prompt)}
                          className="group/p relative flex items-center gap-2.5 rounded-lg border border-border/40 bg-background_alt/25 backdrop-blur-sm px-3 py-2.5 text-left transition-all duration-200 hover:border-accent/40 hover:bg-background_alt/45"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.04,
                            ease: "easeOut",
                          }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Sparkles
                            className="h-3 w-3 text-accent/70 shrink-0"
                            strokeWidth={1.8}
                          />
                          <p className="flex-1 text-[12px] text-primary/90 leading-snug line-clamp-2">
                            {prompt}
                          </p>
                          <ArrowRight
                            className="h-3 w-3 text-secondary/50 group-hover/p:text-accent group-hover/p:translate-x-0.5 transition-all shrink-0"
                            strokeWidth={1.8}
                          />
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : mode === "settings" ? (
        <TreeSettingsView
          user_id={id || ""}
          conversation_id={currentConversation || ""}
          selectChat={selectChat}
        />
      ) : null}
      {showRateLimitDialog && <RateLimitDialog />}
    </div>
  );
}
