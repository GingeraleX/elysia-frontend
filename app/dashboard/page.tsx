import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard - Elysia",
  description: "La tua dashboard Elysia",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Benvenuto nel tuo account Elysia
        </p>
      </div>
      
      <div className="grid gap-4">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Per iniziare</h2>
          <p className="text-muted-foreground mb-4">
            Il tuo account è configurato e pronto all&apos;uso. Ecco i prossimi passaggi:
          </p>
          <ul className="space-y-2 text-sm">
            <li>✓ Account creato correttamente</li>
            <li>✓ Tenant predisposto</li>
            <li>✓ Pronto per iniziare a usare Elysia</li>
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Impostazioni</h2>
          <p className="text-muted-foreground mb-4">
            Gestisci le impostazioni del tuo account e della tua organizzazione.
          </p>
          <Link 
            href="/settings" 
            className="text-primary hover:underline"
          >
            Vai alle impostazioni →
          </Link>
        </div>
      </div>
    </div>
  );
}
