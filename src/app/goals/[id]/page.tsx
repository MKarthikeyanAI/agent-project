"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { StatsCard } from "@/components/finance/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/market";

interface Contribution {
  id: string;
  amount: string;
  date: string;
  notes: string | null;
}

interface Goal {
  id: string;
  name: string;
  type: string;
  targetAmount: string;
  currentAmount: string;
  monthlySIP: string | null;
  expectedReturn: string;
  currency: string;
  targetDate: string | null;
  isCompleted: boolean;
  contributions: Contribution[];
}

const GOAL_ICONS: Record<string, string> = {
  retirement: "🏖️",
  emergency_fund: "🛡️",
  home_purchase: "🏠",
  education: "🎓",
  travel: "✈️",
  custom: "🎯",
};

function ContributeDialog({
  goalId,
  currency,
  onDone,
}: {
  goalId: string;
  currency: string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/goals/${goalId}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), notes: notes || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success("Contribution recorded");
      setOpen(false);
      setAmount("");
      setNotes("");
      onDone();
    } catch {
      toast.error("Failed to record contribution");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Contribution
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contribution</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="contrib-amount">Amount ({currency})</Label>
            <Input
              id="contrib-amount"
              type="number"
              step="any"
              min="0"
              placeholder="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contrib-notes">Notes (optional)</Label>
            <Input
              id="contrib-notes"
              placeholder="Monthly SIP, bonus, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !amount}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** SIP Calculator — months needed to reach target */
function calculateMonths(
  currentAmount: number,
  targetAmount: number,
  monthlySIP: number,
  annualReturn: number
): number | null {
  if (monthlySIP <= 0) return null;
  const r = annualReturn / 100 / 12;
  let balance = currentAmount;
  let months = 0;
  while (balance < targetAmount && months < 1200) {
    balance = balance * (1 + r) + monthlySIP;
    months++;
  }
  return months;
}

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchGoal = useCallback(async () => {
    try {
      const res = await fetch(`/api/goals/${id}`);
      if (!res.ok) {
        router.push("/goals");
        return;
      }
      const data = await res.json();
      setGoal(data);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  async function handleDelete() {
    if (!confirm("Delete this goal?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
      toast.success("Goal deleted");
      router.push("/goals");
    } catch {
      toast.error("Failed to delete");
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
      </div>
    );
  }

  if (!goal) return null;

  const target = parseFloat(goal.targetAmount);
  const current = parseFloat(goal.currentAmount);
  const remaining = Math.max(target - current, 0);
  const progress = Math.min((current / target) * 100, 100);
  const monthlySIP = goal.monthlySIP ? parseFloat(goal.monthlySIP) : 0;
  const expectedReturn = parseFloat(goal.expectedReturn);
  const monthsNeeded = calculateMonths(current, target, monthlySIP, expectedReturn);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
              <Link href="/goals" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Goals
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{GOAL_ICONS[goal.type] ?? "🎯"}</span>
            <h1 className="text-3xl font-bold">{goal.name}</h1>
            {goal.isCompleted && (
              <Badge className="bg-emerald-500 text-white">Completed</Badge>
            )}
          </div>
          {goal.targetDate && (
            <p className="text-muted-foreground mt-1">
              Target:{" "}
              {new Date(goal.targetDate).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!goal.isCompleted && (
            <ContributeDialog goalId={id} currency={goal.currency} onDone={fetchGoal} />
          )}
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

      {/* Progress */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all ${
              goal.isCompleted ? "bg-emerald-500" : "bg-primary"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(current, goal.currency)} saved
          </span>
          <span className="font-medium">
            {formatCurrency(target, goal.currency)} goal
          </span>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Amount Remaining"
          value={formatCurrency(remaining, goal.currency)}
        />
        <StatsCard
          title="Monthly SIP"
          value={monthlySIP > 0 ? formatCurrency(monthlySIP, goal.currency) : "Not set"}
        />
        <StatsCard
          title="Est. Time to Goal"
          value={
            monthsNeeded !== null
              ? monthsNeeded < 12
                ? `${monthsNeeded} months`
                : `${Math.ceil(monthsNeeded / 12)} years`
              : "—"
          }
          subtitle={`At ${expectedReturn}% annual return`}
        />
      </div>

      {/* Contribution history */}
      <Card>
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-lg">Contribution History</h2>
        </div>
        {goal.contributions.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">No contributions yet</p>
        ) : (
          <div className="divide-y divide-border">
            {[...goal.contributions].reverse().map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium">{formatCurrency(parseFloat(c.amount), goal.currency)}</p>
                  {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(c.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
