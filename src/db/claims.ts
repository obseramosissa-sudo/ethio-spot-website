import { db } from './index.ts';
import { claims } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getClaims() {
  try {
    return await db.select().from(claims);
  } catch (error) {
    console.error("Database query failed on getClaims:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function insertClaim(data: typeof claims.$inferInsert) {
  try {
    const results = await db.insert(claims).values(data).returning();
    return results[0];
  } catch (error) {
    console.error("Database insert failed on insertClaim:", error);
    throw new Error("Database insert failed. Please try again later.", { cause: error });
  }
}

export async function updateClaimStatus(id: string, status: string) {
  try {
    const results = await db.update(claims).set({ status }).where(eq(claims.id, id)).returning();
    return results[0];
  } catch (error) {
    console.error("Database update failed on updateClaimStatus:", error);
    throw new Error("Database update failed. Please try again later.", { cause: error });
  }
}
