import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getQuotes } from "@/lib/market";
import { portfolios, holdings, goals } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

// Risk weight per asset type (1 = safest, 9 = riskiest)
const RISK_WEIGHTS: Record<string, number> = {
  cash: 1,
  bond: 2,
  mutual_fund: 4,
  etf: 4,
  reit: 5,
  stock: 6,
  other: 5,
  crypto: 9,
};

const ASSET_LABELS: Record<string, string> = {
  stock: "Stocks",
  etf: "ETFs",
  mutual_fund: "Mutual Funds",
  crypto: "Crypto",
  bond: "Bonds",
  reit: "REITs",
  cash: "Cash",
  other: "Other",
};

// Tailwind color classes per asset type (bg- for bar fill)
const ASSET_COLORS: Record<string, string> = {
  stock: "bg-blue-500",
  etf: "bg-emerald-500",
  crypto: "bg-orange-500",
  bond: "bg-violet-500",
  reit: "bg-yellow-500",
  mutual_fund: "bg-teal-500",
  cash: "bg-slate-400",
  other: "bg-pink-500",
};

function riskLabel(score: number): string {
  if (score <= 2) return "Very Low";
  if (score <= 4) return "Low";
  if (score <= 6) return "Moderate";
  if (score <= 8) return "High";
  return "Very High";
}

function diversificationLabel(score: number): string {
  if (score <= 20) return "Poor";
  if (score <= 40) return "Fair";
  if (score <= 60) return "Good";
  if (score <= 80) return "Great";
  return "Excellent";
}

export async function GET() {
  const userId = await getTestUserId();

  // Fetch portfolios + holdings
  const userPortfolios = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.userId, userId));

  const allHoldings = userPortfolios.length
    ? await Promise.all(
        userPortfolios.map((p) =>
          db.select().from(holdings).where(eq(holdings.portfolioId, p.id))
        )
      )
    : [];

  // Flatten and get unique tickers
  const holdingRows = allHoldings.flat();
  const tickers = [...new Set(holdingRows.map((h) => h.ticker))];

  // Fetch live quotes
  const quoteList = tickers.length ? await getQuotes(tickers) : [];
  const quoteMap: Record<string, number> = {};
  for (const q of quoteList) quoteMap[q.ticker] = q.price;

  // Compute per-holding metrics
  type HoldingMetric = {
    id: string;
    portfolioId: string;
    ticker: string;
    name: string;
    assetType: string;
    qty: number;
    avgCost: number;
    price: number;
    value: number;
    cost: number;
    pnl: number;
    pnlPct: number;
  };

  const metrics: HoldingMetric[] = holdingRows.map((h) => {
    const qty = parseFloat(h.quantity);
    const avgCost = parseFloat(h.avgCostBasis);
    const price = quoteMap[h.ticker] ?? avgCost;
    const value = qty * price;
    const cost = qty * avgCost;
    return {
      id: h.id,
      portfolioId: h.portfolioId,
      ticker: h.ticker,
      name: h.name,
      assetType: h.assetType,
      qty,
      avgCost,
      price,
      value,
      cost,
      pnl: value - cost,
      pnlPct: cost > 0 ? ((value - cost) / cost) * 100 : 0,
    };
  });

  const totalValue = metrics.reduce((s, m) => s + m.value, 0);
  const totalCost = metrics.reduce((s, m) => s + m.cost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  // ── Allocation by asset type ─────────────────────────────────────────────
  const byType: Record<string, number> = {};
  for (const m of metrics) {
    byType[m.assetType] = (byType[m.assetType] ?? 0) + m.value;
  }

  const allocationByType = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, value]) => ({
      type,
      label: ASSET_LABELS[type] ?? type,
      value,
      pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: ASSET_COLORS[type] ?? "bg-gray-400",
    }));

  // ── Risk Score ────────────────────────────────────────────────────────────
  let weightedRisk = 5;
  if (totalValue > 0) {
    const raw = Object.entries(byType).reduce((sum, [type, val]) => {
      return sum + (RISK_WEIGHTS[type] ?? 5) * (val / totalValue);
    }, 0);

    // Concentration penalty: top holding > 50% adds 1 point
    const topValue = Math.max(...metrics.map((m) => m.value), 0);
    const topPct = totalValue > 0 ? topValue / totalValue : 0;
    const concentrationPenalty = topPct > 0.5 ? 1 : 0;

    weightedRisk = Math.min(10, Math.max(1, Math.round(raw + concentrationPenalty)));
  }

  // ── Diversification Score ─────────────────────────────────────────────────
  const assetTypeCount = Object.keys(byType).length;
  const divScore = Math.min(assetTypeCount * 20, 100);

  // ── Top Holdings ──────────────────────────────────────────────────────────
  const topHoldings = [...metrics]
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map((m) => ({
      ticker: m.ticker,
      name: m.name,
      assetType: m.assetType,
      value: m.value,
      pct: totalValue > 0 ? (m.value / totalValue) * 100 : 0,
      pnl: m.pnl,
      pnlPct: m.pnlPct,
    }));

  // ── Per-portfolio breakdown ───────────────────────────────────────────────
  const portfolioBreakdown = userPortfolios.map((p) => {
    const pHoldings = metrics.filter((m) => m.portfolioId === p.id);
    const pValue = pHoldings.reduce((s, m) => s + m.value, 0);
    const pCost = pHoldings.reduce((s, m) => s + m.cost, 0);
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      value: pValue,
      cost: pCost,
      pnl: pValue - pCost,
      pnlPct: pCost > 0 ? ((pValue - pCost) / pCost) * 100 : 0,
      holdingsCount: pHoldings.length,
      pct: totalValue > 0 ? (pValue / totalValue) * 100 : 0,
    };
  });

  // ── Goals summary ─────────────────────────────────────────────────────────
  const userGoals = await db.select().from(goals).where(eq(goals.userId, userId));
  const goalsSummary = {
    total: userGoals.length,
    active: userGoals.filter((g) => !g.isCompleted).length,
    totalSaved: userGoals.reduce((s, g) => s + parseFloat(g.currentAmount), 0),
    totalTarget: userGoals.reduce((s, g) => s + parseFloat(g.targetAmount), 0),
  };

  return NextResponse.json({
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPct,
    riskScore: weightedRisk,
    riskLabel: riskLabel(weightedRisk),
    diversificationScore: divScore,
    diversificationLabel: diversificationLabel(divScore),
    allocationByType,
    topHoldings,
    portfolioBreakdown,
    goalsSummary,
    holdingsCount: metrics.length,
    assetTypeCount,
  });
}
