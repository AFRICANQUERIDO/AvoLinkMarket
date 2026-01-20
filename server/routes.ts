import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEnquirySchema, insertPageVisitSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Submit enquiry
  app.post("/api/enquiries", async (req, res) => {
    try {
      const data = insertEnquirySchema.parse(req.body);
      const enquiry = await storage.createEnquiry(data);
      
      // Log email notification
      console.log(`\n📧 NEW ${data.type.toUpperCase()} ENQUIRY`);
      console.log('═══════════════════════════════════════');
      console.log(`To: ${process.env.ADMIN_EMAIL}`);
      console.log(`From: ${enquiry.email}`);
      console.log(`Subject: ${data.type === 'buyer' ? 'New Product Enquiry' : 'New Seller/Processor Registration'} - ${enquiry.name}`);
      console.log('───────────────────────────────────────');
      console.log(`Company: ${enquiry.company}`);
      console.log(`Contact: ${enquiry.name}`);
      console.log(`Email: ${enquiry.email}`);
      if (data.type === 'buyer') {
        console.log(`Product: ${enquiry.product}`);
        console.log(`Quantity: ${enquiry.quantity}`);
      }
      console.log(`Message/Details: ${enquiry.message || 'N/A'}`);
      console.log('═══════════════════════════════════════\n');
      
      res.json({ success: true, enquiry });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error creating enquiry:', error);
      res.status(500).json({ error: 'Failed to submit enquiry' });
    }
  });

  // Get recent enquiries (for admin dashboard)
  app.get("/api/enquiries", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const enquiries = await storage.getEnquiries(limit);
      res.json({ enquiries });
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      res.status(500).json({ error: 'Failed to fetch enquiries' });
    }
  });

  // Track page visit
  app.post("/api/track-visit", async (req, res) => {
    try {
      const data = insertPageVisitSchema.parse(req.body);
      await storage.trackPageVisit(data);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Error tracking visit:', error);
      res.status(500).json({ error: 'Failed to track visit' });
    }
  });

  // Get analytics stats
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const stats = await storage.getVisitStats(days);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  return httpServer;
}
