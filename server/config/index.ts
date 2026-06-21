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
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  githubToken: process.env.GITHUB_TOKEN,
  nodeEnv: process.env.NODE_ENV || 'development',
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
};