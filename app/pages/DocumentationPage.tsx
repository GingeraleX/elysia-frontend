"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Bot,
  CheckCircle2,
  Cloud,
  Database,
  FileText,
  FolderOpen,
  HelpCircle,
  MessageSquareText,
  Route,
  Search,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

type DocSection = {
  id: string;
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};

const quickSteps = [
  "Carica i file nella pagina Dati.",
  "Controlla che la collezione sia pronta.",
  "Scegli i modelli AI più adatti.",
  "Fai una domanda nella Chat.",
  "Apri fonti e dettagli per verificare la risposta.",
];

function InfoBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background_alt/30 p-4">
      <p className="text-sm font-semibold text-primary">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-secondary">
        {children}
      </div>
    </div>
  );
}

function DocSectionBlock({ section }: { section: DocSection }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-6 rounded-lg border border-border/60 bg-background_alt/20 p-4 lg:p-5"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background [&>svg]:h-4 [&>svg]:w-4">
          {section.icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            {section.eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-primary">
            {section.title}
          </h2>
        </div>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-secondary">
        {section.content}
      </div>
    </section>
  );
}

export default function DocumentationPage() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState("panoramica");

  const sections = useMemo<DocSection[]>(
    () => [
      {
        id: "panoramica",
        title: "Panoramica",
        eyebrow: "Cos'è",
        icon: <BookOpen />,
        content: (
          <>
            <p>
              Questo software serve a interrogare i tuoi documenti con una chat
              AI. Tu carichi file e collezioni, il sistema li organizza e poi
              usa un modello AI per rispondere alle domande usando quei dati.
            </p>
            <InfoBox title="In parole semplici">
              È come avere un assistente che legge i tuoi documenti, cerca le
              parti utili e prepara una risposta più chiara possibile.
            </InfoBox>
          </>
        ),
      },
      {
        id: "rag",
        title: "Come funziona il RAG",
        eyebrow: "Metodo",
        icon: <Search />,
        content: (
          <>
            <p>
              RAG significa recuperare informazioni dai documenti prima di
              generare una risposta. La chat non prova solo a “inventare” una
              risposta: prima cerca nei dati caricati, poi usa il modello AI per
              spiegare il risultato.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <InfoBox title="1. Cerca">Trova i pezzi di testo più rilevanti.</InfoBox>
              <InfoBox title="2. Legge">Passa quei pezzi al modello AI.</InfoBox>
              <InfoBox title="3. Risponde">Produce una risposta basata sui dati trovati.</InfoBox>
            </div>
          </>
        ),
      },
      {
        id: "dati",
        title: "Pagina Dati",
        eyebrow: "Caricamento",
        icon: <Database />,
        content: (
          <>
            <p>
              La pagina Dati è il punto di partenza. Qui vedi lo stato delle
              collezioni, quanti oggetti sono stati caricati e puoi aggiungere
              nuovi file senza uscire dalla dashboard.
            </p>
            <InfoBox title="A cosa serve">
              Usala quando devi importare nuovi documenti, controllare se una
              collezione è pronta o aprire rapidamente una raccolta già
              esistente.
            </InfoBox>
          </>
        ),
      },
      {
        id: "file",
        title: "Pagina File",
        eyebrow: "Archivio",
        icon: <FolderOpen />,
        content: (
          <>
            <p>
              La pagina File mostra i file sorgente collegati alle collezioni.
              Serve come file manager leggero: puoi vedere da dove arrivano i
              dati, aprire la collezione collegata e gestire i file disponibili.
            </p>
            <InfoBox title="Nota">
              I file compaiono correttamente quando l&apos;import salva anche i
              metadati del file. Le vecchie collezioni potrebbero richiedere un
              nuovo import.
            </InfoBox>
          </>
        ),
      },
      {
        id: "chat",
        title: "Chat",
        eyebrow: "Domande",
        icon: <MessageSquareText />,
        content: (
          <>
            <p>
              La Chat è la parte operativa: fai una domanda, scegli o usi una
              collezione disponibile e ricevi una risposta costruita sui tuoi
              dati. È pensata per lavorare con linguaggio naturale, quindi puoi
              scrivere domande normali.
            </p>
            <InfoBox title="Esempi di domanda">
              “Riassumi questo contratto”, “Trova le scadenze principali”,
              “Quali documenti parlano di fatturazione?”.
            </InfoBox>
          </>
        ),
      },
      {
        id: "modelli",
        title: "Modelli AI",
        eyebrow: "Motore",
        icon: <Bot />,
        content: (
          <>
            <p>
              In Modelli AI scegli se usare modelli locali o modelli online. I
              modelli locali sono più indicati quando vuoi lavorare anche senza
              internet o con più controllo sui dati. I modelli online richiedono
              connessione e una API key valida.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoBox title="Locale">
                Funziona sul computer o sulla rete locale. Utile per privacy e
                continuità.
              </InfoBox>
              <InfoBox title="Online">
                Usa provider esterni come OpenAI, Gemini o altri servizi
                compatibili. Richiede internet.
              </InfoBox>
            </div>
          </>
        ),
      },
      {
        id: "impostazioni",
        title: "Impostazioni",
        eyebrow: "Configurazione",
        icon: <Settings2 />,
        content: (
          <>
            <p>
              Le Impostazioni raccolgono le configurazioni più tecniche:
              collegamento a Weaviate, parametri del sistema, chiavi API e
              opzioni avanzate. Al momento restano una traccia completa per chi
              deve intervenire in modo più preciso.
            </p>
            <InfoBox title="Consiglio">
              Se devi solo usare il programma, parti da Dati, File, Modelli AI
              e Chat. Le Impostazioni servono soprattutto nella fase di setup.
            </InfoBox>
          </>
        ),
      },
      {
        id: "fonti",
        title: "Fonti e risultati",
        eyebrow: "Verifica",
        icon: <FileText />,
        content: (
          <>
            <p>
              Quando il sistema risponde, è importante controllare le fonti. Le
              citazioni e i documenti collegati aiutano a capire da dove arriva
              l&apos;informazione e se la risposta è coerente con i dati caricati.
            </p>
            <InfoBox title="Regola pratica">
              Se la risposta deve essere usata per una decisione importante,
              apri sempre le fonti e verifica il testo originale.
            </InfoBox>
          </>
        ),
      },
      {
        id: "online-offline",
        title: "Online e offline",
        eyebrow: "Disponibilità",
        icon: <Cloud />,
        content: (
          <>
            <p>
              Alcune funzioni possono lavorare in locale, altre dipendono da
              servizi esterni. Se scegli modelli online, senza internet la chat
              non potrà usare quei provider. Se scegli modelli locali, il
              sistema può continuare a lavorare anche senza connessione, nei
              limiti della configurazione installata.
            </p>
            <InfoBox title="Differenza chiave">
              Locale vuol dire più controllo e meno dipendenza dalla rete.
              Online vuol dire accesso a provider esterni e spesso modelli più
              potenti, ma con API key e connessione.
            </InfoBox>
          </>
        ),
      },
      {
        id: "flusso",
        title: "Flusso consigliato",
        eyebrow: "Uso pratico",
        icon: <Route />,
        content: (
          <>
            <p>
              Per usare il sistema senza perdersi, segui sempre lo stesso
              percorso operativo.
            </p>
            <div className="rounded-lg border border-border/60 bg-background/50 p-3">
              <ol className="space-y-2">
                {quickSteps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-semibold text-accent">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        ),
      },
      {
        id: "sicurezza",
        title: "Dati e sicurezza",
        eyebrow: "Attenzione",
        icon: <ShieldCheck />,
        content: (
          <>
            <p>
              I dati caricati vengono usati per cercare informazioni e generare
              risposte. Se usi modelli online, una parte del contenuto può
              essere inviata al provider scelto per ottenere la risposta.
            </p>
            <InfoBox title="Prima di caricare dati sensibili">
              Verifica quale modello stai usando. Per dati riservati, valuta
              una configurazione locale o una policy aziendale chiara.
            </InfoBox>
          </>
        ),
      },
      {
        id: "glossario",
        title: "Glossario minimo",
        eyebrow: "Termini",
        icon: <HelpCircle />,
        content: (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoBox title="Collezione">
              Un gruppo di documenti o dati che il sistema può interrogare.
            </InfoBox>
            <InfoBox title="Embedding">
              Una rappresentazione numerica del testo che aiuta a trovare
              contenuti simili.
            </InfoBox>
            <InfoBox title="Provider">
              Il servizio che fornisce un modello AI, per esempio locale oppure
              online.
            </InfoBox>
            <InfoBox title="API key">
              Una chiave personale che permette al software di usare un servizio
              online.
            </InfoBox>
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
      setActiveSection(hash);
    }, 80);
  }, []);

  const handleContentScroll = () => {
    const container = contentRef.current;
    if (!container) return;

    const containerTop = container.getBoundingClientRect().top;
    const nextSection = sections.reduce((current, section) => {
      const element = document.getElementById(section.id);
      if (!element) return current;

      const offset = element.getBoundingClientRect().top - containerTop;
      return offset <= 80 ? section.id : current;
    }, sections[0]?.id || "panoramica");

    setActiveSection(nextSection);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setActiveSection(id);
    window.history.replaceState(null, "", `/?page=documentation#${id}`);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden fade-in">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-accent" />
          <h1 className="text-xl font-semibold text-primary">
            Documentazione
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-secondary">
          Guida rapida alle funzioni principali del RAG: caricamento dati,
          gestione file, chat, modelli AI e impostazioni essenziali.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-4 xl:grid-cols-[18rem_minmax(0,1fr)] xl:grid-rows-1">
        <aside className="min-h-0">
          <div className="flex max-h-full flex-col rounded-lg border border-border/60 bg-background_alt/20 p-3">
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Sezioni
            </p>
            <nav className="flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden xl:pb-0">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors xl:min-w-0",
                    activeSection === section.id
                      ? "bg-foreground_alt text-primary"
                      : "text-secondary hover:bg-foreground/50 hover:text-primary"
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background [&>svg]:h-3.5 [&>svg]:w-3.5">
                    {section.icon}
                  </span>
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div
          ref={contentRef}
          onScroll={handleContentScroll}
          className="min-h-0 space-y-4 overflow-y-auto pr-1 pb-6"
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <InfoBox title="Obiettivo">
              Trovare risposte nei tuoi documenti senza doverli aprire uno per
              uno.
            </InfoBox>
            <InfoBox title="Uso tipico">
              Carichi file, scegli il modello, fai domande e controlli le
              fonti.
            </InfoBox>
            <InfoBox title="Controllo">
              Puoi lavorare con modelli locali o online in base alle esigenze.
            </InfoBox>
          </div>

          {sections.map((section) => (
            <DocSectionBlock key={section.id} section={section} />
          ))}

          <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-secondary">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p>
              Questa documentazione è volutamente sintetica. In questa fase
              serve a spiegare le funzioni principali del RAG; potrà essere
              ampliata con schermate, esempi e procedure passo passo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
