import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://khanrakshak:khanrakshak@localhost:5432/khanrakshak",
});

export async function query(text, params) {
  return pool.query(text, params);
}