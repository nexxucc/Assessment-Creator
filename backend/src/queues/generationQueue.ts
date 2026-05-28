import { Queue } from "bullmq";
import { env } from "../config/env";

export interface GenerationJobData {
  assignmentId: string;
}

export const bullConnection = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null
};

export const generationQueue = new Queue<GenerationJobData>("generation", {
  connection: bullConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});
