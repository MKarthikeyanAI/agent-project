export interface QuoteData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
}

export interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
}

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

/**
 * Fetch live quotes for one or more tickers from Yahoo Finance.
 * Results are cached by Next.js for 60 seconds.
 */
export async function getQuotes(tickers: string[]): Promise<QuoteData[]> {
  if (tickers.length === 0) return [];

  const symbols = tickers.join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,shortName,longName,currency,marketState`;

  try {
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`Yahoo Finance quote error: ${res.status}`);
      return tickers.map((t) => fallbackQuote(t));
    }

    const data = await res.json();
    const results: QuoteData[] = (data?.quoteResponse?.result ?? []).map(
      (q: Record<string, unknown>) => ({
        ticker: String(q.symbol ?? ""),
        name: String(q.shortName ?? q.longName ?? q.symbol ?? ""),
        price: Number(q.regularMarketPrice ?? 0),
        change: Number(q.regularMarketChange ?? 0),
        changePercent: Number(q.regularMarketChangePercent ?? 0),
        currency: String(q.currency ?? "USD"),
        marketState: String(q.marketState ?? "CLOSED"),
      })
    );

    // Fill in any missing tickers with fallbacks
    const found = new Set(results.map((r) => r.ticker.toUpperCase()));
    for (const t of tickers) {
      if (!found.has(t.toUpperCase())) {
        results.push(fallbackQuote(t));
      }
    }

    return results;
  } catch {
    console.error("Failed to fetch Yahoo Finance quotes");
    return tickers.map((t) => fallbackQuote(t));
  }
}

/**
 * Search for tickers by name or symbol.
 */
export async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false`;

  try {
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data?.quotes ?? [])
      .filter((q: Record<string, unknown>) => q.symbol && q.shortname)
      .map((q: Record<string, unknown>) => ({
        ticker: String(q.symbol ?? ""),
        name: String(q.shortname ?? q.longname ?? q.symbol ?? ""),
        exchange: String(q.exchDisp ?? q.exchange ?? ""),
        type: String(q.typeDisp ?? q.quoteType ?? "Equity"),
      }));
  } catch {
    console.error("Failed to search Yahoo Finance");
    return [];
  }
}

function fallbackQuote(ticker: string): QuoteData {
  return {
    ticker,
    name: ticker,
    price: 0,
    change: 0,
    changePercent: 0,
    currency: "USD",
    marketState: "UNKNOWN",
  };
}

/** Format a number as currency */
export function formatCurrency(
  value: number,
  currency = "USD",
  compact = false
): string {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a percentage with sign */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
