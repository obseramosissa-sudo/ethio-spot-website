import { db } from './index.ts';
import { quotes } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getQuotes() {
  try {
    return await db.select().from(quotes);
  } catch (error) {
    console.error("Database query failed on getQuotes:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function insertQuote(data: typeof quotes.$inferInsert) {
  try {
    const results = await db.insert(quotes).values(data).returning();
    return results[0];
  } catch (error) {
    console.error("Database insert failed on insertQuote:", error);
    throw new Error("Database insert failed. Please try again later.", { cause: error });
  }
}

export async function updateQuoteStatus(id: string, status: string) {
  try {
    const results = await db.update(quotes).set({ status }).where(eq(quotes.id, id)).returning();
    return results[0];
  } catch (error) {
    console.error("Database update failed on updateQuoteStatus:", error);
    throw new Error("Database update failed. Please try again later.", { cause: error });
  }
}
