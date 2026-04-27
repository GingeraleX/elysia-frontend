# Elysia Frontend

![Elysia](./public/logo.svg)

Elysia is a Next.js 15 single-page application providing the full user interface for the Elysia AI platform. It covers authentication, multi-tenant session management, real-time AI chat, data collection management, file ingestion, model configuration, evaluation, and role-based administration. It communicates exclusively with the Bun/Elysia backend over a typed REST API.

---

## Tech Stack

**Framework & Core**

| Library | Version | Purpose |
|---|---|---|
| Next.js | 15 (App Router) | Framework, routing, SSR/static export |
| React | 18 | Component model |
| TypeScript | 5 | Type safety (`strict: true`) |
| Tailwind CSS | 3 | Utility-first styling |
| Bun | latest | Package manager & dev runtime |

**UI Components**

- **Radix UI** — accessible, unstyled primitives (dialog, dropdown, tabs, toast, select, etc.)
- **shadcn/ui** — pre-styled component layer on top of Radix UI
- **Framer Motion** — animations and transitions
- **React Markdown + React Syntax Highlighter** — chat message rendering

**3D & Visualization**

- **Three.js / React Three Fiber / Drei / Postprocessing** — 3D scenes and globe visualizations
- **Recharts** — data charts
- **XYFlow React** — node-based flow diagrams

---

## Requirements

- **Bun** ≥ 1.0 (preferred) or Node.js ≥ 18
- A running instance of the Elysia backend (port 3000) — _or_ mock mode enabled (see below)
- Modern browser with ES2020+ support

---

## Getting Started

### Standard (with backend)

```bash
# 1. Install dependencies
cd frontend
bun install

# 2. Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# 3. Start the dev server (port 3001)
bun run dev
```

### Mock Mode (no backend required)

Mock mode intercepts all API calls and returns fixture data. Useful for UI development, design reviews, and onboarding without running the full backend stack.

```bash
# 1. Enable mock mode
echo "NEXT_PUBLIC_MOCK_MODE=true" > .env.local

# 2. Install dependencies
bun install

# 3. Start
bun run dev
```

Then visit `http://localhost:3001`. Wait for compilation (first time takes a while). Click the **⚫ MOCK OFF** button in the bottom-right corner — it turns **🟢 MOCK ON** and reloads. All API requests are intercepted from that point. The toggle state persists in `localStorage` across reloads.

> Mock mode activates only when **both** `NEXT_PUBLIC_MOCK_MODE=true` (env) **and** `localStorage.mockMode === "true"` (runtime toggle) are set. In production builds without the env flag, `MockToggle` renders nothing and has zero runtime cost.

---

## Project Structure

