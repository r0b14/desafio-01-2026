export interface User {
  id: string;
  whatsapp_id: string;
  name: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  content: string | null;
  timestamp: string;
  raw_payload: any | null;
  status: "pending" | "processed" | "error";
}

export interface Emotion {
  id: string;
  message_id: string;
  primary_emotion: string;
  score: number;
  model_version: string | null;
}

export interface Intention {
  id: string;
  message_id: string;
  intention_type: string;
  score: number;
  model_version: string | null;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  score: number;
  updated_at: string;
}

export interface SkillHistory {
  id: string;
  user_id: string;
  message_id: string | null;
  skill_name: string;
  delta: number;
  reason: string | null;
  created_at: string;
}
