"use client";

import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAssignment, regenerateAssignment } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { GeneratingLoader } from "@/components/ui/GeneratingLoader";

type Props = {
  assignmentId: string;
};

type RegenerationState = {
  active: boolean;
  jobId?: string;
  progress: number;
  message: string;
};

type AssignmentStatusResponse = {
  status: "pending" | "queued" | "processing" | "done" | "failed";
  error?: string;
};

export function RegenerateBtn({ assignmentId }: Props) {
  const router = useRouter();

  const [regeneration, setRegeneration] = useState<RegenerationState>({
    active: false,
    progress: 0,
    message: ""
  });

  const finishRegeneration = useCallback(() => {
    setRegeneration(prev => ({
      ...prev,
      progress: 100,
      message: "New question paper ready. Refreshing..."
    }));

    window.setTimeout(() => {
      setRegeneration({
        active: false,
        progress: 0,
        message: ""
      });

      router.refresh();
    }, 600);
  }, [router]);

  const handleSocketMessage = useCallback(
    (data: { event: string; progress?: number; error?: string }) => {
      if (data.event === "job:queued") {
        setRegeneration(prev => ({
          ...prev,
          progress: Math.max(prev.progress, 20),
          message: "Regeneration queued..."
        }));
      }

      if (data.event === "job:processing") {
        setRegeneration(prev => ({
          ...prev,
          progress: data.progress ?? Math.max(prev.progress, 60),
          message: "AI is regenerating your question paper..."
        }));
      }

      if (data.event === "job:done") {
        finishRegeneration();
      }

      if (data.event === "job:failed") {
        setRegeneration({
          active: false,
          progress: 0,
          message: ""
        });

        alert(data.error || "Regeneration failed. Please try again.");
      }
    },
    [finishRegeneration]
  );

  useWebSocket(regeneration.jobId, handleSocketMessage);

  useEffect(() => {
    if (!regeneration.active || !regeneration.jobId) return;

    let cancelled = false;

    const interval = window.setInterval(async () => {
      try {
        const assignment = (await getAssignment(
          assignmentId
        )) as AssignmentStatusResponse;

        if (cancelled) return;

        if (assignment.status === "processing") {
          setRegeneration(prev => ({
            ...prev,
            progress: Math.max(prev.progress, 60),
            message: "AI is regenerating your question paper..."
          }));
        }

        if (assignment.status === "done") {
          window.clearInterval(interval);
          finishRegeneration();
        }

        if (assignment.status === "failed") {
          window.clearInterval(interval);

          setRegeneration({
            active: false,
            progress: 0,
            message: ""
          });

          alert(assignment.error || "Regeneration failed. Please try again.");
        }
      } catch {
        // WebSocket is the primary path; polling is only fallback.
      }
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [
    assignmentId,
    finishRegeneration,
    regeneration.active,
    regeneration.jobId
  ]);

  async function handleRegenerate() {
    const confirmed = window.confirm("Regenerate this question paper?");
    if (!confirmed) return;

    try {
      setRegeneration({
        active: true,
        progress: 10,
        message: "Sending regeneration request..."
      });

      const response = (await regenerateAssignment(assignmentId)) as {
        assignmentId: string;
        jobId: string;
        status: string;
      };

      setRegeneration({
        active: true,
        jobId: response.jobId,
        progress: 20,
        message: "Regeneration queued..."
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to regenerate assignment";

      setRegeneration({
        active: false,
        progress: 0,
        message: ""
      });

      alert(message);
    }
  }

  return (
    <>
      {regeneration.active && (
        <GeneratingLoader
          progress={regeneration.progress}
          message={regeneration.message}
        />
      )}

      <button
        onClick={handleRegenerate}
        disabled={regeneration.active}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-6 text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCcw size={17} />
        {regeneration.active ? "Regenerating..." : "Regenerate"}
      </button>
    </>
  );
}