```
frontend/
├── app/
│   ├── api/                          # Next.js server-side API handlers
│   │   ├── addFeedback.ts            # Evaluation feedback submission
│   │   ├── analyzeCollection.ts      # Collection analysis trigger
│   │   ├── createConfig.ts           # Model config creation
│   │   ├── deleteCollection.ts       # Collection deletion
│   │   ├── getCollections.ts         # Collection listing
│   │   ├── getConfig.ts / getConfigList.ts
│   │   ├── getModels.ts              # Available model listing
│   │   ├── loadConversation.ts / saveConversation.ts
│   │   ├── initializeUser.ts         # First-run user setup
│   │   ├── modeToggle.ts             # Stack/mode switching
│   │   └── ...                       # (30+ typed API handlers)
│   ├── components/
│   │   ├── admin/                    # Admin-only panels
│   │   │   └── ConfigSection.tsx
│   │   ├── auth/                     # Login, registration, session guards
│   │   ├── chat/                     # Chat interface
│   │   │   ├── components/           # Message bubbles, input, toolbars
│   │   │   ├── displays/             # Specialised display renderers
│   │   │   ├── nodes/                # Flow node components
│   │   │   ├── QueryInput.tsx        # Chat input with mode awareness
│   │   │   └── RenderChat.tsx        # Main chat renderer
│   │   ├── configuration/            # Model & agent configuration UI
│   │   │   ├── ConfigurationDashboard.tsx
│   │   │   ├── ConfigSidebar.tsx
│   │   │   ├── StackModeSlider.tsx
│   │   │   ├── TreeSettingsView.tsx
│   │   │   ├── sections/             # Grouped config sections
│   │   │   └── hooks/ utils/
│   │   ├── contexts/                 # React context providers
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ChatContext.tsx
│   │   │   ├── CollectionContext.tsx
│   │   │   ├── ConversationContext.tsx
│   │   │   ├── DisplayContext.tsx
│   │   │   ├── EvaluationContext.tsx
│   │   │   ├── ModeContext.tsx
│   │   │   ├── ProcessingContext.tsx
│   │   │   ├── RouterContext.tsx
│   │   │   ├── SessionContext.tsx
│   │   │   ├── SocketContext.tsx
│   │   │   ├── StackModeContext.tsx
│   │   │   └── ToastContext.tsx
│   │   ├── data-import/              # File ingestion pipeline UI
│   │   │   ├── DataImportHub.tsx
│   │   │   └── sections/
│   │   │       ├── FileUploadSection.tsx
│   │   │       ├── EmbedderConfigSection.tsx
│   │   │       ├── CollectionInfoSection.tsx
│   │   │       ├── PreviewSection.tsx
│   │   │       └── ImportProgressSection.tsx
│   │   ├── debugging/                # Internal developer utilities
│   │   ├── dialog/                   # Modal and dialog components
│   │   ├── evaluation/               # AI output evaluation and feedback
│   │   ├── explorer/                 # Data collection browser
│   │   ├── layout/                   # Shared layout wrappers
│   │   ├── loading/                  # Loading states and skeletons
│   │   ├── navigation/               # Sidebar, sub-menus, mode toggle
│   │   │   ├── SidebarComponent.tsx
│   │   │   ├── HomeSubMenu.tsx
│   │   │   ├── DataSubMenu.tsx
│   │   │   ├── EvalSubMenu.tsx
│   │   │   ├── SettingsSubMenu.tsx
│   │   │   └── RateLimitDialog.tsx
│   │   ├── settings/                 # Role-scoped settings panels
│   │   │   ├── AdminSettingsComponent.tsx
│   │   │   ├── OwnerSettingsComponent.tsx
│   │   │   └── UserSettingsComponent.tsx
│   │   ├── threejs/                  # 3D scene components
│   │   └── MockToggle.tsx            # Dev-only mock mode toggle
│   ├── pages/                        # Top-level page compositions
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── DataPage.tsx
│   │   ├── CollectionPage.tsx
│   │   ├── FilesPage.tsx
│   │   ├── ImportDataPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── ElysiaPage.tsx
│   │   ├── DisplayPage.tsx
│   │   ├── EvalPage.tsx
│   │   ├── FeedbackPage.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AgentConfigPage.tsx
│   │       ├── ApiKeysConfigPage.tsx
│   │       ├── ModelsConfigPage.tsx
│   │       ├── StorageConfigPage.tsx
│   │       ├── TimeoutsLoggingConfigPage.tsx
│   │       └── WeaviateConfigPage.tsx
│   ├── types/                        # Shared TypeScript interfaces
│   ├── globals.css
│   ├── layout.tsx                    # Root layout — provider tree assembly
│   └── page.tsx                      # Entry point
├── components/
│   └── ui/                           # shadcn/ui primitives
├── hooks/
│   ├── useApiErrorHandler.ts
│   ├── useGlobeSettings.ts
│   ├── useMobile.tsx
│   ├── useSystemConfig.ts
│   └── useToast.ts
├── lib/
│   ├── api-client.ts                 # Typed fetch wrapper (mock-aware)
│   ├── auth.ts                       # Auth helpers
│   ├── auth-errors.ts                # Typed auth error catalogue
│   ├── config.ts                     # Runtime config resolution
│   ├── mock-data.ts                  # Fixture datasets for mock mode
│   ├── mock-handlers.ts              # Endpoint-pattern → fixture mappings
│   └── utils.ts                      # General utilities
└── public/                           # Static assets (logo, icons, images)
```

---

## Features

### Authentication & Multi-Tenancy
- JWT-based login and registration
- Session management with automatic token refresh
- Role-based access: Owner, Admin, Member, Viewer, Guest
- Role-scoped settings panels (Owner / Admin / User)

