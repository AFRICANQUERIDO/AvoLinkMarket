import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  product: text("product").notNull(),
  quantity: text("quantity").notNull(),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pageVisits = pgTable("page_visits", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userAgent: text("user_agent"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEnquirySchema = createInsertSchema(enquiries).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertPageVisitSchema = createInsertSchema(pageVisits).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type PageVisit = typeof pageVisits.$inferSelect;
export type InsertPageVisit = z.infer<typeof insertPageVisitSchema>;
