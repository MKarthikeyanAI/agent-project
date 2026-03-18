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
import { Textarea } from "@/components/ui/textarea";

interface CreatePortfolioDialogProps {
  onCreated: () => void;
}

export function CreatePortfolioDialog({ onCreated }: CreatePortfolioDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "long_term" as const,
    description: "",
    currency: "USD",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to create portfolio");

      toast.success("Portfolio created");
      setOpen(false);
      setForm({ name: "", type: "long_term", description: "", currency: "USD" });
      onCreated();
    } catch {
      toast.error("Failed to create portfolio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Portfolio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="port-name">Portfolio Name</Label>
            <Input
              id="port-name"
              placeholder="e.g. Retirement Fund"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="port-type">Strategy Type</Label>
            <select
              id="port-type"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))
              }
            >
              <option value="long_term">Long-term</option>
              <option value="short_term">Short-term</option>
              <option value="intraday">Intraday</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="port-currency">Currency</Label>
            <select
              id="port-currency"
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

          <div className="space-y-1.5">
            <Label htmlFor="port-desc">Description (optional)</Label>
            <Textarea
              id="port-desc"
              placeholder="Notes about this portfolio..."
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
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
            <Button type="submit" disabled={loading || !form.name.trim()}>
              {loading ? "Creating..." : "Create Portfolio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
