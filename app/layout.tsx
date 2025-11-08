import type { Metadata } from "next";
import "./globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "./components/contexts/AuthContext";
import { SessionProvider } from "./components/contexts/SessionContext";
import { CollectionProvider } from "./components/contexts/CollectionContext";
import { ConversationProvider } from "./components/contexts/ConversationContext";
import { SocketProvider } from "./components/contexts/SocketContext";
import { EvaluationProvider } from "./components/contexts/EvaluationContext";
import { ToastProvider } from "./components/contexts/ToastContext";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RouterProvider } from "./components/contexts/RouterContext";
import { ProcessingProvider } from "./components/contexts/ProcessingContext";

const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-text",
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Elysia",
  description: "Your AI Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_G_KEY || ""} />
      <body
        className={`bg-background h-screen w-screen overflow-hidden ${space_grotesk.variable} ${manrope.variable} font-text antialiased flex`}
        suppressHydrationWarning
      >
        {/* Minimal providers - only auth needed for login screen */}
        <AuthProvider>
          <ToastProvider>
            <SessionProvider>
              {/* Heavy providers wrapped conditionally in children */}
              {children}
              <Toaster />
            </SessionProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
