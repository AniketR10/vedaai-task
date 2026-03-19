import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { redisSub } from "../config/redis";
import { WSMessage } from "../types";

let wss: WebSocketServer;
const clients = new Map<string, Set<WebSocket>>();

function notifyClient(message: WSMessage) {
  const socketSet = clients.get(message.assignmentId);
  if (!socketSet) return;

  const payload = JSON.stringify(message);
  socketSet.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  redisSub.subscribe("ws:notifications");
  redisSub.on("message", (_channel, data) => {
    try {
      const message = JSON.parse(data) as WSMessage;
      notifyClient(message);
    } catch {}
  });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const assignmentId = url.searchParams.get("assignmentId");

    if (assignmentId) {
      if (!clients.has(assignmentId)) {
        clients.set(assignmentId, new Set());
      }
      clients.get(assignmentId)!.add(ws);
    }

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "subscribe" && msg.assignmentId) {
          if (!clients.has(msg.assignmentId)) {
            clients.set(msg.assignmentId, new Set());
          }
          clients.get(msg.assignmentId)!.add(ws);
        }
      } catch {}
    });

    ws.on("close", () => {
      clients.forEach((socketSet) => {
        socketSet.delete(ws);
      });
    });
  });

  return wss;
}

export { notifyClient };
