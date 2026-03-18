"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search, X, TrendingUp, TrendingDown, Bell, BellOff, Filter,
  ChevronUp, ChevronDown, LayoutGrid, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent } from "@/lib/market";
import type { QuoteData, SearchResult } from "@/lib/market";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WatchlistItem {
  id: string;
  ticker: string;
  name: string;
  assetType: string;
}

interface PriceAlert {
  id: string;
  ticker: string;
  name: string;
  targetPrice: number;
  direction: "above" | "below";
  triggered: boolean;
  createdAt: string;
}

// ─── Screener Data ─────────────────────────────────────────────────────────────

const SCREENER_LISTS: Record<string, { label: string; tickers: string[] }> = {
  "large-cap": {
    label: "Large-Cap Stocks",
    tickers: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BERKB", "JPM", "V"],
  },
  "etfs": {
    label: "Popular ETFs",
    tickers: ["SPY", "QQQ", "VTI", "IWM", "GLD", "BND", "VNQ", "ARKK", "DIA", "XLK"],
  },
  "crypto": {
    label: "Crypto",
    tickers: ["BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "XRP-USD", "DOGE-USD", "ADA-USD", "AVAX-USD"],
  },
  "dividend": {
    label: "Dividend Aristocrats",
    tickers: ["JNJ", "KO", "PG", "MMM", "T", "XOM", "CVX", "MCD", "WMT", "IBM"],
  },
  "growth": {
    label: "Growth Leaders",
    tickers: ["NVDA", "TSLA", "PLTR", "SHOP", "SNOW", "NET", "CRWD", "DDOG", "MDB", "ZS"],
  },
};

const DEFAULT_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "BTC-USD"];

// ─── Shared Quote Table ────────────────────────────────────────────────────────

