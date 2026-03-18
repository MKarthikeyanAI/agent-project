import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { portfolios, holdings, transactions } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

const updatePortfolioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["long_term", "short_term", "intraday", "mixed"]).optional(),
  description: z.string().max(500).optional(),
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

  const portfolioHoldings = await db
    .select()
    .from(holdings)
    .where(eq(holdings.portfolioId, id));

  return NextResponse.json({ ...portfolio, holdings: portfolioHoldings });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getTestUserId();
  const { id } = await params;

  const body = await req.json();
  const parsed = updatePortfolioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(portfolios)
    .set(parsed.data)
    .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getTestUserId();
  const { id } = await params;

  await db.delete(transactions).where(eq(transactions.portfolioId, id));

  const [deleted] = await db
    .delete(portfolios)
    .where(and(eq(portfolios.id, id), eq(portfolios.userId, userId)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
