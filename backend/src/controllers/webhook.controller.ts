import type { Request, Response } from "express";
// import { ingestMessage } from '../services/message.service';

export const handleWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const payload = req.body;

    // Devolvemos 200 OK imediato para a Evolution API não dar timeout
    res.status(200).json({ success: true, message: "Webhook received" });

    // Processamento assíncrono (Ingestão/Worker)
    // await ingestMessage(payload);
  } catch (error) {
    console.error("Error handling webhook:", error);
  }
};
