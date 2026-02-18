import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { sendEmail } from "./mailer";

export async function registerRoutes(_server: any, app: Express) {
  
  // 1. CREATE Enquiry
  app.post("/api/enquiries", async (req: Request, res: Response) => {
    try {
      const result = await storage.createEnquiry(req.body);
      
      if (req.body.name && req.body.email) {
        await sendEmail(req.body.name, req.body.email, req.body.message || "New Enquiry");
      }
      
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("POST Error:", err);
      res.status(500).json({ error: "Failed to save enquiry" });
    }
  });

  // 2. READ All Enquiries
  app.get("/api/enquiries", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const enquiries = await storage.getEnquiries(limit);
      res.json(enquiries); 
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });

  // 3. UPDATE Enquiry Status
  app.patch("/api/enquiries/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ['new', 'pending', 'completed', 'archived'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).send("Invalid status");
    }

    try {
      const updated = await storage.updateEnquiryStatus(id, status);
      res.json(updated);
    } catch (error) {
      res.status(404).send("Enquiry not found");
    }
  });

  // 4. DELETE Enquiry
  app.delete("/api/enquiries/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.deleteEnquiry(id);
      res.status(204).send(); 
    } catch (error) {
      res.status(404).send("Enquiry not found");
    }
  });

  // --- Analytics Routes ---
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const stats = await storage.getVisitStats(days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/analytics/visit", async (req, res) => {
    try {
      await storage.trackPageVisit({ path: req.body.path });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to track visit" });
    }
  });
}