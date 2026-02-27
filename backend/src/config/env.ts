// src/config/env.ts
import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  OPENAI_API_KEY: string;
  EVOLUTION_API_URL: string;
  EVOLUTION_API_TOKEN: string;
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL || "",
  EVOLUTION_API_TOKEN: process.env.EVOLUTION_API_TOKEN || "",
};

// Validação simples
const requiredEnvs = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "OPENAI_API_KEY"];
for (const key of requiredEnvs) {
  if (!(env as any)[key]) {
    console.warn(`WARNING: Missing required environment variable: ${key}`);
  }
}
