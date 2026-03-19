# WealthPath — Implementation Plan

## Status Legend
| Symbol | Meaning |
|---|---|
| ✅ | Complete |
| 🔄 | In Progress |
| ⏳ | Pending |
| ❌ | Blocked |

---

## Phase 0 — Boilerplate Setup ✅

**Goal:** Establish the Next.js 16 boilerplate with auth, database, and AI plumbing.

| Task | Status | Notes |
|---|---|---|
| Next.js 16 + App Router + TypeScript scaffold | ✅ | Base boilerplate |
| Better Auth (email/password) | ✅ | `/api/auth/[...all]` catch-all |
| PostgreSQL + Drizzle ORM setup | ✅ | `src/lib/db.ts`, `src/lib/schema.ts` |
| OpenRouter AI SDK integration | ✅ | `@openrouter/ai-sdk-provider` |
| shadcn/ui component library | ✅ | Button, Card, Dialog, Badge, Input, etc. |
| Dark mode (next-themes) | ✅ | `ThemeProvider` + `ModeToggle` |
| Site header + footer | ✅ | `SiteHeader`, `SiteFooter` |

---

## Phase 1 — Finance Core ✅

**Goal:** Database schema, market data service, CRUD APIs, and core UI.

**Completed:** 2026-03-19

| Task | Status | File(s) |
|---|---|---|
| Finance DB schema (7 tables, 4 enums) | ✅ | `src/lib/schema.ts` |
| DB migration generated | ✅ | `drizzle/0002_smart_wild_pack.sql` |
| Yahoo Finance market data service | ✅ | `src/lib/market.ts` |
| Auth bypass for local testing | ✅ | `src/lib/test-auth.ts` |
| Portfolio CRUD APIs | ✅ | `/api/portfolios/**` |
| Holdings API (weighted avg cost basis) | ✅ | `/api/portfolios/[id]/holdings` |
| Transactions API (buy/sell, updates qty) | ✅ | `/api/portfolios/[id]/transactions` |
| Goals CRUD + contribute endpoint | ✅ | `/api/goals/**` |
| Market quote + search APIs | ✅ | `/api/market/quote`, `/api/market/search` |
| Finance UI components | ✅ | `src/components/finance/` |
| Dashboard page | ✅ | `/dashboard` |
| Portfolio list + detail pages | ✅ | `/portfolio`, `/portfolio/[id]` |
| Goals list + detail pages | ✅ | `/goals`, `/goals/[id]` |
| Markets overview page | ✅ | `/markets` |
| Site header updated (WealthPath branding) | ✅ | `src/components/site-header.tsx` |

---

## Phase 2 — Authentication Hardening ⏳

**Goal:** Re-enable production auth flow (currently bypassed for dev testing).

| Task | Status | Notes |
|---|---|---|
| Remove `test-auth.ts` bypass | ⏳ | Restore `auth.api.getSession()` in all API routes |
| Protect all finance routes with session check | ⏳ | Server components + API routes |
| Redirect unauthenticated users to `/login` | ⏳ | Middleware or per-page check |
| Test full auth flow (register → login → dashboard) | ⏳ | Requires live Postgres |

---

## Phase 3 — Database Migration & Deployment ⏳

**Goal:** Run migrations on a live Postgres instance and deploy to Vercel.

| Task | Status | Notes |
|---|---|---|
| Start local Postgres (Docker or native) | ⏳ | `docker-compose.yml` provided |
| Run `pnpm db:migrate` | ⏳ | Blocked: Postgres not running locally |
| Set production env vars in Vercel | ⏳ | `POSTGRES_URL`, `BETTER_AUTH_SECRET`, `OPENROUTER_API_KEY` |
| Deploy to Vercel | ⏳ | Run `vercel --prod` |
| Smoke test all API routes in production | ⏳ | |

---

## Phase 4 — Risk & Portfolio Analysis ✅

**Goal:** Compute risk scores, diversification, and allocation breakdowns.

**Completed:** 2026-03-19

| Task | Status | File(s) |
|---|---|---|
| Analysis overview API | ✅ | `/api/analysis/overview` |
| Risk score algorithm (weighted by asset type + concentration penalty) | ✅ | `route.ts` |
| Diversification score | ✅ | `route.ts` |
| Allocation breakdown by asset type | ✅ | `route.ts` |
| Top 8 holdings with P&L | ✅ | `route.ts` |
| Per-portfolio breakdown | ✅ | `route.ts` |
| `RiskScoreCard` component | ✅ | `src/components/finance/risk-score-card.tsx` |
| `AllocationBreakdown` + `AllocationStackedBar` | ✅ | `src/components/finance/allocation-bar.tsx` |
| `/analysis` page | ✅ | `src/app/analysis/page.tsx` |
| Analysis added to navigation | ✅ | `site-header.tsx` |

---

## Phase 5 — AI Financial Advisor ✅

**Goal:** Upgrade AI chat with live portfolio context injected into the system prompt.

**Completed:** 2026-03-19

