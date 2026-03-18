"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  Trophy,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface UnrealizedRow {
  ticker: string;
  name: string;
  assetType: string;
  portfolioName: string;
  qty: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  cost: number;
  pnl: number;
  pnlPct: number;
}

interface RealizedRow {
  ticker: string;
  name: string;
  assetType: string;
  portfolioName: string;
  date: string;
  qty: number;
  salePrice: number;
  avgCost: number;
  proceeds: number;
  cost: number;
  pnl: number;
  pnlPct: number;
  fees: number;
}

interface AssetTypeRow {
  type: string;
  value: number;
  cost: number;
  pnl: number;
  pnlPct: number;
}

interface PnlData {
  summary: {
    totalUnrealizedPnl: number;
    totalUnrealizedPct: number;
    totalRealizedPnl: number;
    winnersCount: number;
    losersCount: number;
    winRate: number;
  };
  unrealizedRows: UnrealizedRow[];
  realizedRows: RealizedRow[];
  byAssetType: AssetTypeRow[];
  biggestGain: UnrealizedRow | null;
  biggestLoss: UnrealizedRow | null;
}

interface BenchmarkEntry {
  ticker: string;
  label: string;
  returnPct: number | null;
}

interface BenchmarkData {
  portfolioReturn: number | null;
  benchmarks: BenchmarkEntry[];
  ranked: { ticker: string; label: string; returnPct: number }[];
  portfolioRank: number;
  totalBenchmarks: number;
  beatenCount: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function pnlClass(n: number) {
  return n >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400";
}

const ASSET_LABELS: Record<string, string> = {
  stock: "Stocks", etf: "ETFs", mutual_fund: "Mutual Funds",
  crypto: "Crypto", bond: "Bonds", reit: "REITs", cash: "Cash", other: "Other",
};

export default function ReportsPage() {
  const [pnlData, setPnlData] = useState<PnlData | null>(null);
  const [benchData, setBenchData] = useState<BenchmarkData | null>(null);
  const [loadingPnl, setLoadingPnl] = useState(true);
  const [loadingBench, setLoadingBench] = useState(true);
  const [activeTab, setActiveTab] = useState<"unrealized" | "realized">("unrealized");

  const fetchAll = useCallback(async () => {
    setLoadingPnl(true);
    setLoadingBench(true);
    const [pnlRes, benchRes] = await Promise.all([
      fetch("/api/reports/pnl"),
      fetch("/api/reports/benchmark"),
    ]);
    if (pnlRes.ok) setPnlData(await pnlRes.json());
    if (benchRes.ok) setBenchData(await benchRes.json());
    setLoadingPnl(false);
    setLoadingBench(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, [fetchAll]);

  function exportCSV() {
    if (!pnlData) return;
    const rows = [
      ["Ticker", "Name", "Asset Type", "Portfolio", "Qty", "Avg Cost", "Current Price", "Value", "Cost", "P&L", "P&L %"],
      ...pnlData.unrealizedRows.map((r) => [
        r.ticker, r.name, r.assetType, r.portfolioName,
        r.qty.toFixed(4), r.avgCost.toFixed(2), r.currentPrice.toFixed(2),
        r.value.toFixed(2), r.cost.toFixed(2), r.pnl.toFixed(2), r.pnlPct.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wealthpath-pnl.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const maxBenchReturn = benchData
    ? Math.max(
        ...benchData.ranked.map((r) => Math.abs(r.returnPct)),
        1
      )
    : 1;

  return (
    <main id="main-content" className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">P&amp;L Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Unrealized gains/losses, realized trades, and benchmark comparison
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      {loadingPnl ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : pnlData ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Unrealized P&amp;L</p>
            <p className={`text-xl font-bold mt-1 ${pnlClass(pnlData.summary.totalUnrealizedPnl)}`}>
              {fmt(pnlData.summary.totalUnrealizedPnl)}
            </p>
            <p className={`text-xs mt-0.5 ${pnlClass(pnlData.summary.totalUnrealizedPct)}`}>
              {fmtPct(pnlData.summary.totalUnrealizedPct)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Realized P&amp;L</p>
            <p className={`text-xl font-bold mt-1 ${pnlClass(pnlData.summary.totalRealizedPnl)}`}>
              {fmt(pnlData.summary.totalRealizedPnl)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">from closed positions</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-xl font-bold mt-1">{pnlData.summary.winRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pnlData.summary.winnersCount}W / {pnlData.summary.losersCount}L
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Open Positions</p>
            <p className="text-xl font-bold mt-1">{pnlData.unrealizedRows.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pnlData.realizedRows.length} closed trades
            </p>
          </Card>
        </div>
      ) : null}

      {/* Biggest Gain / Loss */}
      {pnlData && (pnlData.biggestGain || pnlData.biggestLoss) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pnlData.biggestGain && (
            <Card className="p-4 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Biggest Gain</p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold">{pnlData.biggestGain.ticker}</p>
                  <p className="text-xs text-muted-foreground">{pnlData.biggestGain.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {fmt(pnlData.biggestGain.pnl)}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {fmtPct(pnlData.biggestGain.pnlPct)}
                  </p>
                </div>
              </div>
            </Card>
          )}
          {pnlData.biggestLoss && pnlData.biggestLoss.pnl < 0 && (
            <Card className="p-4 border-red-200 dark:border-red-900">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-red-500" />
                <p className="text-sm font-medium text-red-500 dark:text-red-400">Biggest Loss</p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold">{pnlData.biggestLoss.ticker}</p>
                  <p className="text-xs text-muted-foreground">{pnlData.biggestLoss.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-500 dark:text-red-400 font-semibold">
                    {fmt(pnlData.biggestLoss.pnl)}
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400">
                    {fmtPct(pnlData.biggestLoss.pnlPct)}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* P&L by Asset Type */}
      {pnlData && pnlData.byAssetType.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">P&amp;L by Asset Type</h2>
          </div>
          <div className="space-y-3">
            {pnlData.byAssetType.map((row) => {
              const maxPnl = Math.max(...pnlData.byAssetType.map((r) => Math.abs(r.pnl)), 1);
              const barPct = (Math.abs(row.pnl) / maxPnl) * 100;
              return (
                <div key={row.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{ASSET_LABELS[row.type] ?? row.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs">{fmt(row.value)}</span>
                      <span className={`font-semibold ${pnlClass(row.pnl)}`}>
                        {fmt(row.pnl)}
                      </span>
                      <span className={`text-xs ${pnlClass(row.pnlPct)}`}>
                        {fmtPct(row.pnlPct)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.pnl >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Benchmark Comparison */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Benchmark Comparison (1-Year Return)</h2>
        </div>
        {loadingBench ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 rounded" />)}
          </div>
        ) : benchData ? (
          <div className="space-y-3">
            {benchData.ranked.map((entry) => {
              const isPortfolio = entry.ticker === "Portfolio";
              const barPct = (Math.abs(entry.returnPct) / maxBenchReturn) * 100;
              return (
                <div key={entry.ticker}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isPortfolio ? "text-primary" : ""}`}>
                        {entry.label}
                      </span>
                      {isPortfolio && (
                        <Badge className="text-[10px] bg-primary/10 text-primary border-0 px-1.5 py-0">
                          You
                        </Badge>
                      )}
                    </div>
                    <span className={`font-semibold ${pnlClass(entry.returnPct)}`}>
                      {fmtPct(entry.returnPct)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isPortfolio
                          ? "bg-primary"
                          : entry.returnPct >= 0
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {benchData.portfolioReturn !== null && (
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Your portfolio beats {benchData.beatenCount} of {benchData.totalBenchmarks} benchmarks
                {benchData.beatenCount === benchData.totalBenchmarks
                  ? " — outstanding performance!"
                  : benchData.beatenCount >= Math.ceil(benchData.totalBenchmarks / 2)
                  ? " — solid performance."
                  : " — consider reviewing your allocation."}
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Unable to load benchmark data.</p>
        )}
      </Card>

      {/* Holdings P&L Table */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Position Detail</h2>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={activeTab === "unrealized" ? "default" : "outline"}
              onClick={() => setActiveTab("unrealized")}
              className="text-xs h-7"
            >
              Unrealized
            </Button>
            <Button
              size="sm"
              variant={activeTab === "realized" ? "default" : "outline"}
              onClick={() => setActiveTab("realized")}
              className="text-xs h-7"
            >
              Realized
            </Button>
          </div>
        </div>

        {loadingPnl ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : activeTab === "unrealized" ? (
          pnlData && pnlData.unrealizedRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left pb-2 font-medium">Ticker</th>
                    <th className="text-left pb-2 font-medium hidden md:table-cell">Portfolio</th>
                    <th className="text-right pb-2 font-medium">Qty</th>
                    <th className="text-right pb-2 font-medium hidden sm:table-cell">Avg Cost</th>
                    <th className="text-right pb-2 font-medium hidden sm:table-cell">Price</th>
                    <th className="text-right pb-2 font-medium">Value</th>
                    <th className="text-right pb-2 font-medium">P&amp;L</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pnlData.unrealizedRows.map((r) => (
                    <tr key={r.ticker + r.portfolioName} className="py-2">
                      <td className="py-2">
                        <div className="font-medium">{r.ticker}</div>
                        <div className="text-xs text-muted-foreground">{ASSET_LABELS[r.assetType] ?? r.assetType}</div>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground hidden md:table-cell">{r.portfolioName}</td>
                      <td className="py-2 text-right text-xs">{r.qty.toFixed(r.qty < 1 ? 4 : 2)}</td>
                      <td className="py-2 text-right text-xs hidden sm:table-cell">{fmt(r.avgCost)}</td>
                      <td className="py-2 text-right text-xs hidden sm:table-cell">{fmt(r.currentPrice)}</td>
                      <td className="py-2 text-right font-medium">{fmt(r.value)}</td>
                      <td className="py-2 text-right">
                        <div className={`font-semibold text-xs ${pnlClass(r.pnl)}`}>{fmt(r.pnl)}</div>
                        <div className={`text-[10px] ${pnlClass(r.pnlPct)}`}>{fmtPct(r.pnlPct)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No open positions.</p>
          )
        ) : pnlData && pnlData.realizedRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left pb-2 font-medium">Ticker</th>
                  <th className="text-left pb-2 font-medium hidden md:table-cell">Date</th>
                  <th className="text-right pb-2 font-medium">Qty</th>
                  <th className="text-right pb-2 font-medium hidden sm:table-cell">Sale Price</th>
                  <th className="text-right pb-2 font-medium hidden sm:table-cell">Proceeds</th>
                  <th className="text-right pb-2 font-medium">P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pnlData.realizedRows.map((r, i) => (
                  <tr key={i} className="py-2">
                    <td className="py-2">
                      <div className="font-medium">{r.ticker}</div>
                      <div className="text-xs text-muted-foreground">{r.portfolioName}</div>
                    </td>
                    <td className="py-2 text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-right text-xs">{r.qty.toFixed(2)}</td>
                    <td className="py-2 text-right text-xs hidden sm:table-cell">{fmt(r.salePrice)}</td>
                    <td className="py-2 text-right text-xs hidden sm:table-cell">{fmt(r.proceeds)}</td>
                    <td className="py-2 text-right">
                      <div className={`font-semibold text-xs ${pnlClass(r.pnl)}`}>{fmt(r.pnl)}</div>
                      <div className={`text-[10px] ${pnlClass(r.pnlPct)}`}>{fmtPct(r.pnlPct)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No closed trades yet.</p>
            <p className="text-xs">Log a sell transaction to see realized P&amp;L.</p>
          </div>
        )}
      </Card>
    </main>
  );
}
