import Redis from "ioredis";
import { env } from "../config/env";
import type { WSEvent } from "../types";

export const JOB_EVENTS_CHANNEL = "job-events";

const publisher = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null
});

export async function publishJobEvent(event: WSEvent) {
  await publisher.publish(JOB_EVENTS_CHANNEL, JSON.stringify(event));
}
