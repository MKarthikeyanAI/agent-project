import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/market";

export async function GET(req: NextRequest) {
  const tickersParam = req.nextUrl.searchParams.get("tickers") ?? "";
  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 50);

  if (tickers.length === 0) {
    return NextResponse.json([]);
  }

  const quotes = await getQuotes(tickers);
  return NextResponse.json(quotes);
}
