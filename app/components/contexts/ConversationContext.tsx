"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Conversation, initialConversation } from "../types";

import {
  Query,
  NERPayload,
  TitlePayload,
  SuggestionPayload,
  Message,
  TextPayload,
  UserPromptPayload,
  ResponsePayload,
} from "@/app/types/chat";
import { TreeUpdatePayload } from "@/app/components/types";

import {
  DecisionTreePayload,
  SavedConversationPayload,
  ConversationPayload,
  SavedTreeData,
  BasePayload,
} from "@/app/types/payloads";
import { DecisionTreeNode } from "@/app/types/objects";
import { v4 as uuidv4 } from "uuid";
import { CollectionContext } from "./CollectionContext";

import { SessionContext } from "./SessionContext";

import { loadConversations } from "@/app/api/loadConversations";
import { loadConversation } from "@/app/api/loadConversation";
import { initializeTree } from "@/app/api/InitializeTree";
import { getSuggestions } from "@/app/api/getSuggestions";
import { deleteConversation } from "@/app/api/deleteConversation";
import { saveConversation } from "@/app/api/saveConversation";
import { addFeedback } from "@/app/api/addFeedback";
import { deleteFeedback } from "@/app/api/deleteFeedback";
import { RouterContext } from "./RouterContext";
import { usePathname, useSearchParams } from "next/navigation";

export const ConversationContext = createContext<{
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  currentConversation: string | null;
  setCurrentConversation: (currentConversation: string | null) => void;
  creatingNewConversation: boolean;
  setCreatingNewConversation: (creatingNewConversation: boolean) => void;
  loadingConversations: boolean;
  addConversation: (user_id: string) => Promise<Conversation | null>;
  removeConversation: (conversation_id: string) => void;
  selectConversation: (id: string) => void;
  setConversationStatus: (status: string, conversationId: string) => void;
  handleConversationError: (conversationId: string) => void;
  addMessageToConversation: (
    messages: Message[],
    conversationId: string,
    queryId: string
  ) => void;
  initializeEnabledCollections: (
    collections: { [key: string]: boolean },
    collection_id: string
  ) => void;
  toggleCollectionEnabled: (
    collection_id: string,
    conversationId: string
  ) => void;
  updateTree: (tree_update_message: Message) => void;
  addTreeToConversation: (conversationId: string) => void;
  changeBaseToQuery: (conversationId: string, query: string) => void;
  addQueryToConversation: (
    conversationId: string,
    query: string,
    query_id: string
  ) => void;
  finishQuery: (conversationId: string, queryId: string) => void;
  updateNERForQuery: (
    conversationId: string,
    queryId: string,
    NER: NERPayload
  ) => void;
  updateFeedbackForQuery: (
    conversationId: string,
    queryId: string,
    feedback: number
  ) => void;
  setAllConversationStatuses: (status: string) => void;
  startNewConversation: () => void;
  getAllEnabledCollections: () => string[];
  triggerAllCollections: (conversationId: string, enable: boolean) => void;
  handleAllConversationsError: () => void;
  conversationPreviews: { [key: string]: SavedTreeData };
  addSuggestionToConversation: (
    conversationId: string,
    queryId: string,
    user_id: string
  ) => void;
  loadConversationsFromDB: () => void;
  handleWebsocketMessage: (message: Message) => void;
  loadingConversation: boolean;
  /** Suggestions for the active conversation's last completed query. */
  currentSuggestions: string[];
  /** Rename a conversation — updates both local state and persists to backend. */
  renameConversation: (conversationId: string, newTitle: string) => Promise<void>;
}>({
  conversations: [],
  setConversations: () => {},
  currentConversation: null,
  setCurrentConversation: () => {},
  creatingNewConversation: false,
  setCreatingNewConversation: () => {},
  loadingConversations: false,
  loadingConversation: false,
  startNewConversation: () => {},
  conversationPreviews: {},
  addConversation: () => Promise.resolve(null),
  removeConversation: () => {},
  selectConversation: () => {},
  setConversationStatus: () => {},
  setAllConversationStatuses: () => {},
  addMessageToConversation: () => {},
  initializeEnabledCollections: () => {},
  handleConversationError: () => {},
  toggleCollectionEnabled: () => {},
  handleWebsocketMessage: () => {},
  updateTree: () => {},
  addTreeToConversation: () => {},
  changeBaseToQuery: () => {},
  addQueryToConversation: () => {},
  finishQuery: () => {},
  updateNERForQuery: () => {},
  updateFeedbackForQuery: () => {},
  triggerAllCollections: () => {},
  handleAllConversationsError: () => {},
  addSuggestionToConversation: () => {},
  getAllEnabledCollections: () => [],
  loadConversationsFromDB: () => {},
  currentSuggestions: [],
  renameConversation: () => Promise.resolve(),
});