function QuoteTable({
  quotes,
  showRemove,
  onRemove,
  onAdd,
  loading,
}: {
  quotes: QuoteData[];
  showRemove?: boolean;
  onRemove?: (ticker: string) => void;
  onAdd?: (ticker: string, name: string) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="px-5 py-8 text-center text-muted-foreground text-sm">
        Loading market data...
      </div>
    );
  }
  if (quotes.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-muted-foreground text-sm">No data available.</div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left px-5 py-3 font-medium">Symbol</th>
            <th className="text-right px-5 py-3 font-medium">Price</th>
            <th className="text-right px-5 py-3 font-medium hidden sm:table-cell">Change</th>
            <th className="text-right px-5 py-3 font-medium">% Change</th>
            <th className="text-right px-5 py-3 font-medium hidden md:table-cell">Market</th>
            {(showRemove || onAdd) && <th className="px-5 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {quotes.map((q) => {
            const isPositive = q.changePercent >= 0;
            return (
              <tr key={q.ticker} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-semibold">{q.ticker}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">{q.name}</p>
                </td>
                <td className="px-5 py-3 text-right font-medium tabular-nums">
                  {formatCurrency(q.price, q.currency)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums hidden sm:table-cell">
                  <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                    {q.change >= 0 ? "+" : ""}{formatCurrency(q.change, q.currency)}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`flex items-center justify-end gap-1 font-medium ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {formatPercent(q.changePercent)}
                  </span>
                </td>
                <td className="px-5 py-3 text-right hidden md:table-cell">
                  <Badge variant="secondary" className={`text-xs ${q.marketState === "REGULAR" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}`}>
                    {q.marketState === "REGULAR" ? "Open" : (q.marketState ?? "Closed")}
                  </Badge>
                </td>
                {showRemove && onRemove && (
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500" onClick={() => onRemove(q.ticker)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </td>
                )}
                {onAdd && !showRemove && (
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => onAdd(q.ticker, q.name)}>
                      + Watch
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [watchQuotes, setWatchQuotes] = useState<Record<string, QuoteData>>({});
  const [defaultQuotes, setDefaultQuotes] = useState<QuoteData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDefaultQuotes = useCallback(async () => {
    setLoadingDefault(true);
    try {
      const res = await fetch(`/api/market/quote?tickers=${DEFAULT_TICKERS.join(",")}`);
      const data: QuoteData[] = await res.json();
      setDefaultQuotes(data);
    } catch { /* ignore */ } finally {
      setLoadingDefault(false);
    }
  }, []);

  useEffect(() => { fetchDefaultQuotes(); }, [fetchDefaultQuotes]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(await res.json());
      } catch { setSearchResults([]); } finally { setSearching(false); }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  async function addToWatchlist(result: SearchResult) {
    const newItem: WatchlistItem = { id: result.ticker, ticker: result.ticker, name: result.name, assetType: "stock" };
    setWatchlist((prev) => prev.some((i) => i.ticker === result.ticker) ? prev : [...prev, newItem]);
    setSearchQuery("");
    setSearchResults([]);
    try {
      const res = await fetch(`/api/market/quote?tickers=${result.ticker}`);
      const data: QuoteData[] = await res.json();
      if (data[0]) setWatchQuotes((prev) => ({ ...prev, [result.ticker]: data[0]! }));
    } catch { /* ignore */ }
    toast.success(`${result.ticker} added to watchlist`);
  }

  function removeFromWatchlist(ticker: string) {
    setWatchlist((prev) => prev.filter((i) => i.ticker !== ticker));
    setWatchQuotes((prev) => { const n = { ...prev }; delete n[ticker]; return n as Record<string, QuoteData>; });
  }

  const watchQuoteList = watchlist.map((w) => watchQuotes[w.ticker]).filter(Boolean) as QuoteData[];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search stocks, ETFs, crypto..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Searching...</span>}
        {searchResults.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((r) => (
              <button key={r.ticker} className="w-full text-left px-4 py-2.5 hover:bg-muted text-sm transition-colors flex items-center justify-between" onClick={() => addToWatchlist(r)}>
                <div>
                  <span className="font-semibold">{r.ticker}</span>
                  <span className="text-muted-foreground ml-2">{r.name}</span>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <span className="text-xs text-muted-foreground">{r.exchange}</span>
                  <Badge variant="secondary" className="text-xs">{r.type}</Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">My Watchlist</h2>
          <Card>
            <QuoteTable quotes={watchQuoteList} showRemove onRemove={removeFromWatchlist} />
          </Card>
        </section>
      )}

      {/* Market Overview */}
      <section>
        <h2 className="text-base font-semibold mb-3">Market Overview</h2>
        <Card>
          <QuoteTable quotes={defaultQuotes} loading={loadingDefault} />
        </Card>
      </section>
    </div>
  );
}

// ─── Screener Tab ─────────────────────────────────────────────────────────────

type SortField = "ticker" | "price" | "changePercent";
type SortDir = "asc" | "desc";

function ScreenerTab() {
  const [category, setCategory] = useState<string>("large-cap");
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("changePercent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<"all" | "gainers" | "losers">("all");

  const fetchCategory = useCallback(async (cat: string) => {
    setLoading(true);
    setQuotes([]);
    try {
      const tickers = SCREENER_LISTS[cat]?.tickers ?? [];
      const res = await fetch(`/api/market/quote?tickers=${tickers.join(",")}`);
      const data: QuoteData[] = await res.json();
      setQuotes(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategory(category); }, [category, fetchCategory]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  const filtered = quotes
    .filter((q) => {
      if (filter === "gainers") return q.changePercent > 0;
      if (filter === "losers") return q.changePercent < 0;
      return true;
    })
    .sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      if (sortField === "ticker") return mult * a.ticker.localeCompare(b.ticker);
      if (sortField === "price") return mult * (a.price - b.price);
      return mult * (a.changePercent - b.changePercent);
    });

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="inline h-3 w-3 ml-0.5" /> : <ChevronDown className="inline h-3 w-3 ml-0.5" />;
  }

  return (
    <div className="space-y-5">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SCREENER_LISTS).map(([key, { label }]) => (
          <Button key={key} size="sm" variant={category === key ? "default" : "outline"} onClick={() => setCategory(key)} className="text-xs h-8">
            {label}
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter:</span>
        </div>
        {(["all", "gainers", "losers"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "secondary" : "ghost"} onClick={() => setFilter(f)} className="text-xs h-7 capitalize">
            {f === "gainers" ? "Gainers only" : f === "losers" ? "Losers only" : "All"}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("ticker")}>
                    Symbol <SortIcon field="ticker" />
                  </th>
                  <th className="text-right px-5 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("price")}>
                    Price <SortIcon field="price" />
                  </th>
                  <th className="text-right px-5 py-3 font-medium hidden sm:table-cell">Change</th>
                  <th className="text-right px-5 py-3 font-medium cursor-pointer select-none" onClick={() => toggleSort("changePercent")}>
                    % Change <SortIcon field="changePercent" />
                  </th>
                  <th className="text-right px-5 py-3 font-medium hidden md:table-cell">Market</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No results for this filter.</td></tr>
                ) : filtered.map((q) => {
                  const isPositive = q.changePercent >= 0;
                  return (
                    <tr key={q.ticker} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold">{q.ticker}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">{q.name}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums">{formatCurrency(q.price, q.currency)}</td>
                      <td className="px-5 py-3 text-right tabular-nums hidden sm:table-cell">
                        <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                          {q.change >= 0 ? "+" : ""}{formatCurrency(q.change, q.currency)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`flex items-center justify-end gap-1 font-medium ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          {formatPercent(q.changePercent)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right hidden md:table-cell">
                        <Badge variant="secondary" className={`text-xs ${q.marketState === "REGULAR" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}`}>
                          {q.marketState === "REGULAR" ? "Open" : (q.marketState ?? "Closed")}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Alerts Tab ────────────────────────────────────────────────────────────────

const ALERTS_KEY = "wealthpath_alerts";

function loadAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY) ?? "[]"); } catch { return []; }
}

function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
}

