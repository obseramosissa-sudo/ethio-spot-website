import { pgTable, text, serial, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (maps Firebase Auth UID to relational record)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Commercial Enterprises Registry
export const businesses = pgTable('businesses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameAmharic: text('name_amharic'),
  category: text('category').notNull(),
  categoryLabel: text('category_label'),
  district: text('district').notNull(),
  address: text('address').notNull(),
  licenseNumber: text('license_number').notNull(),
  licenseType: text('license_type').notNull().default('Pending Verification'),
  tinNumber: text('tin_number'),
  rating: text('rating').default('4.5'),
  reviewCount: integer('review_count').default(0),
  phone: text('phone').notNull(),
  hours: text('hours'),
  isOpen: boolean('is_open').default(true),
  priceRange: text('price_range').default('$$'),
  imageUrl: text('image_url').notNull(),
  description: text('description').notNull(),
  coordinatesLat: text('coordinates_lat'),
  coordinatesLng: text('coordinates_lng'),
  paymentMethods: text('payment_methods'), // comma-separated or JSON
  tags: text('tags'), // comma-separated or JSON
  featured: boolean('featured').default(false),
  creatorId: text('creator_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Commercial Ownership & License Claims
export const claims = pgTable('claims', {
  id: text('id').primaryKey(),
  businessName: text('business_name').notNull(),
  licenseNumber: text('license_number').notNull(),
  tinNumber: text('tin_number').notNull(),
  applicantName: text('applicant_name').notNull(),
  role: text('role').notNull(),
  applicantPhone: text('applicant_phone').notNull(),
  status: text('status').notNull().default('Under MoT Verification'),
  submittedAt: text('submitted_at'),
  applicantId: text('applicant_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// B2B Procurement & Concierge Quotes
export const quotes = pgTable('quotes', {
  id: text('id').primaryKey(),
  businessId: text('business_id'),
  businessName: text('business_name').notNull(),
  category: text('category').notNull(),
  contactName: text('contact_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  quantityNotes: text('quantity_notes').notNull(),
  organization: text('organization').notNull(),
  urgency: text('urgency').notNull(),
  status: text('status').default('Under Evaluation'),
  submittedAt: text('submitted_at'),
  senderId: text('sender_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  claims: many(claims),
  quotes: many(quotes),
}));

export const claimsRelations = relations(claims, ({ one }) => ({
  user: one(users, {
    fields: [claims.applicantId],
    references: [users.uid],
  }),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  user: one(users, {
    fields: [quotes.senderId],
    references: [users.uid],
  }),
}));
