import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define configuration schema with sensible defaults and strict validation
const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GITHUB_TOKEN: z.string().min(1, 'GitHub Token is required for API requests'),
  GEMINI_API_KEY: z.string().min(1, 'Gemini API Key is required'),
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
  geminiApiKey: _env.data.GEMINI_API_KEY,
};