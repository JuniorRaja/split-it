# split·it

Splitwise-style trip expense splitter for the MAL26 crew. Static site — React 18 UMD + PocketBase JS SDK from CDN, JSX **precompiled** to `app.js` (no runtime Babel). Hosted on GitHub Pages, mobile-first, installable to the home screen.

```
GitHub Pages (index.html + app.js + manifest/icons, static)
        │  HTTPS + PocketBase JS SDK (+ realtime SSE)     │ open.er-api.com (daily FX rates)
        ▼                                                  ▼
PocketBase @ db.prasannar.com   (shared instance — collections prefixed splitit_)
   splitit_users | splitit_trips | splitit_expenses | splitit_splits | splitit_settlements | splitit_activity
```

## Features

- **Profile-picker sign-in** for the crew (Prasanna, Chinna, Sabari, Lokesh, Dinesh) + email fallback. Accounts are provisioned by the PB admin only — no open registration.
- **Trips** — per-trip **base currency** (ISO code; balances are kept in it), add members by email, rename, delete (owner). Base currency locks once the trip has expenses.
- **Multi-currency expenses** — enter any expense in INR, MYR, SGD, THB, USD, EUR, GBP, AED, JPY, IDR, VND or LKR. The daily mid-market rate is fetched automatically (cached per day, editable if you exchanged at a different rate); the original amount, rate, and converted base amount are all stored and shown.
- **Four split modes** — equally, exact amounts (in the entry currency), percentages, shares — with live per-person preview in base currency and rounding that always sums exactly.
- **Edit + delete** any expense; detail sheet with split breakdown, FX info and **comments**.
- **Balances** — per-member net with bars, **debt simplification**, one-tap Settle prefill, manual payments, payment history with delete.
- **Totals** — trip spend, per-head average, you-paid vs your-share, category breakdown, who-paid-what, **CSV export** (with currency, rate, and base columns).
- **Activity feed**, **realtime sync** (PB SSE), search + category filter, monthly grouping.
- **Mobile UX** — installable PWA (manifest + icons), safe-area aware, sticky blurred header, **swipe left/right to switch tabs**, **drag sheets down to dismiss**, bottom toasts, numeric keyboards, dark mode, reduced-motion support.
- **Fast** — precompiled JS (~63 KB), deferred pinned CDN scripts, preconnects, and localStorage snapshot hydration: revisits paint the last-known data instantly while fresh data loads.

## Development

```
npm install        # dev-only: @babel/standalone
node build.mjs     # compiles app.jsx -> app.js
```

Edit `app.jsx` (never `app.js`), rebuild, and bump the `app.js?v=N` query in `index.html` so clients pick up the new file.

Config at the top of `app.jsx`: `PB_URL`, `PREFIX` (`splitit_`), `ROSTER` (login-screen profiles), `CURRENCIES`.

## Multi-currency model

Each trip has a base currency. A foreign-currency expense stores `amount` + `currency` (as entered), `fx_rate` (editable, auto-fetched from open.er-api.com and cached per day in localStorage), and `base_amount = amount × fx_rate`. **All splits, balances, settlements and totals are in base currency** — one coherent ledger, no per-currency balance juggling. Settlements are recorded in base currency.

## PocketBase setup (already provisioned)

Live schema in [`pb_schema.json`](pb_schema.json) (PB 0.23+ format) — import via Dashboard → Settings → Import collections. Notes:

- `splitit_users` is a dedicated auth collection (shared PB instance serves several apps; everything here is prefixed `splitit_`). Its `createRule` is locked — create accounts from the Dashboard with `emailVisibility: true`.
- `created`/`updated` are explicit `autodate` fields — PB 0.23+ doesn't add them automatically to API-created collections.
- Trip data is visible/editable only to the trip's owner + members; activity is append-only for members.

## Known trade-offs

- Single payer per expense (no multi-payer).
- FX rate is fixed at entry time (editable) — no retroactive revaluation.
- Comments live in `splitit_activity` (`action: "comment"`) and can't be deleted by users.
- Expense create/update trusts split rows from members — fine for a trusted group.
