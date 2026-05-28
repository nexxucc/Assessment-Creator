import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import Redis from "ioredis";
import { env } from "../config/env";
import { JOB_EVENTS_CHANNEL } from "./jobEventService";

const jobSubscribers = new Map<string, Set<WebSocket>>();

export function initWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  const subscriber = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null
  });

  subscriber.subscribe(JOB_EVENTS_CHANNEL, error => {
    if (error) {
      console.error("Failed to subscribe to job events", error);
      return;
    }

    console.log("Subscribed to Redis job-events channel");
  });

  subscriber.on("message", (_channel, message) => {
    try {
      const event = JSON.parse(message);
      broadcastJob(event.jobId, event);
    } catch (error) {
      console.error("Invalid Redis job event", error);
    }
  });

  wss.on("connection", ws => {
    ws.on("message", raw => {
      try {
        const message = JSON.parse(raw.toString());

        if (typeof message.subscribe === "string") {
          const jobId = message.subscribe;

          if (!jobSubscribers.has(jobId)) {
            jobSubscribers.set(jobId, new Set());
          }

          jobSubscribers.get(jobId)!.add(ws);

          ws.send(
            JSON.stringify({
              event: "job:subscribed",
              jobId
            })
          );
        }
      } catch {
        ws.send(
          JSON.stringify({
            event: "error",
            error: "Invalid WebSocket message"
          })
        );
      }
    });

    ws.on("close", () => {
      for (const subscribers of jobSubscribers.values()) {
        subscribers.delete(ws);
      }
    });
  });

  console.log("WebSocket server attached");
}

export function broadcastJob(jobId: string, payload: unknown) {
  const subscribers = jobSubscribers.get(jobId);

  if (!subscribers) {
    return;
  }

  const message = JSON.stringify(payload);

  for (const ws of subscribers) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}
