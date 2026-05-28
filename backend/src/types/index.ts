export type Difficulty = "easy" | "moderate" | "hard";

export type JobStatus =
  | "pending"
  | "queued"
  | "processing"
  | "done"
  | "failed";

export type QuestionType =
  | "mcq"
  | "short"
  | "diagram"
  | "numerical"
  | "custom";

export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  count: number;
  marks: number;
}

export interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInfo?: string;
  fileUrl?: string;
  status: JobStatus;
  jobId?: string;
  createdAt: string;
}

export interface Question {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export interface AnswerKeyItem {
  number: number;
  answer: string;
}

export interface Result {
  _id: string;
  assignmentId: string;
  title: string;
  school: string;
  subject: string;
  className: string;
  timeAllowed: number;
  totalMarks: number;
  sections: Section[];
  answerKey: AnswerKeyItem[];
  generatedAt: string;
}

export interface WSEvent {
  event: "job:queued" | "job:processing" | "job:done" | "job:failed";
  jobId: string;
  assignmentId?: string;
  resultId?: string;
  progress?: number;
  error?: string;
}
