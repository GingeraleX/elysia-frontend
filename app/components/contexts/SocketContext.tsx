"use client";

import { createContext, useEffect, useState } from "react";
import { Message } from "@/app/types/chat";
import { getWebsocketHost } from "../host";
import { useContext, useRef } from "react";
import { ConversationContext } from "./ConversationContext";
import { ToastContext } from "./ToastContext";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext<{
  socketOnline: boolean;
  sendQuery: (
    user_id: string,
    query: string,
    conversation_id: string,
    query_id: string,
    route?: string,
    mimick?: boolean
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
    mimick: boolean = false
  ) => {
    setConversationStatus("Thinking...", conversation_id);
    const enabled_collections = getAllEnabledCollections();

    if (process.env.NODE_ENV === "development") {
      console.log(
        `Sending query with enabled collections: ${enabled_collections} to conversation ${conversation_id}`
      );
    }

    socket?.send(
      JSON.stringify({
        user_id,
        query,
        query_id,
        conversation_id,
        collection_names: enabled_collections,
        route,
        mimick,
      })
    );

    return Promise.resolve(true);
  };

  return (
    <SocketContext.Provider value={{ socketOnline, sendQuery }}>
      {children}
    </SocketContext.Provider>
  );
};
