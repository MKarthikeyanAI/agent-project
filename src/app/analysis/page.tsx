"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Target, Layers, BarChart2, Briefcase } from "lucide-react";
import { AllocationBreakdown, AllocationStackedBar } from "@/components/finance/allocation-bar";
import { RiskScoreCard } from "@/components/finance/risk-score-card";
import { StatsCard } from "@/components/finance/stats-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/lib/market";

interface AllocationItem {
  type: string;
  label: string;
  value: number;
  pct: number;
  color: string;
}

interface TopHolding {
  ticker: string;
  name: string;
  assetType: string;
  value: number;
  pct: number;
  pnl: number;
  pnlPct: number;
}

interface PortfolioBreakdown {
  id: string;
  name: string;
  type: string;
  value: number;
  pnl: number;
  pnlPct: number;
  holdingsCount: number;
  pct: number;
}

interface Overview {
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPct: number;
  riskScore: number;
  riskLabel: string;
  diversificationScore: number;
  diversificationLabel: string;
  allocationByType: AllocationItem[];
  topHoldings: TopHolding[];
  portfolioBreakdown: PortfolioBreakdown[];
  goalsSummary: { total: number; active: number; totalSaved: number; totalTarget: number };
  holdingsCount: number;
  assetTypeCount: number;
}

const PORTFOLIO_TYPE_LABELS: Record<string, string> = {
  long_term: "Long-term",
  short_term: "Short-term",
  intraday: "Intraday",
  mixed: "Mixed",
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  stock: "Stock", etf: "ETF", mutual_fund: "Mutual Fund",
  crypto: "Crypto", bond: "Bond", reit: "REIT", cash: "Cash", other: "Other",
};

function divColor(score: number) {
  if (score <= 20) return "text-red-600 dark:text-red-400";
  if (score <= 40) return "text-orange-600 dark:text-orange-400";
  if (score <= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score <= 80) return "text-lime-600 dark:text-lime-400";
  return "text-emerald-600 dark:text-emerald-400";
}

export default function AnalysisPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analysis/overview")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.holdingsCount === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Risk & Analysis</h1>
          <p className="text-muted-foreground mt-1">Portfolio insights and risk metrics</p>
        </div>
        <Card className="p-12 text-center">
          <BarChart2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">No holdings to analyse</h2>
          <p className="text-muted-foreground mb-4">
            Add holdings to your portfolios to see risk metrics and allocation analysis.
          </p>
          <Link href="/portfolio" className="text-primary underline underline-offset-2 text-sm">
            Go to Portfolios →
          </Link>
        </Card>
      </div>
    );
  }

  const isPnlPositive = data.totalPnl >= 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Risk & Analysis</h1>
        <p className="text-muted-foreground mt-1">
          {data.holdingsCount} holding{data.holdingsCount !== 1 ? "s" : ""} across{" "}
          {data.portfolioBreakdown.length} portfolio{data.portfolioBreakdown.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Portfolio Value"
          value={formatCurrency(data.totalValue)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          title="Total P&L"
          value={`${isPnlPositive ? "+" : ""}${formatCurrency(data.totalPnl)}`}
          change={data.totalPnlPct}
          icon={isPnlPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
        />
        <StatsCard
          title="Asset Types"
          value={String(data.assetTypeCount)}
          subtitle={`${data.diversificationLabel} diversification`}
          icon={<Layers className="h-5 w-5" />}
        />
        <StatsCard
          title="Goals Funded"
          value={`${data.goalsSummary.total > 0 ? Math.round((data.goalsSummary.totalSaved / data.goalsSummary.totalTarget) * 100) : 0}%`}
          subtitle={`${data.goalsSummary.active} active goals`}
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      {/* Risk + Allocation row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk */}
        <div className="space-y-4">
          <RiskScoreCard score={data.riskScore} label={data.riskLabel} />

          {/* Diversification */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Diversification</p>
              <span className={`text-sm font-semibold ${divColor(data.diversificationScore)}`}>
                {data.diversificationLabel}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${data.diversificationScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {data.assetTypeCount} asset type{data.assetTypeCount !== 1 ? "s" : ""} detected.{" "}
              {data.assetTypeCount < 3
                ? "Consider adding bonds or ETFs to improve diversification."
                : "Good spread across asset classes."}
            </p>
          </Card>
        </div>

        {/* Allocation */}
        <Card className="p-5">
          <h2 className="font-semibold mb-1">Asset Allocation</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {formatCurrency(data.totalValue)} total invested
          </p>

          {/* Stacked bar */}
          <AllocationStackedBar items={data.allocationByType} />

          <div className="mt-5">
            <AllocationBreakdown items={data.allocationByType} />
          </div>
        </Card>
      </div>

      {/* Top Holdings */}
      <Card className="mb-6">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-lg">Top Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-5 py-3 font-medium">Asset</th>
                <th className="text-right px-5 py-3 font-medium">Value</th>
                <th className="text-right px-5 py-3 font-medium">Weight</th>
                <th className="text-right px-5 py-3 font-medium">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.topHoldings.map((h) => (
                <tr key={h.ticker} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold">{h.ticker}</p>
                    <p className="text-xs text-muted-foreground">{ASSET_TYPE_LABELS[h.assetType] ?? h.assetType}</p>
                  </td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">
                    {formatCurrency(h.value)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${h.pct}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-xs">{h.pct.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`font-medium text-sm ${
                        h.pnl >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {h.pnl >= 0 ? "+" : ""}
                      {formatCurrency(h.pnl)}
                      <span className="block text-xs">{formatPercent(h.pnlPct)}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Portfolio Breakdown */}
      {data.portfolioBreakdown.length > 1 && (
        <Card>
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-lg">Portfolio Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-5 py-3 font-medium">Portfolio</th>
                  <th className="text-right px-5 py-3 font-medium">Value</th>
                  <th className="text-right px-5 py-3 font-medium">Share</th>
                  <th className="text-right px-5 py-3 font-medium">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.portfolioBreakdown.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/portfolio/${p.id}`} className="font-semibold hover:text-primary transition-colors">
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">
                          {PORTFOLIO_TYPE_LABELS[p.type] ?? p.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {p.holdingsCount} holding{p.holdingsCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">
                      {formatCurrency(p.value)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${p.pct}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-xs">{p.pct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-medium text-sm flex items-center justify-end gap-1 ${
                          p.pnl >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {p.pnl >= 0 ? "+" : ""}
                        {formatCurrency(p.pnl)}
                        <span className="text-xs">({formatPercent(p.pnlPct)})</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Risk tips */}
      <Card className="mt-6 p-5 bg-muted/30">
        <div className="flex items-start gap-3">
          <Briefcase className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold mb-1 text-sm">Investment Insight</h3>
            <p className="text-sm text-muted-foreground">
              {data.riskScore >= 7
                ? "Your portfolio carries high risk. Consider adding bonds, ETFs, or cash to reduce volatility and protect against downturns."
                : data.riskScore <= 3
                ? "Your portfolio is conservative. If your time horizon allows, adding growth assets like stocks or ETFs could improve long-term returns."
                : "Your portfolio has a balanced risk profile. Regular rebalancing helps maintain your target allocation as markets move."}
              {" "}
              <Link href="/chat" className="text-primary underline underline-offset-2">
                Ask your AI advisor
              </Link>{" "}
              for personalised recommendations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
