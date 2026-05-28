import { z } from "zod";
import OpenAI from "openai";
import { env } from "../config/env";

const QuestionSchema = z.object({
  number: z.number().int().positive(),
  text: z.string().min(5),
  difficulty: z.enum(["easy", "moderate", "hard"]),
  marks: z.number().positive()
});

const SectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(QuestionSchema).min(1)
});

const AnswerKeySchema = z.object({
  number: z.number().int().positive(),
  answer: z.string().min(1)
});

export const LLMResultSchema = z.object({
  title: z.string().min(1),
  school: z.string().min(1),
  subject: z.string().min(1),
  className: z.string().min(1),
  timeAllowed: z.number().positive(),
  totalMarks: z.number().positive(),
  sections: z.array(SectionSchema).min(1),
  answerKey: z.array(AnswerKeySchema).min(1)
});

type LLMResult = z.infer<typeof LLMResultSchema>;

const openai = new OpenAI({
  apiKey: env.LLM_API_KEY,
  baseURL: env.LLM_BASE_URL
});

function isMcqLabel(label: string) {
  return /multiple\s*choice|mcq/i.test(label);
}

function hasFourMcqOptions(text: string) {
  return (
    /\(a\)\s+\S/i.test(text) &&
    /\(b\)\s+\S/i.test(text) &&
    /\(c\)\s+\S/i.test(text) &&
    /\(d\)\s+\S/i.test(text)
  );
}

function validateSemanticContract(result: LLMResult) {
  for (const section of result.sections) {
    const isMcqSection = isMcqLabel(section.title);

    if (!isMcqSection) continue;

    for (const question of section.questions) {
      if (!hasFourMcqOptions(question.text)) {
        throw new Error(
          `MCQ question ${question.number} is missing four options: (a), (b), (c), (d)`
        );
      }
    }

    for (const question of section.questions) {
      const answer = result.answerKey.find(item => item.number === question.number);

      if (!answer || !/^\([a-d]\)/i.test(answer.answer.trim())) {
        throw new Error(
          `MCQ answer ${question.number} must start with an option letter like "(b) Answer"`
        );
      }
    }
  }

  return result;
}

export function buildPrompt(assignment: any) {
  const questionPlan = assignment.questionTypes
    .map((q: any) => {
      const extra = isMcqLabel(q.label)
        ? " IMPORTANT: Every question in this type MUST include exactly four options on separate lines: (a), (b), (c), (d)."
        : "";

      return `- ${q.label}: ${q.count} questions, ${q.marks} marks each.${extra}`;
    })
    .join("\n");

  const totalMarks = assignment.questionTypes.reduce(
    (sum: number, q: any) => sum + q.count * q.marks,
    0
  );

  const totalQuestions = assignment.questionTypes.reduce(
    (sum: number, q: any) => sum + q.count,
    0
  );

  return `
You are an expert school assessment designer.

Return ONLY valid JSON. No markdown. No explanation. No text outside JSON.

Create a polished academic question paper.

Rules:
- Match the requested question plan exactly.
- Generate exactly ${totalQuestions} questions.
- Group questions into logical sections based on question type.
- Preserve the question type order from the Question Plan.
- If the question type is Multiple Choice Questions or MCQ, every question text MUST include exactly four options on separate lines:
  (a) option
  (b) option
  (c) option
  (d) option
- For MCQ questions, the answerKey answer MUST start with the correct option letter, for example "(b) Ampere".
- For non-MCQ questions, do NOT add MCQ options.
- Every question must have number, text, difficulty, and marks.
- difficulty must be one of: easy, moderate, hard.
- Use "easy", "moderate", and "hard" only in the JSON difficulty field.
- Include a complete answerKey with one answer per question.
- Make questions exam-ready, clear, and age-appropriate.
- Do not create duplicate question numbers.
- totalMarks must equal ${totalMarks}.
- timeAllowed should be 45 unless the additional instructions explicitly specify exam duration.
- school should be "Delhi Public School, Sector-4, Bokaro" unless the instructions specify another school.

Assignment:
Title: ${assignment.title}
Due Date: ${assignment.dueDate}

Question Plan:
${questionPlan}

Additional Instructions:
${assignment.additionalInfo || "None"}

Return JSON in this exact shape:
{
  "title": "string",
  "school": "Delhi Public School, Sector-4, Bokaro",
  "subject": "string",
  "className": "string",
  "timeAllowed": 45,
  "totalMarks": ${totalMarks},
  "sections": [
    {
      "id": "A",
      "title": "Multiple Choice Questions",
      "instruction": "Choose the correct option for each of the following questions. Each question carries 1 mark.",
      "questions": [
        {
          "number": 1,
          "text": "Which of the following is the SI unit of electric current?\\n(a) Volt\\n(b) Ampere\\n(c) Ohm\\n(d) Watt",
          "difficulty": "easy",
          "marks": 1
        }
      ]
    }
  ],
  "answerKey": [
    {
      "number": 1,
      "answer": "(b) Ampere"
    }
  ]
}
`;
}

export async function callLLM(prompt: string) {
  const response = await openai.chat.completions.create({
    model: env.LLM_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You generate only strict JSON for academic question papers. Never return markdown or explanations. For MCQs, always include exactly four options labelled (a), (b), (c), and (d)."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.25,
    response_format: {
      type: "json_object"
    }
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("LLM returned empty response");
  }

  return content;
}

export function parseResponse(raw: string) {
  const json = JSON.parse(raw);
  const parsed = LLMResultSchema.parse(json);
  return validateSemanticContract(parsed);
}
