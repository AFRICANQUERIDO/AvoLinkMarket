import { poolPromise } from "./db";

// 1. Update the interface to include the new methods
export interface IStorage {
  createEnquiry(enquiry: any): Promise<void>;
  getEnquiries(limit?: number): Promise<any[]>;
  updateEnquiryStatus(id: number, status: string): Promise<any>; // Added
  deleteEnquiry(id: number): Promise<void>; // Added
  trackPageVisit(visit: { path: string }): Promise<void>;
  getVisitStats(days?: number): Promise<{ totalVisits: number; totalEnquiries: number }>;
}

export class DatabaseStorageMSSQL implements IStorage {

  async createEnquiry(enquiry: any) {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input("name", enquiry.name)
        .input("email", enquiry.email)
        .input("message", enquiry.message || "")
        .input("company", enquiry.company)
        .input("type", enquiry.type)
        .input("product", enquiry.product || null)
        .input("quantity", enquiry.quantity || null)
        .query(`
          INSERT INTO Enquiries (Name, Email, Message, Company, Type, Product, Quantity, Status, CreatedAt)
          VALUES (@name, @email, @message, @company, @type, @product, @quantity, 'new', GETDATE())
        `);
    } catch (err) {
      console.error("Database Insert Error:", err);
      throw err;
    }
  }

  async getEnquiries(limit = 50) {
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

  // 2. REWRITTEN for MSSQL (Status Update)
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

  // 3. REWRITTEN for MSSQL (Delete)
  async deleteEnquiry(id: number): Promise<void> {
    const pool = await poolPromise;
    await pool.request()
      .input("id", id)
      .query(`DELETE FROM Enquiries WHERE Id = @id`);
  }

  async trackPageVisit(visit: { path: string }) {
    const pool = await poolPromise;
    await pool.request()
      .input("path", visit.path)
      .query(`INSERT INTO PageVisits (Path) VALUES (@path)`);
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
}

export const storage = new DatabaseStorageMSSQL();