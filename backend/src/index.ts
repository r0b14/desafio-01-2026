// src/index.ts
import dotenv from "dotenv";
import express from "express";
import { env } from "./config/env";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", environment: env.NODE_ENV });
});

// Registrar rotas
import apiRoutes from "./routes/api.routes";
import webhookRoutes from "./routes/webhook.routes";

app.use("/webhooks/evolution", webhookRoutes);
app.use("/api", apiRoutes);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
