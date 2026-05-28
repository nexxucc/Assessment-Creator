"use client";

import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import type { Assignment } from "@/types";
import { formatDate } from "@/lib/utils";

type Props = {
  assignment: Assignment;
  onDelete: (id: string) => Promise<void>;
};

export function AssignmentCard({ assignment, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("Delete this assignment and its result?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await onDelete(assignment._id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="relative h-[162px] rounded-[24px] bg-white p-6">
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <h3 className="max-w-[418px] truncate text-[24px] font-extrabold leading-[1.2] tracking-[-0.96px] text-[var(--text-primary)]">
            {assignment.title}
          </h3>

          <button
            onClick={() => setOpen(value => !value)}
            className="flex size-6 items-center justify-center text-[var(--text-primary)]"
            aria-label="Open assignment menu"
          >
            <MoreVertical size={24} />
          </button>
        </div>

        <div className="flex items-center justify-between text-[16px] tracking-[-0.64px]">
          <p className="text-black/50">
            <span className="font-extrabold text-[var(--text-primary)]">
              Assigned on
            </span>{" "}
            : {formatDate(assignment.createdAt).replaceAll("/", "-")}
          </p>

          <p className="text-black/50">
            <span className="font-extrabold text-[var(--text-primary)]">
              Due
            </span>{" "}
            : {formatDate(assignment.dueDate).replaceAll("/", "-")}
          </p>
        </div>
      </div>

      {open && (
        <div className="absolute right-14 top-[54px] z-20 flex w-[140px] flex-col gap-1 rounded-2xl bg-white p-2 shadow-[0px_16px_24px_rgba(0,0,0,0.2),0px_32px_24px_rgba(0,0,0,0.05)]">
          <Link
            href={`/assignments/${assignment._id}`}
            className="flex h-8 items-center rounded-lg px-2 text-[14px] font-medium leading-[1.4] tracking-[-0.56px] text-[var(--text-primary)]"
          >
            View Assignment
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex h-8 items-center rounded-lg bg-[var(--bg-off-white-primary)] px-2 text-left text-[14px] font-medium leading-[1.4] tracking-[-0.56px] text-[var(--error)] disabled:opacity-60"
          >
            {deleting ? "Deleting" : "Delete"}
          </button>
        </div>
      )}
    </article>
  );
}
