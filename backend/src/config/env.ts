import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  LLM_API_KEY: z.string().min(1, "LLM_API_KEY is required"),
  LLM_BASE_URL: z.string().url().default("https://generativelanguage.googleapis.com/v1beta/openai/"),
  LLM_MODEL: z.string().min(1, "LLM_MODEL is required"),
  FRONTEND_URL: z.string().default("http://localhost:3000")
});

export const env = EnvSchema.parse(process.env);
