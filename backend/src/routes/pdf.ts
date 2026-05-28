import { Router } from "express";
import { AssignmentModel } from "../models/Assignment";
import { ResultModel } from "../models/Result";
import { redis } from "../config/redis";

const router = Router();

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMultiline(value: unknown) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function cleanClassName(value: string) {
  return value.replace(/^Class\s*/i, "");
}

function difficultyLabel(value: string) {
  if (value === "easy") return "Easy";
  if (value === "moderate") return "Moderate";
  return "Challenging";
}

function marksLabel(marks: number) {
  return marks === 1 ? "1 Mark" : `${marks} Marks`;
}

function cleanSectionTitle(title: string, sectionId: string) {
  return title
    .replace(new RegExp(`^Section\\s+${sectionId}\\s*:?\\s*`, "i"), "")
    .replace(/^Section\s+[A-Z]\s*:\s*/i, "")
    .trim();
}

function buildPdfHtml(result: any) {
  const className = cleanClassName(result.className);

  const sectionsHtml = result.sections
    .map((section: any) => {
      const title = cleanSectionTitle(section.title, section.id);

      const questionsHtml = section.questions
        .map((question: any) => {
          return `
            <div class="question">
              <span class="q-number">${question.number}.</span>
              <div class="q-body">
                <span>[${difficultyLabel(question.difficulty)}]</span>
                <span>${formatMultiline(question.text)}</span>
                <span>[${marksLabel(question.marks)}]</span>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <section class="section">
          <h2>Section ${escapeHtml(section.id)}</h2>

          <div class="section-body">
            <h3>${escapeHtml(title)}</h3>
            <p class="instruction">${escapeHtml(section.instruction)}</p>

            <div class="questions">
              ${questionsHtml}
            </div>
          </div>
        </section>
      `;
    })
    .join("");

  const answerKeyHtml = result.answerKey
    .map((item: any) => {
      return `
        <div class="answer">
          <span class="answer-number">${item.number}.</span>
          <div>${formatMultiline(item.answer)}</div>
        </div>
      `;
    })
    .join("");

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(result.title)}</title>

  <style>
    @page {
      size: A4;
      margin: 15mm 14mm 15mm 14mm;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: white;
      color: #303030;
      font-family: Inter, Arial, Helvetica, sans-serif;
    }

    body {
      font-size: 12px;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
    }

    .paper {
      width: 100%;
      background: white;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .school {
      margin: 0;
      font-size: 25px;
      line-height: 1.55;
      font-weight: 800;
      letter-spacing: -0.75px;
    }

    .meta {
      margin: 2px 0 0;
      font-size: 18px;
      line-height: 1.45;
      font-weight: 700;
    }

    .time-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 32px;
      font-size: 13px;
      line-height: 1.6;
      font-weight: 700;
    }

    .general {
      margin-top: 24px;
      font-size: 13px;
      line-height: 1.6;
      font-weight: 700;
    }

    .student-info {
      margin-top: 24px;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.75;
    }

    .section {
      margin-top: 34px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .section h2 {
      margin: 0;
      text-align: center;
      font-size: 18px;
      line-height: 1.6;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .section-body {
      margin-top: 24px;
    }

    .section h3 {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      font-weight: 700;
    }

    .instruction {
      margin: 0;
      font-size: 12px;
      line-height: 1.6;
      font-style: italic;
    }

    .questions {
      margin-top: 18px;
    }

    .question {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin: 0 0 7px;
      font-size: 11.3px;
      line-height: 1.7;
      font-weight: 400;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .q-number,
    .answer-number {
      flex: 0 0 auto;
    }

    .q-body {
      flex: 1;
    }

    .end {
      margin-top: 30px;
      font-size: 11.3px;
      line-height: 1.7;
      font-weight: 700;
    }

    .answer-key {
      margin-top: 28px;
      break-before: auto;
    }

    .answer-key h3 {
      margin: 0 0 12px;
      font-size: 15px;
      line-height: 1.55;
      font-weight: 800;
    }

    .answer {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 5px;
      font-size: 10.2px;
      line-height: 1.5;
      break-inside: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>

<body>
  <main class="paper">
    <header class="header">
      <h1 class="school">${escapeHtml(result.school)}</h1>
      <p class="meta">Subject: ${escapeHtml(result.subject)}</p>
      <p class="meta">Class: ${escapeHtml(className)}</p>
    </header>

    <div class="time-row">
      <p>Time Allowed: ${escapeHtml(result.timeAllowed)} minutes</p>
      <p>Maximum Marks: ${escapeHtml(result.totalMarks)}</p>
    </div>

    <p class="general">All questions are compulsory unless stated otherwise.</p>

    <div class="student-info">
      <div>Name: ______________________</div>
      <div>Roll Number: ________________</div>
      <div>Class: ${escapeHtml(className)} Section: __________</div>
    </div>

    ${sectionsHtml}

    <p class="end">End of Question Paper</p>

    <section class="answer-key">
      <h3>Answer Key:</h3>
      ${answerKeyHtml}
    </section>
  </main>
</body>
</html>
`;
}

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `pdf:${id}:v5`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      const cachedBuffer = Buffer.from(cached, "base64");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="assignment-question-paper.pdf"'
      );
      res.setHeader("Content-Length", cachedBuffer.length);

      return res.send(cachedBuffer);
    }

    const assignment = await AssignmentModel.findById(id).lean();

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found"
      });
    }

    const result = await ResultModel.findOne({
      assignmentId: id
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!result) {
      return res.status(404).json({
        message: "Generated result not found"
      });
    }

    const { default: puppeteer } = await import("puppeteer");

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.setContent(buildPdfHtml(result), {
      waitUntil: "domcontentloaded"
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
    });

    await browser.close();

    const pdfBuffer = Buffer.from(pdf);

    await redis.setex(cacheKey, 600, pdfBuffer.toString("base64"));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="assignment-question-paper.pdf"'
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation failed", error);

    return res.status(500).json({
      message: "Failed to generate PDF"
    });
  }
});

export default router;
