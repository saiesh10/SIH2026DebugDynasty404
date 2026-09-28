import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const { Pool } = pg;
const DEFAULT_DATABASE_URL = "postgresql://khanrakshak:khanrakshak@localhost:5433/khanrakshak";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function testDatabaseConnection() {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows[0]?.ok === 1;
}