"use client";

import { Mic, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createAssignment } from "@/lib/api";
import { useCreateFormStore } from "@/store/createFormStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { FileUpload } from "./FileUpload";
import { QuestionTypeRow } from "./QuestionTypeRow";
import { GeneratingLoader } from "@/components/ui/GeneratingLoader";
import type { QuestionTypeConfig } from "@/types";

const CreateAssignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine(value => new Date(value).getTime() > Date.now(), {
      message: "Due date must be in the future"
    }),
  questionTypes: z
    .array(
      z.object({
        type: z.enum(["mcq", "short", "diagram", "numerical", "custom"]),
        label: z.string().min(1),
        count: z.number().int().positive(),
        marks: z.number().positive()
      })
    )
    .min(1, "Add at least one question type"),
  additionalInfo: z.string().optional(),
  fileUrl: z.string().optional()
});

type CreateAssignmentPayload = z.infer<typeof CreateAssignmentSchema>;

type GenerationState = {
  active: boolean;
  jobId?: string;
  assignmentId?: string;
  progress: number;
  message: string;
};

export function CreateForm() {
  const router = useRouter();
  const store = useCreateFormStore();

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [generation, setGeneration] = useState<GenerationState>({
    active: false,
    progress: 10,
    message: "Preparing assignment..."
  });

  const totals = useMemo(() => {
    return store.questionTypes.reduce(
      (acc, item) => {
        acc.questions += item.count;
        acc.marks += item.count * item.marks;
        return acc;
      },
      { questions: 0, marks: 0 }
    );
  }, [store.questionTypes]);

  const handleSocketMessage = useCallback(
    (data: {
      event: string;
      progress?: number;
      assignmentId?: string;
      error?: string;
    }) => {
      if (data.event === "job:processing") {
        setGeneration(prev => ({
          ...prev,
          progress: data.progress ?? Math.max(prev.progress, 60),
          message: "AI is generating your question paper..."
        }));
      }

      if (data.event === "job:done") {
        setGeneration(prev => ({
          ...prev,
          progress: 100,
          message: "Question paper ready. Opening..."
        }));

        const id = data.assignmentId || generation.assignmentId;

        if (id) {
          window.setTimeout(() => router.push(`/assignments/${id}`), 500);
        }
      }

      if (data.event === "job:failed") {
        setGeneration(prev => ({
          ...prev,
          active: false
        }));

        setErrors([data.error || "Generation failed. Please try again."]);
      }
    },
    [generation.assignmentId, router]
  );

  useWebSocket(generation.jobId, handleSocketMessage);

  function updateRow(index: number, row: QuestionTypeConfig) {
    const next = [...store.questionTypes];
    next[index] = row;
    store.setQuestionTypes(next);
  }

  function removeRow(index: number) {
    store.setQuestionTypes(
      store.questionTypes.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addRow() {
    store.setQuestionTypes([
      ...store.questionTypes,
      {
        type: "custom",
        label: "Custom Questions",
        count: 1,
        marks: 1
      }
    ]);
  }

  function buildPayload(): CreateAssignmentPayload {
    return {
      title: store.title || "Quiz on Electricity",
      dueDate: store.dueDate,
      questionTypes: store.questionTypes,
      additionalInfo: store.additionalInfo,
      fileUrl: store.fileUrl
    };
  }

  async function handleSubmit() {
    setErrors([]);

    const payload = buildPayload();
    const parsed = CreateAssignmentSchema.safeParse(payload);

    if (!parsed.success) {
      setErrors(parsed.error.issues.map(issue => issue.message));
      return;
    }

    try {
      setSubmitting(true);

      const response = (await createAssignment(parsed.data)) as {
        assignmentId: string;
        jobId: string;
        status: string;
      };

      setGeneration({
        active: true,
        assignmentId: response.assignmentId,
        jobId: response.jobId,
        progress: 15,
        message: "Assignment queued. Waiting for AI worker..."
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create assignment";
      setErrors([message]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {generation.active && (
        <GeneratingLoader
          progress={generation.progress}
          message={generation.message}
        />
      )}

      <section className="mx-auto w-full max-w-[1103px]">
        <div className="mb-8">
          <div className="mb-8 px-2">
            <div className="flex items-center gap-3">
              <span className="size-3 rounded-full bg-[#41c46b] shadow-[0px_0px_20px_rgba(65,196,107,0.8)]" />

              <div>
                <h1 className="text-[20px] font-bold leading-[1.4] tracking-[-0.8px] text-[#303030]">
                  Create Assignment
                </h1>
                <p className="text-[14px] font-normal leading-[1.4] tracking-[-0.56px] text-[rgba(94,94,94,0.55)]">
                  Set up a new assignment for your students
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="mx-auto w-full max-w-[810px] rounded-[32px] bg-white/50 p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-[20px] font-bold leading-[1.4] tracking-[-0.8px] text-[#303030]">
              Assignment Details
            </h2>
            <p className="text-[14px] font-normal leading-[1.4] tracking-[-0.56px] text-[rgba(94,94,94,0.55)]">
              Basic information about your assignment
            </p>
          </div>

          {errors.length > 0 && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">
              {errors.map(error => (
                <p key={error} className="text-sm font-semibold text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-7">
            <FileUpload
              fileName={store.fileName}
              onFileSelect={(fileName, fileUrl) => {
                store.setField("fileName", fileName);
                store.setField("fileUrl", fileUrl);
              }}
              onClear={() => {
                store.setField("fileName", "");
                store.setField("fileUrl", "");
              }}
            />

            <p className="-mt-4 text-center text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-[rgba(48,48,48,0.6)]">
              Upload images of your preferred document/image
            </p>

            <div>
              <label className="mb-2 block text-[16px] font-bold leading-[1.4] tracking-[-0.64px] text-[#303030]">
                Due Date
              </label>

              <input
                type="date"
                value={store.dueDate}
                onChange={event => store.setField("dueDate", event.target.value)}
                className="h-11 w-full rounded-full border border-[#dadada] bg-transparent px-4 text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-[#303030] outline-none"
              />
            </div>

            <div>
              <div className="mb-3 grid grid-cols-[1fr_28px_100px_100px] gap-4">
                <p className="text-[16px] font-bold leading-[1.4] tracking-[-0.64px] text-[#303030]">
                  Question Type
                </p>
                <span />
                <p className="text-center text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-[#303030]">
                  No. of Questions
                </p>
                <p className="text-center text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-[#303030]">
                  Marks
                </p>
              </div>

              <div className="space-y-4">
                {store.questionTypes.map((row, index) => (
                  <QuestionTypeRow
                    key={`${row.type}-${index}`}
                    row={row}
                    canRemove={store.questionTypes.length > 1}
                    onChange={updated => updateRow(index, updated)}
                    onRemove={() => removeRow(index)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="mt-5 flex items-center gap-3 text-[14px] font-bold leading-[1.4] tracking-[-0.56px] text-[#303030]"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-[#2b2b2b] text-white">
                  <Plus size={20} />
                </span>
                Add Question Type
              </button>

              <div className="mt-6 text-right text-[16px] font-medium leading-[1.1] tracking-[-0.64px] text-[#303030]">
                <p>Total Questions : {totals.questions}</p>
                <p className="mt-2">Total Marks : {totals.marks}</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[16px] font-bold leading-[1.4] tracking-[-0.64px] text-[#303030]">
                Additional Information (For better output)
              </label>

              <div className="relative">
                <textarea
                  value={store.additionalInfo}
                  onChange={event =>
                    store.setField("additionalInfo", event.target.value)
                  }
                  rows={4}
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  className="h-[102px] w-full resize-none rounded-2xl border border-dashed border-[#dadada] bg-white/25 px-4 py-4 text-[14px] font-medium leading-[1.4] tracking-[-0.56px] text-[#303030] outline-none placeholder:text-[rgba(48,48,48,0.6)]"
                />

                <button
                  type="button"
                  className="absolute bottom-4 right-4 flex size-9 items-center justify-center rounded-full bg-[#f0f0f0] text-[#303030]"
                >
                  <Mic size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-[810px] items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/assignments")}
            className="rounded-full bg-white px-6 py-3 text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-[#303030]"
          >
            ← Previous
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="rounded-full border border-white/50 bg-[#181818] px-6 py-3 text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Generating..." : "Generate Assignment"}
          </button>
        </div>
      </section>
    </>
  );
}
