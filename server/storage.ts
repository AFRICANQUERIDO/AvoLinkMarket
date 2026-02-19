import { poolPromise } from "./db";
import { products, type Product, type InsertProduct, type Enquiry } from "@shared/schema";

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
  deleteProduct(id: number): Promise<void>;
}

// --- 2. MSSQL Implementation ---
export class DatabaseStorageMSSQL implements IStorage {

  async createEnquiry(enquiry: any): Promise<Enquiry> {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("name", enquiry.name)
      .input("email", enquiry.email)
      .input("message", enquiry.message || "")
      .input("company", enquiry.company)
      .input("type", enquiry.type)
      .input("product", enquiry.product || null)
      .input("quantity", enquiry.quantity || null)
      .query(`
        INSERT INTO Enquiries (Name, Email, Message, Company, Type, Product, Quantity, Status, CreatedAt)
        OUTPUT 
          INSERTED.Id as id, INSERTED.Name as name, INSERTED.Email as email, 
          INSERTED.Message as message, INSERTED.Company as company, 
          INSERTED.Type as type, INSERTED.Product as product, 
          INSERTED.Quantity as quantity, INSERTED.Status as status, 
          INSERTED.CreatedAt as createdAt
        VALUES (@name, @email, @message, @company, @type, @product, @quantity, 'new', GETDATE())
      `);

    return result.recordset[0]; // Now it returns the actual object!
  } catch (err) {
    console.error("Database Insert Error:", err);
    throw err;
  }
}

  async getEnquiries(limit = 50): Promise<Enquiry[]> {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("limit", limit)
      .query(`
        SELECT TOP (@limit) 
          Id as id, Name as name, Email as email, Message as message, 
          Company as company, Type as type, Product as product, 
          Quantity as quantity, Status as status, CreatedAt as createdAt
        FROM Enquiries 
        ORDER BY CreatedAt DESC
      `);
    return result.recordset;
  }

  async updateEnquiryStatus(id: number, status: string): Promise<any> {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", id)
      .input("status", status)
      .query(`
        UPDATE Enquiries 
        SET Status = @status 
        WHERE Id = @id;
        
        SELECT Id as id, Status as status FROM Enquiries WHERE Id = @id;
      `);
      
    if (result.recordset.length === 0) throw new Error("Enquiry not found");
    return result.recordset[0];
  }

  async deleteEnquiry(id: number): Promise<void> {
    const pool = await poolPromise;
    await pool.request()
      .input("id", id)
      .query(`DELETE FROM Enquiries WHERE Id = @id`);
  }

  // --- Analytics Methods ---
  async trackPageVisit(visit: { path: string }) {
    const pool = await poolPromise;
    await pool.request()
      .input("path", visit.path)
      .query(`INSERT INTO PageVisits (Path, Timestamp) VALUES (@path, GETDATE())`);
  }

  async getVisitStats(days = 7) {
    const pool = await poolPromise;
    
    const resultVisits = await pool.request()
      .input("days", days)
      .query(`
        SELECT COUNT(*) AS totalVisits 
        FROM PageVisits 
        WHERE Timestamp >= DATEADD(DAY, -@days, GETDATE())
      `);

    const resultEnquiries = await pool.request()
      .input("days", days)
      .query(`
        SELECT COUNT(*) AS totalEnquiries 
        FROM Enquiries 
        WHERE CreatedAt >= DATEADD(DAY, -@days, GETDATE())
      `);

    return {
      totalVisits: resultVisits.recordset[0].totalVisits || 0,
      totalEnquiries: resultEnquiries.recordset[0].totalEnquiries || 0,
    };
  }

  // --- Product Catalogue Methods ---
  async getProducts(): Promise<Product[]> {
    const pool = await poolPromise;
    const result = await pool.request().query(`
  SELECT 
    Id as id, Slug as slug, Name as name, Price as price, 
    [Desc] as [desc], Specs as specs, Badge as badge, 
    Category as category, Image as image
  FROM Products
`);
    
    // Parse the specs JSON string back into a JS array for the frontend
    return result.recordset.map(row => ({
      ...row,
      specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs
    }));
  }

  async createProduct(p: InsertProduct): Promise<Product> {
  const pool = await poolPromise;
  const result = await pool.request()
    .input("slug", p.slug)
    .input("name", p.name)
    .input("price", p.price)
    .input("desc", p.desc)
    .input("specs", JSON.stringify(p.specs))
    .input("badge", p.badge || null)
    .input("category", p.category)
    .input("image", p.image) // 1. Add the image as an input
    .query(`
      INSERT INTO Products (Slug, Name, Price, [Desc], Specs, Badge, Category, Image) -- 2. Add Image column here
      OUTPUT INSERTED.Id as id, 
             INSERTED.Slug as slug, 
             INSERTED.Name as name, 
             INSERTED.Price as price, 
             INSERTED.[Desc] as [desc], 
             INSERTED.Specs as specs, 
             INSERTED.Badge as badge, 
             INSERTED.Category as category,
             INSERTED.Image as image 
      VALUES (@slug, @name, @price, @desc, @specs, @badge, @category, @image) -- 4. Add the value variable
    `);
  
  const newProduct = result.recordset[0];
  return {
    ...newProduct,
    specs: typeof newProduct.specs === 'string' ? JSON.parse(newProduct.specs) : newProduct.specs,
    // Ensure image is returned as-is
  };
}

  async deleteProduct(id: number): Promise<void> {
    const pool = await poolPromise;
    await pool.request()
      .input("id", id)
      .query(`DELETE FROM Products WHERE Id = @id`);
  }
}

export const storage = new DatabaseStorageMSSQL();