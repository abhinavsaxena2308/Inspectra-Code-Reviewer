import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');
    await client.query(`
      ALTER TABLE repositories 
      ADD COLUMN IF NOT EXISTS architecture_diagram TEXT,
      ADD COLUMN IF NOT EXISTS architecture_report TEXT;
    `);
    console.log('Migration complete: Added architecture columns to repositories table.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
