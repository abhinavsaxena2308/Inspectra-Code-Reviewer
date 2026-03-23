import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env from project root
dotenv.config();

// Define configuration schema with sensible defaults and strict validation
const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GITHUB_TOKEN: z.string().min(1, 'GitHub Token is required for API requests'),
  VITE_INSFORGE_URL: z.url('InsForge URL must be a valid URL'),
  VITE_INSFORGE_ANON_KEY: z.string().min(1, 'InsForge Anon Key is required'),
});

// Validate environment variables
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:\n', _env.error.format());
  process.exit(1);
}

export const config = {
  port: parseInt(_env.data.PORT, 10),
  nodeEnv: _env.data.NODE_ENV,
  githubToken: _env.data.GITHUB_TOKEN,
  insforgeUrl: _env.data.VITE_INSFORGE_URL,
  insforgeAnonKey: _env.data.VITE_INSFORGE_ANON_KEY,
};