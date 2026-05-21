# Status Handoff - UI/UX

## Stato attuale
- Data: 2026-04-28
- Repository: `https://github.com/GingeraleX/elysia-frontend`
- Branch attivo: `themes/marco`
- Obiettivo prossima sessione: migliorare UI e UX senza cambiare logica backend.

## Ambiente locale
- Runtime disponibile: Bun `1.3.13`
- Dipendenze installate: `node_modules` presente
- File env locale: `.env` con mock mode abilitata (impostata da utente)
- Nota: `.env.example` risulta cancellato nel working tree per scelta utente (non ripristinare automaticamente).

## Avvio progetto (dev)
1. `bun run dev`
2. Aprire `http://localhost:3001`
3. Se compare il toggle in basso a destra, attivare `MOCK ON`.
4. Navigare su `/?page=chat` per entrare direttamente nella UI principale.

## Accesso come utente loggato (mock)
La sessione mock usa localStorage con queste chiavi principali:
- `auth_token`
- `user_id`
- `user_email`
- `user_role`
- `tenant_id`
- `tenant_name`
- `mockMode=true`

Se necessario, forzare da console browser:

```js
localStorage.setItem("mockMode","true");
localStorage.setItem("auth_token","mock.jwt.token");
localStorage.setItem("user_id","mock-user-00000000-0000-0000-0000-000000000001");
localStorage.setItem("user_email","demo@example.com");
localStorage.setItem("user_role","ADMIN");
localStorage.setItem("tenant_id","mock-tenant-0000-0000-0000-000000000001");
localStorage.setItem("tenant_name","Demo Organization");
localStorage.removeItem("guest_mode");
location.href='/?page=chat';
```

## Priorita UI/UX prossima sessione
1. Definire direzione visiva unica (tipografia, palette, spaziature, tone of UI).
2. Rifinire layout principale (sidebar, header, area contenuti) su desktop e mobile.
3. Migliorare gerarchia informativa nelle pagine core (`chat`, `data`, `settings`).
4. Uniformare componenti interattivi (button, input, card, modal, stati hover/focus/disabled/loading).
5. Ridurre attrito UX nei flussi chiave (prima apertura, navigazione, feedback stato azioni).
6. Validare accessibilità base (contrasto, focus visibile, keyboard navigation minima).

## Guardrail di implementazione
- Non toccare endpoint o contratti API.
- Privilegiare cambiamenti in layer presentazionale e componenti UI.
- Evitare regressioni funzionali: test manuale rapido dopo ogni blocco di modifiche.
- Mantenere mock mode funzionante per review senza backend.

## Definizione di done (prima iterazione)
- UI più coerente e leggibile nelle pagine principali.
- Navigazione percepita più chiara e meno dispersiva.
- Componenti base con stile uniforme.
- Nessun blocco su login/accesso in mock.
