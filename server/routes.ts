import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertEnquirySchema, insertProductSchema } from "@shared/schema";
import { sendLeadNotification } from "./mailer";
import { Resend } from 'resend';
import { Request, Response, NextFunction } from "express";

// 💡 Tell TypeScript exactly what properties are allowed inside the session
declare module "express-session" {
  interface SessionData {
    adminId: number;
    username: string;
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function registerRoutes(httpServer: Server, app: Express) {
  
  // 🛡️ Gatekeeper Middleware: Protects sensitive backend endpoints from unauthenticated visitors
  function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.session || !req.session.adminId) {
      return res.status(403).json({ error: "Access Denied. Admin authentication required." });
    }
    next();
  }

  // --- ENQUIRIES (LEADS) ---
  // 🔒 Added requireAdmin guard to secure client lead info
  app.get("/api/enquiries", requireAdmin, async (_req, res) => {
    const enquiries = await storage.getEnquiries();
    res.json(enquiries);
  });

  // 🌐 Publicly accessible so potential customers can submit form data
  app.post("/api/enquiries", async (req, res) => {
    try {
      const data = insertEnquirySchema.parse(req.body);
      const newEnquiry = await storage.createEnquiry(data);

      try {
        await sendLeadNotification({
          ...newEnquiry,
          product: req.body.product,
          quantity: req.body.quantity
        });
      } catch (mailError) {
        console.error("Email notification failed:", mailError);
      }

      res.status(201).json({ message: "Enquiry submitted", id: newEnquiry.id });
    } catch (e) {
      res.status(400).json({ error: "Invalid enquiry data" });
    }
  });

  // 🔒 Added requireAdmin guard to prevent malicious status modifications
  app.patch("/api/enquiries/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    try {
      const updated = await storage.updateEnquiryStatus(id, status);
      res.json(updated);
    } catch (e) {
      res.status(404).json({ error: "Enquiry not found" });
    }
  });

  // 🔒 Added requireAdmin guard to stop unauthenticated row deletions
  app.delete("/api/enquiries/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteEnquiry(id);
    res.sendStatus(204);
  });

  // --- PRODUCTS (CATALOGUE) ---
  // 🌐 Publicly accessible so visitors can view your product cards
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // 🔒 Added requireAdmin guard to stop catalog tampering
  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (e) {
      console.error("Product Creation Error:", e);
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  // 🔒 Added requireAdmin guard
  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).send("Invalid ID");
      const validatedData = insertProductSchema.partial().parse(req.body);
      const updated = await storage.updateProduct(id, validatedData);
      res.json(updated);
    } catch (e) {
      console.error("PATCH Route Error:", e);
      res.status(400).json({ error: "Validation or Database error" });
    }
  });

  // 🔒 Added requireAdmin guard
  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.sendStatus(204);
    } catch (e) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // --- ANALYTICS ---
  // 🌐 Public: Tracks standard metrics when users land on components
  app.post("/api/analytics/visit", async (req, res) => {
    const { path } = req.body;
    if (path) {
      await storage.trackPageVisit({ path });
    }
    res.sendStatus(204);
  });

  // 🔒 Added requireAdmin guard so only you can inspect metrics
  app.get("/api/analytics/stats", requireAdmin, async (req, res) => {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await storage.getVisitStats(days);
    res.json(stats);
  });

  // --- ADMINISTRATIVE AUTHENTICATION CONTROL ---
  
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const { password } = req.body;
    const masterPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (password === masterPassword) {
      // Clean, compiled types implemented directly without messy "as any" assertions
      req.session.adminId = 1;
      req.session.username = "admin";

      return req.session.save((err) => {
        if (err) {
          return res.status(500).json({ error: "Session storage failure" });
        }
        return res.status(200).json({ authenticated: true });
      });
    }

    res.status(401).json({ error: "Invalid password" });
  });

  app.get("/api/admin/me", (req: Request, res: Response) => {
    if (!req.session || !req.session.adminId) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, username: req.session.username });
  });

  // 🚪 Added Clean Logout Route to wipe cookie values securely
  app.post("/api/admin/logout", (req: Request, res: Response) => {
    if (!req.session) return res.sendStatus(200);
    
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Logout execution error" });
      res.clearCookie("connect.sid"); // Matches default cookie label layout
      res.json({ message: "Logged out completely" });
    });
  });

  app.post("/api/admin/forgot-password", async (req: Request, res: Response) => {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "your-personal-email@gmail.com";
      
      await resend.emails.send({
        from: 'Avolink Security <onboarding@resend.dev>',
        to: [adminEmail],
        subject: '⚠️ Admin Portal Password Reset Request',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
            <h3 style="color: #dc2626; margin-top: 0;">Password Reset Security Alert</h3>
            <p>A user requested a password reset configuration for the Avolink International CRM Dashboard.</p>
            <p>If you made this request, check your application server config environment profiles to update your <strong>ADMIN_PASSWORD</strong> token string variable securely.</p>
            <hr style="border:none; border-top:1px solid #e2e8f0; margin: 16px 0;" />
            <small style="color:#64748b;">Timestamp: ${new Date().toUTCString()}</small>
          </div>
        `
      });

      res.status(200).json({ status: "Recovery message dispatched" });
    } catch (err) {
      console.error("Recovery dispatch failure:", err);
      res.status(500).json({ error: "Failed to handle action" });
    }
  });
}