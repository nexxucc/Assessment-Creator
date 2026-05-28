"use client";

import Link from "next/link";
import { Filter, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Assignment } from "@/types";
import { AssignmentCard } from "./AssignmentCard";

type Props = {
  assignments: Assignment[];
  onDelete: (id: string) => Promise<void>;
};

export function AssignmentGrid({ assignments, onDelete }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return assignments.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [assignments, query]);

  return (
    <section className="relative min-h-[calc(100vh-90px)] w-full overflow-hidden pb-24">
      <div className="mb-3 flex h-[50px] items-center px-2">
        <div className="flex items-center gap-3">
          <span className="size-3 rounded-full bg-[var(--orange-primary)] shadow-[0px_0px_40px_rgba(255,86,35,0.9)]" />

          <div>
            <h1 className="text-[20px] font-bold leading-[1.4] tracking-[-0.8px] text-[var(--text-primary)]">
              Assignments
            </h1>
            <p className="text-[14px] font-normal leading-[1.4] tracking-[-0.56px] text-[rgba(94,94,94,0.55)]">
              Manage and create assignments for your classes.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3 flex h-auto flex-col gap-3 rounded-[20px] bg-white px-4 py-3 md:h-16 md:flex-row md:items-center md:justify-between">
        <button className="flex items-center gap-1 text-[14px] font-bold leading-[1.4] tracking-[-0.56px] text-[var(--text-muted)]">
          <Filter size={20} />
          Filter By
        </button>

        <div className="flex h-11 w-full items-center rounded-full border border-black/20 px-4 md:w-[380px]">
          <Search size={20} className="mr-3 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search Assignment"
            className="w-full bg-transparent text-[14px] font-bold leading-[1.4] tracking-[-0.56px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 md:gap-x-4">
        {filtered.map(assignment => (
          <AssignmentCard
            key={assignment._id}
            assignment={assignment}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 hidden h-[73px] items-center justify-center bg-white/20 backdrop-blur-[20px] lg:left-[315px] lg:flex">
        <Link
          href="/assignments/create"
          className="flex h-[46px] items-center gap-1 rounded-full border border-white/50 bg-[var(--button-primary)] px-6 py-3 text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-white"
        >
          <Plus size={20} />
          Create Assignment
        </Link>
      </div>
    </section>
  );
}
