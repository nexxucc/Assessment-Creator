"use client";

import Link from "next/link";
import { FileText, Plus } from "lucide-react";

export function EmptyState() {
  return (
    <section className="flex min-h-[calc(100vh-90px)] w-full items-center justify-center">
      <div className="flex w-[486px] max-w-full flex-col items-center text-center">
        <div className="mb-3 flex size-[300px] items-center justify-center rounded-[40px] bg-white/60">
          <FileText size={118} className="text-[var(--text-secondary)]" />
        </div>

        <div className="mt-3 w-full">
          <h2 className="text-center text-[20px] font-bold leading-[1.4] tracking-[-0.8px] text-[var(--text-primary)]">
            No assignments yet
          </h2>

          <p className="mt-0.5 text-center text-[16px] font-normal leading-[1.4] tracking-[-0.64px] text-[rgba(94,94,94,0.8)]">
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and let
            AI assist with grading.
          </p>
        </div>

        <Link
          href="/assignments/create"
          className="mt-32 flex h-[46px] items-center gap-1 rounded-full border border-white/50 bg-[var(--button-primary)] px-6 py-3 text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-white"
        >
          <Plus size={20} />
          Create Your First Assignment
        </Link>
      </div>
    </section>
  );
}
