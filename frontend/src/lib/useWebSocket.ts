"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "./store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/ws";

export function useWebSocket(assignmentId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    let reconnectTimer: NodeJS.Timeout;
    let isClosed = false;

    function connect() {
      if (isClosed) return;

      const ws = new WebSocket(`${WS_URL}?assignmentId=${assignmentId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "subscribe", assignmentId }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const store = useAppStore.getState();
          switch (msg.type) {
            case "job_status":
              store.setJobStatus(msg.data.status, msg.data.message);
              break;
            case "job_progress":
              store.setJobProgress(msg.data.progress, msg.data.message);
              break;
            case "job_complete":
              store.setJobStatus("completed", "Question paper generated!");
              store.setGeneratedPaper(msg.data.paper);
              break;
            case "job_error":
              store.setJobStatus("failed", msg.data.error);
              break;
          }
        } catch {}
      };

      ws.onclose = () => {
        if (!isClosed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      isClosed = true;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [assignmentId]);

  return wsRef;
}
