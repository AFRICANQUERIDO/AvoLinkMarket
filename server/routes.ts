import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertEnquirySchema, insertProductSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express) {

  // --- ENQUIRIES (LEADS) ---
app.get("/api/enquiries", async (_req, res) => {
    const enquiries = await storage.getEnquiries();
    res.json(enquiries);
  });

  app.post("/api/enquiries", async (req, res) => {
    try {
      const data = insertEnquirySchema.parse(req.body);
      await storage.createEnquiry(data);
      res.status(201).json({ message: "Enquiry submitted" });
    } catch (e) {
      res.status(400).json({ error: "Invalid enquiry data" });
    }
  });

  app.patch("/api/enquiries/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    try {
      const updated = await storage.updateEnquiryStatus(id, status);
      res.json(updated);
    } catch (e) {
      res.status(404).json({ error: "Enquiry not found" });
    }
  });

  app.delete("/api/enquiries/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteEnquiry(id);
    res.sendStatus(204);
  });

  // --- PRODUCTS (CATALOGUE) ---
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      // Validate the incoming data against our Zod schema
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (e) {
      console.error("Product Creation Error:", e);
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.sendStatus(204);
    } catch (e) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // --- ANALYTICS ---
  app.post("/api/analytics/visit", async (req, res) => {
    const { path } = req.body;
    if (path) {
      await storage.trackPageVisit({ path });
    }
    res.sendStatus(204);
  });

  app.get("/api/analytics/stats", async (req, res) => {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await storage.getVisitStats(days);
    res.json(stats);
  });
}