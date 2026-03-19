"use client";

import { useRef } from "react";
import { GeneratedPaper } from "@/lib/store";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
};

interface QuestionPaperProps {
  paper: GeneratedPaper;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export default function QuestionPaper({
  paper,
}: QuestionPaperProps) {
  const paperRef = useRef<HTMLDivElement>(null);

  function handleDownloadPDF() {
    if (!paperRef.current) return;

    const printContent = paperRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${paper.title || "Question Paper"}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', Times, serif; color: #000; background: #fff; padding: 40px; }
          
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .text-xl { font-size: 20px; }
          .text-lg { font-size: 18px; }
          .text-sm { font-size: 14px; line-height: 1.5; }
          .text-xs { font-size: 12px; }
          
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mb-6 { margin-bottom: 24px; }
          .mb-8 { margin-bottom: 32px; }
          .mt-6 { margin-top: 24px; }
          .mt-8 { margin-top: 32px; }
          
          .flex-between { display: flex; justify-content: space-between; align-items: center; }
          
          .q-row { display: flex; gap: 8px; margin-bottom: 12px; font-size: 14px; line-height: 1.6; }
          .q-num { min-width: 20px; text-align: right; font-weight: normal; }
          .q-text { flex: 1; }
          
          .italic { font-style: italic; }
          
          @media print {
            body { padding: 0; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  return (
    <div className="w-full pb-20">
      
      <div className="bg-[#2A2A2A] rounded-2xl p-6 mb-6 shadow-md text-white">
        <p className="text-[15px] font-medium leading-relaxed mb-6">
          Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade {paper.grade} {paper.subject} classes on the NCERT chapters:
        </p>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download as PDF
        </button>
      </div>

      <div
        ref={paperRef}
        className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10 md:p-14 text-gray-900 font-sans"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">Delhi Public School, Sector-4, Bokaro</h1>
          <p className="text-lg font-medium mb-1">Subject: {paper.subject}</p>
          <p className="text-lg font-medium">Class: {paper.grade}</p>
        </div>

        <div className="flex justify-between items-center text-[14px] font-bold mb-6">
          <span>Time Allowed: {paper.duration || "45 minutes"}</span>
          <span>Maximum Marks: {paper.totalMarks}</span>
        </div>

        <p className="text-[14px] font-bold mb-6">
          All questions are compulsory unless stated otherwise.
        </p>

        <div className="space-y-2.5 text-[14px] font-medium mb-10">
          <p>Name: ______________________</p>
          <p>Roll Number: ______________________</p>
          <p>Class: {paper.grade} Section: ________</p>
        </div>

        {paper.sections.map((section, sIdx) => (
          <div key={sIdx} className="mb-10">
            <h2 className="text-center text-lg font-bold mb-4">{section.title}</h2>
            
            {section.instruction && (
              <div className="mb-4">
                <p className="font-bold text-[14px] mb-0.5">{section.title === "Section A" ? "Short Answer Questions" : ""}</p>
                <p className="text-[13px] italic text-gray-700">{section.instruction}</p>
              </div>
            )}

            <div className="space-y-3">
              {section.questions.map((q) => (
                <div key={q.questionNumber} className="flex gap-2 text-[14px] leading-relaxed">
                  <span className="w-5 shrink-0 text-right">{q.questionNumber}.</span>
                  <div className="flex-1">
                    <span>[{DIFFICULTY_LABELS[q.difficulty] || q.difficulty}] </span>
                    <span>{q.text} </span>
                    <span>[{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]</span>

                    {q.options && q.options.length > 0 && (
                      <div className="mt-1 ml-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[13px]">
                        {q.options.map((opt, oIdx) => (
                          <span key={oIdx}>
                            {String.fromCharCode(97 + oIdx)} {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="font-bold text-[14px] mb-8 mt-2 text-center">End of Question Paper</p>

      </div>
    </div>
  );
}