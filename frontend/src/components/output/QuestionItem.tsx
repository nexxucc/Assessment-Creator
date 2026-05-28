"use client";

import type { Question } from "@/types";

type Props = {
  question: Question;
};

function difficultyLabel(value: Question["difficulty"]) {
  if (value === "easy") return "Easy";
  if (value === "moderate") return "Moderate";
  return "Challenging";
}

function marksLabel(marks: number) {
  return marks === 1 ? "1 Mark" : `${marks} Marks`;
}

export function QuestionItem({ question }: Props) {
  return (
    <div className="paper-question flex items-start gap-2 text-[16px] font-normal leading-[2.4] tracking-[-0.16px] text-[#303030]">
      <span className="shrink-0">{question.number}.</span>

      <p className="whitespace-pre-line">
        <span>[{difficultyLabel(question.difficulty)}]</span>{" "}
        <span>{question.text}</span>{" "}
        <span>[{marksLabel(question.marks)}]</span>
      </p>
    </div>
  );
}
