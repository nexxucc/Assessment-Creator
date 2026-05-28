import { redis } from "../config/redis";

export const ASSIGNMENTS_ALL_KEY = "assignments:all";

export function assignmentKey(id: string) {
  return `assignment:${id}`;
}

export function pdfKey(id: string) {
  return `pdf:${id}`;
}

export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);

  if (!cached) {
    return null;
  }

  return JSON.parse(cached) as T;
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number
) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function delCache(...keys: string[]) {
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
