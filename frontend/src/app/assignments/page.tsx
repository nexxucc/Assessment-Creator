"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/assignments/EmptyState";
import { AssignmentGrid } from "@/components/assignments/AssignmentGrid";
import { useAssignmentStore } from "@/store/assignmentStore";

function LoadingSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-x-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-[162px] animate-pulse rounded-[24px] bg-white/70"
        />
      ))}
    </div>
  );
}

export default function AssignmentsPage() {
  const {
    assignments,
    loading,
    error,
    fetchAssignments,
    removeAssignment
  } = useAssignmentStore();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  if (loading) {
    return (
      <section className="w-full">
        <LoadingSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] bg-white p-8 text-center">
        <h2 className="text-[20px] font-bold tracking-[-0.8px] text-[var(--text-primary)]">
          Could not load assignments
        </h2>
        <p className="mt-2 text-[14px] text-[var(--error)]">{error}</p>
        <button
          onClick={fetchAssignments}
          className="mt-5 rounded-full bg-[var(--button-primary)] px-6 py-3 text-[16px] font-medium tracking-[-0.64px] text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (assignments.length === 0) {
    return <EmptyState />;
  }

  return (
    <AssignmentGrid
      assignments={assignments}
      onDelete={removeAssignment}
    />
  );
}
