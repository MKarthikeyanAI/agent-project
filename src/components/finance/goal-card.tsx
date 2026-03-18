"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/market";

interface GoalCardProps {
  id: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: string | null;
  isCompleted: boolean;
}

const GOAL_ICONS: Record<string, string> = {
  retirement: "🏖️",
  emergency_fund: "🛡️",
  home_purchase: "🏠",
  education: "🎓",
  travel: "✈️",
  custom: "🎯",
};

const GOAL_LABELS: Record<string, string> = {
  retirement: "Retirement",
  emergency_fund: "Emergency Fund",
  home_purchase: "Home Purchase",
  education: "Education",
  travel: "Travel",
  custom: "Custom",
};

export function GoalCard({
  id,
  name,
  type,
  targetAmount,
  currentAmount,
  currency,
  targetDate,
  isCompleted,
}: GoalCardProps) {
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  const remaining = Math.max(targetAmount - currentAmount, 0);

  const now = new Date();
  const daysLeft = targetDate
    ? Math.ceil((new Date(targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Link href={`/goals/${id}`}>
      <Card className="p-5 hover:border-primary/50 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label={GOAL_LABELS[type]}>
              {GOAL_ICONS[type] ?? "🎯"}
            </span>
            <div>
              <h3 className="font-semibold leading-tight">{name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {GOAL_LABELS[type] ?? type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <Badge className="bg-emerald-500 text-white text-xs">Completed</Badge>
            ) : daysLeft !== null && daysLeft < 30 ? (
              <Badge variant="destructive" className="text-xs">
                {daysLeft}d left
              </Badge>
            ) : null}
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{formatCurrency(currentAmount, currency, true)} saved</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isCompleted ? "bg-emerald-500" : "bg-primary"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {formatCurrency(remaining, currency, true)} remaining of{" "}
            {formatCurrency(targetAmount, currency, true)}
          </p>
        </div>

        {daysLeft !== null && !isCompleted && (
          <p className="text-xs text-muted-foreground">
            Target:{" "}
            {new Date(targetDate!).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </Card>
    </Link>
  );
}
