import { db } from "../drizzle/db";
import { users, enquiries, pageVisits } from "@shared/schema";
import type { User, InsertUser, Enquiry, InsertEnquiry, PageVisit, InsertPageVisit } from "@shared/schema";
import { eq, desc, gte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
  getEnquiries(limit?: number): Promise<Enquiry[]>;
  getEnquiryById(id: number): Promise<Enquiry | undefined>;
  updateEnquiryStatus(id: number, status: string): Promise<void>;
  
  trackPageVisit(visit: InsertPageVisit): Promise<void>;
  getPageVisits(days?: number): Promise<PageVisit[]>;
  getVisitStats(days?: number): Promise<{
    totalVisits: number;
    totalEnquiries: number;
    visitsByDay: { date: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry> {
    const result = await db.insert(enquiries).values(enquiry).returning();
    return result[0];
  }

  async getEnquiries(limit: number = 50): Promise<Enquiry[]> {
    return await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(limit);
  }

  async getEnquiryById(id: number): Promise<Enquiry | undefined> {
    const result = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
    return result[0];
  }

  async updateEnquiryStatus(id: number, status: string): Promise<void> {
    await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));
  }

  async trackPageVisit(visit: InsertPageVisit): Promise<void> {
    await db.insert(pageVisits).values(visit);
  }

  async getPageVisits(days: number = 7): Promise<PageVisit[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await db.select()
      .from(pageVisits)
      .where(gte(pageVisits.timestamp, cutoffDate))
      .orderBy(desc(pageVisits.timestamp));
  }

  async getVisitStats(days: number = 7): Promise<{
    totalVisits: number;
    totalEnquiries: number;
    visitsByDay: { date: string; count: number }[];
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const [visitsResult, enquiriesResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(pageVisits)
        .where(gte(pageVisits.timestamp, cutoffDate)),
      db.select({ count: sql<number>`count(*)` })
        .from(enquiries)
        .where(gte(enquiries.createdAt, cutoffDate)),
    ]);

    const visitsByDay = await db
      .select({
        date: sql<string>`DATE(${pageVisits.timestamp})`,
        count: sql<number>`count(*)`,
      })
      .from(pageVisits)
      .where(gte(pageVisits.timestamp, cutoffDate))
      .groupBy(sql`DATE(${pageVisits.timestamp})`)
      .orderBy(sql`DATE(${pageVisits.timestamp})`);

    return {
      totalVisits: Number(visitsResult[0]?.count || 0),
      totalEnquiries: Number(enquiriesResult[0]?.count || 0),
      visitsByDay: visitsByDay.map(v => ({ date: v.date, count: Number(v.count) })),
    };
  }
}

export const storage = new DatabaseStorage();
