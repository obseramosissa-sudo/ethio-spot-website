import { db } from './index.ts';
import { businesses } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getBusinesses() {
  try {
    return await db.select().from(businesses);
  } catch (error) {
    console.error("Database query failed on getBusinesses:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function getBusinessById(id: string) {
  try {
    const results = await db.select().from(businesses).where(eq(businesses.id, id));
    return results[0] || null;
  } catch (error) {
    console.error("Database query failed on getBusinessById:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function insertBusiness(data: typeof businesses.$inferInsert) {
  try {
    const results = await db.insert(businesses).values(data).returning();
    return results[0];
  } catch (error) {
    console.error("Database insert failed on insertBusiness:", error);
    throw new Error("Database insert failed. Please try again later.", { cause: error });
  }
}

export async function updateBusiness(id: string, data: Partial<typeof businesses.$inferInsert>) {
  try {
    const results = await db.update(businesses).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(businesses.id, id)).returning();
    return results[0];
  } catch (error) {
    console.error("Database update failed on updateBusiness:", error);
    throw new Error("Database update failed. Please try again later.", { cause: error });
  }
}

export async function deleteBusiness(id: string) {
  try {
    const results = await db.delete(businesses).where(eq(businesses.id, id)).returning();
    return results[0];
  } catch (error) {
    console.error("Database delete failed on deleteBusiness:", error);
    throw new Error("Database delete failed. Please try again later.", { cause: error });
  }
}
