import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { goals, goalContributions } from "@/lib/schema";
import { getTestUserId } from "@/lib/test-auth";

const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.string().datetime().nullable().optional(),
  monthlySIP: z.number().positive().nullable().optional(),
  expectedReturn: z.number().min(0).max(100).optional(),
  isCompleted: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getTestUserId();
  const { id } = await params;

  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)));

  if (!goal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contributions = await db
    .select()
    .from(goalContributions)
    .where(eq(goalContributions.goalId, id))
    .orderBy(goalContributions.date);

  return NextResponse.json({ ...goal, contributions });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getTestUserId();
  const { id } = await params;

  const body = await req.json();
  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.targetAmount !== undefined)
    updates.targetAmount = String(parsed.data.targetAmount);
  if (parsed.data.targetDate !== undefined)
    updates.targetDate = parsed.data.targetDate ? new Date(parsed.data.targetDate) : null;
  if (parsed.data.monthlySIP !== undefined)
    updates.monthlySIP = parsed.data.monthlySIP ? String(parsed.data.monthlySIP) : null;
  if (parsed.data.expectedReturn !== undefined)
    updates.expectedReturn = String(parsed.data.expectedReturn);
  if (parsed.data.isCompleted !== undefined) updates.isCompleted = parsed.data.isCompleted;

  const [updated] = await db
    .update(goals)
    .set(updates)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
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

  const [deleted] = await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
