"use client";

import { useState } from "react";
import {
  TrendingUp,
  RefreshCw,
  Layers,
  BarChart2,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Strategy {
  id: string;
  name: string;
  tagline: string;
  description: string;
  riskLevel: "Low" | "Moderate" | "High" | "Very High";
  timeHorizon: string;
  expectedReturn: string;
  icon: React.ReactNode;
  steps: string[];
  pros: string[];
  cons: string[];
  idealFor: string;
  sampleAllocation: { label: string; pct: number; color: string }[];
}

const STRATEGIES: Strategy[] = [
  {
    id: "buy-and-hold",
    name: "Buy & Hold",
    tagline: "Set it, forget it, let compounding work.",
    description:
      "Purchase diversified assets — typically index funds or blue-chip stocks — and hold them for years or decades regardless of market volatility. This strategy leverages the long-term upward trend of markets.",
    riskLevel: "Low",
    timeHorizon: "10+ years",
    expectedReturn: "8–10% annually (historical avg)",
    icon: <Shield className="h-5 w-5" />,
    steps: [
      "Choose a diversified mix of index ETFs (e.g. SPY, VTI, QQQ)",
      "Invest a lump sum or start a regular contribution schedule",
      "Reinvest all dividends automatically",
      "Review allocation annually — rebalance if off by >5%",
      "Ignore short-term market noise; do not panic-sell",
    ],
    pros: [
      "Minimal time commitment after setup",
      "Low transaction costs and taxes (fewer trades)",
      "Historically outperforms most active strategies long-term",
      "Emotionally simple — no need to watch markets daily",
    ],
    cons: [
      "Requires patience; gains are slow",
      "Full exposure to market downturns (no hedging)",
      "Opportunity cost if market stagnates for years",
    ],
    idealFor: "Long-term investors who want to build wealth passively",
    sampleAllocation: [
      { label: "US Stocks", pct: 60, color: "bg-blue-500" },
      { label: "International", pct: 20, color: "bg-emerald-500" },
      { label: "Bonds", pct: 15, color: "bg-violet-500" },
      { label: "REITs", pct: 5, color: "bg-yellow-500" },
    ],
  },
  {
    id: "dca",
    name: "Dollar-Cost Averaging",
    tagline: "Invest a fixed amount regularly, regardless of price.",
    description:
      "Invest a fixed dollar amount at regular intervals (weekly/monthly) no matter what the market is doing. This smooths out the impact of volatility by automatically buying more when prices are low and less when they're high.",
    riskLevel: "Low",
    timeHorizon: "5–20 years",
    expectedReturn: "7–10% annually",
    icon: <RefreshCw className="h-5 w-5" />,
    steps: [
      "Decide on a fixed monthly investment amount (e.g. $500/month)",
      "Choose 2–4 core ETFs or index funds",
      "Set up automatic monthly purchases on a fixed date",
      "Stick to the schedule — especially during downturns",
      "Increase contributions as income grows",
    ],
    pros: [
      "Removes emotion from investing decisions",
      "Reduces risk of investing a lump sum at a market peak",
      "Works with any income level — start small",
      "Builds a disciplined savings habit",
    ],
    cons: [
      "If the market trends up strongly, lump-sum investing may outperform",
      "Transaction fees can add up with frequent small purchases",
      "Requires consistent cash flow",
    ],
    idealFor: "Salaried investors who want a disciplined, automated strategy",
    sampleAllocation: [
      { label: "Total Market ETF", pct: 70, color: "bg-blue-500" },
      { label: "International ETF", pct: 20, color: "bg-emerald-500" },
      { label: "Bond ETF", pct: 10, color: "bg-violet-500" },
    ],
  },
  {
    id: "dividend-growth",
    name: "Dividend Growth",
    tagline: "Build a stream of growing passive income.",
    description:
      "Focus on companies with a long history of paying and increasing dividends (Dividend Aristocrats). The goal is to build a portfolio that generates a reliable, growing income stream over time.",
    riskLevel: "Moderate",
    timeHorizon: "7–15 years",
    expectedReturn: "6–9% total return (dividends + appreciation)",
    icon: <TrendingUp className="h-5 w-5" />,
    steps: [
      "Screen for Dividend Aristocrats (25+ years of consecutive dividend increases)",
      "Target companies with <60% payout ratio for dividend sustainability",
      "Diversify across sectors — avoid >30% in any single sector",
      "Reinvest dividends (DRIP) until you need the income",
      "Monitor annual dividend growth rate — exit if growth stalls",
    ],
    pros: [
      "Growing passive income stream",
      "Tend to hold up better in downturns (stable companies)",
      "Dividend reinvestment supercharges compounding",
      "Portfolio generates real cash — tangible reward",
    ],
    cons: [
      "Dividend-paying stocks may lag growth stocks in bull markets",
      "Heavy exposure to specific sectors (utilities, consumer staples)",
      "Dividends are taxed as ordinary income",
    ],
    idealFor: "Income-seeking investors building toward retirement",
    sampleAllocation: [
      { label: "Dividend Stocks", pct: 55, color: "bg-blue-500" },
      { label: "Dividend ETFs", pct: 25, color: "bg-emerald-500" },
      { label: "REITs", pct: 15, color: "bg-yellow-500" },
      { label: "Cash", pct: 5, color: "bg-slate-400" },
    ],
  },
  {
    id: "index-investing",
    name: "Index Investing",
    tagline: "Own the whole market for near-zero cost.",
    description:
      "Build a portfolio exclusively of low-cost index ETFs that track broad market indices. Based on the efficient market hypothesis — over time, most active managers fail to beat the index after fees.",
    riskLevel: "Moderate",
    timeHorizon: "10+ years",
    expectedReturn: "8–10% annually (market returns)",
    icon: <Layers className="h-5 w-5" />,
    steps: [
      "Build a 3-fund portfolio: total US market, international, bonds",
      "Use the lowest-cost ETFs available (target <0.10% expense ratio)",
      "Set a target allocation based on age and risk tolerance",
      "Rebalance annually back to your target allocation",
      "Increase bond allocation as you approach your goal date",
    ],
    pros: [
      "Lowest possible investment costs",
      "Instant diversification across thousands of securities",
      "Tax-efficient (low turnover)",
      "Consistently beats most actively managed funds over 10+ years",
    ],
    cons: [
      "You will never outperform the market — you ARE the market",
      "No protection against broad market crashes",
      "Boring — requires ignoring financial media",
    ],
    idealFor: "Anyone who wants a simple, evidence-based approach",
    sampleAllocation: [
      { label: "US Total Market", pct: 60, color: "bg-blue-500" },
      { label: "International", pct: 30, color: "bg-emerald-500" },
      { label: "Bonds", pct: 10, color: "bg-violet-500" },
    ],
  },
  {
    id: "growth",
    name: "Growth Investing",
    tagline: "Bet on companies growing faster than the market.",
    description:
      "Focus on companies expected to grow revenue and earnings significantly faster than average. Accept higher valuations (high P/E ratios) in exchange for potential above-market returns.",
    riskLevel: "High",
    timeHorizon: "5–10 years",
    expectedReturn: "15–25% in good years, -30% in bad years",
    icon: <Zap className="h-5 w-5" />,
    steps: [
      "Screen for high revenue growth (>20% YoY), large TAM, strong moat",
      "Check balance sheet quality — favor low debt, high FCF margins",
      "Hold 15–25 positions to balance concentration risk",
      "Use a 52-week high/low analysis to identify entry points",
      "Set a thesis for each holding; exit if thesis breaks",
    ],
    pros: [
      "Potential for significant market outperformance",
      "Exciting — you're investing in the future",
      "Compounding at high rates is extremely powerful",
    ],
    cons: [
      "Highly volatile — 30–50% drawdowns are common",
      "Requires significant research time per company",
      "Growth stocks are sensitive to interest rate rises",
      "Emotionally challenging — easy to panic-sell",
    ],
    idealFor: "Investors with high risk tolerance and a 5+ year horizon",
    sampleAllocation: [
      { label: "Growth Stocks", pct: 70, color: "bg-blue-500" },
      { label: "Growth ETFs", pct: 20, color: "bg-emerald-500" },
      { label: "Cash (dry powder)", pct: 10, color: "bg-slate-400" },
    ],
  },
  {
    id: "value",
    name: "Value Investing",
    tagline: "Buy $1 of value for $0.70.",
    description:
      "Seek companies trading below their intrinsic value — due to temporary problems, market overreaction, or neglect. Wait for the market to recognize the true value. Pioneered by Benjamin Graham, popularized by Warren Buffett.",
    riskLevel: "Moderate",
    timeHorizon: "5–10 years",
    expectedReturn: "10–15% on successful picks",
    icon: <BarChart2 className="h-5 w-5" />,
    steps: [
      "Screen for low P/E (<15), P/B (<1.5), strong FCF yield",
      "Analyze why the stock is cheap — is it fixable?",
      "Calculate intrinsic value (DCF or earnings power value)",
      "Buy only when price is 30%+ below intrinsic value (margin of safety)",
      "Hold until price reaches fair value, then sell and redeploy",
    ],
    pros: [
      "Buy assets at a discount — inherent margin of safety",
      "Long historical track record of outperformance",
      "Less exposed to hype-driven market swings",
    ],
    cons: [
      "Value traps — cheap for a reason that doesn't resolve",
      "Can underperform growth significantly during bull markets",
      "Requires deep fundamental analysis skills",
      "Mean-reversion can take years (tests patience)",
    ],
    idealFor: "Analytical investors willing to dig deep into financials",
    sampleAllocation: [
      { label: "Value Stocks", pct: 65, color: "bg-blue-500" },
      { label: "Value ETFs", pct: 20, color: "bg-emerald-500" },
      { label: "Bonds/Cash", pct: 15, color: "bg-violet-500" },
    ],
  },
];

const RISK_COLORS: Record<string, string> = {
  "Low": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Moderate": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "High": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Very High": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
            {strategy.icon}
          </div>
          <div>
            <h3 className="font-semibold text-base">{strategy.name}</h3>
            <p className="text-xs text-muted-foreground">{strategy.tagline}</p>
          </div>
        </div>
        <Badge className={`text-xs border-0 shrink-0 ml-2 ${RISK_COLORS[strategy.riskLevel]}`}>
          {strategy.riskLevel} Risk
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{strategy.description}</p>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Time Horizon</p>
          <p className="text-sm font-medium mt-0.5">{strategy.timeHorizon}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Expected Return</p>
          <p className="text-sm font-medium mt-0.5">{strategy.expectedReturn}</p>
        </div>
      </div>

      {/* Sample allocation */}
      <div className="mb-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Sample Allocation</p>
        <div className="h-3 rounded-full overflow-hidden flex">
          {strategy.sampleAllocation.map((a) => (
            <div
              key={a.label}
              className={`h-full ${a.color}`}
              style={{ width: `${a.pct}%` }}
              title={`${a.label}: ${a.pct}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
          {strategy.sampleAllocation.map((a) => (
            <div key={a.label} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${a.color}`} />
              <span className="text-[10px] text-muted-foreground">{a.label} {a.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expand button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full h-8 text-xs text-muted-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <><ChevronUp className="h-3.5 w-3.5 mr-1" /> Hide details</>
        ) : (
          <><ChevronDown className="h-3.5 w-3.5 mr-1" /> Show steps, pros & cons</>
        )}
      </Button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {/* Steps */}
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide">How to implement</p>
            <ol className="space-y-1.5">
              {strategy.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold shrink-0 text-xs mt-0.5">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Pros */}
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Pros</p>
            <ul className="space-y-1">
              {strategy.pros.map((pro, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-red-500 dark:text-red-400">Cons</p>
            <ul className="space-y-1">
              {strategy.cons.map((con, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-red-500 shrink-0 font-bold text-xs mt-0.5">–</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-xs font-semibold text-primary mb-0.5">Ideal for</p>
            <p className="text-xs text-muted-foreground">{strategy.idealFor}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function StrategiesPage() {
  const [filter, setFilter] = useState<"All" | "Low" | "Moderate" | "High">("All");

  const filtered = STRATEGIES.filter((s) => {
    if (filter === "All") return true;
    if (filter === "High") return s.riskLevel === "High" || s.riskLevel === "Very High";
    return s.riskLevel === filter;
  });

  return (
    <main id="main-content" className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Investment Strategy Templates</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          6 proven strategies with step-by-step guides, pros/cons, and sample allocations
        </p>
      </div>

      {/* Risk filter */}
      <div className="flex flex-wrap gap-2">
        {(["All", "Low", "Moderate", "High"] as const).map((level) => (
          <Button
            key={level}
            size="sm"
            variant={filter === level ? "default" : "outline"}
            onClick={() => setFilter(level)}
            className="text-xs h-8"
          >
            {level === "High" ? "High / Very High" : level} Risk
          </Button>
        ))}
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((s) => (
          <StrategyCard key={s.id} strategy={s} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> The strategies above are educational templates, not personalized financial advice.
          Past performance does not guarantee future results. Always consult a licensed financial advisor before
          making investment decisions. WealthPath is not a registered investment advisor.
        </p>
      </div>
    </main>
  );
}
