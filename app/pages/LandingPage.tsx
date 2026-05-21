"use client";

import React, { useContext } from "react";
import { RouterContext } from "@/app/components/contexts/RouterContext";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Lock,
  Brain,
  Shield,
  Cpu,
  Sparkles,
  Activity,
  Server,
  Database,
  Plug,
} from "lucide-react";
import { public_path } from "@/app/components/host";

/**
 * Cinematic editorial landing.
 * Italian copy preserved.
 */
export default function LandingPage() {
  const { changePage } = useContext(RouterContext);

  return (
    <div className="relative min-h-screen w-full bg-background text-primary overflow-x-hidden">
      {/* ───── Ambient backdrop ───── */}
      <AuroraBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav onLogin={() => changePage("login")} />

        <Hero onLogin={() => changePage("login")} />

        <Marquee />

        <Manifesto />

        <Bento />

        <UseCases />

        <Cta onLogin={() => changePage("login")} />

        <Footer />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Backdrop with slow-drifting aurora orb
   ──────────────────────────────────────────────────────────── */

function AuroraBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            "radial-gradient(900px 700px at 8% -10%, hsl(268 75% 30% / 0.28), transparent 60%)",
            "radial-gradient(900px 700px at 100% 12%, hsl(320 70% 32% / 0.18), transparent 60%)",
            "radial-gradient(1100px 900px at 50% 110%, hsl(200 80% 30% / 0.18), transparent 70%)",
          ].join(", "),
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(250 25% 96% / 0.7) 1px, transparent 1px), linear-gradient(to bottom, hsl(250 25% 96% / 0.7) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 80%)",
        }}
      />
      {/* Aurora orb */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-[55%] top-[-20%] z-0 h-[80vh] w-[80vh] rounded-full opacity-30 blur-3xl aurora-drift"
        style={{ background: "var(--grad-aurora-conic)" }}
      />
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   NAV
   ──────────────────────────────────────────────────────────── */

function Nav({ onLogin }: { onLogin: () => void }) {
  return (
    <nav className="sticky top-0 z-30 w-full border-b border-border/30 bg-background/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <Mark />
          <div className="flex flex-col leading-none">
            <span className="font-display-italic text-2xl text-primary">
              Elysia
            </span>
            <span className="font-mono-soft text-[9px] uppercase tracking-[0.3em] text-secondary/70 mt-1">
              Private AI Studio
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 rounded-full border border-border/40 bg-background_alt/60 px-2 py-1.5 backdrop-blur-md">
          {[
            { href: "#manifesto", label: "Manifesto" },
            { href: "#platform", label: "Piattaforma" },
            { href: "#use-cases", label: "Casi d'uso" },
            { href: "#cta", label: "Contatti" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono-soft rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-secondary transition-colors hover:bg-foreground_alt/60 hover:text-primary"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLogin}>
            Accedi
          </Button>
          <Button variant="primary" size="sm" onClick={onLogin}>
            Inizia
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Mark() {
  return (
    <div className="relative grid h-10 w-10 place-items-center">
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl opacity-80"
        style={{ background: "var(--grad-aurora)" }}
      />
      <div className="absolute inset-[2px] rounded-[10px] bg-background_alt/90 backdrop-blur-md" />
      <img
        src={`${public_path}logo.svg`}
        alt="Elysia"
        className="relative h-4 w-4"
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   HERO — asymmetric, with floating status capsule
   ──────────────────────────────────────────────────────────── */

function Hero({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="relative px-6 lg:px-12 pt-20 pb-28">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8">
        {/* Big lockup */}
        <div className="col-span-12 lg:col-span-9 stagger">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/8 px-3 py-1.5 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="font-mono-soft text-[10px] uppercase tracking-[0.24em] text-accent">
              Piattaforma RAG agentica · privata
            </span>
          </div>

          {/* Editorial heading */}
          <h1 className="mt-8 text-balance tracking-[-0.03em] leading-[0.95] text-primary">
            <span className="block text-[clamp(2.8rem,9vw,7.5rem)]">
              I tuoi dati.
            </span>
            <span className="block text-[clamp(2.8rem,9vw,7.5rem)]">
              La tua AI.
            </span>
            <span className="block text-[clamp(2.8rem,9vw,7.5rem)]">
              <span className="font-display-italic text-aurora">
                A modo tuo
              </span>
              <span className="text-accent">.</span>
            </span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-secondary">
            Elysia è una piattaforma RAG agentica pensata per aziende e team
            che mettono la privacy al primo posto. Distribuisci in locale,
            controlla tutto, scala senza limiti.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary/70">
            Progettata per founder, imprese e team che non accettano
            compromessi su privacy e controllo dei dati.
          </p>

          <div className="mt-12 flex flex-wrap gap-3">
            <Button size="lg" variant="primary" onClick={onLogin}>
              Prova gratis
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                window.open(
                  "https://t.me/gingerale0x?text=Hi%2C%20I%20have%20a%20question%20about%20Elysia",
                  "_blank"
                )
              }
            >
              Contatta il team commerciale
            </Button>
          </div>
        </div>

        {/* Live capsule */}
        <div className="col-span-12 lg:col-span-3 lg:pt-6">
          <LiveCapsule />
        </div>
      </div>
    </section>
  );
}

function LiveCapsule() {
  return (
    <div className="surface-glass relative rounded-2xl p-5 lg:translate-y-12">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Live · 00:42</span>
        <span className="inline-flex items-center gap-1 font-mono-soft text-[10px] text-accent">
          <Activity className="h-3 w-3" /> agent
        </span>
      </div>

      <div className="mt-4 space-y-3 font-mono-soft text-[12px] leading-relaxed">
        <Line k="user" v="riassumi Q3 finance" />
        <Line k="route" v="rag.documents.scoped" />
        <Line k="model" v="local-7b · 8.2k ctx" />
        <Line k="latency" v="241ms" emphasis />
      </div>

      <div className="mt-5 rounded-md border border-border/40 bg-background/50 p-3">
        <p className="text-[12px] leading-relaxed text-primary/90">
          Ricavi Q3 in crescita del{" "}
          <span className="text-aurora font-medium">+18.4%</span> YoY, trainati da
          Enterprise…
          <span className="cursor-blink ml-0.5 inline-block h-3 w-[7px] translate-y-0.5 bg-accent" />
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-mono-soft text-secondary/70">
        <span>0% data egress</span>
        <span>on-prem · eu-1</span>
      </div>
    </div>
  );
}

function Line({ k, v, emphasis }: { k: string; v: string; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-16 shrink-0 text-secondary/70">{k}</span>
      <span className={emphasis ? "text-accent" : "text-primary/90"}>{v}</span>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MARQUEE — ticker of values
   ──────────────────────────────────────────────────────────── */

function Marquee() {
  const items = [
    "Local-first",
    "RBAC granulare",
    "Multi-tenant",
    "Open source core",
    "EU sovereignty",
    "On-prem · cloud privato · ibrido",
    "API REST estendibili",
    "Zero data egress",
    "Audit trail completo",
    "RAG agentico",
    "Self-hosted models",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border/30 bg-background/30 py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent"
      />
      <div className="marquee">
        {doubled.map((it, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-3 pr-10 font-display-italic text-2xl text-primary/85"
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--grad-aurora)" }}
            />
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MANIFESTO — large editorial type
   ──────────────────────────────────────────────────────────── */

function Manifesto() {
  return (
    <section id="manifesto" className="relative px-6 lg:px-12 py-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3">
          <span className="eyebrow">— Manifesto · 01</span>
          <p className="mt-4 font-mono-soft text-[11px] leading-relaxed text-secondary">
            Una pila tecnologica completa per portare l'AI agentica dentro
            alla tua organizzazione, senza mai cedere il controllo dei dati.
          </p>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <h2 className="text-balance tracking-[-0.028em] leading-[0.98] text-[clamp(2rem,5.2vw,4.4rem)]">
            Costruita per chi non scende a{" "}
            <span className="font-display-italic text-aurora">
              compromessi
            </span>{" "}
            sui dati. Per chi vuole{" "}
            <span className="font-display-italic text-aurora">controllo</span>,
            non promesse.
          </h2>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   BENTO — asymmetric platform grid
   ──────────────────────────────────────────────────────────── */

function Bento() {
  return (
    <section id="platform" className="relative px-6 lg:px-12 py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="eyebrow">— Piattaforma · 02</span>
            <h3 className="font-display-italic text-5xl md:text-6xl tracking-tight text-primary">
              Una pila completa
            </h3>
          </div>
          <p className="max-w-md text-secondary text-sm leading-relaxed">
            Tutto il necessario per portare l'AI agentica in produzione, da
            data-ingestion a deploy.
          </p>
        </div>

        <div className="grid grid-cols-12 grid-rows-[auto] gap-3">
          {/* Big tile */}
          <BentoTile
            className="col-span-12 lg:col-span-7 lg:row-span-2 min-h-[360px]"
            num="01"
            icon={<Lock className="h-5 w-5" />}
            title="Architettura local-first"
            body="Distribuisci sulla tua infrastruttura — on-prem, cloud privato o ibrido. I dati non lasciano mai il tuo perimetro. Privacy e compliance by design, senza concessioni."
            featured
          />
          <BentoTile
            className="col-span-12 md:col-span-6 lg:col-span-5"
            num="02"
            icon={<Brain className="h-5 w-5" />}
            title="Agenti personali"
            body="RAG agentico per utente: ogni membro del team ha un assistente che rispetta ruolo, permessi e contesto."
          />
          <BentoTile
            className="col-span-12 md:col-span-6 lg:col-span-5"
            num="03"
            icon={<Shield className="h-5 w-5" />}
            title="RBAC enterprise"
            body="Controllo accessi granulare basato sui ruoli. Audit trail completo. Compliance pronta."
          />
          <BentoTile
            className="col-span-12 md:col-span-4"
            num="04"
            icon={<Cpu className="h-5 w-5" />}
            title="Modelli a scelta"
            body="LLM open source e proprietari, on-prem o ibrido."
          />
          <BentoTile
            className="col-span-12 md:col-span-4"
            num="05"
            icon={<Database className="h-5 w-5" />}
            title="Data layer"
            body="Ingestion, embedding, retrieval — tutto governato."
          />
          <BentoTile
            className="col-span-12 md:col-span-4"
            num="06"
            icon={<Plug className="h-5 w-5" />}
            title="API estendibili"
            body="REST + SDK. Componi l'AI nel tuo prodotto."
          />
        </div>
      </div>
    </section>
  );
}

function BentoTile({
  className = "",
  num,
  icon,
  title,
  body,
  featured = false,
}: {
  className?: string;
  num: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`group/tile surface-glass relative flex flex-col gap-4 overflow-hidden rounded-2xl p-7 transition-all duration-500 hover:border-accent/40 ${className}`}
    >
      {/* Hover aurora wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover/tile:opacity-100"
        style={{ background: "var(--grad-aurora-soft)" }}
      />

      <div className="relative flex items-center justify-between">
        <span className="font-mono-soft text-[10px] uppercase tracking-[0.24em] text-secondary/70">
          / {num}
        </span>
        <ArrowUpRight className="h-4 w-4 text-secondary/60 transition-all duration-300 group-hover/tile:-translate-y-0.5 group-hover/tile:translate-x-0.5 group-hover/tile:text-accent" />
      </div>

      <div
        className="relative grid h-10 w-10 place-items-center rounded-lg text-primary"
        style={{
          background: featured
            ? "var(--grad-aurora-soft)"
            : "hsl(var(--accent) / 0.10)",
          boxShadow: "inset 0 0 0 1px hsl(var(--accent) / 0.25)",
        }}
      >
        <span className="text-accent">{icon}</span>
      </div>

      <h4
        className={`relative tracking-tight text-primary ${
          featured
            ? "font-display-italic text-4xl md:text-5xl"
            : "text-xl font-medium"
        }`}
      >
        {title}
      </h4>

      <p
        className={`relative text-secondary leading-relaxed ${
          featured ? "text-base max-w-md" : "text-sm"
        }`}
      >
        {body}
      </p>

      {featured && (
        <div className="relative mt-auto flex items-end justify-between pt-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display-italic text-aurora text-6xl leading-none">
              0%
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-secondary">
              Data egress
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 font-mono-soft text-[10px] text-secondary/70">
            <span>EU · sovereign</span>
            <span>SOC2 · GDPR ready</span>
          </div>
        </div>
      )}
    </article>
  );
}

/* ────────────────────────────────────────────────────────────
   USE CASES — editorial spread with massive numbers
   ──────────────────────────────────────────────────────────── */

function UseCases() {
  const cases = [
    {
      n: "01",
      tag: "Compliance",
      title: "Enterprise",
      body: "Deploy multi-tenant con RBAC granulare. Pronto per la compliance con audit trail e governance dei dati.",
    },
    {
      n: "02",
      tag: "Brandable",
      title: "Partner white-label",
      body: "Integra Elysia nel tuo prodotto. Interfaccia white-label, tuo brand, pieno controllo.",
    },
    {
      n: "03",
      tag: "Local-first",
      title: "Team orientati alla privacy",
      body: "Opzioni di deploy locale. Nessun dato inviato a terze parti. La tua infrastruttura, le tue regole.",
    },
    {
      n: "04",
      tag: "Extensible",
      title: "Sviluppatori e startup",
      body: "Componenti open source, API REST e architettura estendibile. Costruisci sopra Elysia.",
    },
  ];

  return (
    <section id="use-cases" className="relative px-6 lg:px-12 py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-20 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-3">
            <span className="eyebrow">— Casi d'uso · 03</span>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h2 className="text-balance tracking-[-0.025em] leading-[0.98] text-[clamp(2rem,5vw,4.2rem)]">
              <span className="font-display-italic text-aurora">Perfetto</span>{" "}
              per team che cercano controllo, privacy e scalabilità.
            </h2>
          </div>
        </div>

        <div className="divide-y divide-border/40 border-y border-border/40">
          {cases.map((c) => (
            <a
              key={c.n}
              href="#cta"
              className="group/row relative grid grid-cols-12 items-center gap-6 px-2 py-10 transition-colors hover:bg-foreground_alt/20"
            >
              {/* Hover bar */}
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-0 bg-accent transition-all duration-500 group-hover/row:w-[2px]"
              />
              <span className="col-span-3 md:col-span-2 font-display-italic text-aurora text-6xl md:text-7xl leading-none tracking-tight">
                {c.n}
              </span>
              <div className="col-span-9 md:col-span-5 flex flex-col gap-1">
                <span className="font-mono-soft text-[10px] uppercase tracking-[0.22em] text-accent">
                  {c.tag}
                </span>
                <h3 className="font-display-italic text-3xl md:text-4xl tracking-tight text-primary">
                  {c.title}
                </h3>
              </div>
              <p className="col-span-12 md:col-span-4 text-sm leading-relaxed text-secondary">
                {c.body}
              </p>
              <span className="col-span-12 md:col-span-1 flex justify-end">
                <ArrowUpRight className="h-5 w-5 text-secondary/60 transition-all duration-500 group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-accent" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   CTA
   ──────────────────────────────────────────────────────────── */

function Cta({ onLogin }: { onLogin: () => void }) {
  return (
    <section id="cta" className="relative px-6 lg:px-12 py-32">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative overflow-hidden rounded-3xl border border-accent/30">
          {/* Background */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 460px at 50% 100%, hsl(268 80% 55% / 0.45), transparent 70%), linear-gradient(180deg, hsl(240 18% 6% / 0.92), hsl(240 14% 8% / 0.92))",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-30 mix-blend-screen aurora-drift"
            style={{ background: "var(--grad-aurora-conic)" }}
          />

          <div className="relative grid grid-cols-12 gap-6 px-8 py-20 md:px-16 md:py-24">
            <div className="col-span-12 md:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/60 px-3 py-1.5 backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-accent" />
                <span className="font-mono-soft text-[10px] uppercase tracking-[0.24em] text-accent">
                  Inizia oggi
                </span>
              </div>
              <h2 className="mt-6 tracking-[-0.025em] leading-[0.98] text-[clamp(2.2rem,5vw,4.4rem)]">
                Pronto a prendere{" "}
                <span className="font-display-italic text-aurora">
                  il controllo?
                </span>
              </h2>
              <p className="mt-5 max-w-lg text-secondary">
                Unisciti ai team che costruiscono il futuro dell'AI con privacy
                e controllo al centro. Nessun lock-in. Nessun compromesso.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button size="lg" variant="primary" onClick={onLogin}>
                  Inizia la prova gratuita
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() =>
                    window.open(
                      "https://t.me/gingerale0x?text=Hi%2C%20I%20want%20to%20learn%20about%20whitelabel%20options%20for%20Elysia",
                      "_blank"
                    )
                  }
                >
                  Scopri il white-label
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {[
                  { k: "Privacy", v: "100%", note: "Local-first" },
                  { k: "Scala", v: "∞", note: "La tua infra" },
                  { k: "Audit", v: "Full", note: "Trail completo" },
                  { k: "Egress", v: "0", note: "Zero leaks" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="surface-glass relative flex flex-col gap-2 rounded-xl p-5"
                  >
                    <span className="font-mono-soft text-[10px] uppercase tracking-[0.22em] text-secondary">
                      {s.k}
                    </span>
                    <span className="font-display-italic text-aurora text-4xl leading-none">
                      {s.v}
                    </span>
                    <span className="text-[11px] text-secondary/80">
                      {s.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   FOOTER
   ──────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="relative mt-auto border-t border-border/30 bg-background/55 px-6 lg:px-12 py-12 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Mark />
          <div className="flex flex-col leading-none">
            <span className="font-display-italic text-xl text-primary">
              Elysia
            </span>
            <span className="font-mono-soft text-[10px] uppercase tracking-[0.22em] text-secondary/70 mt-1">
              © 2025 · Tutti i diritti riservati
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-border/40 bg-background_alt/60 px-4 py-2 backdrop-blur-md">
          <Server className="h-3.5 w-3.5 text-secondary" />
          <span className="font-mono-soft text-[10px] uppercase tracking-[0.22em] text-secondary">
            Built in Italy · Deployed worldwide
          </span>
        </div>
        <div className="flex gap-7 font-mono-soft text-[11px] uppercase tracking-[0.18em] text-secondary">
          <a href="#" className="hover:text-primary transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Termini
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Contatti
          </a>
        </div>
      </div>
    </footer>
  );
}
