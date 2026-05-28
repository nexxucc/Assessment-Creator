import express from "express";
import cors from "cors";
import http from "http";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { initWebSocket } from "./services/wsService";
import assignmentRoutes from "./routes/assignments";
import pdfRoutes from "./routes/pdf";

async function bootstrap() {
  await connectDB();

  const app = express();
  const server = http.createServer(app);

  app.use(
    cors({
      origin: env.FRONTEND_URL
    })
  );

  app.use(express.json({ limit: "10mb" }));

  initWebSocket(server);

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "vedaai-backend"
    });
  });

  app.use("/api/assignments", assignmentRoutes);
  app.use("/api/pdf", pdfRoutes);

  server.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch(error => {
  console.error("Backend failed to start", error);
  process.exit(1);
});
