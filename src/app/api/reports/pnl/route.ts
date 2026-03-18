import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getQuotes } from "@/lib/market";
import { portfolios, holdings, transactions } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

export async function GET() {
  const userId = await getTestUserId();

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

  const allTransactions = userPortfolios.length
    ? await Promise.all(
        userPortfolios.map((p) =>
          db.select().from(transactions).where(eq(transactions.portfolioId, p.id))
        )
      )
    : [];

  const holdingRows = allHoldings.flat();
  const tickers = [...new Set(holdingRows.map((h) => h.ticker))];
  const quoteList = tickers.length ? await getQuotes(tickers) : [];
  const quoteMap: Record<string, number> = {};
  for (const q of quoteList) quoteMap[q.ticker] = q.price;

  // Unrealized P&L per holding
  const unrealizedRows = holdingRows.map((h) => {
    const qty = parseFloat(h.quantity);
    const avgCost = parseFloat(h.avgCostBasis);
    const price = quoteMap[h.ticker] ?? avgCost;
    const value = qty * price;
    const cost = qty * avgCost;
    const pnl = value - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    const portfolioName =
      userPortfolios.find((p) => p.id === h.portfolioId)?.name ?? "Unknown";
    return {
      ticker: h.ticker,
      name: h.name,
      assetType: h.assetType,
      portfolioName,
      qty,
      avgCost,
      currentPrice: price,
      value,
      cost,
      pnl,
      pnlPct,
    };
  });

  // Realized P&L from sell transactions
  const sellTxns = allTransactions.flat().filter((t) => t.type === "sell");
  const realizedRows = sellTxns.map((t) => {
    const qty = parseFloat(t.quantity);
    const price = parseFloat(t.price);
    const fees = parseFloat(t.fees ?? "0");
    // For realized: we approximate cost basis as average cost from the matching holding
    const holding = holdingRows.find(
      (h) => h.ticker === t.ticker && h.portfolioId === t.portfolioId
    );
    const avgCost = holding ? parseFloat(holding.avgCostBasis) : price;
    const proceeds = qty * price - fees;
    const cost = qty * avgCost;
    const pnl = proceeds - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    const portfolioName =
      userPortfolios.find((p) => p.id === t.portfolioId)?.name ?? "Unknown";
    return {
      ticker: t.ticker,
      name: t.notes ?? t.ticker,
      assetType: holding?.assetType ?? "stock",
      portfolioName,
      date: t.date,
      qty,
      salePrice: price,
      avgCost,
      proceeds,
      cost,
      pnl,
      pnlPct,
      fees,
    };
  });

  // Aggregated unrealized by asset type
  const byAssetType: Record<string, { value: number; cost: number; pnl: number }> = {};
  for (const r of unrealizedRows) {
    if (!byAssetType[r.assetType]) byAssetType[r.assetType] = { value: 0, cost: 0, pnl: 0 };
    byAssetType[r.assetType]!.value += r.value;
    byAssetType[r.assetType]!.cost += r.cost;
    byAssetType[r.assetType]!.pnl += r.pnl;
  }

  const byAssetTypeArr = Object.entries(byAssetType).map(([type, d]) => ({
    type,
    value: d.value,
    cost: d.cost,
    pnl: d.pnl,
    pnlPct: d.cost > 0 ? (d.pnl / d.cost) * 100 : 0,
  })).sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));

  const totalUnrealizedPnl = unrealizedRows.reduce((s, r) => s + r.pnl, 0);
  const totalUnrealizedCost = unrealizedRows.reduce((s, r) => s + r.cost, 0);
  const totalUnrealizedPct =
    totalUnrealizedCost > 0 ? (totalUnrealizedPnl / totalUnrealizedCost) * 100 : 0;

  const totalRealizedPnl = realizedRows.reduce((s, r) => s + r.pnl, 0);
  const winnersCount = unrealizedRows.filter((r) => r.pnl > 0).length;
  const losersCount = unrealizedRows.filter((r) => r.pnl < 0).length;
  const winRate =
    unrealizedRows.length > 0 ? (winnersCount / unrealizedRows.length) * 100 : 0;

  const biggestGain = [...unrealizedRows].sort((a, b) => b.pnl - a.pnl)[0] ?? null;
  const biggestLoss = [...unrealizedRows].sort((a, b) => a.pnl - b.pnl)[0] ?? null;

  return NextResponse.json({
    summary: {
      totalUnrealizedPnl,
      totalUnrealizedPct,
      totalRealizedPnl,
      winnersCount,
      losersCount,
      winRate,
    },
    unrealizedRows: unrealizedRows.sort((a, b) => b.pnl - a.pnl),
    realizedRows: realizedRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    byAssetType: byAssetTypeArr,
    biggestGain,
    biggestLoss,
  });
}
