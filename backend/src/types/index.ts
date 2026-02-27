// src/types/index.ts

export interface WebhookPayload {
  event: string;
  instance: string;
  data: {
    message: {
      id: string;
      conversation: string;
      extendedTextMessage?: {
        text: string;
      };
    };
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
      participant?: string;
    };
    messageTimestamp: number;
    pushName: string;
  };
}

export interface AIAnalysisResult {
  emotion: {
    label: string;
    score: number;
  };
  intentions: Array<{
    label: string;
    score: number;
  }>;
  skills_delta: Array<{
    skill: string;
    delta: number;
    reason: string;
  }>;
}
