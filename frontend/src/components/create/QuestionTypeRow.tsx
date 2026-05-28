"use client";

import { Minus, Plus, X } from "lucide-react";
import type { QuestionType, QuestionTypeConfig } from "@/types";

const options: { type: QuestionType; label: string }[] = [
  { type: "mcq", label: "Multiple Choice Questions" },
  { type: "short", label: "Short Questions" },
  { type: "diagram", label: "Diagram/Graph-Based Questions" },
  { type: "numerical", label: "Numerical Problems" },
  { type: "custom", label: "Custom Questions" }
];

type Props = {
  row: QuestionTypeConfig;
  canRemove: boolean;
  onChange: (row: QuestionTypeConfig) => void;
  onRemove: () => void;
};

export function QuestionTypeRow({
  row,
  canRemove,
  onChange,
  onRemove
}: Props) {
  function updateType(value: string) {
    const selected = options.find(option => option.type === value);
    if (!selected) return;

    onChange({
      ...row,
      type: selected.type,
      label: selected.label
    });
  }

  function changeCount(delta: number) {
    onChange({
      ...row,
      count: Math.max(1, row.count + delta)
    });
  }

  function changeMarks(delta: number) {
    onChange({
      ...row,
      marks: Math.max(1, row.marks + delta)
    });
  }

  return (
    <div className="grid grid-cols-[1fr_28px_100px_100px] items-center gap-4">
      <select
        value={row.type}
        onChange={event => updateType(event.target.value)}
        className="h-11 rounded-full border-0 bg-white px-4 text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-[#303030] outline-none"
      >
        {options.map(option => (
          <option key={option.type} value={option.type}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={!canRemove}
        onClick={onRemove}
        className="flex size-7 items-center justify-center rounded-full text-[#303030] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <X size={16} />
      </button>

      <Counter
        value={row.count}
        onMinus={() => changeCount(-1)}
        onPlus={() => changeCount(1)}
      />

      <Counter
        value={row.marks}
        onMinus={() => changeMarks(-1)}
        onPlus={() => changeMarks(1)}
      />
    </div>
  );
}

function Counter({
  value,
  onMinus,
  onPlus
}: {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex h-11 items-center justify-between rounded-full bg-white px-2">
      <button
        type="button"
        onClick={onMinus}
        className="flex size-7 items-center justify-center rounded-full text-[#a9a9a9]"
      >
        <Minus size={16} />
      </button>

      <span className="text-[16px] font-semibold leading-[1.4] tracking-[-0.64px] text-[#303030]">
        {value}
      </span>

      <button
        type="button"
        onClick={onPlus}
        className="flex size-7 items-center justify-center rounded-full text-[#a9a9a9]"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
