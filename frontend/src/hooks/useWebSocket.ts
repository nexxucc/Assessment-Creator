"use client";

import { useEffect, useRef } from "react";
import type { WSEvent } from "@/types";

type ClientSocketEvent =
  | WSEvent
  | {
      event: "job:subscribed";
      jobId: string;
    }
  | {
      event: "error";
      error: string;
    };

export function useWebSocket(
  jobId: string | undefined,
  onMessage: (data: ClientSocketEvent) => void
) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ subscribe: jobId }));
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data) as ClientSocketEvent;
        onMessage(data);
      } catch {
        console.error("Invalid WebSocket message", event.data);
      }
    };

    ws.onerror = error => {
      console.error("WebSocket error", error);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [jobId, onMessage]);
}
