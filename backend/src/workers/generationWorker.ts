import { Worker } from "bullmq";
import { connectDB } from "../config/db";
import { bullConnection } from "../queues/generationQueue";
import { AssignmentModel } from "../models/Assignment";
import { ResultModel } from "../models/Result";
import { buildPrompt, callLLM, parseResponse } from "../services/llmService";
import { publishJobEvent } from "../services/jobEventService";
import {
  ASSIGNMENTS_ALL_KEY,
  assignmentKey,
  delCache
} from "../services/cacheService";

async function startWorker() {
  await connectDB();

  const worker = new Worker(
    "generation",
    async job => {
      const { assignmentId } = job.data;

      const assignment = await AssignmentModel.findById(assignmentId);

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      assignment.status = "processing";
      assignment.error = undefined;
      await assignment.save();

      await publishJobEvent({
        event: "job:processing",
        jobId: job.id!,
        assignmentId,
        progress: 25
      });

      const prompt = buildPrompt(assignment);

      await publishJobEvent({
        event: "job:processing",
        jobId: job.id!,
        assignmentId,
        progress: 45
      });

      const raw = await callLLM(prompt);
      const parsed = parseResponse(raw);

      await publishJobEvent({
        event: "job:processing",
        jobId: job.id!,
        assignmentId,
        progress: 75
      });

      await ResultModel.deleteMany({ assignmentId });

      const result = await ResultModel.create({
        assignmentId,
        ...parsed
      });

      assignment.status = "done";
      await assignment.save();

      await delCache(
        ASSIGNMENTS_ALL_KEY,
        assignmentKey(assignmentId)
      );

      await publishJobEvent({
        event: "job:done",
        jobId: job.id!,
        assignmentId,
        resultId: result._id.toString(),
        progress: 100
      });

      return {
        resultId: result._id.toString()
      };
    },
    {
      connection: bullConnection,
      concurrency: 2,
      lockDuration: 120000
    }
  );

  worker.on("failed", async (job, error) => {
    if (!job) return;

    const assignmentId = job.data.assignmentId;

    const attemptsMade = job.attemptsMade;
    const maxAttempts = job.opts.attempts ?? 1;

    if (attemptsMade < maxAttempts) {
      return;
    }

    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: "failed",
      error: error.message
    });

    await delCache(
      ASSIGNMENTS_ALL_KEY,
      assignmentKey(assignmentId)
    );

    await publishJobEvent({
      event: "job:failed",
      jobId: job.id!,
      assignmentId,
      error: error.message
    });
  });

  console.log("Generation worker started");
}

startWorker().catch(error => {
  console.error("Worker failed to start", error);
  process.exit(1);
});
