"use client";

import type { AnswerKeyItem } from "@/types";

type Props = {
  answerKey: AnswerKeyItem[];
};

export function AnswerKey({ answerKey }: Props) {
  return (
    <section className="mt-[56px] font-paper text-[#303030]">
      <h3 className="text-[20px] font-bold leading-[2.4]">
        Answer Key:
      </h3>

      <div className="mt-[8px] space-y-0">
        {answerKey.map(item => (
          <div
            key={item.number}
            className="flex items-start gap-2 text-[16px] font-normal leading-[2.4]"
          >
            <span className="shrink-0">{item.number}.</span>
            <p className="whitespace-pre-line">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
