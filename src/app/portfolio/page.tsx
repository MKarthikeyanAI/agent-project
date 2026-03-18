"use client";

import { useEffect, useState, useCallback } from "react";
import { Briefcase } from "lucide-react";
import { CreatePortfolioDialog } from "@/components/finance/create-portfolio-dialog";
import { PortfolioCard } from "@/components/finance/portfolio-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolios");
      const portsData: Portfolio[] = await res.json();

      const withHoldings = await Promise.all(
        portsData.map(async (p) => {
          const r = await fetch(`/api/portfolios/${p.id}`);
          const d = await r.json();
          return { ...p, holdings: (d.holdings ?? []) as Holding[] };
        })
      );
      setPortfolios(withHoldings);

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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summaries = portfolios.map((p) => {
    let value = 0;
    let cost = 0;
    for (const h of p.holdings) {
      const qty = parseFloat(h.quantity);
      const cb = parseFloat(h.avgCostBasis);
      const price = quotes[h.ticker]?.price ?? cb;
      value += qty * price;
      cost += qty * cb;
    }
    return { ...p, totalValue: value, totalCost: cost };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Portfolios</h1>
          <p className="text-muted-foreground mt-1">
            {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreatePortfolioDialog onCreated={fetchData} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">No portfolios yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first portfolio to start tracking your investments across different
            strategies.
          </p>
          <CreatePortfolioDialog onCreated={fetchData} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((p) => (
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
    </div>
  );
}
