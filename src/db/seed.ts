import { db } from './index.ts';
import { businesses } from './schema.ts';
import { INITIAL_BUSINESSES } from '../data/businesses.ts';

export async function seedInitialBusinesses() {
  try {
    const existing = await db.select({ id: businesses.id }).from(businesses).limit(1);
    if (existing.length > 0) {
      return;
    }

    console.log('Seeding initial businesses into Cloud SQL...');
    for (const b of INITIAL_BUSINESSES) {
      await db.insert(businesses).values({
        id: b.id,
        name: b.name,
        nameAmharic: b.nameAmharic || null,
        category: b.category,
        categoryLabel: b.categoryLabel || null,
        district: b.district,
        address: b.address,
        licenseNumber: b.licenseNumber,
        licenseType: b.licenseType,
        tinNumber: 'TIN-00' + Math.floor(10000000 + Math.random() * 90000000),
        rating: b.rating ? b.rating.toString() : '4.5',
        reviewCount: b.reviewCount || 0,
        phone: b.phone,
        hours: b.hours || null,
        isOpen: b.isOpen,
        priceRange: b.priceRange || '$$',
        imageUrl: b.imageUrl,
        description: b.description,
        coordinatesLat: b.lat ? b.lat.toString() : null,
        coordinatesLng: b.lng ? b.lng.toString() : null,
        paymentMethods: JSON.stringify(b.paymentMethods || []),
        tags: JSON.stringify(b.tags || []),
        featured: b.featured || false,
      }).onConflictDoNothing();
    }
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during initial business seeding:', error);
  }
}
