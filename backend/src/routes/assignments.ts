import { Router } from "express";
import { z } from "zod";
import { AssignmentModel } from "../models/Assignment";
import { ResultModel } from "../models/Result";
import { generationQueue } from "../queues/generationQueue";
import { publishJobEvent } from "../services/jobEventService";
import {
  ASSIGNMENTS_ALL_KEY,
  assignmentKey,
  pdfKey,
  getCache,
  setCache,
  delCache
} from "../services/cacheService";

const router = Router();

const QuestionTypeConfigSchema = z.object({
  type: z.enum(["mcq", "short", "diagram", "numerical", "custom"]),
  label: z.string().min(1, "Question type label is required"),
  count: z.coerce.number().int().positive("Question count must be positive"),
  marks: z.coerce.number().positive("Marks must be positive")
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  dueDate: z.coerce
    .date()
    .refine(date => date.getTime() > Date.now(), "Due date must be in the future"),
  questionTypes: z.array(QuestionTypeConfigSchema).min(1, "Add at least one question type"),
  additionalInfo: z.string().optional().default(""),
  fileUrl: z.string().optional().default("")
});

router.post("/", async (req, res) => {
  const parsed = CreateAssignmentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid assignment data",
      errors: parsed.error.flatten()
    });
    return;
  }

  const assignment = await AssignmentModel.create({
    ...parsed.data,
    status: "queued"
  });

  const job = await generationQueue.add("generate-assessment", {
    assignmentId: assignment._id.toString()
  });

  const jobId = String(job.id);

  assignment.jobId = jobId;
  await assignment.save();

  await delCache(ASSIGNMENTS_ALL_KEY);

  await publishJobEvent({
    event: "job:queued",
    jobId,
    assignmentId: assignment._id.toString()
  });

  res.status(201).json({
    assignmentId: assignment._id.toString(),
    jobId,
    status: assignment.status
  });
});

router.get("/", async (_req, res) => {
  const cached = await getCache(ASSIGNMENTS_ALL_KEY);

  if (cached) {
    res.json(cached);
    return;
  }

  const assignments = await AssignmentModel.find()
    .sort({ createdAt: -1 })
    .lean();

  await setCache(ASSIGNMENTS_ALL_KEY, assignments, 60);

  res.json(assignments);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const key = assignmentKey(id);

  const cached = await getCache(key);

  if (cached) {
    res.json(cached);
    return;
  }

  const assignment = await AssignmentModel.findById(id).lean();

  if (!assignment) {
    res.status(404).json({ message: "Assignment not found" });
    return;
  }

  const result = await ResultModel.findOne({ assignmentId: id })
    .sort({ createdAt: -1 })
    .lean();

  const payload = {
    ...assignment,
    result
  };

  await setCache(key, payload, 120);

  res.json(payload);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const assignment = await AssignmentModel.findByIdAndDelete(id);

  if (!assignment) {
    res.status(404).json({ message: "Assignment not found" });
    return;
  }

  await ResultModel.deleteMany({ assignmentId: id });

  await delCache(
    ASSIGNMENTS_ALL_KEY,
    assignmentKey(id),
    pdfKey(id)
  );

  res.json({ ok: true });
});

router.post("/:id/regenerate", async (req, res) => {
  const { id } = req.params;

  const assignment = await AssignmentModel.findById(id);

  if (!assignment) {
    res.status(404).json({ message: "Assignment not found" });
    return;
  }

  await ResultModel.deleteMany({ assignmentId: id });

  assignment.status = "queued";
  assignment.error = undefined;

  const job = await generationQueue.add("regenerate-assessment", {
    assignmentId: assignment._id.toString()
  });

  const jobId = String(job.id);

  assignment.jobId = jobId;
  await assignment.save();

  await delCache(
    ASSIGNMENTS_ALL_KEY,
    assignmentKey(id),
    pdfKey(id)
  );

  await publishJobEvent({
    event: "job:queued",
    jobId,
    assignmentId: id
  });

  res.status(202).json({
    assignmentId: id,
    jobId,
    status: assignment.status
  });
});

export default router;
