import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../../.env') });
export const env = {
  // Hono Configuration
  HONO_SECRET_KEY: process.env.HONO_SECRET_KEY || 'default-secret-key-do-not-use-in-production',
  PORT: parseInt(process.env.PORT || '3000', 10),

  // Python Service Configuration
  PYTHON_API_URL: process.env.PYTHON_API_URL || 'http://localhost:8000',
  PYTHON_SECRET_KEY: process.env.PYTHON_SECRET_KEY,

  // Security Configuration
  JWT_EXPIRATION: parseInt(process.env.JWT_EXPIRATION || '3600', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Environment Check
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Validate required environment variables
const requiredEnvVars = ['HONO_SECRET_KEY', 'PYTHON_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please check your .env file or environment configuration.'
  );
} 