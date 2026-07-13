# split·it

Splitwise-style trip expense splitter for the MAL26 crew. One static `index.html` — React 18 UMD + Babel standalone + PocketBase JS SDK, all from CDN. No build step. Hosted on GitHub Pages.

```
GitHub Pages (index.html, static)
        │  HTTPS + PocketBase JS SDK (+ realtime SSE)
        ▼
PocketBase @ db.prasannar.com   (shared instance — collections prefixed splitit_)
   splitit_users | splitit_trips | splitit_expenses | splitit_splits | splitit_settlements | splitit_activity
```

## Features

- **Profile-picker sign-in** for the crew (Prasanna, Chinna, Sabari, Lokesh, Dinesh) + email fallback. Accounts are provisioned by the PB admin only — no open registration.
- **Trips** — multiple trips per user, per-trip currency (₹ $ € £ ¥ AED), add members by email, rename, delete (owner).
- **Expenses** — payer, date, emoji categories, notes, and four split modes: **equally**, **exact amounts**, **percentages**, **shares** — with live per-person preview and rounding that always sums exactly to the total (remainder cents spread by largest fraction).
- **Edit + delete** any expense; full detail sheet with split breakdown and **comments**.
- **Balances** — per-member net with bars, **debt simplification** (greedy min-transaction suggestions), one-tap **Settle** prefill, manual payment recording, payment history with delete.
- **Totals** — trip spend, per-head average, you-paid vs your-share, category breakdown, who-paid-what, **CSV export**.
- **Activity feed** — every add/edit/delete/payment logged with relative timestamps.
- **Realtime** — PocketBase SSE subscriptions; changes from other members appear without refresh.
- Search + category filter, monthly grouping, dark mode (`prefers-color-scheme`), reduced-motion support, mobile-first.

## PocketBase setup (already provisioned)

The live schema is in [`pb_schema.json`](pb_schema.json) (PocketBase 0.23+ format). To recreate on a fresh instance: Dashboard → Settings → Import collections → paste → import. Notes:

- `splitit_users` is a **dedicated auth collection** (the shared PB instance serves several apps — everything this app owns is prefixed `splitit_`).
- `createRule` on `splitit_users` is locked: create accounts from the Dashboard (set `emailVisibility: true` so add-member-by-email works).
- `created`/`updated` are explicit `autodate` fields — PB 0.23+ does not add them automatically to API-created collections.
- Access rules: trip data is visible/editable only to the trip's owner + members; activity is append-only for members.

## Frontend config

Top of the `<script type="text/babel">` block in `index.html`:

```js
const PB_URL  = "https://db.prasannar.com";  // PocketBase instance
const PREFIX  = "splitit_";                  // collection prefix
const ROSTER  = [...];                       // profiles shown on the sign-in screen
```

Add a person to `ROSTER` (and create their account in PB) to show them on the login screen; anyone else can still use the email sign-in fallback.

> Pinned CDN note: `@babel/standalone` is pinned to `@7` — Babel 8's React preset emits ESM imports, which breaks in-browser classic scripts.

## Deploy

Any static host works. For GitHub Pages: push `index.html` to a public repo → Settings → Pages → Deploy from branch → `main` / root. PocketBase must be served over HTTPS with CORS allowed (PB default is `*`).

## Known trade-offs

- Babel compiles JSX in the browser (~1s first paint). Fine for a friend group; precompile if it ever matters.
- Single payer per expense (Splitwise's multi-payer isn't supported).
- Expense create/update trusts split rows from members — fine for a trusted group.
- Comments live in `splitit_activity` (`action: "comment"`) and cannot be deleted by users (append-only log).
