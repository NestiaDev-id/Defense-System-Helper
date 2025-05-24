// app/config/env.ts
import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Definisikan tipe Env dengan semua variabel yang dibutuhkan
type Env = {
  HONO_SECRET_KEY: string;
  PORT: number;
  PYTHON_API_URL: string;
  PYTHON_SECRET_KEY: string;
  JWT_EXPIRATION: number;
  CORS_ORIGIN: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // Tambahkan variabel lingkungan baru untuk database di sini
  FIREBASE_SERVICE_ACCOUNT_JSON?: string; // Opsional jika tidak selalu ada
  // FIREBASE_DATABASE_URL?: string;

  MONGODB_URI?: string; // Opsional jika tidak selalu ada
  MONGODB_DB_NAME?: string; // Opsional jika tidak selalu ada

  SUPABASE_URL?: string; // Opsional jika tidak selalu ada
  SUPABASE_ANON_KEY?: string; // Opsional jika tidak selalu ada
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "../../.env") });

export const env: Env = {
  HONO_SECRET_KEY:
    process.env.HONO_SECRET_KEY ||
    "default-secret-key-do-not-use-in-production",
  PORT: parseInt(process.env.PORT || "3000", 10),
  PYTHON_API_URL: process.env.PYTHON_API_URL || "http://localhost:8000",
  PYTHON_SECRET_KEY: process.env.PYTHON_SECRET_KEY || "default-key",
  JWT_EXPIRATION: parseInt(process.env.JWT_EXPIRATION || "3600", 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",

  // Tambahkan pembacaan dari process.env untuk variabel baru
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  // FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,

  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB_NAME:
    process.env.MONGODB_DB_NAME || "nama_database_mongo_default_anda", // Beri default jika perlu

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
};

// validate required environment variables
const requiredEnvVars = [
  "HONO_SECRET_KEY",
  "PYTHON_SECRET_KEY",
  // Tambahkan variabel wajib lainnya di sini
];
const missingEnvVars = requiredEnvVars.filter(
  (key) => !process.env[key as keyof NodeJS.ProcessEnv]
);
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}\n` +
      "Please check your .env file or environment configuration."
  );
}
