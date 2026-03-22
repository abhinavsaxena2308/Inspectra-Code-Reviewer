import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
};