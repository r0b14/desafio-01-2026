-- Habilita a extensão para UUID, embora o uso do gen_random_uuid() no psql 13+ já seja nativo
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Criação das tabelas principais

-- Tabela users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_id TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  raw_payload JSONB,
  status TEXT CHECK (status IN ('pending', 'processed', 'error')) DEFAULT 'pending' NOT NULL
);

-- Tabela emotions
CREATE TABLE IF NOT EXISTS public.emotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  primary_emotion TEXT NOT NULL,
  score NUMERIC(5, 4) NOT NULL,
  model_version TEXT
);

-- Tabela intentions
CREATE TABLE IF NOT EXISTS public.intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  intention_type TEXT NOT NULL,
  score NUMERIC(5, 4) NOT NULL,
  model_version TEXT
);

-- Tabela user_skills
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  score NUMERIC(5, 4) DEFAULT 0.0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, skill_name)
);

-- Tabela skill_history (tracking)
CREATE TABLE IF NOT EXISTS public.skill_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  skill_name TEXT NOT NULL,
  delta NUMERIC(5, 4) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criação de índices para performance

-- Índices em users
CREATE INDEX IF NOT EXISTS idx_users_whatsapp_id ON public.users(whatsapp_id);

-- Índices em messages
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_status_timestamp ON public.messages(status, timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(timestamp);

-- Índices em emotions e intentions
CREATE INDEX IF NOT EXISTS idx_emotions_message_id ON public.emotions(message_id);
CREATE INDEX IF NOT EXISTS idx_intentions_message_id ON public.intentions(message_id);

-- Índices em skills
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_history_user_id ON public.skill_history(user_id);

-- 3. Row Level Security policies (Opcional, mas recomendado no Supabase p/ impedir acesso não autorizado via APIs públicas)
-- Como as interações de banco virão do backend via Server Role ou Service Key,
-- podemos habilitar o RLS de maneira default e não criar policies públicas.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_history ENABLE ROW LEVEL SECURITY;
