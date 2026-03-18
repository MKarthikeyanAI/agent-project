import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { getQuotes } from "@/lib/market";
import { formatCurrency } from "@/lib/market";
import { portfolios, holdings, goals } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

const messagePartSchema = z.object({
  type: z.string(),
  text: z.string().max(10000).optional(),
});

const messageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(messagePartSchema).optional(),
  content: z.union([z.string(), z.array(messagePartSchema)]).optional(),
});

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).max(100),
});

/** Build a concise portfolio context string for the AI system prompt */
async function buildPortfolioContext(userId: string): Promise<string> {
  try {
    const userPortfolios = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId));

    const allHoldings = await Promise.all(
      userPortfolios.map((p) =>
        db.select().from(holdings).where(eq(holdings.portfolioId, p.id))
      )
    );

    const tickers = [
      ...new Set(allHoldings.flat().map((h) => h.ticker)),
    ];
    const quotes = tickers.length ? await getQuotes(tickers) : [];
    const quoteMap: Record<string, number> = {};
    for (const q of quotes) quoteMap[q.ticker] = q.price;

    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));

    let totalValue = 0;
    let totalCost = 0;

    const portfolioLines = userPortfolios.map((p, i) => {
      const pHoldings = allHoldings[i] ?? [];
      const holdingLines = pHoldings.map((h) => {
        const qty = parseFloat(h.quantity);
        const avg = parseFloat(h.avgCostBasis);
        const price = quoteMap[h.ticker] ?? avg;
        const value = qty * price;
        const cost = qty * avg;
        const pnlPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
        totalValue += value;
        totalCost += cost;
        return `    - ${h.ticker} (${h.assetType}): ${qty} shares, avg ${formatCurrency(avg)}, now ${formatCurrency(price)} (${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%)`;
      });
      return [`  Portfolio: "${p.name}" [${p.type}]`, ...holdingLines].join("\n");
    });

    const goalLines = userGoals.map((g) => {
      const current = parseFloat(g.currentAmount);
      const target = parseFloat(g.targetAmount);
      const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
      const sip = g.monthlySIP ? `, SIP: ${formatCurrency(parseFloat(g.monthlySIP))}/mo` : "";
      return `  - ${g.name} (${g.type}): ${formatCurrency(current)} of ${formatCurrency(target)} (${pct.toFixed(0)}%${sip})`;
    });

    const totalPnl = totalValue - totalCost;
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    const lines = [
      "USER'S FINANCIAL SNAPSHOT:",
      `Total Portfolio Value: ${formatCurrency(totalValue)}`,
      `Total P&L: ${totalPnl >= 0 ? "+" : ""}${formatCurrency(totalPnl)} (${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(1)}%)`,
      "",
      "Portfolios & Holdings:",
      ...portfolioLines,
      "",
      "Financial Goals:",
      ...(goalLines.length ? goalLines : ["  No goals set"]),
    ];

    return lines.join("\n");
  } catch {
    return "Portfolio data unavailable.";
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OpenRouter API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages }: { messages: UIMessage[] } = parsed.data as { messages: UIMessage[] };

  // Build portfolio context for the system prompt
  const userId = await getTestUserId();
  const portfolioContext = await buildPortfolioContext(userId);

  const systemPrompt = [
    "You are WealthPath AI, a knowledgeable and friendly personal finance and investment advisor.",
    "You help users understand their portfolio, manage risk, set financial goals, and make informed investment decisions.",
    "Always provide clear, actionable advice. When discussing numbers, be precise.",
    "Tailor your answers to the user's actual portfolio data below.",
    "Avoid generic advice — reference the user's specific holdings, goals, and situation.",
    "Important: You are not a licensed financial advisor. Remind users to consult a professional for major decisions.",
    "",
    portfolioContext,
  ].join("\n");

  const openrouter = createOpenRouter({ apiKey });

  const result = streamText({
    model: openrouter(process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini"),
    system: systemPrompt,
    messages: convertToModelMessages(messages),
  });

  return (
    result as unknown as { toUIMessageStreamResponse: () => Response }
  ).toUIMessageStreamResponse();
}
