# WealthPath — Requirements

## Overview

WealthPath is a personal finance and investment web application that helps users build wealth through structured investment strategies, portfolio tracking, risk management, P&L analysis, and personalized AI-driven recommendations.

---

## 1. Functional Requirements

### 1.1 Authentication
- **REQ-AUTH-01**: Users can register with email and password
- **REQ-AUTH-02**: Users can log in / log out securely
- **REQ-AUTH-03**: All finance data is scoped to the authenticated user
- **REQ-AUTH-04**: Session persists across page refreshes (Better Auth)
- **REQ-AUTH-05** *(Testing)*: Auth can be bypassed via a fixed test user for local development

### 1.2 Portfolio Management
- **REQ-PORT-01**: Users can create multiple portfolios (e.g. Retirement, Taxable, Crypto)
- **REQ-PORT-02**: Portfolio types: `individual`, `joint`, `retirement`, `education`, `trust`
- **REQ-PORT-03**: Users can add holdings to a portfolio (ticker, quantity, avg cost basis, fees)
- **REQ-PORT-04**: When buying more of an existing holding, avg cost basis is recalculated (weighted average)
- **REQ-PORT-05**: Users can log sell transactions — holding quantity is reduced accordingly
- **REQ-PORT-06**: Users can delete portfolios and individual holdings
- **REQ-PORT-07**: Portfolio detail page shows all holdings with live prices and unrealized P&L
- **REQ-PORT-08**: Transaction history is displayed per portfolio

### 1.3 Market Data
- **REQ-MKT-01**: Live price quotes are fetched from Yahoo Finance (no API key required)
- **REQ-MKT-02**: Quotes are server-cached for 60 seconds to prevent rate limiting
- **REQ-MKT-03**: Ticker search returns symbol, name, exchange, and type
- **REQ-MKT-04**: Market state (Open / Pre-Market / After-Hours / Closed) is displayed
- **REQ-MKT-05**: Graceful fallback to cost basis if a quote fetch fails

### 1.4 Markets Page
- **REQ-MKT-PAGE-01**: Overview tab — market overview of 8 default tickers + watchlist
- **REQ-MKT-PAGE-02**: Screener tab — 5 predefined lists (Large-Cap, ETFs, Crypto, Dividend, Growth), filterable by gainers/losers, sortable by ticker/price/% change
- **REQ-MKT-PAGE-03**: Price Alerts tab — localStorage-based alerts (above/below a target price) with live trigger detection and toast notifications

### 1.5 Goals
- **REQ-GOAL-01**: Users can create financial goals (Emergency Fund, Retirement, Home, Education, Travel, Business, Vacation, Wedding, Other)
- **REQ-GOAL-02**: Goals track current amount, target amount, target date, monthly SIP, and expected annual return
- **REQ-GOAL-03**: Goal detail shows progress %, SIP months-to-go calculator, and contribution history
- **REQ-GOAL-04**: Contributing to a goal updates `currentAmount`; goal is auto-marked complete when target is met
- **REQ-GOAL-05**: Goals page shows active and completed goals separately

### 1.6 Risk & Portfolio Analysis
- **REQ-ANLYS-01**: Risk score (1–10) computed as a weighted average of asset-type risk weights, with concentration penalty (+1 if top holding > 50%)
- **REQ-ANLYS-02**: Diversification score (0–100) based on number of distinct asset types
- **REQ-ANLYS-03**: Allocation breakdown by asset type shown as labeled horizontal bars
- **REQ-ANLYS-04**: Top 8 holdings ranked by value with P&L %
- **REQ-ANLYS-05**: Per-portfolio breakdown with value, cost, P&L, and % of total

### 1.7 P&L Reports
- **REQ-RPT-01**: Unrealized P&L per holding (current price vs cost basis)
- **REQ-RPT-02**: Realized P&L from logged sell transactions
- **REQ-RPT-03**: P&L breakdown by asset type with bar chart
- **REQ-RPT-04**: Win rate metric (% of holdings with positive unrealized P&L)
- **REQ-RPT-05**: Biggest gain and biggest loss callout cards
- **REQ-RPT-06**: Benchmark comparison — portfolio 1-year return vs SPY, QQQ, IWM, GLD, BND
- **REQ-RPT-07**: CSV export of all open position data

