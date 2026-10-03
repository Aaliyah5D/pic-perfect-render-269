# Senda: send money home, made simple

**Mukuru × WeThinkCode_ SheHacks · Challenge A: Money Home, Made Simple**

Thandi works in Johannesburg and sends money to her mother in Harare every month. Her phone is cheap, her signal is unreliable, and she reads English better than she speaks it. Senda gets her money home with every cost shown up front, and it works even without a smartphone.

## What it does

| Brief requirement | How Senda meets it |
| --- | --- |
| Send-money journey | 4 steps: destination → amount → recipient → review, then a confirmation screen with a transfer ID |
| Clear fees and exchange rate | Every screen shows the fee, rate, total cost and the exact amount the recipient gets. The rate shown is held for 3–6 minutes and is the rate actually charged |
| Track status | Sent → In transit → Ready to collect → Collected, enforced by a server-side state machine |
| Two or more languages | English and Shona (`src/locales`), switchable on every screen |

**Bonus features**

- **USSD (`*120*7362#`)**: the full send flow and a "My transfers" list on a feature phone with no data. `/ussd` is an in-browser phone simulator. The backend endpoint follows the [Africa's Talking USSD callback format](https://developers.africastalking.com/docs/ussd/overview), so it could be connected to a real shortcode.
- **Exchange rate that moves**: the mock FX service drifts up to ±1.5% every 3 minutes. A quote carries its rate window, and the server honours it until it expires. If the rate changes before the user confirms, they are asked to check the new amount, so the price never changes silently.
- **Recipient notifications**: the recipient gets a (mock) SMS when the money is sent and when it's ready to collect. The tracking page shows these messages.
- **Built for unreliable connections**: the in-progress transfer is saved in `sessionStorage`, so a reload or dropped connection doesn't lose what was typed. The screens use large touch targets and announce status changes to screen readers.

## Try it

```sh
npm install   # or: bun install
npm run dev
```

1. **App:** open `/` → *Send Money*. The demo persona (Thandi → Mai Chipo) is pre-filled, so you can click straight through.
2. **Tracking:** on the tracking page, use *Advance Status* (demo only) to move the transfer along and watch the SMS to the recipient appear.
3. **USSD:** open `/ussd`, press *Call*, and reply with numbers: `1` (send) → `1` (Zimbabwe) → `500` → phone → name → city → `1` (confirm). Then dial again and choose `2` to see the transfer. Option `3` switches the menu to Shona.

## Architecture

```
src/
  lib/
    types.ts          shared domain types (client + server)
    senda.server.ts   business logic: countries, FX, fees, quotes, transfers, status machine
    ussd.server.ts    USSD menu (stateless; reuses senda.server)
    api.ts            typed client for the REST API
    flow.tsx          send-flow draft state (persisted to sessionStorage)
    i18n.tsx          translation provider
  routes/
    api/              REST endpoints (server only)
    *.tsx             screens
  locales/            en.ts, sn.ts
```

The screens only talk to the backend over HTTP. All business rules (fees, rates, limits, status transitions) live on the server, which recalculates every quote, so the client can't change the price.

### API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/countries` | Supported origin/destination countries |
| `GET` | `/api/exchange-rates/:currency?amount=` | Current rate and full quote (fee, total, recipient amount, rate window) |
| `POST` | `/api/transfers` | Create a transfer; pass the quote's `rateWindow` to lock its rate (`409 quote_expired` if too old) |
| `GET` | `/api/transfers/:id` | Transfer details, status and recipient notifications |
| `PUT` | `/api/transfers/:id/status` | Move to the next status (`409` if the transition is invalid) |
| `POST` | `/api/ussd` | USSD gateway callback: `{ sessionId, phoneNumber, text }` → `CON …` / `END …` |

Fees: R15 + 2% (minimum R20). Limits: R50–R5,000.

## Prototype limitations

- **Storage is in memory.** Transfers are kept in the server's memory. On Cloudflare Workers (the deploy target), separate instances don't share memory and an instance can restart, so a transfer may not be found later. A real version would use a database (e.g. Cloudflare D1/KV).
- **No authentication.** The status endpoint is open so the demo can advance transfers. In production, only the payout partner would be allowed to call it.
- **Translations need review.** The Shona text has not yet been checked by a native speaker.
- **Mock services.** Exchange rates, SMS and payments are simulated.

## Built with

TanStack Start (React 19, file-based routing with server API routes), TypeScript, TanStack Query, Tailwind CSS, zod. Started in [Lovable](https://lovable.dev).
