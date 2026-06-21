import { Pool } from 'pg';
import { config } from '../config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS repositories (
        id VARCHAR(255) PRIMARY KEY,
        repo_url TEXT NOT NULL,
        owner VARCHAR(255) NOT NULL,
        repo_name VARCHAR(255) NOT NULL,
        clerk_user_id VARCHAR(255) NOT NULL,
        architecture_diagram TEXT,
        architecture_report TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS analyses (
        id VARCHAR(255) PRIMARY KEY,
        repo_id VARCHAR(255) REFERENCES repositories(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        score INTEGER,
        clerk_user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        analysis_id VARCHAR(255) REFERENCES analyses(id) ON DELETE CASCADE,
        file_name TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        suggestion TEXT NOT NULL,
        line_number INTEGER
      );
    `);
    console.log('[DB] PostgreSQL tables initialized successfully.');
  } catch (error) {
    console.error('[DB] Failed to initialize tables:', error);
  } finally {
    client.release();
  }
};
