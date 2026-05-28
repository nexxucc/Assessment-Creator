"use client";

import type { Assignment, Result } from "@/types";
import { Section } from "./Section";
import { AnswerKey } from "./AnswerKey";
import { DownloadPDF } from "./DownloadPDF";
import { RegenerateBtn } from "@/components/ui/RegenerateBtn";

type Props = {
  assignment: Assignment;
  result: Result;
};

function displayClass(className: string) {
  return className.replace(/^Class\s*/i, "");
}

export function QuestionPaper({ assignment, result }: Props) {
  return (
    <div className="mx-auto w-full max-w-[1100px] rounded-[32px] bg-[#5E5E5E] p-5">
      <div className="mb-3 rounded-[32px] bg-[rgba(24,24,24,0.8)] px-8 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="max-w-[720px] text-[20px] font-bold leading-[1.4] tracking-[-0.8px] text-white">
              Certainly! Here is your customized Question Paper for your{" "}
              {result.className} {result.subject} class based on the selected
              requirements:
            </p>

            <div className="mt-5">
              <DownloadPDF assignmentId={assignment._id} />
            </div>
          </div>

          <RegenerateBtn assignmentId={assignment._id} />
        </div>
      </div>

      <article className="paper-font min-h-[1300px] rounded-[32px] bg-white px-8 py-8 text-[#303030]">
        <header className="text-center">
          <h1 className="font-paper text-[32px] font-bold leading-[1.6] tracking-[-0.96px] text-[#303030]">
            {result.school}
          </h1>

          <p className="font-paper text-[24px] font-semibold leading-[1.6] text-[#303030]">
            Subject: {result.subject}
          </p>

          <p className="font-paper text-[24px] font-semibold leading-[1.6] text-[#303030]">
            Class: {displayClass(result.className)}
          </p>
        </header>

        <div className="mt-[52px] flex items-center justify-between font-paper text-[18px] font-semibold leading-[1.6] text-[#303030]">
          <p>Time Allowed: {result.timeAllowed} minutes</p>
          <p>Maximum Marks: {result.totalMarks}</p>
        </div>

        <p className="mt-[36px] font-paper text-[18px] font-semibold leading-[1.6] text-[#303030]">
          All questions are compulsory unless stated otherwise.
        </p>

        <div className="mt-[36px] font-paper text-[18px] font-semibold leading-[1.6] text-[#303030]">
          <p>Name: ______________________</p>
          <p>Roll Number: ________________</p>
          <p>
            Class: {displayClass(result.className)} Section: __________
          </p>
        </div>

        {result.sections.map(section => (
          <Section key={section.id} section={section} />
        ))}

        <p className="mt-[28px] font-paper text-[16px] font-bold leading-[2.4] text-[#303030]">
          End of Question Paper
        </p>

        <AnswerKey answerKey={result.answerKey} />
      </article>
    </div>
  );
}
