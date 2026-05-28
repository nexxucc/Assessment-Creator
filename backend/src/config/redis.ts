import Redis from "ioredis";
import { env } from "./env";

export const redisUrl = env.REDIS_URL;

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", err => {
  console.error("Redis error", err);
});
