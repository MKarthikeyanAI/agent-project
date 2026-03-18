import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getQuotes } from "@/lib/market";
import { portfolios, holdings } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

const BENCHMARKS = [
  { ticker: "SPY", label: "S&P 500 (SPY)" },
  { ticker: "QQQ", label: "Nasdaq 100 (QQQ)" },
  { ticker: "IWM", label: "Russell 2000 (IWM)" },
  { ticker: "GLD", label: "Gold (GLD)" },
  { ticker: "BND", label: "Total Bond (BND)" },
];

async function getYearReturn(ticker: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1y`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const closes: number[] =
      json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const validCloses = closes.filter((c) => c != null && !isNaN(c));
    if (validCloses.length < 2) return null;
    const first = validCloses[0]!;
    const last = validCloses[validCloses.length - 1]!;
    return ((last - first) / first) * 100;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await getTestUserId();

  // Compute portfolio 1-year return (unrealized, cost-basis vs current)
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

  const holdingRows = allHoldings.flat();
  const tickers = [...new Set(holdingRows.map((h) => h.ticker))];
  const quoteList = tickers.length ? await getQuotes(tickers) : [];
  const quoteMap: Record<string, number> = {};
  for (const q of quoteList) quoteMap[q.ticker] = q.price;

  let totalValue = 0;
  let totalCost = 0;
  for (const h of holdingRows) {
    const qty = parseFloat(h.quantity);
    const avgCost = parseFloat(h.avgCostBasis);
    const price = quoteMap[h.ticker] ?? avgCost;
    totalValue += qty * price;
    totalCost += qty * avgCost;
  }
  const portfolioReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : null;

  // Fetch benchmark returns in parallel
  const benchmarkReturns = await Promise.all(
    BENCHMARKS.map(async (b) => {
      const ret = await getYearReturn(b.ticker);
      return { ...b, returnPct: ret };
    })
  );

  // Build comparison: how does portfolio rank vs benchmarks?
  const allReturns = [
    { ticker: "Portfolio", label: "Your Portfolio", returnPct: portfolioReturn },
    ...benchmarkReturns,
  ].filter((x) => x.returnPct !== null) as { ticker: string; label: string; returnPct: number }[];

  allReturns.sort((a, b) => b.returnPct - a.returnPct);
  const portfolioRank = allReturns.findIndex((x) => x.ticker === "Portfolio") + 1;

  const beatenCount = benchmarkReturns.filter(
    (b) => b.returnPct !== null && portfolioReturn !== null && portfolioReturn > b.returnPct
  ).length;

  return NextResponse.json({
    portfolioReturn,
    benchmarks: benchmarkReturns,
    ranked: allReturns,
    portfolioRank,
    totalBenchmarks: BENCHMARKS.length,
    beatenCount,
  });
}