| Task | Status | File(s) |
|---|---|---|
| `buildPortfolioContext()` — fetches live holdings + goals | ✅ | `/api/chat/route.ts` |
| System prompt includes portfolio snapshot | ✅ | `/api/chat/route.ts` |
| Auth removed from chat (test bypass) | ✅ | `/api/chat/route.ts` |
| AI Advisor page redesigned with 6 starter prompts | ✅ | `src/app/chat/page.tsx` |
| AI Advisor added to navigation | ✅ | `site-header.tsx` |

---

## Phase 6 — P&L Reports & Benchmark Comparison ✅

**Goal:** Advanced profit/loss reporting and benchmark performance comparison.

**Completed:** 2026-03-19

| Task | Status | File(s) |
|---|---|---|
| P&L API — unrealized + realized + by asset type | ✅ | `/api/reports/pnl` |
| Benchmark API — 1-year returns for SPY/QQQ/IWM/GLD/BND | ✅ | `/api/reports/benchmark` |
| Win rate, biggest gain, biggest loss metrics | ✅ | `/api/reports/pnl` |
| P&L bar chart by asset type | ✅ | `src/app/reports/page.tsx` |
| Benchmark comparison bar chart | ✅ | `src/app/reports/page.tsx` |
| Unrealized / Realized position detail tables | ✅ | `src/app/reports/page.tsx` |
| CSV export of open positions | ✅ | `src/app/reports/page.tsx` |
| Reports added to navigation | ✅ | `site-header.tsx` |

---

## Phase 7 — Strategy Templates & Price Alerts ✅

**Goal:** Investment strategy library and localStorage-based price alert system.

**Completed:** 2026-03-19

| Task | Status | File(s) |
|---|---|---|
| 6 strategy templates (Buy & Hold, DCA, Dividend Growth, Index, Growth, Value) | ✅ | `src/app/strategies/page.tsx` |
| Strategy cards with risk badge, allocation bar, pros/cons, steps | ✅ | `src/app/strategies/page.tsx` |
| Risk-level filter for strategies | ✅ | `src/app/strategies/page.tsx` |
| Strategies added to navigation | ✅ | `site-header.tsx` |
| Price Alerts tab in Markets page | ✅ | `src/app/markets/page.tsx` |
| Alerts stored in localStorage | ✅ | `src/app/markets/page.tsx` |
| Live alert trigger detection with toast | ✅ | `src/app/markets/page.tsx` |
| Triggered alerts history with clear-all | ✅ | `src/app/markets/page.tsx` |

---

## Phase 8 — Stock Screener ✅

**Goal:** Tabbed Markets page with category screener.

**Completed:** 2026-03-19

| Task | Status | File(s) |
|---|---|---|
| Markets page refactored into 3 tabs (Overview / Screener / Alerts) | ✅ | `src/app/markets/page.tsx` |
| 5 screener lists (Large-Cap, ETFs, Crypto, Dividend, Growth) | ✅ | `src/app/markets/page.tsx` |
| Gainers / Losers filter | ✅ | `src/app/markets/page.tsx` |
| Sortable columns (ticker, price, % change) | ✅ | `src/app/markets/page.tsx` |

---

## Phase 9 — Production Hardening ⏳

**Goal:** Re-enable auth, clean up test bypass, add error boundaries, and deploy.

| Task | Status | Priority |
|---|---|---|
| Re-enable Better Auth in all API routes | ⏳ | High |
| Add React error boundaries to key pages | ⏳ | Medium |
| Add `loading.tsx` files for each route segment | ⏳ | Medium |
| Add `error.tsx` files for each route segment | ⏳ | Medium |
| Rate limiting on market data proxy routes | ⏳ | Medium |
| Replace localStorage alerts with DB-persisted `watchlist_items` | ⏳ | Low |
| Email digest for triggered price alerts | ⏳ | Low |
| Run `pnpm db:migrate` on production Postgres | ⏳ | High |
| Deploy to Vercel production | ⏳ | High |

---

## Phase 10 — Advanced Features ⏳

**Goal:** Intraday data, tax-lot export, and additional analytics.

| Task | Status | Notes |
|---|---|---|
| Intraday price charts (CSS-based sparklines) | ⏳ | Yahoo Finance intraday endpoint |
| Tax-lot export (FIFO realized gains for tax year) | ⏳ | Extend transactions API |
| Portfolio rebalancing calculator | ⏳ | Target vs actual allocation delta |
| Strategy → Portfolio linker (apply a strategy template) | ⏳ | Create holdings from template allocation |
| Email / push notification delivery for alerts | ⏳ | Requires email provider (Resend / SendGrid) |

---

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Charting | CSS bars (no library) | No install overhead; sufficient for current data density |
| Market data | Yahoo Finance unofficial | No API key required; adequate for personal use |
| Alert persistence | localStorage | No migration needed; acceptable for MVP |
| AI provider | OpenRouter | Access to 100+ models through one key |
| Auth | Better Auth | Modern, lightweight, session-based |
| ORM | Drizzle | Type-safe, minimal overhead, close to SQL |
