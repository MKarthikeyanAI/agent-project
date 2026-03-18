import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number; // positive = green, negative = red
  changeLabel?: string;
  icon?: React.ReactNode;
}

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1 truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 mt-1.5 text-sm font-medium ${
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {change.toFixed(2)}%{changeLabel ? ` ${changeLabel}` : ""}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0 ml-3">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
