import { supabase } from "../config/supabase";
import type { WebhookPayload } from "../types";

export const ingestMessage = async (payload: WebhookPayload) => {
  try {
    const { key, message, pushName, messageTimestamp } = payload.data;

    // Ignora mensagens enviadas pelo próprio bot ou sem texto válido.
    // Dependendo do tipo de mensagem da Evolution API, pode estar em conversation ou extendedTextMessage.text
    const content =
      message?.conversation || message?.extendedTextMessage?.text || "";

    if (key.fromMe || !content) {
      console.log("Ignorando mensagem inválida ou do próprio bot.");
      return;
    }

    const whatsappId = key.remoteJid;

    // 1. Tentar encontrar ou criar o usuário (Upsert)
    // O whatsapp_id tem que ser único, por isso lidamos com conflitos
    const { data: user, error: userError } = await supabase
      .from("users")
      .upsert(
        { whatsapp_id: whatsappId, name: pushName },
        { onConflict: "whatsapp_id" },
      )
      .select()
      .single();

    if (userError) {
      console.error("Erro ao salvar usuário no Supabase:", userError);
      return;
    }

    // 2. Salvar a mensagem na tabela messages
    // O timestamp vem em epoch (segundos), precisamos converter para milissegundos
    const date = new Date(messageTimestamp * 1000).toISOString();

    const { error: msgError } = await supabase.from("messages").insert([
      {
        user_id: user.id,
        content: content,
        timestamp: date,
        raw_payload: payload,
        status: "pending", // Estado inicial para o worker de IA consumir
      },
    ]);

    if (msgError) {
      console.error("Erro ao salvar mensagem no Supabase:", msgError);
      return;
    }

    console.log(
      `Mensagem de [${pushName}] ingerida com sucesso! STATUS: PENDING`,
    );
  } catch (error) {
    console.error("Exceção na ingestão do Webhook:", error);
  }
};
