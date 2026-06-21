import { pool } from './server/services/db';

async function test() {
  try {
    const res = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
    console.log("Tables:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();
