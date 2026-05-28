"use client";

import { create } from "zustand";
import type { QuestionTypeConfig } from "@/types";

const defaultRows: QuestionTypeConfig[] = [
  {
    type: "mcq",
    label: "Multiple Choice Questions",
    count: 4,
    marks: 1
  },
  {
    type: "short",
    label: "Short Questions",
    count: 3,
    marks: 2
  },
  {
    type: "diagram",
    label: "Diagram/Graph-Based Questions",
    count: 5,
    marks: 5
  },
  {
    type: "numerical",
    label: "Numerical Problems",
    count: 5,
    marks: 5
  }
];

type CreateFormData = {
  title: string;
  dueDate: string;
  fileUrl: string;
  fileName: string;
  additionalInfo: string;
};

type CreateFormStore = CreateFormData & {
  step: 1 | 2;
  questionTypes: QuestionTypeConfig[];
  setField: <K extends keyof CreateFormData>(
    key: K,
    value: CreateFormData[K]
  ) => void;
  setStep: (step: 1 | 2) => void;
  setQuestionTypes: (rows: QuestionTypeConfig[]) => void;
  reset: () => void;
};

export const useCreateFormStore = create<CreateFormStore>(set => ({
  step: 1,
  title: "Quiz on Electricity",
  dueDate: "",
  fileUrl: "",
  fileName: "",
  questionTypes: defaultRows,
  additionalInfo:
    "Subject: Science. Class: 10. Topic: Electricity. Include conceptual and numerical questions.",

  setField: (key, value) =>
    set({
      [key]: value
    } as Pick<CreateFormData, typeof key>),

  setStep: step => set({ step }),

  setQuestionTypes: questionTypes => set({ questionTypes }),

  reset: () =>
    set({
      step: 1,
      title: "Quiz on Electricity",
      dueDate: "",
      fileUrl: "",
      fileName: "",
      questionTypes: defaultRows,
      additionalInfo: ""
    })
}));
