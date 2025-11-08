import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard - Elysia",
  description: "Your Elysia dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Elysia account
        </p>
      </div>
      
      <div className="grid gap-4">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p className="text-muted-foreground mb-4">
            Your account is now set up and ready to use. Here are some next steps:
          </p>
          <ul className="space-y-2 text-sm">
            <li>✓ Account created successfully</li>
            <li>✓ Tenant provisioned</li>
            <li>✓ Ready to start using Elysia</li>
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <p className="text-muted-foreground mb-4">
            Manage your account and organization settings.
          </p>
          <Link 
            href="/settings" 
            className="text-primary hover:underline"
          >
            Go to Settings →
          </Link>
        </div>
      </div>
    </div>
  );
}