function AlertsTab() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, number>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setAlerts(loadAlerts()); }, []);

  // Check alerts against live prices
  useEffect(() => {
    const activeAlerts = alerts.filter((a) => !a.triggered);
    if (activeAlerts.length === 0) return;
    const tickers = [...new Set(activeAlerts.map((a) => a.ticker))];
    fetch(`/api/market/quote?tickers=${tickers.join(",")}`)
      .then((r) => r.json())
      .then((data: QuoteData[]) => {
        const priceMap: Record<string, number> = {};
        for (const q of data) priceMap[q.ticker] = q.price;
        setQuotes(priceMap);

        let changed = false;
        const updated = alerts.map((a) => {
          if (a.triggered) return a;
          const price = priceMap[a.ticker];
          if (price === undefined) return a;
          const triggered =
            a.direction === "above" ? price >= a.targetPrice : price <= a.targetPrice;
          if (triggered) {
            toast.success(`Alert triggered: ${a.ticker} is ${a.direction} $${a.targetPrice.toFixed(2)}`);
            changed = true;
            return { ...a, triggered: true };
          }
          return a;
        });
        if (changed) { setAlerts(updated); saveAlerts(updated); }
      })
      .catch(() => { /* ignore */ });
  }, [alerts]);

  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(searchQ)}`);
        setSearchResults(await res.json());
      } catch { setSearchResults([]); } finally { setSearching(false); }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQ]);

  function selectTicker(r: SearchResult) {
    setTicker(r.ticker);
    setName(r.name);
    setSearchQ(r.ticker);
    setSearchResults([]);
  }

  function addAlert() {
    const price = parseFloat(targetPrice);
    if (!ticker || isNaN(price) || price <= 0) {
      toast.error("Enter a valid ticker and target price.");
      return;
    }
    const alert: PriceAlert = {
      id: `${ticker}-${Date.now()}`,
      ticker,
      name,
      targetPrice: price,
      direction,
      triggered: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...alerts, alert];
    setAlerts(updated);
    saveAlerts(updated);
    setTicker(""); setName(""); setTargetPrice(""); setSearchQ("");
    toast.success(`Alert set: ${ticker} ${direction} $${price.toFixed(2)}`);
  }

  function deleteAlert(id: string) {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
  }

  function clearTriggered() {
    const updated = alerts.filter((a) => !a.triggered);
    setAlerts(updated);
    saveAlerts(updated);
  }

  const active = alerts.filter((a) => !a.triggered);
  const triggered = alerts.filter((a) => a.triggered);

  return (
    <div className="space-y-6">
      {/* Create Alert */}
      <Card className="p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Set Price Alert
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Ticker search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-8 text-sm h-9"
              placeholder="Search ticker..."
              value={searchQ}
              onChange={(e) => { setSearchQ(e.target.value); if (!e.target.value) { setTicker(""); setName(""); } }}
            />
            {searching && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">...</span>}
            {searchResults.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((r) => (
                  <button key={r.ticker} className="w-full text-left px-3 py-2 hover:bg-muted text-sm transition-colors" onClick={() => selectTicker(r)}>
                    <span className="font-semibold">{r.ticker}</span>
                    <span className="text-muted-foreground text-xs ml-2">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Direction */}
          <div className="flex rounded-md overflow-hidden border">
            <button
              className={`flex-1 text-xs py-2 font-medium transition-colors ${direction === "above" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
              onClick={() => setDirection("above")}
            >
              Above ↑
            </button>
            <button
              className={`flex-1 text-xs py-2 font-medium transition-colors ${direction === "below" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
              onClick={() => setDirection("below")}
            >
              Below ↓
            </button>
          </div>
          {/* Target price */}
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Target price ($)"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="h-9 text-sm"
          />
          <Button onClick={addAlert} className="h-9 text-sm">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Set Alert
          </Button>
        </div>
        {ticker && (
          <p className="text-xs text-muted-foreground mt-2">
            Alert: notify when <strong>{ticker}</strong> goes <strong>{direction}</strong> <strong>${parseFloat(targetPrice || "0").toFixed(2)}</strong>
            {quotes[ticker] && ` (current: $${quotes[ticker].toFixed(2)})`}
          </p>
        )}
      </Card>

      {/* Active Alerts */}
      <section>
        <h2 className="text-base font-semibold mb-3">Active Alerts ({active.length})</h2>
        {active.length === 0 ? (
          <Card className="p-8 text-center">
            <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No active alerts.</p>
            <p className="text-xs text-muted-foreground">Set an alert above to get notified when a price target is hit.</p>
          </Card>
        ) : (
          <Card>
            <div className="divide-y">
              {active.map((a) => {
                const current = quotes[a.ticker];
                const diff = current !== undefined ? current - a.targetPrice : null;
                return (
                  <div key={a.id} className="flex items-center justify-between px-5 py-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Bell className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{a.ticker}</p>
                        <p className="text-xs text-muted-foreground">{a.name}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{a.direction === "above" ? "Price above" : "Price below"}</p>
                      <p className="font-semibold text-sm">${a.targetPrice.toFixed(2)}</p>
                    </div>
                    {current !== undefined && (
                      <div className="text-center hidden sm:block">
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="font-semibold text-sm">${current.toFixed(2)}</p>
                        {diff !== null && (
                          <p className={`text-[10px] ${diff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                            {diff >= 0 ? "+" : ""}{diff.toFixed(2)} from target
                          </p>
                        )}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 shrink-0" onClick={() => deleteAlert(a.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </section>

      {/* Triggered Alerts */}
      {triggered.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Triggered ({triggered.length})</h2>
            <Button variant="outline" size="sm" onClick={clearTriggered} className="text-xs h-7">
              Clear all
            </Button>
          </div>
          <Card>
            <div className="divide-y">
              {triggered.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3 gap-4 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Bell className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm line-through">{a.ticker}</p>
                      <p className="text-xs text-muted-foreground">{a.direction} ${a.targetPrice.toFixed(2)} — triggered</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 shrink-0" onClick={() => deleteAlert(a.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "screener" | "alerts";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { id: "screener", label: "Screener", icon: <SlidersHorizontal className="h-3.5 w-3.5" /> },
  { id: "alerts", label: "Price Alerts", icon: <Bell className="h-3.5 w-3.5" /> },
];

export default function MarketsPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <main id="main-content" className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Markets</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Track prices, screen opportunities, and set alerts
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab />}
      {tab === "screener" && <ScreenerTab />}
      {tab === "alerts" && <AlertsTab />}
    </main>
  );
}
