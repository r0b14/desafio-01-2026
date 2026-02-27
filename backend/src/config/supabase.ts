// src/config/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn("Variáveis do Supabase não definidas corretamente!");
}

export const supabase = createClient(
  env.SUPABASE_URL || "https://placeholder.supabase.co",
  env.SUPABASE_ANON_KEY || "placeholder",
);
