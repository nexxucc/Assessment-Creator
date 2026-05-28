"use client";

import type { Difficulty } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  difficulty: Difficulty;
};

const styles: Record<Difficulty, string> = {
  easy: "border-emerald-200 bg-emerald-50 text-emerald-700",
  moderate: "border-amber-200 bg-amber-50 text-amber-700",
  hard: "border-red-200 bg-red-50 text-red-700"
};

export function DifficultyBadge({ difficulty }: Props) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
        styles[difficulty]
      )}
    >
      {difficulty === "moderate" ? "Moderate" : difficulty}
    </span>
  );
}
