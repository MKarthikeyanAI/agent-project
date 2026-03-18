"use client";

import { useState, useEffect, useRef } from "react";
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
import type { SearchResult } from "@/lib/market";

interface AddHoldingDialogProps {
  portfolioId: string;
  onAdded: () => void;
}

export function AddHoldingDialog({ portfolioId, onAdded }: AddHoldingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [form, setForm] = useState({
    quantity: "",
    price: "",
    fees: "0",
    assetType: "stock" as const,
    notes: "",
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQuery.trim() || selected) {
      setSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, selected]);

  function handleSelect(result: SearchResult) {
    setSelected(result);
    setSearchQuery(`${result.ticker} — ${result.name}`);
    setSearchResults([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !form.quantity || !form.price) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/portfolios/${portfolioId}/holdings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: selected.ticker,
          name: selected.name,
          assetType: form.assetType,
          quantity: parseFloat(form.quantity),
          price: parseFloat(form.price),
          fees: parseFloat(form.fees) || 0,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to add holding");

      toast.success(`${selected.ticker} added to portfolio`);
      setOpen(false);
      setSelected(null);
      setSearchQuery("");
      setForm({ quantity: "", price: "", fees: "0", assetType: "stock", notes: "" });
      onAdded();
    } catch {
      toast.error("Failed to add holding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Holding
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Ticker search */}
          <div className="space-y-1.5 relative">
            <Label htmlFor="ticker-search">Search Ticker or Company</Label>
            <Input
              id="ticker-search"
              placeholder="e.g. AAPL or Apple..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelected(null);
              }}
              autoComplete="off"
            />
            {searching && (
              <p className="text-xs text-muted-foreground">Searching...</p>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={r.ticker}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm transition-colors"
                    onClick={() => handleSelect(r)}
                  >
                    <span className="font-medium">{r.ticker}</span>
                    <span className="text-muted-foreground ml-2">{r.name}</span>
                    <span className="text-xs text-muted-foreground ml-1">({r.exchange})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="asset-type">Asset Type</Label>
            <select
              id="asset-type"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.assetType}
              onChange={(e) =>
                setForm((f) => ({ ...f, assetType: e.target.value as typeof f.assetType }))
              }
            >
              <option value="stock">Stock</option>
              <option value="etf">ETF</option>
              <option value="mutual_fund">Mutual Fund</option>
              <option value="crypto">Crypto</option>
              <option value="bond">Bond</option>
              <option value="reit">REIT</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                min="0"
                placeholder="10"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="buy-price">Buy Price</Label>
              <Input
                id="buy-price"
                type="number"
                step="any"
                min="0"
                placeholder="150.00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fees">Fees / Brokerage</Label>
            <Input
              id="fees"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={form.fees}
              onChange={(e) => setForm((f) => ({ ...f, fees: e.target.value }))}
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
            <Button
              type="submit"
              disabled={loading || !selected || !form.quantity || !form.price}
            >
              {loading ? "Adding..." : "Add Holding"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
