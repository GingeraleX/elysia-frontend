"use client";

// This page uses useSearchParams() and manages auth-based routing client-side.
// Disable static prerendering — always render at request time.
export const dynamic = "force-dynamic";

import { useAuth } from "@/app/components/contexts/AuthContext";
import { ShellLayout } from "@/app/components/layout/ShellLayout";
import { UserProfile } from "@/app/components/auth/UserProfile";
import React, { useContext, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import nextDynamic from "next/dynamic";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageLoader } from "./components/loading/LoadingSpinner";
import { FullScreenLoader } from "./components/loading/FullScreenLoader";
import { public_path } from "./components/host";

// ⚡ Dynamic imports - load only the page user needs
// Saves 80%+ on initial bundle size!
// Shows CompactLoader during page transitions
const ChatPage = nextDynamic(() => import("./pages/ChatPage"), { 
  loading: () => <PageLoader /> 
});
const DataPage = nextDynamic(() => import("./pages/DataPage"), { 
  loading: () => <PageLoader /> 
});
const CollectionPage = nextDynamic(() => import("./pages/CollectionPage"), { 
  loading: () => <PageLoader /> 
});
const ImportDataPage = nextDynamic(() => import("./pages/ImportDataPage"), { 
  loading: () => <PageLoader /> 
});
const SettingsPage = nextDynamic(() => import("./pages/SettingsPage"), { 
  loading: () => <PageLoader /> 
});
const EvalPage = nextDynamic(() => import("./pages/EvalPage"), { 
  loading: () => <PageLoader /> 
});
const FeedbackPage = nextDynamic(() => import("./pages/FeedbackPage"), { 
  loading: () => <PageLoader /> 
});
const ElysiaPage = nextDynamic(() => import("./pages/ElysiaPage"), { 
  loading: () => <PageLoader /> 
});
const DisplayPage = nextDynamic(() => import("./pages/DisplayPage"), { 
  loading: () => <PageLoader /> 
});
const LoginPage = nextDynamic(() => import("./pages/LoginPage"), { 
  loading: () => <PageLoader /> 
});
const LandingPage = nextDynamic(() => import("./pages/LandingPage"), { 
  loading: () => <PageLoader /> 
});
const FilesPage = nextDynamic(() => import("./pages/FilesPage"), { 
  loading: () => <PageLoader /> 
});


/**
 * Root page — Next.js 14 requires useSearchParams() to live inside a <Suspense> boundary.
 * This wrapper satisfies that requirement while keeping force-dynamic rendering.
 */
export default function Home() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <HomeContent />
    </Suspense>
  );
}

/**
 * Inner component that owns all routing + auth logic.
 * Separated from Home so that useSearchParams() is safely inside <Suspense>.
 *
 * Logic:
 * - Unauthenticated + no ?page → Show landing (full page)
 * - Unauthenticated + ?page=login → Show login modal
 * - Authenticated → Auto-redirect to ?page=chat
 * - Guest mode → Auto-redirect to ?page=chat
 */
function HomeContent() {
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
      // Read the current URL param directly to avoid the race where
      // currentPage state hasn't been set yet from the first searchParams effect.
      const pageParam = searchParams.get("page");
      if (pageParam === "login" || pageParam === null) {
        // Authenticated user on login or bare URL → go to chat
        window.history.replaceState(null, "", "/?page=chat");
        setCurrentPage("chat");
      }
      // All other valid pages (data, settings, etc.) are preserved on reload.
    }
  }, [user, isGuest, searchParams]);

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
        {/* Fixed avatar — desktop only. Mobile gets it inline in MobileHeader. */}
        <div className="hidden lg:block">
          <UserProfile />
        </div>
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
 * Mobile-only top bar with hamburger trigger.
 * Hidden on lg+ (desktop already shows the persistent sidebar).
 * h-14 = 56px — exactly fits the avatar button (top-0 + h-9 = 36px centred in 56px).
 */
function MobileHeader() {
  return (
    <header className="lg:hidden flex items-center justify-between px-3 h-14 shrink-0 border-b border-border bg-background/90 backdrop-blur-sm z-30 relative">
      {/* Left: hamburger */}
      <SidebarTrigger className="h-9 w-9 text-primary shrink-0" />

      {/* Centre: logo + name */}
      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <img src={`${public_path}logo.svg`} alt="Elysia" className="w-5 h-5" />
        <span className="text-sm font-bold text-primary">Elysia</span>
      </div>

      {/* Right: profile avatar — inline (not fixed) so it sits inside this bar */}
      <UserProfile inline />
    </header>
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
        {/* Sidebar Navigation — Sheet/drawer on mobile, permanent on desktop */}
        <SidebarComponent />

        {/* Content column — mobile header + scrollable page area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <MobileHeader />

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden p-2 md:p-4 lg:p-6">
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
            {currentPage === "files" && <FilesPage />}
          </main>
        </div>
      </div>
    </ShellLayout>
  );
}
