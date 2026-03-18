"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Briefcase, Target, TrendingUp, Bot, ArrowRight } from "lucide-react";
import { CreatePortfolioDialog } from "@/components/finance/create-portfolio-dialog";
import { GoalCard } from "@/components/finance/goal-card";
import { PortfolioCard } from "@/components/finance/portfolio-card";
import { StatsCard } from "@/components/finance/stats-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/market";
import type { QuoteData } from "@/lib/market";

interface Portfolio {
  id: string;
  name: string;
  type: string;
  currency: string;
  holdings: Holding[];
}

interface Holding {
  id: string;
  ticker: string;
  quantity: string;
  avgCostBasis: string;
}

interface Goal {
  id: string;
  name: string;
  type: string;
  targetAmount: string;
  currentAmount: string;
  currency: string;
  targetDate: string | null;
  isCompleted: boolean;
}

export default function DashboardPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [portsRes, goalsRes] = await Promise.all([
        fetch("/api/portfolios"),
        fetch("/api/goals"),
      ]);
      const portsData: Portfolio[] = await portsRes.json();
      const goalsData: Goal[] = await goalsRes.json();

      const withHoldings = await Promise.all(
        portsData.map(async (p) => {
          const res = await fetch(`/api/portfolios/${p.id}`);
          const data = await res.json();
          return { ...p, holdings: (data.holdings ?? []) as Holding[] };
        })
      );

      setPortfolios(withHoldings);
      setGoals(goalsData);

      const tickers = [
        ...new Set(withHoldings.flatMap((p) => p.holdings.map((h) => h.ticker))),
      ];
      if (tickers.length > 0) {
        const qRes = await fetch(`/api/market/quote?tickers=${tickers.join(",")}`);
        const qData: QuoteData[] = await qRes.json();
        const qMap: Record<string, QuoteData> = {};
        for (const q of qData) qMap[q.ticker] = q;
        setQuotes(qMap);
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute net worth
  let totalPortfolioValue = 0;
  let totalPortfolioCost = 0;

  const portfolioSummaries = portfolios.map((p) => {
    let value = 0;
    let cost = 0;
    for (const h of p.holdings) {
      const qty = parseFloat(h.quantity);
      const costBasis = parseFloat(h.avgCostBasis);
      const quote = quotes[h.ticker];
      const currentPrice = quote?.price ?? costBasis;
      value += qty * currentPrice;
      cost += qty * costBasis;
    }
    totalPortfolioValue += value;
    totalPortfolioCost += cost;
    return { ...p, totalValue: value, totalCost: cost };
  });

  const totalGoalSavings = goals.reduce((sum, g) => sum + parseFloat(g.currentAmount), 0);
  const netWorth = totalPortfolioValue + totalGoalSavings;
  const totalPnl = totalPortfolioValue - totalPortfolioCost;
  const totalPnlPct = totalPortfolioCost > 0 ? (totalPnl / totalPortfolioCost) * 100 : 0;

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const avgGoalProgress =
    goals.length > 0
      ? goals.reduce((sum, g) => {
          const pct = Math.min(
            (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100,
            100
          );
          return sum + pct;
        }, 0) / goals.length
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your wealth overview</p>
        </div>
        <CreatePortfolioDialog onCreated={fetchData} />
      </div>

      {/* Stats row */}
      {loadingData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Net Worth"
            value={formatCurrency(netWorth)}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatsCard
            title="Portfolio Value"
            value={formatCurrency(totalPortfolioValue)}
            change={totalPnlPct}
            changeLabel="all time"
            icon={<Briefcase className="h-5 w-5" />}
          />
          <StatsCard
            title="Total P&L"
            value={`${totalPnl >= 0 ? "+" : ""}${formatCurrency(totalPnl)}`}
            subtitle={`${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}% all time`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatsCard
            title="Goals Progress"
            value={`${avgGoalProgress.toFixed(0)}% avg`}
            subtitle={`${activeGoals.length} active goal${activeGoals.length !== 1 ? "s" : ""}`}
            icon={<Target className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Portfolios */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Portfolios</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portfolio" className="flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : portfolioSummaries.length === 0 ? (
          <Card className="p-8 text-center">
            <Briefcase className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">No portfolios yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first portfolio to start tracking investments
            </p>
            <CreatePortfolioDialog onCreated={fetchData} />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioSummaries.slice(0, 3).map((p) => (
              <PortfolioCard
                key={p.id}
                id={p.id}
                name={p.name}
                type={p.type}
                holdingsCount={p.holdings.length}
                totalValue={p.totalValue}
                totalCost={p.totalCost}
                currency={p.currency}
              />
            ))}
          </div>
        )}
      </section>

      {/* Goals */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Financial Goals</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/goals" className="flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">No goals yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Set your first financial goal to start building wealth
            </p>
            <Button asChild>
              <Link href="/goals">
                <Target className="h-4 w-4 mr-2" />
                Create a Goal
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.slice(0, 3).map((g) => (
              <GoalCard
                key={g.id}
                id={g.id}
                name={g.name}
                type={g.type}
                targetAmount={parseFloat(g.targetAmount)}
                currentAmount={parseFloat(g.currentAmount)}
                currency={g.currency}
                targetDate={g.targetDate}
                isCompleted={g.isCompleted}
              />
            ))}
          </div>
        )}
      </section>

      {/* AI Advisor CTA */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">AI Financial Advisor</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Ask questions about your portfolio, investment strategies, risk management, or
              get personalized recommendations.
            </p>
            <Button size="sm" asChild>
              <Link href="/chat">Chat with AI Advisor</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
