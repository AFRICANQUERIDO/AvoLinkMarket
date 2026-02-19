import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Users & Analytics ---
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const pageVisits = pgTable("page_visits", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userAgent: text("user_agent"),
});

// --- Enquiries (Leads) ---
export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  type: text("type").notNull().default("buyer"), 
  product: text("product"),
  quantity: text("quantity"),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Product Catalogue ---
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(), 
  name: text("name").notNull(),
  image: text("image").notNull(), // <--- ADD THIS LINE
  price: text("price").notNull(),
  desc: text("desc").notNull(),
  specs: jsonb("specs").$type<string[]>().notNull(),
  badge: text("badge"),
  category: text("category").notNull(),
});

// --- Schemas for Validation ---
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEnquirySchema = createInsertSchema(enquiries).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true 
});

// --- Types ---
export type User = typeof users.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type Product = typeof products.$inferSelect;
export type PageVisit = typeof pageVisits.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;