import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { goals } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

const createGoalSchema = z.object({
  type: z.enum(["retirement", "emergency_fund", "home_purchase", "education", "travel", "custom"]),
  name: z.string().min(1).max(100),
  targetAmount: z.number().positive(),
  targetDate: z.string().datetime().optional(),
  monthlySIP: z.number().positive().optional(),
  expectedReturn: z.number().min(0).max(100).default(7),
  currency: z.string().length(3).default("USD"),
});

export async function GET() {
  const userId = await getTestUserId();

  const rows = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(goals.createdAt);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const userId = await getTestUserId();

  const body = await req.json();
  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { targetDate, monthlySIP, expectedReturn, targetAmount, ...rest } = parsed.data;

  const [goal] = await db
    .insert(goals)
    .values({
      ...rest,
      userId,
      targetAmount: String(targetAmount),
      targetDate: targetDate ? new Date(targetDate) : null,
      monthlySIP: monthlySIP ? String(monthlySIP) : null,
      expectedReturn: String(expectedReturn),
    })
    .returning();

  return NextResponse.json(goal, { status: 201 });
}
