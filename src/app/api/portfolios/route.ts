import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { portfolios } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

const createPortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["long_term", "short_term", "intraday", "mixed"]).default("long_term"),
  currency: z.string().length(3).default("USD"),
  description: z.string().max(500).optional(),
});

export async function GET() {
  const userId = await getTestUserId();

  const rows = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.userId, userId))
    .orderBy(portfolios.createdAt);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const userId = await getTestUserId();

  const body = await req.json();
  const parsed = createPortfolioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [portfolio] = await db
    .insert(portfolios)
    .values({ ...parsed.data, userId })
    .returning();

  return NextResponse.json(portfolio, { status: 201 });
}
