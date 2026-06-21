import { createPendingAnalysis } from './server/services/storageService';
import { pool } from './server/services/db';

async function test() {
  try {
    const analysisId = await createPendingAnalysis('https://github.com/test/test2', 'test', 'test2', 'user_123');
    console.log("Analysis ID:", analysisId);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();