export const ConversationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { collections } = useContext(CollectionContext);
  const { id, enableRateLimitDialog, initialized, fetchConversationFlag } =
    useContext(SessionContext);

  const { changePage, currentPage } = useContext(RouterContext);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const initial_ref = useRef<boolean>(false);
  // When true, the URL-sync effect skips one cycle (programmatic selection in progress)
  const programmaticSelectRef = useRef<boolean>(false);
  // Mutex: prevents concurrent executions of loadConversationsFromDB
  const loadingConvLockRef = useRef<boolean>(false);
  // Skip the [fetchConversationFlag] effect on initial mount
  // (initial load is handled exclusively by the [id, initialized] effect)
  const convFlagMountedRef = useRef<boolean>(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationPreviews, setConversationPreviews] = useState<{
    [key: string]: SavedTreeData;
  }>({});
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    null
  );
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [creatingNewConversation, setCreatingNewConversation] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);

  const getDecisionTree = async (user_id: string, conversation_id: string) => {
    if (user_id === "") return null;
    const data: DecisionTreePayload = await initializeTree(
      user_id,
      conversation_id
    );
    return data;
  };

  const loadConversationsFromDB = async () => {
    if (!id) return;
    // Mutex: if a load is already in progress, skip this call
    if (loadingConvLockRef.current) return;
    loadingConvLockRef.current = true;

    setLoadingConversations(true);
    const data: SavedConversationPayload = await loadConversations(id || "");

    let hasConversations = false;
    const trees: Record<string, { title: string; last_update_time: string }> = {};

    // Safely check if data and data.trees exist before iterating
    if (data && data.trees && typeof data.trees === 'object') {
      for (const [key, value] of Object.entries(data.trees)) {
        if (value && value.title && value.last_update_time) {
          trees[key] = value;
          hasConversations = true;
        }
      }
    }

    // Deduplicate empty "New Conversation" entries — keep only the most recent one.
    // Multiple entries accumulate when the app loaded while Weaviate was empty and
    // auto-created a new conversation each time. Delete the older duplicates.
    const newConvEntries = Object.entries(trees)
      .filter(([, v]) => v.title === "New Conversation")
      .sort(([, a], [, b]) => new Date(b.last_update_time).getTime() - new Date(a.last_update_time).getTime());

    if (newConvEntries.length > 1) {
      // Keep the most recent, delete the rest
      const toDelete = newConvEntries.slice(1);
      for (const [key] of toDelete) {
        delete trees[key];
        deleteConversation(id || "", key); // fire-and-forget
      }
    }

    // Push deduplicated previews into state
    for (const [key, value] of Object.entries(trees)) {
      setConversationPreviews((prev) => ({ ...prev, [key]: value }));
    }

    setLoadingConversations(false);
    loadingConvLockRef.current = false;

    // Only auto-create if no conversations were found
    // (mutex above ensures this runs at most once at a time)
    if (!hasConversations) {
      await startNewConversation();
    }
  };

  const retrieveConversation = async (
    conversationId: string,
    conversationName: string,
    timestamp: Date
  ) => {
    setLoadingConversation(true);
    try {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversationId);
      } else {
        const data: ConversationPayload = await loadConversation(
          id || "",
          conversationId
        );
        setCreatingNewConversation(true);
        try {
          const tree = await getDecisionTree(id || "", conversationId);
          const treeNode = tree?.tree ?? null;

          // ── Normalise rebuild data ──────────────────────────────────────
          // The backend persists history as compact {role,content,query_id} objects.
          // Convert to equivalent Message objects so downstream logic is uniform.
          const rawRebuild: any[] = data.rebuild ?? [];
          let normalizedRebuild: Message[];

          const isRoleFormat =
            rawRebuild.length > 0 && rawRebuild[0]?.role != null;

          if (isRoleFormat) {
            normalizedRebuild = [];
            for (const entry of rawRebuild) {
              const qid: string = entry.query_id ?? uuidv4();
              if (entry.role === "user") {
                normalizedRebuild.push({
                  type: "user_prompt",
                  id: uuidv4(),
                  conversation_id: conversationId,
                  query_id: qid,
                  user_id: id || "",
                  payload: { prompt: entry.content ?? "" } as UserPromptPayload,
                } as Message);
              } else if (entry.role === "assistant") {
                normalizedRebuild.push({
                  type: "text",
                  id: uuidv4(),
                  conversation_id: conversationId,
                  query_id: qid,
                  user_id: id || "",
                  payload: {
                    type: "response",
                    metadata: {},
                    objects: [{ text: entry.content ?? "" }],
                  } as ResponsePayload,
                } as Message);
                // Mark as finished so FeedbackButtons render correctly
                normalizedRebuild.push({
                  type: "completed",
                  id: uuidv4(),
                  conversation_id: conversationId,
                  query_id: qid,
                  user_id: id || "",
                  payload: { error: "" },
                } as Message);
              }
            }
          } else {
            normalizedRebuild = rawRebuild as Message[];
          }

          // Extract user turns to build the query map
          const queries = normalizedRebuild.filter(
            (m): m is Message =>
              m != null &&
              m.type === "user_prompt" &&
              m.payload != null &&
              typeof (m.payload as UserPromptPayload).prompt === "string"
          );

          // Build queries unconditionally — tree is needed for FlowDisplay only,
          // NOT for basic chat history. Assign sequential index for stable sort.
          const prebuiltQueries: { [key: string]: Query } = {};
          let queryIndex = 0;
          for (const query of queries) {
            const newQuery: Query = createNewQuery(
              conversationId,
              (query.payload as UserPromptPayload).prompt,
              query.query_id,
              conversations
            );
            prebuiltQueries[query.query_id] = { ...newQuery, index: queryIndex++ };
          }

          const newConversation: Conversation = {
            enabled_collections: (collections ?? []).reduce(
              (acc, c) => ({ ...acc, [c.name]: true }),
              {}
            ),
            id: conversationId,
            name: conversationName,
            tree_updates: [],
            tree: treeNode
              ? [
                  ...queries.map((query) => ({
                    ...treeNode!,
                    name: (query.payload as UserPromptPayload).prompt,
                  })),
                  treeNode,
                ]
              : [],
            base_tree: treeNode || null,
            queries: prebuiltQueries,
            current: "",
            initialized: true,
            error: false,
            timestamp: timestamp,
          };

          if (treeNode != null) {
            queries.forEach((query) => {
              const prompt = (query.payload as UserPromptPayload).prompt;
              changeBaseToQuery(conversationId, prompt);
            });
          }

          setConversations((prevConversations) => [
            ...prevConversations,
            newConversation,
          ]);

          // Always replay messages regardless of treeNode.
          // 'completed' → finishQuery only (skip suggestion API calls for history).
          // 'status'    → skip (avoids "Processing…" on finished conversations).
          for (const message of normalizedRebuild) {
            try {
              if (message.type === "completed") {
                finishQuery(message.conversation_id, message.query_id);
              } else if (message.type !== "status") {
                handleWebsocketMessage(message);
              }
            } catch { /* malformed message — skip */ }
          }
        } finally {
          setCreatingNewConversation(false);
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[retrieveConversation] Failed:", err);
      }
    } finally {
      setLoadingConversation(false);
    }
  };

  const addConversation = async (
    user_id: string
  ): Promise<Conversation | null> => {
    if (!user_id?.trim()) {
      return null;
    }

    if (creatingNewConversation) return null;

    const conversation_id = uuidv4();
    setCreatingNewConversation(true);
    const [tree] = await Promise.all([
      getDecisionTree(user_id, conversation_id),
    ]);

    if (tree === null || collections === null || tree.tree === null) {
      setCreatingNewConversation(false);
      return null;
    }

    const newConversation: Conversation = {
      ...initialConversation,
      id: conversation_id,
      timestamp: new Date(),
      tree: [tree.tree],
      base_tree: tree.tree,
      enabled_collections: collections.reduce(
        (acc, c) => ({ ...acc, [c.name]: true }),
        {}
      ),
    };
    setConversations([...(conversations || []), newConversation]);
    setCurrentConversation(conversation_id);
    setCreatingNewConversation(false);
    setConversationPreviews((prev) => ({
      ...prev,
      [conversation_id]: {
        title: newConversation.name,
        last_update_time: new Date().toISOString(),
      },
    }));
    if (currentPage === "chat") {
      changePage("chat", { conversation: conversation_id }, true);
    }
    return newConversation;
  };

  const removeConversation = (conversation_id: string) => {
    if (currentConversation === conversation_id) {
      setCurrentConversation(null);
    }
    setConversations([]);
    setConversationPreviews({});
    deleteConversation(id || "", conversation_id);
    loadConversationsFromDB();
  };

  const selectConversation = (conversationId: string) => {
    if (conversationId === currentConversation) return;

    // Flag so the URL-sync effect doesn't overwrite this selection with stale searchParams
    programmaticSelectRef.current = true;

    // Direct state update — reliable regardless of URL/searchParams timing
    const alreadyLoaded = conversations.find((c) => c.id === conversationId);
    if (!alreadyLoaded) {
      const preview = conversationPreviews[conversationId];
      // retrieveConversation sets loadingConversation=true synchronously, so
      // the chat shows "Loading…" before the first render with empty queries
      retrieveConversation(
        conversationId,
        preview?.title ?? "Conversation",
        new Date(preview?.last_update_time ?? Date.now())
      );
    }
    setCurrentConversation(conversationId);

    // Also update URL so refresh/back works (pushState → history entry added)
    changePage("chat", { conversation: conversationId }, false);
  };

  const setConversationStatus = (status: string, conversationId: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId) {
          return { ...c, current: status };
        }
        return c;
      })
    );
  };

  const setConversationTitle = async (
    title: string,
    conversationId: string
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId) {
          return { ...c, name: title };
        }
        return c;
      })
    );
    setConversationPreviews((prev) => ({
      ...prev,
      [conversationId]: {
        title: title,
        last_update_time: new Date().toISOString(),
      },
    }));
  };

  const setAllConversationStatuses = (status: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => ({ ...c, current: status }))
    );
  };

  const addSuggestionToConversation = async (
    conversationId: string,
    queryId: string,
    user_id: string
  ) => {
    // user_id may be empty (e.g. session not yet resolved) — the backend handles
    // empty user_id gracefully by generating generic suggestions without history.
    const auth_key = "";
    // Pass enabled collection names so the LLM can generate collection-aware suggestions
    const currentConv = conversations.find((c) => c.id === conversationId);
    const collectionNames = (currentConv?.collections ?? [])
      .filter((col) => col.enabled)
      .map((col) => col.name)
      .join(", ");

    const data: SuggestionPayload = await getSuggestions(
      user_id,
      conversationId,
      auth_key,
      collectionNames
    );
    if (data.error) {
      console.error("[addSuggestionToConversation] Backend error:", data.error);
    }
    const newMessage: Message = {
      type: "suggestion",
      id: uuidv4(),
      conversation_id: conversationId,
      query_id: queryId,
      user_id: user_id,
      payload: {
        error: data.error ?? "",
        suggestions: data.suggestions,
      },
    };
    addMessageToConversation([newMessage], conversationId, queryId);
  };

  const addMessageToConversation = (
    messages: Message[],
    conversationId: string,
    queryId: string
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId) {
          if (!c.queries[queryId]) {
            console.warn(
              `Query ${queryId} not found in conversation ${conversationId} ${JSON.stringify(
                Object.keys(c.queries)
              )}`
            );
            return c;
          }
          return {
            ...c,
            initialized: true,
            queries: {
              ...c.queries,
              [queryId]: {
                ...c.queries[queryId],
                messages: [...c.queries[queryId].messages, ...messages],
              },
            },
          };
        }
        return c;
      })
    );
  };

  const getAllEnabledCollections = () => {
    // Return enabled collections for the CURRENT conversation only.
    // Using all conversations caused duplicates when multiple conversations
    // shared the same collection (e.g. Wally_servizi_about_vision × 2),
    // which broke the backend BM25 query path.
    const current = conversations.find((c) => c.id === currentConversation);
    if (!current) return [];
    return Object.entries(current.enabled_collections || {})
      .filter(([, enabled]) => enabled === true)
      .map(([name]) => name);
  };

  const initializeEnabledCollections = (
    collections: { [key: string]: boolean },
    collection_id: string
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === collection_id) {
          return { ...c, enabled_collections: collections };
        }
        return c;
      })
    );
  };

  const toggleCollectionEnabled = (
    collection_id: string,
    conversationId: string
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId) {
          const new_enabled_collections = {
            ...c.enabled_collections,
            [collection_id]: !c.enabled_collections[collection_id],
          };
          return {
            ...c,
            enabled_collections: new_enabled_collections,
          };
        }
        return c;
      })
    );
  };

  const triggerAllCollections = (conversationId: string, enable: boolean) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId) {
          const new_enabled_collections = Object.keys(
            c.enabled_collections
          ).reduce(
            (acc, key) => {
              acc[key] = enable;
              return acc;
            },
            {} as { [key: string]: boolean }
          );
          return { ...c, enabled_collections: new_enabled_collections };
        }
        return c;
      })
    );
  };

  const updateTree = (tree_update_message: Message) => {
    const _payload = tree_update_message.payload as TreeUpdatePayload;

    const findAndUpdateNode = (
      tree: DecisionTreeNode | null,
      base_tree: DecisionTreeNode | null,
      payload: TreeUpdatePayload
    ): DecisionTreeNode | null => {
      if (!tree) {
        return null;
      }

      // If this is the node we're looking for
      if (tree.id === payload.node && !tree.blocked) {
        // Update the specific option within tree.options where option.name === payload.decision
        const updatedOptions = Object.entries(tree.options).reduce(
          (acc, [key, option]) => {
            if (key === payload.decision) {
              acc[key] = {
                ...option,
                choosen: true,
                reasoning: payload.reasoning,
                options: payload.reset
                  ? base_tree
                    ? { base: base_tree }
                    : {}
                  : option.options || {},
              };
            } else {
              acc[key] = option;
            }
            return acc;
          },
          {} as { [key: string]: DecisionTreeNode }
        );
        return { ...tree, options: updatedOptions, blocked: true };
      } else if (tree.options && Object.keys(tree.options).length > 0) {
        // Recurse into options
        const updatedOptions = Object.entries(tree.options).reduce(
          (acc, [key, option]) => {
            const updatedNode = findAndUpdateNode(option, base_tree, _payload);
            if (updatedNode) {
              acc[key] = updatedNode;
            }
            return acc;
          },
          {} as { [key: string]: DecisionTreeNode }
        );
        return { ...tree, options: updatedOptions, blocked: true };
      } else {
        return tree;
      }
    };

    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === tree_update_message.conversation_id) {
          const trees = c.tree;
          const tree = trees[_payload.tree_index];
          const updatedTree = findAndUpdateNode(tree, c.base_tree, _payload);

          const newTrees = [...(c.tree || [])];
          if (updatedTree) {
            newTrees[_payload.tree_index] = updatedTree;
          }
          return {
            ...c,
            tree: newTrees,
            tree_updates: [...c.tree_updates, _payload],
          };
        }
        return c;
      })
    );
  };

  const addTreeToConversation = (conversationId: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId && c.base_tree) {
          return {
            ...c,
            tree: [...c.tree, { ...c.base_tree }],
          };
        }
        return c;
      })
    );
  };

  const changeBaseToQuery = (conversationId: string, query: string) => {
    const treeIndex =
      conversations.find((c) => c.id === conversationId)?.tree?.length || 1;

    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId) {
          const newTrees = [...c.tree];
          if (newTrees[treeIndex - 1]) {
            newTrees[treeIndex - 1] = {
              ...newTrees[treeIndex - 1],
              name: query,
            };
          }
          return {
            ...c,
            tree: newTrees,
          };
        }
        return c;
      })
    );
  };

  const createNewQuery = (
    conversationId: string,
    query: string,
    query_id: string,
    prevConversations: Conversation[],
    messages: Message[] = []
  ) => {
    const newMessage: Message = {
      type: "User",
      id: uuidv4(),
      query_id: query_id,
      conversation_id: conversationId,
      user_id: id || "",
      payload: {
        type: "text",
        metadata: {},
        code: {
          language: "",
          title: "",
          text: "",
        },
        objects: [query],
      },
    };
    const newQuery: Query = {
      id: query_id,
      query: query,
      finished: false,
      query_start: new Date(),
      query_end: null,
      feedback: null,
      NER: null,
      index:
        prevConversations.find((c) => c.id === conversationId)?.queries[
          query_id
        ]?.index ??
        Object.keys(
          prevConversations.find((c) => c.id === conversationId)?.queries ?? {}
        ).length,
      messages: [newMessage, ...messages],
    };

    return newQuery;
  };

  const addQueryToConversation = (
    conversationId: string,
    query: string,
    query_id: string
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        const newQuery = createNewQuery(
          conversationId,
          query,
          query_id,
          prevConversations
        );
        if (c.id === conversationId) {
          return { ...c, queries: { ...c.queries, [query_id]: newQuery } };
        }
        return c;
      })
    );
  };

  const finishQuery = (conversationId: string, queryId: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId && c.queries[queryId]) {
          return {
            ...c,
            queries: {
              ...c.queries,
              [queryId]: {
                ...c.queries[queryId],
                finished: true,
                query_end: new Date(),
              },
            },
          };
        }
        return c;
      })
    );
  };

  const updateNERForQuery = (
    conversationId: string,
    queryId: string,
    NER: NERPayload
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId && c.queries[queryId]) {
          return {
            ...c,
            queries: {
              ...c.queries,
              [queryId]: { ...c.queries[queryId], NER: NER },
            },
          };
        }
        return c;
      })
    );
  };

  const updateFeedbackForQuery = async (
    conversationId: string,
    queryId: string,
    feedback: number
  ) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation || conversation.error) return;

    if (conversation.queries[queryId].feedback === feedback) {
      await deleteFeedback(id || "", conversationId, queryId);
      setConversations((prevConversations) => {
        const newConversations = prevConversations.map((c) => {
          if (c.id === conversationId && c.queries[queryId]) {
            return {
              ...c,
              queries: {
                ...c.queries,
                [queryId]: { ...c.queries[queryId], feedback: null },
              },
            };
          }
          return c;
        });
        return newConversations;
      });
    } else {
      handleAddFeedback(id || "", conversationId, queryId, feedback);
      setConversations((prevConversations) => {
        const newConversations = prevConversations.map((c) => {
          if (c.id === conversationId && c.queries[queryId]) {
            return {
              ...c,
              queries: {
                ...c.queries,
                [queryId]: { ...c.queries[queryId], feedback },
              },
            };
          }
          return c;
        });
        return newConversations;
      });
    }
  };

  const handleAddFeedback = async (
    user_id: string,
    conversation_id: string,
    query_id: string,
    feedback: number
  ) => {
    const data: BasePayload = await addFeedback(
      user_id,
      conversation_id,
      query_id,
      feedback
    );
    return data;
  };

  const handleAllConversationsError = () => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => ({ ...c, error: true }))
    );
  };

  const handleConversationError = (conversationId: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (c.id === conversationId) {
          return { ...c, error: true };
        }
        return c;
      })
    );
  };

  const handleWebsocketMessage = (message: Message | null | undefined) => {
    if (!message) return;
    if (process.env.NODE_ENV === "development") {
      console.log("Handling message type:", message.type);
    }
    if (message.type === "status") {
      const payload = message.payload as TextPayload;
      setConversationStatus(payload.text, message.conversation_id);
    } else if (message.type === "title") {
      const payload = message.payload as TitlePayload;
      setConversationTitle(payload.title, message.conversation_id);
    } else if (message.type === "ner") {
      const payload = message.payload as NERPayload;
      updateNERForQuery(message.conversation_id, message.query_id, payload);
    } else if (message.type === "completed") {
      setConversationStatus("", message.conversation_id);
      finishQuery(message.conversation_id, message.query_id);
      addSuggestionToConversation(
        message.conversation_id,
        message.query_id,
        message.user_id
      );
    } else if (message.type === "tree_update") {
      updateTree(message);
    } else {
      if (
        [
          "error",
          "tree_timeout_error",
          "rate_limit_error",
          "authentication_error",
        ].includes(message.type)
      ) {
        handleConversationError(message.conversation_id);
        finishQuery(message.conversation_id, message.query_id);
        setConversationStatus("", message.conversation_id);
      }

      if (message.type === "rate_limit_error") {
        enableRateLimitDialog();
      }
      addMessageToConversation(
        [message],
        message.conversation_id,
        message.query_id
      );
    }
  };

  const startNewConversation = async () => {
    if (id) {
      const newConversation = await addConversation(id);
      if (newConversation) {
        setCurrentConversation(newConversation.id);
      }
    }
  };

  // ── Derived: last suggestion list for the current conversation ────────────
  const currentSuggestions = useMemo<string[]>(() => {
    const conv = conversations.find((c) => c.id === currentConversation);
    if (!conv) return [];
    const allMessages = Object.values(conv.queries).flatMap((q) => q.messages);
    const last = [...allMessages].reverse().find((m) => m.type === "suggestion");
    return (last?.payload as SuggestionPayload)?.suggestions ?? [];
  }, [conversations, currentConversation]);

  // ── Inline rename: update preview title locally, then persist to backend ──
  const renameConversation = async (conversationId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed || !id) return;
    // Optimistic UI update
    setConversationPreviews((prev) => ({
      ...prev,
      [conversationId]: {
        ...(prev[conversationId] ?? { last_update_time: new Date().toISOString() }),
        title: trimmed,
      },
    }));
    // Persist to backend — pass empty rebuild array (title-only update)
    await saveConversation(id, conversationId, trimmed, []);
  };

  useEffect(() => {
    if (!collections) return;
    setConversations((prevConversations) =>
      prevConversations.map((c) => {
        if (
          !c.enabled_collections ||
          Object.keys(c.enabled_collections).length === 0
        ) {
          return {
            ...c,
            enabled_collections: collections.reduce(
              (acc, c) => ({ ...acc, [c.name]: true }),
              {}
            ),
          };
        }
        return c;
      })
    );
  }, [collections]);

  useEffect(() => {
    if (id && !initial_ref.current && initialized) {
      initial_ref.current = true;
      loadConversationsFromDB();
    }
  }, [id, initialized]);

  useEffect(() => {
    // Skip the initial mount run — the [id, initialized] effect owns the first load.
    // This effect only reacts to genuine flag changes (e.g., after saveConfig).
    if (!convFlagMountedRef.current) {
      convFlagMountedRef.current = true;
      return;
    }
    if (id && initial_ref.current) {
      loadConversationsFromDB();
    }
  }, [fetchConversationFlag]);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const isChatPageOrRoot =
      pathname === "/" && (pageParam === "chat" || pageParam === null);

    if (process.env.NODE_ENV === "development") {
      console.log("Conversation selection logic:", {
        isChatPageOrRoot,
        initial_ref: initial_ref.current,
        conversationPreviews: Object.keys(conversationPreviews).length,
        id: !!id,
        currentConversation,
      });
    }

    if (
      isChatPageOrRoot &&
      initial_ref.current &&
      id &&
      Object.keys(conversationPreviews).length > 0
    ) {
      // Skip if a programmatic selectConversation() just ran — searchParams is stale
      if (programmaticSelectRef.current) {
        programmaticSelectRef.current = false;
        return;
      }

      const conversationId = searchParams.get("conversation");

      if (conversationId) {
        // Handle specific conversation ID in URL
        if (conversationId === currentConversation) {
          return;
        }
        if (!conversationPreviews[conversationId]) {
          // Conversation not found - select latest existing one
          const latestConversationId = Object.entries(
            conversationPreviews
          ).sort(
            ([, a], [, b]) =>
              new Date(b.last_update_time).getTime() -
              new Date(a.last_update_time).getTime()
          )[0][0];
          changePage("chat", { conversation: latestConversationId }, true);
          return;
        }
        const conversation = conversations.find((c) => c.id === conversationId);
        const conversationName = conversationPreviews[conversationId].title;

        if (!conversation) {
          retrieveConversation(
            conversationId,
            conversationName,
            new Date(conversationPreviews[conversationId].last_update_time)
          );
        }
        setCurrentConversation(conversationId);
      } else {
        // No conversation ID in URL - auto-select the most recent conversation.
        // replaceState (used by changePage) does NOT trigger useSearchParams to
        // update, so we must also call setCurrentConversation directly here —
        // otherwise currentConversation stays null and sendQuery silently bails.
        const latestConversationId = Object.entries(conversationPreviews).sort(
          ([, a], [, b]) =>
            new Date(b.last_update_time).getTime() -
            new Date(a.last_update_time).getTime()
        )[0][0];

        if (latestConversationId !== currentConversation) {
          // Load conversation data into memory if it hasn't been fetched yet
          const alreadyLoaded = conversations.find(
            (c) => c.id === latestConversationId
          );
          if (!alreadyLoaded) {
            const preview = conversationPreviews[latestConversationId];
            retrieveConversation(
              latestConversationId,
              preview?.title ?? "New Conversation",
              new Date(preview?.last_update_time ?? Date.now())
            );
          }
          setCurrentConversation(latestConversationId);
          changePage("chat", { conversation: latestConversationId }, true);
        }
      }
    }
  }, [searchParams, pathname, conversationPreviews, id, currentConversation]);

  return (
    <ConversationContext.Provider
      value={{
        setConversations,
        setCurrentConversation,
        conversations,
        currentConversation,
        addConversation,
        removeConversation,
        selectConversation,
        setConversationStatus,
        setAllConversationStatuses,
        addMessageToConversation,
        initializeEnabledCollections,
        toggleCollectionEnabled,
        updateTree,
        addTreeToConversation,
        startNewConversation,
        changeBaseToQuery,
        addQueryToConversation,
        creatingNewConversation,
        conversationPreviews,
        loadingConversations,
        setCreatingNewConversation,
        finishQuery,
        updateNERForQuery,
        updateFeedbackForQuery,
        triggerAllCollections,
        handleConversationError,
        handleAllConversationsError,
        addSuggestionToConversation,
        getAllEnabledCollections,
        loadConversationsFromDB,
        handleWebsocketMessage,
        loadingConversation,
        currentSuggestions,
        renameConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
