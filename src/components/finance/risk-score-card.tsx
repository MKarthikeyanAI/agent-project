import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface RiskScoreCardProps {
  score: number; // 1–10
  label: string;
  description?: string;
}

function riskColor(score: number) {
  if (score <= 2) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
  if (score <= 4) return { bar: "bg-lime-500", text: "text-lime-600 dark:text-lime-400", badge: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400" };
  if (score <= 6) return { bar: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400", badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  if (score <= 8) return { bar: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
  return { bar: "bg-red-500", text: "text-red-600 dark:text-red-400", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
}

const RISK_DESCRIPTIONS: Record<string, string> = {
  "Very Low": "Portfolio is heavily in bonds/cash. Very stable but may underperform inflation.",
  "Low": "Conservative allocation. Good stability with modest growth potential.",
  "Moderate": "Balanced mix of growth and stability assets.",
  "High": "Growth-oriented with significant equity exposure. Expect higher volatility.",
  "Very High": "Aggressive allocation, likely heavy in crypto or concentrated positions.",
};

export function RiskScoreCard({ score, label }: RiskScoreCardProps) {
  const colors = riskColor(score);
  const pct = (score / 10) * 100;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Risk Score</p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
              <span className="text-muted-foreground text-sm">/ 10</span>
            </div>
          </div>
        </div>
        <Badge className={`text-xs font-medium border-0 ${colors.badge}`}>{label}</Badge>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {RISK_DESCRIPTIONS[label] ?? "Risk assessment based on your asset allocation."}
      </p>
    </Card>
  );
}
