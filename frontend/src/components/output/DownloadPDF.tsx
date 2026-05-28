"use client";

import { Download } from "lucide-react";
import { downloadPdf } from "@/lib/api";

type Props = {
  assignmentId: string;
};

export function DownloadPDF({ assignmentId }: Props) {
  async function handleDownload() {
    try {
      const blob = await downloadPdf(assignmentId);
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "assignment-question-paper.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch {
      alert("PDF export will be enabled in the next phase.");
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[16px] font-medium leading-[1.4] tracking-[-0.64px] text-[#303030]"
    >
      <Download size={18} />
      Download as PDF
    </button>
  );
}
