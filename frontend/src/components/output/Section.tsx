"use client";

import type { Section as SectionType } from "@/types";
import { QuestionItem } from "./QuestionItem";

type Props = {
  section: SectionType;
};

function cleanSectionTitle(title: string, sectionId: string) {
  return title
    .replace(new RegExp(`^Section\\s+${sectionId}\\s*:?\\s*`, "i"), "")
    .replace(/^Section\s+[A-Z]\s*:\s*/i, "")
    .trim();
}

export function Section({ section }: Props) {
  const title = cleanSectionTitle(section.title, section.id);

  return (
    <section className="mt-[48px]">
      <h2 className="text-center font-paper text-[24px] font-semibold leading-[1.6] tracking-[-0.96px] text-[#303030]">
        Section {section.id}
      </h2>

      <div className="mt-[32px]">
        <h3 className="font-paper text-[18px] font-semibold leading-[1.6] text-[#303030]">
          {title}
        </h3>

        <p className="font-paper text-[16px] italic leading-[1.6] text-[#303030]">
          {section.instruction}
        </p>

        <div className="mt-[28px] space-y-0">
          {section.questions.map(question => (
            <QuestionItem key={question.number} question={question} />
          ))}
        </div>
      </div>
    </section>
  );
}
