import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { portfolios, holdings, transactions } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

const addTransactionSchema = z.object({
  holdingId: z.string().uuid(),
  type: z.enum(["buy", "sell", "dividend", "split"]),
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

  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.portfolioId, id))
    .orderBy(desc(transactions.date));

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
  const parsed = addTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { holdingId, type, quantity, price, fees, date, notes } = parsed.data;

  const [holding] = await db
    .select()
    .from(holdings)
    .where(and(eq(holdings.id, holdingId), eq(holdings.portfolioId, portfolioId)));

  if (!holding) {
    return NextResponse.json({ error: "Holding not found" }, { status: 404 });
  }

  if (type === "buy") {
    const existingQty = parseFloat(holding.quantity);
    const existingCost = parseFloat(holding.avgCostBasis);
    const newQty = existingQty + quantity;
    const newAvgCost = (existingQty * existingCost + quantity * price) / newQty;
    await db
      .update(holdings)
      .set({ quantity: String(newQty), avgCostBasis: String(newAvgCost) })
      .where(eq(holdings.id, holdingId));
  } else if (type === "sell") {
    const newQty = Math.max(0, parseFloat(holding.quantity) - quantity);
    await db.update(holdings).set({ quantity: String(newQty) }).where(eq(holdings.id, holdingId));
  }

  const [tx] = await db
    .insert(transactions)
    .values({
      holdingId,
      portfolioId,
      type,
      ticker: holding.ticker,
      quantity: String(quantity),
      price: String(price),
      fees: String(fees),
      date: date ? new Date(date) : new Date(),
      notes: notes ?? null,
    })
    .returning();

  return NextResponse.json(tx, { status: 201 });
}
