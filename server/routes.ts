import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertEnquirySchema, insertPageVisitSchema } from "@shared/schema";
import { z } from "zod";
import sgMail from "@sendgrid/mail";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Submit enquiry
  app.post("/api/enquiries", async (req, res) => {
    try {
      const data = insertEnquirySchema.parse(req.body);
      if (!data.type) {
        throw new Error("Enquiry type is required");
      }
      const enquiry = await storage.createEnquiry(data);
      
      const adminEmail = process.env.ADMIN_EMAIL || 'janengene12@gmail.com';
      const subjectPrefix = data.type === 'buyer' ? 'BUYER ENQUIRY' : 'SELLER ENQUIRY';
      const subject = `[${subjectPrefix}] ${data.type === 'buyer' ? 'New Product Enquiry' : 'New Seller/Processor Registration'} - ${data.name}`;
      
      const emailHtml = `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #166534; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">New ${data.type.toUpperCase()} Enquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Company:</td>
              <td style="padding: 8px;">${data.company}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px;">${data.email}</td>
            </tr>
            ${data.type === 'buyer' ? `
            <tr>
              <td style="padding: 8px; font-weight: bold;">Product:</td>
              <td style="padding: 8px;">${data.product || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Quantity:</td>
              <td style="padding: 8px;">${data.quantity || 'N/A'}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px; font-weight: bold;">Details:</td>
              <td style="padding: 8px;">${data.message || 'N/A'}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">This enquiry was submitted via the AvoLink Global Marketplace platform.</p>
        </div>
      `;

      // Log email notification
      console.log(`\n📧 SENDING ${data.type.toUpperCase()} ENQUIRY EMAIL TO ${adminEmail}`);
      
      if (process.env.SENDGRID_API_KEY) {
        try {
          await sgMail.send({
            to: adminEmail,
            from: 'noreply@avolink.global', // This should be a verified sender in SendGrid
            subject: subject,
            html: emailHtml,
          });
          console.log('✅ Email sent successfully via SendGrid');
        } catch (error) {
          console.error('❌ SendGrid Error:', error);
        }
      } else {
        console.log('⚠️ SENDGRID_API_KEY not found. Email logged to console only.');
        console.log('═══════════════════════════════════════');
        console.log(`Subject: ${subject}`);
        console.log('───────────────────────────────────────');
        console.log(emailHtml.replace(/<[^>]*>/g, ''));
        console.log('═══════════════════════════════════════\n');
      }
      
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
