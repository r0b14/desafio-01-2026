import { Router } from "express";
import { handleWebhook } from "../controllers/webhook.controller";

const router = Router();

// Rota principal de recebimento de eventos da Evolution API
router.post("/", handleWebhook);

export default router;
