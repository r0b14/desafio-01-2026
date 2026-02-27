import type { WebhookPayload } from "../types";

export const ingestMessage = async (payload: WebhookPayload) => {
  // Lógica de salvar usuário se não existir e salvar mensagem bruta com status PENDING
  console.log("Ingesting message from:", payload.data?.pushName);
};
