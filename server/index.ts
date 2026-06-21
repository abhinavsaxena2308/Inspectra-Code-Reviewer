import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { config } from './config';
import { initDb } from './services/db';

const PORT = config.port;

initDb().then(() => {
  app.listen(PORT, () => {
      console.log(`[Server] Running in ${config.nodeEnv} mode on port ${PORT}`);
      console.log(`[Health] http://localhost:${PORT}/api/health`);
  });
});
