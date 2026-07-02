import { pool } from "./db";
import { type Product, type InsertProduct, type Enquiry } from "@shared/schema";

// --- 1. Storage Interface Definition ---
export interface IStorage {
  // Enquiries (Leads)
  createEnquiry(enquiry: any): Promise<Enquiry>; 
  getEnquiries(limit?: number): Promise<Enquiry[]>;
  updateEnquiryStatus(id: number, status: string): Promise<any>;
  deleteEnquiry(id: number): Promise<void>;

  // Analytics
  trackPageVisit(visit: { path: string }): Promise<void>;
  getVisitStats(days?: number): Promise<{ totalVisits: number; totalEnquiries: number }>;

  // Product Catalogue
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
}

// --- 2. Postgres Implementation ---
export class DatabaseStoragePostgres implements IStorage {

  async createEnquiry(enquiry: any): Promise<Enquiry> {
    try {
      const query = `
        INSERT INTO enquiries (name, email, message, company, type, product, quantity, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', NOW())
        RETURNING id, name, email, message, company, type, product, quantity, status, created_at as "createdAt";
      `;
      
      const values = [
        enquiry.name,
        enquiry.email,
        enquiry.message || "",
        enquiry.company,
        enquiry.type,
        enquiry.product || null,
        enquiry.quantity || null
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error("Database Insert Error:", err);
      throw err;
    }
  }

  async getEnquiries(limit = 50): Promise<Enquiry[]> {
    const query = `
      SELECT 
        id, name, email, message, company, type, product, 
        quantity, status, created_at as "createdAt"
      FROM enquiries 
      ORDER BY created_at DESC
      LIMIT $1;
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  async updateEnquiryStatus(id: number, status: string): Promise<any> {
    const query = `
      UPDATE enquiries 
      SET status = $1 
      WHERE id = $2
      RETURNING id, status;
    `;
    const result = await pool.query(query, [status, id]);
    
    if (result.rows.length === 0) throw new Error("Enquiry not found");
    return result.rows[0];
  }

  async deleteEnquiry(id: number): Promise<void> {
    await pool.query(`DELETE FROM enquiries WHERE id = $1`, [id]);
  }

  // --- Analytics Methods ---
  async trackPageVisit(visit: { path: string }) {
    await pool.query(
      `INSERT INTO page_visits (path, timestamp) VALUES ($1, NOW())`,
      [visit.path]
    );
  }

  async getVisitStats(days = 7) {
    const visitsQuery = `
      SELECT COUNT(*) AS "totalVisits" 
      FROM page_visits 
      WHERE timestamp >= NOW() - ($1 * INTERVAL '1 day');
    `;
    const enquiriesQuery = `
      SELECT COUNT(*) AS "totalEnquiries" 
      FROM enquiries 
      WHERE created_at >= NOW() - ($1 * INTERVAL '1 day');
    `;

    const resultVisits = await pool.query(visitsQuery, [days]);
    const resultEnquiries = await pool.query(enquiriesQuery, [days]);

    return {
      totalVisits: parseInt(resultVisits.rows[0].totalVisits) || 0,
      totalEnquiries: parseInt(resultEnquiries.rows[0].totalEnquiries) || 0,
    };
  }

  // --- Product Catalogue Methods ---
  async getProducts(): Promise<Product[]> {
    const query = `
      SELECT 
        id, slug, name, price, description as desc, 
        specs, badge, category, image
      FROM products;
    `;
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      ...row,
      specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs
    }));
  }

  async createProduct(p: InsertProduct): Promise<Product> {
    const query = `
      INSERT INTO products (slug, name, price, description, specs, badge, category, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, slug, name, price, description as desc, specs, badge, category, image;
    `;

    const values = [
      p.slug,
      p.name,
      p.price,
      p.desc,
      JSON.stringify(p.specs),
      p.badge || null,
      p.category,
      p.image
    ];

    const result = await pool.query(query, values);
    const newProduct = result.rows[0];
    
    return {
      ...newProduct,
      specs: typeof newProduct.specs === 'string' ? JSON.parse(newProduct.specs) : newProduct.specs,
    };
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product> {
    const specsJson = data.specs ? JSON.stringify(data.specs) : null;
    
    const query = `
      UPDATE products 
      SET 
        name = COALESCE($1, name),
        price = COALESCE($2, price),
        image = COALESCE($3, image),
        description = COALESCE($4, description),
        specs = COALESCE($5, specs),
        category = COALESCE($6, category)
      WHERE id = $7
      RETURNING id, slug, name, price, description as desc, specs, badge, category, image;
    `;

    const values = [
      data.name || null,
      data.price || null,
      data.image || null,
      data.desc || null,
      specsJson,
      data.category || null,
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) throw new Error("Product not found");
    
    const p = result.rows[0];
    return { 
      ...p, 
      specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs 
    };
  }

  async deleteProduct(id: number): Promise<void> {
    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
  }
}

export const storage = new DatabaseStoragePostgres();