### AI Chat
- Real-time conversation with configurable AI models
- Multiple display modes (text, flow, structured output)
- Stack mode and single-model mode switching
- Node-based flow display for multi-step reasoning

### Data Collections & File Ingestion
- Create, browse, and delete data collections
- Multi-step file import pipeline: upload → embedder config → preview → progress tracking
- Collection analysis and metadata management
- File record management with download support

### Model & Agent Configuration
- Named configuration profiles with sidebar navigation
- Per-collection embedder settings
- Agent pipeline configuration
- Stack mode slider for multi-model composition
- Tree-based settings view for advanced config

### Administration (Owner / Admin only)
- Admin dashboard with tenant overview
- Model provider management
- API key configuration
- Storage and Weaviate connection settings
- Timeout and logging configuration

### Evaluation & Feedback
- AI output evaluation workflows
- Feedback submission and review
- Evaluation history browsing

### Developer Tools
- **Mock Mode** — full API interception with fixture data, zero backend dependency
- Globe and 3D visualizations
- Rate limit dialog with user guidance
- Internal debugging panel

---

## Available Scripts

```bash
bun run dev              # Dev server on port 3001
bun run build            # Production build
bun run build:clean      # Clean build (removes .next/ and out/ first)
bun run build:static     # Static export build (NEXT_PUBLIC_IS_STATIC=true)
bun run build:proxy      # Proxy-mode build
bun run export           # Export static files to backend static dir
bun run assemble         # Static build + export in one step
bun run assemble:clean   # Clean static build + export
bun run start            # Start production server
bun run lint             # Run ESLint
```

---

## Environment Variables

Create `frontend/.env.local` (never commit this file):

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Base URL of the Elysia backend (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Yes | Same as above — used by `api-client.ts` and settings hooks |
| `NEXT_PUBLIC_API_TIMEOUT` | No | API call timeout in ms (default: `10000`) |
| `NEXT_PUBLIC_MOCK_MODE` | No | Set to `true` to enable the mock mode toggle in dev |
| `NEXT_PUBLIC_IS_STATIC` | No | Set to `true` for static export / GitHub Pages builds |
| `NEXT_PUBLIC_PROXY_MODE` | No | Set to `true` for proxy-mode builds |
| `NEXT_PUBLIC_G_KEY` | No | Google Analytics 4 measurement ID (leave empty to disable) |

---

## Architecture Notes

### Context Provider Tree

The root layout (`app/layout.tsx`) assembles a minimal provider tree. Only what is needed for the login screen is mounted at root level — heavy feature providers are composed inside the pages that need them:

```
AuthProvider → ToastProvider → SessionProvider → ModeProvider → StackModeProvider → children
```

Collection, Conversation, Socket, Processing, and Evaluation providers are scoped to their respective page trees.

### API Client & Mock Interception

`lib/api-client.ts` is the single entry point for all backend communication. When mock mode is active, `request()` delegates to `mock-handlers.ts` before issuing any network call. Fixture data lives in `mock-data.ts` and is mapped to endpoint URL patterns in `mock-handlers.ts`.

### Routing

Navigation is handled client-side via `RouterContext` without full page reloads. Next.js App Router manages auth-gated layout boundaries; internal view switching (Chat ↔ Data ↔ Settings ↔ Admin) happens through context state.

### Role-Based UI

Page-level and component-level rendering is gated by the role from `SessionContext`. Admin pages and Owner-only settings are not rendered for lower-privilege roles — the server also enforces these constraints independently.

### Fonts

- **Space Grotesk** (`--font-text`) — body and UI text
- **Manrope** (`--font-heading`) — headings and display text

---

## Contributing

1. Branch off `develop`: `feature/<name>`, `fix/<name>`, or `chore/<name>`.
2. Run `bun run lint` — zero errors required.
3. Run `bun run build` — must exit clean before opening a pull request.
4. Open a pull request against `develop` with a clear description of what changed and why.

> **Build gate:** TypeScript errors, missing imports, and broken component contracts are all caught at build time. The PR will not be accepted if the build fails.
