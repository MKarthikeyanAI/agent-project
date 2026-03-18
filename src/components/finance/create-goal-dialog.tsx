"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateGoalDialogProps {
  onCreated: () => void;
}

export function CreateGoalDialog({ onCreated }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "custom" as const,
    targetAmount: "",
    targetDate: "",
    monthlySIP: "",
    expectedReturn: "7",
    currency: "USD",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.targetAmount) return;

    setLoading(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          targetAmount: parseFloat(form.targetAmount),
          targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
          monthlySIP: form.monthlySIP ? parseFloat(form.monthlySIP) : undefined,
          expectedReturn: parseFloat(form.expectedReturn) || 7,
          currency: form.currency,
        }),
      });

      if (!res.ok) throw new Error("Failed to create goal");

      toast.success("Goal created");
      setOpen(false);
      setForm({
        name: "",
        type: "custom",
        targetAmount: "",
        targetDate: "",
        monthlySIP: "",
        expectedReturn: "7",
        currency: "USD",
      });
      onCreated();
    } catch {
      toast.error("Failed to create goal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Financial Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-type">Goal Type</Label>
              <select
                id="goal-type"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as typeof f.type }))
                }
              >
                <option value="retirement">🏖️ Retirement</option>
                <option value="emergency_fund">🛡️ Emergency Fund</option>
                <option value="home_purchase">🏠 Home Purchase</option>
                <option value="education">🎓 Education</option>
                <option value="travel">✈️ Travel</option>
                <option value="custom">🎯 Custom</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal-currency">Currency</Label>
              <select
                id="goal-currency"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input
              id="goal-name"
              placeholder="e.g. Retire by 55"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="target-amount">Target Amount</Label>
              <Input
                id="target-amount"
                type="number"
                step="any"
                min="0"
                placeholder="100000"
                value={form.targetAmount}
                onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target-date">Target Date (optional)</Label>
              <Input
                id="target-date"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="monthly-sip">Monthly SIP (optional)</Label>
              <Input
                id="monthly-sip"
                type="number"
                step="any"
                min="0"
                placeholder="500"
                value={form.monthlySIP}
                onChange={(e) => setForm((f) => ({ ...f, monthlySIP: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expected-return">Expected Return %/yr</Label>
              <Input
                id="expected-return"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="7"
                value={form.expectedReturn}
                onChange={(e) => setForm((f) => ({ ...f, expectedReturn: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !form.name.trim() || !form.targetAmount}
            >
              {loading ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
