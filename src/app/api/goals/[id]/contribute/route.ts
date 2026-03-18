import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { goals, goalContributions } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

const contributeSchema = z.object({
  amount: z.number().positive(),
  date: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getTestUserId();
  const { id: goalId } = await params;

  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  if (!goal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = contributeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { amount, date, notes } = parsed.data;

  const [contribution] = await db
    .insert(goalContributions)
    .values({
      goalId,
      amount: String(amount),
      date: date ? new Date(date) : new Date(),
      notes: notes ?? null,
    })
    .returning();

  const newAmount = parseFloat(goal.currentAmount) + amount;
  const isCompleted = newAmount >= parseFloat(goal.targetAmount);

  await db
    .update(goals)
    .set({ currentAmount: String(newAmount), isCompleted })
    .where(eq(goals.id, goalId));

  return NextResponse.json(contribution, { status: 201 });
}