### 1.8 Investment Strategy Templates
- **REQ-STRAT-01**: 6 static strategy templates: Buy & Hold, DCA, Dividend Growth, Index Investing, Growth, Value
- **REQ-STRAT-02**: Each strategy includes: description, risk level, time horizon, expected return range, sample allocation bar, step-by-step implementation guide, pros and cons
- **REQ-STRAT-03**: Strategies are filterable by risk level (Low / Moderate / High)

### 1.9 AI Financial Advisor
- **REQ-AI-01**: Chat interface powered by OpenRouter (default: `openai/gpt-4o-mini`)
- **REQ-AI-02**: Each conversation receives a system prompt containing the user's live portfolio snapshot (holdings, prices, P&L, goals)
- **REQ-AI-03**: 6 finance-specific starter prompts displayed on empty state
- **REQ-AI-04**: AI reminds users it is not a licensed financial advisor
- **REQ-AI-05**: Chat is streamed (Vercel AI SDK `streamText`)

### 1.10 Dashboard
- **REQ-DASH-01**: Displays net worth (sum of all portfolio values), total P&L and %, number of holdings
- **REQ-DASH-02**: Shows up to 3 portfolios and 3 goals as summary cards
- **REQ-DASH-03**: Links to full portfolio, goals, and AI advisor pages

---

## 2. Non-Functional Requirements

### 2.1 Performance
- **REQ-PERF-01**: Market quote API uses 60-second server-side cache
- **REQ-PERF-02**: Pages use client-side data fetching with skeleton loading states
- **REQ-PERF-03**: Benchmark historical data cached for 1 hour (`revalidate: 3600`)

### 2.2 Security
- **REQ-SEC-01**: All DB queries are user-scoped (userId foreign key)
- **REQ-SEC-02**: API routes validate input via Zod schemas (chat route)
- **REQ-SEC-03**: No raw SQL; all queries use Drizzle ORM parameterized queries
- **REQ-SEC-04**: Price alerts stored in `localStorage` only (no sensitive server data)

### 2.3 Accessibility
- **REQ-A11Y-01**: Skip-to-main-content link present in site header
- **REQ-A11Y-02**: ARIA labels on nav and header elements
- **REQ-A11Y-03**: Mobile-responsive layout with horizontal scrollable nav on small screens

### 2.4 Tech Stack Constraints
- **REQ-TECH-01**: Framework: Next.js 16 App Router, React 19, TypeScript (strict)
- **REQ-TECH-02**: Styling: Tailwind CSS 4 + shadcn/ui; no custom CSS files
- **REQ-TECH-03**: No charting libraries; all visualizations use CSS-based bars
- **REQ-TECH-04**: Database: PostgreSQL + Drizzle ORM; all numeric fields stored as `numeric(precision, scale)`
- **REQ-TECH-05**: Package manager: pnpm
- **REQ-TECH-06**: Market data: Yahoo Finance unofficial API (no key needed)
- **REQ-TECH-07**: AI provider: OpenRouter via `@openrouter/ai-sdk-provider`

---

## 3. Data Model Summary

| Table | Purpose |
|---|---|
| `users` | Better Auth user accounts |
| `sessions` | Better Auth sessions |
| `portfolios` | User portfolios (type, currency, description) |
| `holdings` | Positions within a portfolio (ticker, qty, avg cost) |
| `transactions` | Buy/sell transaction log per portfolio |
| `goals` | Financial goals with target amounts and SIP |
| `goal_contributions` | Contribution history per goal |
| `risk_profiles` | (Reserved) User risk questionnaire responses |
| `watchlist_items` | (Reserved) DB-persisted watchlist items |

---

## 4. Out of Scope (Current Version)

- Real-time WebSocket price streaming
- Tax lot accounting (FIFO/LIFO/specific ID)
- Multi-currency portfolio conversion
- Brokerage account sync / Open Finance API integration
- Mobile native app
- Email / push notification delivery for price alerts
- Social / sharing features
