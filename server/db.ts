import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER, 
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, 
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

export const poolPromise = pool.connect()
  .then(client => {
    console.log("✅ Connected to Supabase PostgreSQL permanently and securely!");
    client.release();
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });