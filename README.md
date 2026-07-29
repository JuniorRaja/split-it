# split·it

Splitwise-style trip expense splitter for groups of any size. Static site — React 18 UMD + PocketBase JS SDK from CDN, JSX **precompiled** to `app.js` (no runtime Babel). Hosted on GitHub Pages, mobile-first, installable to the home screen.

```
GitHub Pages (index.html + app.js + manifest/icons, static)
        │  HTTPS + PocketBase JS SDK (+ realtime SSE)     │ open.er-api.com (daily FX rates)
        ▼                                                  ▼
PocketBase (self-hosted or managed)   (collections prefixed splitit_ by default)
   splitit_users | splitit_trips | splitit_expenses | splitit_splits | splitit_settlements | splitit_activity
```

## Features

- **Flexible sign-in UX** — optional profile-picker (runtime-configurable) plus email sign-in and self-signup with email verification.
- **Trips** — per-trip **base currency** (ISO code; balances are kept in it), add members by member ID, rename, delete (owner). Base currency locks once the trip has expenses.
- **Multi-currency expenses** — enter any expense in INR, MYR, SGD, THB, USD, EUR, GBP, AED, JPY, IDR, VND or LKR. The daily mid-market rate is fetched automatically (cached per day, editable if you exchanged at a different rate); the original amount, rate, and converted base amount are all stored and shown.
- **Four split modes** — equally, exact amounts (in the entry currency), percentages, shares — with live per-person preview in base currency and rounding that always sums exactly.
- **Scoped edits/deletes** — only payer or trip owner can edit/delete an expense; payment delete is limited to payer/receiver/owner.
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

## Runtime config (public deployments)

Set `window.SPLITIT_CONFIG` in `index.html` before loading `app.js`:

```html
<script>
        window.SPLITIT_CONFIG = {
                appName: "split·it",
                tagline: "Split trips, not friendships.",
                pocketbaseUrl: "https://your-pocketbase.example.com",
                collectionPrefix: "splitit_",
                defaultCurrency: "INR",
                allowEmailSignin: true,
                allowSelfSignup: true,
                requireEmailVerification: true,
                roster: []
        };
</script>
```

- `roster`: Optional profile-picker list: `[{ name, email }]`. Keep `[]` for generic public login.
- `allowSelfSignup`: Enables account creation in the login screen. Default is `true` in this repo.
- `requireEmailVerification`: If `true`, signup sends verification email and blocks login until verified.
- `collectionPrefix`: Useful when sharing one PB instance with multiple apps.
- `defaultCurrency`: The default for new trips.

### Observability hooks

The app emits browser events and tries common providers if present:

- Custom event: `window` event `splitit:event` with `{ event, props, at }`
- Product analytics: calls `window.plausible(...)` and/or `window.gtag(...)` when available
- Error tracking: calls `window.Sentry.captureException(...)` when available

## Public launch checklist

- PocketBase must allow user creation in `splitit_users`: set `createRule` to an empty string (`""`) for public signup.
- Enforce verified-only login in `splitit_users` by setting `authRule` to `verified = true`.
- In `splitit_users` verification email template, use `href="{APP_URL}/#/auth/confirm-verification/{TOKEN}"` (no `/_/` path) for static-hosted SPA deployments.
- Prevent user-directory scraping by setting `splitit_users.listRule` to `id = @request.auth.id`.
- Restrict trip metadata changes to owners only (`splitit_trips.updateRule = owner = @request.auth.id`).
- Configure SMTP in PocketBase Settings so verification emails can be delivered.
- Enforce **server-side** rate limiting at your edge/proxy (do not rely only on browser throttling).
- Add CAPTCHA at the edge/auth gateway for login/signup endpoints if you expect abuse.
- Keep automated backups at the server layer and test restore regularly.

## Multi-currency model

Each trip has a base currency. A foreign-currency expense stores `amount` + `currency` (as entered), `fx_rate` (editable, auto-fetched from open.er-api.com and cached per day in localStorage), and `base_amount = amount × fx_rate`. **All splits, balances, settlements and totals are in base currency** — one coherent ledger, no per-currency balance juggling. Settlements are recorded in base currency.

## PocketBase setup (already provisioned)

Live schema in [`pb_schema.json`](pb_schema.json) (PB 0.23+ format) — import via Dashboard → Settings → Import collections. Notes:

- `splitit_users` is a dedicated auth collection (shared PB instance serves several apps; everything here is prefixed `splitit_`). Public signup is enabled by `createRule: ""`, directory listing is restricted by `listRule: "id = @request.auth.id"`, and verified-only auth uses `authRule: "verified = true"`.
- `created`/`updated` are explicit `autodate` fields — PB 0.23+ doesn't add them automatically to API-created collections.
- Trip data is visible/editable only to the trip's owner + members; activity is append-only for members.

## Known trade-offs

- Single payer per expense (no multi-payer).
- FX rate is fixed at entry time (editable) — no retroactive revaluation.
- Comments live in `splitit_activity` (`action: "comment"`) and can't be deleted by users.
- Expense create/update trusts split rows from members — fine for a trusted group.
