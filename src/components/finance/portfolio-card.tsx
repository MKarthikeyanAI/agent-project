"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, ChevronRight, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/market";

interface PortfolioCardProps {
  id: string;
  name: string;
  type: string;
  holdingsCount: number;
  totalValue: number;
  totalCost: number;
  currency: string;
}

const TYPE_LABELS: Record<string, string> = {
  long_term: "Long-term",
  short_term: "Short-term",
  intraday: "Intraday",
  mixed: "Mixed",
};

export function PortfolioCard({
  id,
  name,
  type,
  holdingsCount,
  totalValue,
  totalCost,
  currency,
}: PortfolioCardProps) {
  const pnl = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const isPositive = pnl >= 0;

  return (
    <Link href={`/portfolio/${id}`}>
      <Card className="p-5 hover:border-primary/50 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {holdingsCount} holding{holdingsCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {TYPE_LABELS[type] ?? type}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Market Value</span>
            <span className="font-semibold">
              {formatCurrency(totalValue, currency)}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-muted-foreground">Total P&L</span>
            <span
              className={`font-medium text-sm flex items-center gap-1 ${
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? "+" : ""}
              {formatCurrency(pnl, currency)} ({isPositive ? "+" : ""}
              {pnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
