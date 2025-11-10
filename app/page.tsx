"use client";

import { useAuth } from "@/app/components/contexts/AuthContext";
import { ShellLayout } from "@/app/components/layout/ShellLayout";
import { UserProfile } from "@/app/components/auth/UserProfile";
import React, { useContext, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { RouterContext } from "./components/contexts/RouterContext";
import { ToastContext } from "./components/contexts/ToastContext";
import ConfirmationModal from "./components/dialog/ConfirmationModal";
import { CollectionProvider } from "./components/contexts/CollectionContext";
import { ConversationProvider } from "./components/contexts/ConversationContext";
import { SocketProvider } from "./components/contexts/SocketContext";
import { EvaluationProvider } from "./components/contexts/EvaluationContext";
import { ProcessingProvider } from "./components/contexts/ProcessingContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RouterProvider } from "./components/contexts/RouterContext";
import SidebarComponent from "./components/navigation/SidebarComponent";
import { PageLoader } from "./components/loading/LoadingSpinner";
import { FullScreenLoader } from "./components/loading/FullScreenLoader";

// ⚡ Dynamic imports - load only the page user needs
// Saves 80%+ on initial bundle size!
// Shows CompactLoader during page transitions
const ChatPage = dynamic(() => import("./pages/ChatPage"), { 
  loading: () => <PageLoader /> 
});
const DataPage = dynamic(() => import("./pages/DataPage"), { 
  loading: () => <PageLoader /> 
});
const CollectionPage = dynamic(() => import("./pages/CollectionPage"), { 
  loading: () => <PageLoader /> 
});
const ImportDataPage = dynamic(() => import("./pages/ImportDataPage"), { 
  loading: () => <PageLoader /> 
});
const SettingsPage = dynamic(() => import("./pages/SettingsPage"), { 
  loading: () => <PageLoader /> 
});
const EvalPage = dynamic(() => import("./pages/EvalPage"), { 
  loading: () => <PageLoader /> 
});
const FeedbackPage = dynamic(() => import("./pages/FeedbackPage"), { 
  loading: () => <PageLoader /> 
});
const ElysiaPage = dynamic(() => import("./pages/ElysiaPage"), { 
  loading: () => <PageLoader /> 
});
const DisplayPage = dynamic(() => import("./pages/DisplayPage"), { 
  loading: () => <PageLoader /> 
});
const LoginPage = dynamic(() => import("./pages/LoginPage"), { 
  loading: () => <PageLoader /> 
});
const LandingPage = dynamic(() => import("./pages/LandingPage"), { 
  loading: () => <PageLoader /> 
});


/**
 * Root page - unified entry point
 * Logic:
 * - Unauthenticated + no ?page → Show landing (full page)
 * - Unauthenticated + ?page=login → Show login modal
 * - Authenticated → Auto-redirect to ?page=chat
 * - Guest mode → Auto-redirect to ?page=chat
 */
export default function Home() {
  const { user, isLoading, isGuest } = useAuth();
  const [currentPage, setCurrentPage] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const searchParams = useSearchParams();

  // Initial loading - show generic loader before anything else
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000); // Show loader for at least 1 second
    
    return () => clearTimeout(timer);
  }, []);

  // Determine current page from URL
  React.useEffect(() => {
    const pageParam = searchParams.get("page");
    setCurrentPage(pageParam);
  }, [searchParams]);

  // Handle authentication-based redirects (must be at top level, not conditional)
  React.useEffect(() => {
    if (user || isGuest) {
      // If authenticated user tries to access login, redirect to chat
      if (currentPage === "login") {
        window.history.replaceState(null, "", "/?page=chat");
        setCurrentPage("chat");
      } else if (!currentPage) {
        // If no page specified, redirect to chat
        window.history.replaceState(null, "", "/?page=chat");
        setCurrentPage("chat");
      }
    }
  }, [user, isGuest, currentPage]);

  // Show initial generic loading screen
  if (isInitializing) {
    return <FullScreenLoader />;
  }

  // Show loading state while auth is checking
  if (isLoading) {
    return <FullScreenLoader />;
  }

  // User is authenticated or guest - show main app
  if (user || isGuest) {

    return (
      <AppProviders>
        <UserProfile />
        <AuthenticatedApp />
      </AppProviders>
    );
  }

  // User is NOT authenticated
  // If requesting ?page=login, show login modal
  if (currentPage === "login") {
    return (
      <div className="w-full h-screen overflow-y-auto">
        <RouterProvider>
          <LoginPage />
        </RouterProvider>
      </div>
    );
  }

  // Default: Show landing page (no ?page= or any other page)
  return (
    <div className="w-full h-screen overflow-y-auto">
      <RouterProvider>
        <LandingPage />
      </RouterProvider>
    </div>
  );
}


/**
 * Heavy providers - only loaded after authentication
 * Reduces initial auth page load from 135MB to ~20MB
 */
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CollectionProvider>
      <ConversationProvider>
        <SocketProvider>
          <EvaluationProvider>
            <ProcessingProvider>
              <SidebarProvider>
                <RouterProvider>
                  {children}
                </RouterProvider>
              </SidebarProvider>
            </ProcessingProvider>
          </EvaluationProvider>
        </SocketProvider>
      </ConversationProvider>
    </CollectionProvider>
  );
}

/**
 * Main authenticated app content
 */
function AuthenticatedApp() {
  const { currentPage } = useContext(RouterContext);
  const { isConfirmModalOpen } = useContext(ToastContext);

  return (
    <ShellLayout>
      <div className="flex w-full h-full">
        {/* Sidebar Navigation */}
        <SidebarComponent />
        
        {/* Main Content Area */}
        <main className="flex flex-1 flex-col md:flex-row w-full gap-2 md:gap-6 items-start justify-start p-2 md:p-6 overflow-hidden">
          {isConfirmModalOpen && <ConfirmationModal />}
          {currentPage === "chat" && <ChatPage />}
          {currentPage === "data" && <DataPage />}
          {currentPage === "collection" && <CollectionPage />}
          {currentPage === "import" && <ImportDataPage />}
          {currentPage === "settings" && <SettingsPage />}
          {currentPage === "eval" && <EvalPage />}
          {currentPage === "feedback" && <FeedbackPage />}
          {currentPage === "elysia" && <ElysiaPage />}
          {currentPage === "display" && <DisplayPage />}
          {currentPage === "login" && <LoginPage />}
          {currentPage === "landing" && <LandingPage />}
        </main>
      </div>
    </ShellLayout>
  );
}
