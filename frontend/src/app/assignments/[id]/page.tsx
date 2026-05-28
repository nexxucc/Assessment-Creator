import { getAssignment } from "@/lib/api";
import { QuestionPaper } from "@/components/output/QuestionPaper";
import { GeneratingLoader } from "@/components/ui/GeneratingLoader";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssignmentDetailPage({ params }: Props) {
  const { id } = await params;
  const assignment = await getAssignment(id);

  if (assignment.status === "queued" || assignment.status === "processing") {
    return (
      <GeneratingLoader
        progress={assignment.status === "queued" ? 20 : 60}
        message="Generating your question paper..."
      />
    );
  }

  if (assignment.status === "failed") {
    return (
      <div className="rounded-[28px] bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black text-red-600">
          Generation failed
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {assignment.error || "Please regenerate this assignment."}
        </p>
      </div>
    );
  }

  if (!assignment.result) {
    return (
      <div className="rounded-[28px] bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">
          Result not available yet
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please refresh after a few seconds.
        </p>
      </div>
    );
  }

  return (
    <QuestionPaper
      assignment={assignment}
      result={assignment.result}
    />
  );
}
