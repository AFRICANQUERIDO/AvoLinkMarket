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
  getVisitStats(days?: number): Promise<{
    totalVisits: number;
    totalEnquiries: number;
    dailyVisits: { date: string; count: number }[];
  }>;

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
async trackPageVisit(visit: { path: string; userAgent?: string }) {
  try {
    await pool.query(
      `INSERT INTO page_visits (path, timestamp, user_agent) VALUES ($1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC', $2)`,
      [visit.path, visit.userAgent || null]
    );
  } catch (err) {
    console.error("🚨 DATABASE INSERT FAILED:", err);
  }
}

async getVisitStats(days = 7) {
  // Total visitors should reflect the full tracked count for the dashboard card.
  const visitsQuery = `
    SELECT COUNT(*)::int AS "totalVisits"
    FROM page_visits;
  `;

  const enquiriesQuery = `
    SELECT COUNT(*)::int AS "totalEnquiries"
    FROM enquiries;
  `;

  const dailyVisitsQuery = `
    SELECT TO_CHAR(DATE(timestamp), 'YYYY-MM-DD') AS "date", COUNT(*)::int AS "count"
    FROM page_visits
    WHERE timestamp >= CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day'
    GROUP BY DATE(timestamp)
    ORDER BY DATE(timestamp) ASC;
  `;

  const resultVisits = await pool.query(visitsQuery);
  const resultEnquiries = await pool.query(enquiriesQuery);
  const resultDaily = await pool.query(dailyVisitsQuery, [days]);

  const totalVisits = resultVisits.rows[0].totalVisits || 0;
  const totalEnquiries = resultEnquiries.rows[0].totalEnquiries || 0;

  const visitCountsByDate = Object.fromEntries(
    resultDaily.rows.map((row: { date: string; count: number }) => [row.date, row.count])
  );

  const utcToday = new Date();
  const dailyVisits = Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.UTC(utcToday.getUTCFullYear(), utcToday.getUTCMonth(), utcToday.getUTCDate()));
    date.setUTCDate(date.getUTCDate() - (days - 1 - index));
    const dateKey = date.toISOString().slice(0, 10);
    return {
      date: dateKey,
      count: visitCountsByDate[dateKey] ?? 0,
    };
  });

  console.log(`🔍 Stats fetched: ${totalVisits} visits, ${totalEnquiries} enquiries.`);

  return {
    totalVisits,
    totalEnquiries,
    dailyVisits,
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
  
  // FIX: Changed "desc" to "description" in the SET clause to match your DB schema
  const query = `
    UPDATE products 
    SET 
      slug = COALESCE($1, slug),
      name = COALESCE($2, name),
      price = COALESCE($3, price),
      image = COALESCE($4, image),
      description = COALESCE($5, description),
      specs = COALESCE($6, specs),
      category = COALESCE($7, category)
    WHERE id = $8
    RETURNING id, slug, name, price, description as desc, specs, badge, category, image;
  `;

  const values = [
    data.slug || null,
    data.name || null,
    data.price || null,
    data.image || null,
    data.desc || null, // Matches the incoming property name from your form
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