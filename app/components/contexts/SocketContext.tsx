"use client";

import { createContext, useEffect, useState } from "react";
import { Message } from "@/app/types/chat";
import { getWebsocketHost } from "../host";
import { useContext, useRef } from "react";
import { ConversationContext } from "./ConversationContext";
import { ToastContext } from "./ToastContext";
import { AuthContext } from "./AuthContext";
import { getModeStatus } from "@/app/api/modeToggle";

export const SocketContext = createContext<{
  socketOnline: boolean;
  sendQuery: (
    user_id: string,
    query: string,
    conversation_id: string,
    query_id: string,
    route?: string,
    mimick?: boolean,
    tree_index?: number
  ) => Promise<boolean>;
}>({
  socketOnline: false,
  sendQuery: async () => false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    setConversationStatus,
    setAllConversationStatuses,
    handleAllConversationsError,
    getAllEnabledCollections,
    handleWebsocketMessage,
  } = useContext(ConversationContext);

  const { showErrorToast, showSuccessToast } = useContext(ToastContext);
  const { user, isGuest } = useContext(AuthContext); // Get auth status

  const [socketOnline, setSocketOnline] = useState(false);
  const [socket, setSocket] = useState<WebSocket>();
  const [reconnect, setReconnect] = useState(false);
  const initialRef = useRef(false);

  // Only initialize reconnect if user is authenticated
  useEffect(() => {
    if (user || isGuest) {
      setReconnect(true);
    }
  }, [user, isGuest]);

  useEffect(() => {
    if (!initialRef.current) {
      return;
    }

    const interval = setInterval(() => {
      if (!socketOnline || socket?.readyState === WebSocket.CLOSED || !socket) {
        console.log("Elysia not online, trying to reconnect...");
        initialRef.current = false;
        setReconnect((prev) => !prev);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [socketOnline, socket]);

  useEffect(() => {
    // Don't connect if not authenticated
    if (!user && !isGuest) {
      return;
    }

    if (initialRef.current) {
      return;
    }

    initialRef.current = true;

    const socketHost = getWebsocketHost() + "query";
    const localSocket = new WebSocket(socketHost);

    localSocket.onopen = () => {
      setSocketOnline(true);
      showSuccessToast("Connected to Elysia");
      if (process.env.NODE_ENV === "development") {
        console.log("Socket opened");
      }
    };

    localSocket.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        handleWebsocketMessage(message);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(error);
        }
      }
    };

    localSocket.onerror = (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ WebSocket error:", error);
      }
      setSocketOnline(false);
      setSocket(undefined);
      setAllConversationStatuses("");
      handleAllConversationsError();
      // Don't show error toast - let user use app in offline mode
      if (process.env.NODE_ENV === "development") {
        showErrorToast("⚠️ Connection to backend lost (working in offline mode)");
      }
    };

    localSocket.onclose = () => {
      if (process.env.NODE_ENV === "development") {
        console.log("🔌 Socket closed");
      }
      setSocketOnline(false);
      setAllConversationStatuses("");
      setSocket(undefined);
      handleAllConversationsError();
      // Don't show error toast in production - silently retry
      if (process.env.NODE_ENV === "development") {
        showErrorToast("⚠️ Disconnected from backend");
      }
    };

    setSocket(localSocket);
  }, [reconnect]);

  const sendQuery = async (
    user_id: string,
    query: string,
    conversation_id: string,
    query_id: string,
    route: string = "",
    mimick: boolean = false,
    tree_index: number = 0
  ) => {
    // Guard: only send if the socket is actually open.
    // If we optimistically set status then fail to send, the status gets
    // permanently stuck at "Thinking..." and blocks all future queries.
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      if (process.env.NODE_ENV === "development") {
        console.warn("sendQuery called with socket not OPEN, dropping message");
      }
      return Promise.resolve(false);
    }

    setConversationStatus("Thinking...", conversation_id);
    const enabled_collections = getAllEnabledCollections();

    // Fetch the current mode (cloud | local) at send-time so each message
    // carries the exact mode the user had when they clicked Send.
    let processing_mode = "cloud";
    try {
      const modeStatus = await getModeStatus();
      processing_mode = modeStatus.mode;
    } catch {
      // Fall back to cloud on network error — safe default
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `Sending query with enabled collections: ${enabled_collections} to conversation ${conversation_id}`
      );
    }

    try {
      socket.send(
        JSON.stringify({
          user_id,
          query,
          query_id,
          conversation_id,
          collection_names: enabled_collections,
          route,
          mimick,
          tree_index,
          processing_mode,
        })
      );
    } catch (err) {
      // send() threw (socket closed between the readyState check and the send call)
      setConversationStatus("", conversation_id);
      if (process.env.NODE_ENV === "development") {
        console.error("sendQuery socket.send() threw:", err);
      }
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  };

  return (
    <SocketContext.Provider value={{ socketOnline, sendQuery }}>
      {children}
    </SocketContext.Provider>
  );
};
