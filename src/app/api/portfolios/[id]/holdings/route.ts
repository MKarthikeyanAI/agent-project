import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { portfolios, holdings, transactions } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

const addHoldingSchema = z.object({
  ticker: z.string().min(1).max(20).transform((s) => s.toUpperCase()),
  name: z.string().min(1).max(200),
  assetType: z
    .enum(["stock", "etf", "mutual_fund", "crypto", "bond", "reit", "cash", "other"])
    .default("stock"),
  quantity: z.number().positive(),
  price: z.number().positive(),
  fees: z.number().min(0).default(0),
  date: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getTestUserId();
  const { id } = await params;

  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)));

  if (!portfolio) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await db.select().from(holdings).where(eq(holdings.portfolioId, id));
  return NextResponse.json(rows);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getTestUserId();
  const { id: portfolioId } = await params;

  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(and(eq(portfolios.id, portfolioId), eq(portfolios.userId, userId)));

  if (!portfolio) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = addHoldingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ticker, name, assetType, quantity, price, fees, date, notes } = parsed.data;

  const [existing] = await db
    .select()
    .from(holdings)
    .where(and(eq(holdings.portfolioId, portfolioId), eq(holdings.ticker, ticker)));

  let holding;

  if (existing) {
    const existingQty = parseFloat(existing.quantity);
    const existingCost = parseFloat(existing.avgCostBasis);
    const newQty = existingQty + quantity;
    const newAvgCost = (existingQty * existingCost + quantity * price) / newQty;

    const [updated] = await db
      .update(holdings)
      .set({ quantity: String(newQty), avgCostBasis: String(newAvgCost) })
      .where(eq(holdings.id, existing.id))
      .returning();

    holding = updated;
  } else {
    const [created] = await db
      .insert(holdings)
      .values({ portfolioId, ticker, name, assetType, quantity: String(quantity), avgCostBasis: String(price) })
      .returning();

    holding = created;
  }

  if (!holding) {
    return NextResponse.json({ error: "Failed to create holding" }, { status: 500 });
  }

  await db.insert(transactions).values({
    holdingId: holding.id,
    portfolioId,
    type: "buy",
    ticker,
    quantity: String(quantity),
    price: String(price),
    fees: String(fees),
    date: date ? new Date(date) : new Date(),
    notes: notes ?? null,
  });

  return NextResponse.json(holding, { status: 201 });
}
