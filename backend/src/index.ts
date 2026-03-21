import express from "express";
import cors from "cors";
import http from "http";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { initWebSocket } from "./services/websocket";
import assignmentRoutes from "./routes/assignment";
import "./workers/generationWorker"; // start worker in same process

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin 
      if (!origin) return callback(null, true);
      if (
        origin === env.CLIENT_URL ||
        origin.endsWith(".vercel.app") ||
        origin === "http://localhost:3000"
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/assignments", assignmentRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// websocket
initWebSocket(server);

async function start() {
  await connectDB();
  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
    console.log(`websocket available at ws://localhost:${env.PORT}/ws`);
  });
}

start().catch(console.error);
