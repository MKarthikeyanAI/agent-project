/**
 * TEST-ONLY: Bypasses authentication for local development testing.
 * Remove this file and revert API routes before going to production.
 */
import { db } from "./db";
import { user } from "./schema";

export const TEST_USER_ID = "test-user-bypass";

/** Upserts the test user row so FK constraints are satisfied. */
export async function getTestUserId(): Promise<string> {
  await db
    .insert(user)
    .values({
      id: TEST_USER_ID,
      name: "Test User",
      email: "test@wealthpath.dev",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing();
  return TEST_USER_ID;
}
