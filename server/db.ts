// server/db.ts
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

// Fully typed config for MSSQL
const config: sql.config = {
  server: process.env.DB_SERVER as string,       // e.g., JANEQUE
  database: process.env.DB_DATABASE as string,   // e.g., avolink_db
  user: process.env.DB_USER as string,           // SQL login username
  password: process.env.DB_PASSWORD as string,   // SQL login password
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,                              // true if Azure
    trustServerCertificate: true,               // allows local self-signed cert
    instanceName: process.env.DB_INSTANCE || "SQLEXPRESS", // your instance
  },
};

// Create a reusable pool
export const poolPromise: Promise<sql.ConnectionPool> = sql.connect(config)
  .then(pool => {
    console.log("✅ Connected to MSSQL!");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
