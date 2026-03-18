"use client";

import { useEffect, useState, useCallback } from "react";
import { Target } from "lucide-react";
import { CreateGoalDialog } from "@/components/finance/create-goal-dialog";
import { GoalCard } from "@/components/finance/goal-card";
import { StatsCard } from "@/components/finance/stats-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/market";

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

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      setGoals(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  const totalSaved = goals.reduce((sum, g) => sum + parseFloat(g.currentAmount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + parseFloat(g.targetAmount), 0);
  const avgProgress =
    goals.length > 0
      ? goals.reduce((sum, g) => {
          return (
            sum +
            Math.min((parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100, 100)
          );
        }, 0) / goals.length
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Financial Goals</h1>
          <p className="text-muted-foreground mt-1">
            {goals.length} goal{goals.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <CreateGoalDialog onCreated={fetchGoals} />
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard title="Total Saved" value={formatCurrency(totalSaved)} />
          <StatsCard title="Total Target" value={formatCurrency(totalTarget)} />
          <StatsCard
            title="Average Progress"
            value={`${avgProgress.toFixed(0)}%`}
            subtitle={`${completedGoals.length} completed`}
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold mb-2">No goals yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Set financial goals — retirement, home purchase, education, or anything you&#39;re
            saving toward.
          </p>
          <CreateGoalDialog onCreated={fetchGoals} />
        </Card>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Active Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map((g) => (
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
            </section>
          )}

          {completedGoals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Completed Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map((g) => (
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
            </section>
          )}
        </>
      )}
    </div>
  );
}
