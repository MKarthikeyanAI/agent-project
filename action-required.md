# WealthPath — Action Required

> Last updated: 2026-03-19
> This file tracks outstanding tasks, blockers, and decisions that need attention before the app is production-ready.

---

## 🔴 Critical (Blocks Production Launch)

### 1. Start PostgreSQL and Run Migrations
**What:** The database schema has been fully designed and the migration file generated (`drizzle/0002_smart_wild_pack.sql`), but Postgres is not running locally — `pnpm db:migrate` fails.
**Action:**
```bash
# Option A — Docker (recommended)
docker-compose up -d postgres

# Option B — Start native Postgres
brew services start postgresql@16

# Then run:
pnpm db:migrate
```
**Owner:** Developer
**Unblocks:** All API routes, testing the full app end-to-end

---

### 2. Re-enable Authentication
**What:** All API routes currently use `getTestUserId()` from `src/lib/test-auth.ts`, which bypasses login and uses a hardcoded test user. This must be replaced before production.
**Action:**
- Replace every `getTestUserId()` call with `auth.api.getSession({ headers: await headers() })`
- Return `401` if session is null
- Add middleware or per-page redirect for unauthenticated users
- Delete or gate `src/lib/test-auth.ts` behind a `NODE_ENV === 'development'` guard

**Files to update:**
- `src/app/api/portfolios/route.ts`
- `src/app/api/portfolios/[id]/route.ts`
- `src/app/api/portfolios/[id]/holdings/route.ts`
- `src/app/api/portfolios/[id]/transactions/route.ts`
- `src/app/api/goals/route.ts`
- `src/app/api/goals/[id]/route.ts`
- `src/app/api/goals/[id]/contribute/route.ts`
- `src/app/api/analysis/overview/route.ts`
- `src/app/api/chat/route.ts`
- `src/app/api/reports/pnl/route.ts`
- `src/app/api/reports/benchmark/route.ts`

---

### 3. Set Production Environment Variables
**What:** The app will not start in production without these environment variables.
**Action:** Set the following in Vercel dashboard (or `.env.local` for local dev):
```env
POSTGRES_URL=postgresql://user:password@host:5432/wealthpath
BETTER_AUTH_SECRET=<32+ character random string>
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-4o-mini
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## 🟡 High Priority (Quality / Stability)

### 4. Add `loading.tsx` Files
**What:** Route segments don't have loading UI — navigating between pages shows a blank flash while data fetches.
**Action:** Add `loading.tsx` with `<Skeleton>` placeholders to:
- `src/app/dashboard/loading.tsx`
- `src/app/portfolio/loading.tsx`
- `src/app/portfolio/[id]/loading.tsx`
- `src/app/goals/loading.tsx`
- `src/app/goals/[id]/loading.tsx`
- `src/app/analysis/loading.tsx`
- `src/app/reports/loading.tsx`

---

### 5. Add `error.tsx` Files
**What:** Unhandled errors in route segments crash the entire page silently.
**Action:** Add `error.tsx` with a graceful "Something went wrong, try again" UI to the same routes listed in item 4.

---

### 6. Rate Limit the Market Data Proxy
**What:** `/api/market/quote` and `/api/market/search` are unauthenticated and pass through to Yahoo Finance. They could be abused.
**Action:** Add rate limiting (e.g. `upstash/ratelimit` or a simple in-memory token bucket) to these two routes.

---

## 🟢 Low Priority / Nice to Have

### 7. Persist Price Alerts to Database
**What:** Price alerts are currently stored in `localStorage` — they disappear if the user clears storage or switches browsers.
**Action:** Expose `/api/alerts` CRUD routes using the existing `watchlist_items` table (or a new `alerts` table). Migrate the Alerts tab to use server state instead of localStorage.

---

### 8. Email Delivery for Triggered Alerts
**What:** Price alerts trigger a toast notification in-browser only — if the page isn't open, the user never sees the alert.
**Action:** Integrate Resend (or SendGrid) to send an email when an alert triggers. Requires a background job or a webhook from a price subscription service.

---

### 9. Tax-Lot Export
**What:** Investors need FIFO/LIFO realized gain data for tax reporting.
**Action:** Extend `/api/reports/pnl` to compute realized P&L using proper cost-lot accounting (FIFO by default), and add a tax-year CSV export.

---

### 10. Replace Home Page Boilerplate Content
**What:** `src/app/page.tsx` still shows the original boilerplate landing page (setup checklist, boilerplate feature list, YouTube walkthrough embed).
**Action:** Replace with a WealthPath-branded landing page that highlights the app's actual features (portfolio tracking, AI advisor, risk analysis, etc.) and links to `/dashboard`.

---

### ~~11. Add `BERKB` → `BRK-B` Ticker Correction~~ ✅ Fixed
`BRK-B` is now used in the large-cap screener list.

---

## ✅ Recently Completed

| Item | Completed |
|---|---|
| Phase 1: DB schema, portfolio/goal CRUD APIs, market data service | 2026-03-19 |
| Phase 4: Risk analysis API + Analysis page | 2026-03-19 |
| Phase 5: AI Advisor with live portfolio context | 2026-03-19 |
| Phase 6: P&L reports + benchmark comparison | 2026-03-19 |
| Phase 7: Strategy templates + price alerts | 2026-03-19 |
| Phase 8: Stock screener (Markets tabs) | 2026-03-19 |
| Lint + TypeScript clean pass on all new files | 2026-03-19 |
