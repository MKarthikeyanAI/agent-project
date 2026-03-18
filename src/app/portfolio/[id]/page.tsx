"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AddHoldingDialog } from "@/components/finance/add-holding-dialog";
import { StatsCard } from "@/components/finance/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/lib/market";
import type { QuoteData } from "@/lib/market";

interface Holding {
  id: string;
  ticker: string;
  name: string;
  assetType: string;
  quantity: string;
  avgCostBasis: string;
}

interface Transaction {
  id: string;
  type: string;
  ticker: string;
  quantity: string;
  price: string;
  fees: string;
  date: string;
  notes: string | null;
}

interface Portfolio {
  id: string;
  name: string;
  type: string;
  currency: string;
  description: string | null;
  holdings: Holding[];
}

const TYPE_LABELS: Record<string, string> = {
  long_term: "Long-term",
  short_term: "Short-term",
  intraday: "Intraday",
  mixed: "Mixed",
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  stock: "Stock",
  etf: "ETF",
  mutual_fund: "Mutual Fund",
  crypto: "Crypto",
  bond: "Bond",
  reit: "REIT",
  cash: "Cash",
  other: "Other",
};

export default function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [portRes, txRes] = await Promise.all([
        fetch(`/api/portfolios/${id}`),
        fetch(`/api/portfolios/${id}/transactions`),
      ]);

      if (!portRes.ok) {
        router.push("/portfolio");
        return;
      }

      const portData: Portfolio = await portRes.json();
      const txData: Transaction[] = await txRes.json();

      setPortfolio(portData);
      setTransactions(txData);

      const tickers = portData.holdings.map((h) => h.ticker);
      if (tickers.length > 0) {
        const qRes = await fetch(`/api/market/quote?tickers=${tickers.join(",")}`);
        const qData: QuoteData[] = await qRes.json();
        const qMap: Record<string, QuoteData> = {};
        for (const q of qData) qMap[q.ticker] = q;
        setQuotes(qMap);
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete() {
    if (!confirm("Delete this portfolio and all its holdings?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Portfolio deleted");
      router.push("/portfolio");
    } catch {
      toast.error("Failed to delete portfolio");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!portfolio) return null;

  // Compute metrics
  let totalValue = 0;
  let totalCost = 0;
  const holdingRows = portfolio.holdings.map((h) => {
    const qty = parseFloat(h.quantity);
    const cb = parseFloat(h.avgCostBasis);
    const quote = quotes[h.ticker];
    const price = quote?.price ?? cb;
    const value = qty * price;
    const cost = qty * cb;
    const pnl = value - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    totalValue += value;
    totalCost += cost;
    return { ...h, qty, cb, price, value, cost, pnl, pnlPct, quote };
  });

  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
              <Link href="/portfolio" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Portfolios
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{portfolio.name}</h1>
            <Badge variant="secondary">{TYPE_LABELS[portfolio.type] ?? portfolio.type}</Badge>
          </div>
          {portfolio.description && (
            <p className="text-muted-foreground mt-1">{portfolio.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <AddHoldingDialog portfolioId={id} onAdded={fetchData} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Market Value"
          value={formatCurrency(totalValue, portfolio.currency)}
          subtitle={`${portfolio.holdings.length} holding${portfolio.holdings.length !== 1 ? "s" : ""}`}
        />
        <StatsCard
          title="Total Cost"
          value={formatCurrency(totalCost, portfolio.currency)}
        />
        <StatsCard
          title="Total P&L"
          value={`${totalPnl >= 0 ? "+" : ""}${formatCurrency(totalPnl, portfolio.currency)}`}
          change={totalPnlPct}
        />
      </div>

      {/* Holdings Table */}
      <Card className="mb-8">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-lg">Holdings</h2>
        </div>

        {portfolio.holdings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No holdings yet</p>
            <AddHoldingDialog portfolioId={id} onAdded={fetchData} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">Asset</th>
                  <th className="text-right px-5 py-3 font-medium">Qty</th>
                  <th className="text-right px-5 py-3 font-medium">Avg Cost</th>
                  <th className="text-right px-5 py-3 font-medium">Price</th>
                  <th className="text-right px-5 py-3 font-medium">Market Value</th>
                  <th className="text-right px-5 py-3 font-medium">P&L</th>
                  <th className="text-right px-5 py-3 font-medium">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {holdingRows.map((h) => (
                  <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <span className="font-semibold">{h.ticker}</span>
                        <span className="text-muted-foreground ml-1.5 text-xs">
                          {ASSET_TYPE_LABELS[h.assetType] ?? h.assetType}
                        </span>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {h.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{h.qty.toFixed(4).replace(/\.?0+$/, "")}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatCurrency(h.cb, portfolio.currency)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <div>
                        {formatCurrency(h.price, portfolio.currency)}
                        {h.quote && (
                          <span
                            className={`block text-xs ${
                              h.quote.changePercent >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatPercent(h.quote.changePercent)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-medium">
                      {formatCurrency(h.value, portfolio.currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`flex items-center justify-end gap-1 font-medium ${
                          h.pnl >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {h.pnl >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {h.pnl >= 0 ? "+" : ""}
                        {formatCurrency(h.pnl, portfolio.currency)}
                        <span className="text-xs">({formatPercent(h.pnlPct)})</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground text-xs tabular-nums">
                      {totalValue > 0 ? ((h.value / totalValue) * 100).toFixed(1) : "0.0"}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Transactions */}
      <Card>
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-lg">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-left px-5 py-3 font-medium">Ticker</th>
                  <th className="text-right px-5 py-3 font-medium">Qty</th>
                  <th className="text-right px-5 py-3 font-medium">Price</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => {
                  const qty = parseFloat(tx.quantity);
                  const price = parseFloat(tx.price);
                  const fees = parseFloat(tx.fees);
                  return (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant={tx.type === "buy" ? "default" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 font-medium">{tx.ticker}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{qty}</td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {formatCurrency(price, portfolio.currency)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-medium">
                        {formatCurrency(qty * price + fees, portfolio.currency)}
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
