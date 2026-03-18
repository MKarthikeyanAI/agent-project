import { formatCurrency } from "@/lib/market";

interface AllocationItem {
  type: string;
  label: string;
  value: number;
  pct: number;
  color: string;
}

interface AllocationBarProps {
  items: AllocationItem[];
  currency?: string;
  showLegend?: boolean;
}

/** Stacked horizontal bar showing portfolio allocation */
export function AllocationStackedBar({ items }: { items: AllocationItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex h-4 w-full rounded-full overflow-hidden gap-px">
      {items.map((item) => (
        <div
          key={item.type}
          title={`${item.label}: ${item.pct.toFixed(1)}%`}
          className={`${item.color} transition-all first:rounded-l-full last:rounded-r-full`}
          style={{ width: `${item.pct}%` }}
        />
      ))}
    </div>
  );
}

/** Row-by-row breakdown with bars */
export function AllocationBreakdown({ items, currency = "USD" }: AllocationBarProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.type}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className="text-muted-foreground text-xs">
                {formatCurrency(item.value, currency)}
              </span>
              <span className="font-semibold w-12 text-right">{item.pct.toFixed(1)}%</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${item.color}`}
              style={{ width: `${item.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
