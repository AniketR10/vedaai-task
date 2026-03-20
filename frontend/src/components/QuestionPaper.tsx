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
  onRegenerate,
  isRegenerating,
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
      
      <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-4xl p-2 md:p-3 border border-gray-100">
        
        <div className="bg-[#2A2A2A] rounded-3xl p-6 text-white relative">
          <p className="text-[14px] md:text-[15px] font-medium leading-relaxed mb-5 md:mb-6 pr-4">
            Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade {paper.grade} {paper.subject} classes on the NCERT chapters:
          </p>
          
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center justify-center gap-2 bg-[#424242] md:bg-white text-white md:text-black w-10.5 h-10.5 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-full text-[13px] font-bold hover:opacity-80 md:hover:bg-gray-100 transition-colors"
            title="Download as PDF"
          >
            <svg className="w-[4.5 h-4.5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden md:inline">Download as PDF</span>
          </button>
        </div>

        <div
          ref={paperRef}
          className="bg-white rounded-3xl p-6 md:p-14 text-gray-900 font-sans mt-1 md:mt-2"
        >
          <div className="text-center mb-8">
            <h1 className="text-xl md:text-2xl font-bold mb-1">Delhi Public School, Sector-4, Bokaro</h1>
            <p className="text-md md:text-lg font-medium mb-1">Subject: {paper.subject}</p>
            <p className="text-md md:text-lg font-medium">Class: {paper.grade}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-[13px] md:text-[14px] font-bold mb-6 gap-2">
            <span>Time Allowed: {paper.duration || "45 minutes"}</span>
            <span>Maximum Marks: {paper.totalMarks}</span>
          </div>

          <p className="text-[13px] md:text-[14px] font-bold mb-6">
            All questions are compulsory unless stated otherwise.
          </p>

          {/* Student Fields */}
          <div className="space-y-3 text-[13px] md:text-[14px] font-medium mb-10">
            <p>Name: ______________________</p>
            <p>Roll Number: ______________________</p>
            <p>Class: {paper.grade} Section: ________</p>
          </div>

          {paper.sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-10">
              <h2 className="text-center text-lg font-bold mb-4">{section.title}</h2>
              
              {section.instruction && (
                <div className="mb-5">
                  <p className="font-bold text-[13px] md:text-[14px] mb-0.5">{section.title === "Section A" ? "Short Answer Questions" : ""}</p>
                  <p className="text-[12px] md:text-[13px] italic text-gray-700">{section.instruction}</p>
                </div>
              )}

              <div className="space-y-4">
                {section.questions.map((q) => (
                  <div key={q.questionNumber} className="flex gap-2 text-[13px] md:text-[14px] leading-relaxed">
                    <span className="w-5 shrink-0 text-right">{q.questionNumber}.</span>
                    <div className="flex-1">
                      <span>[{DIFFICULTY_LABELS[q.difficulty] || q.difficulty}] </span>
                      <span>{q.text} </span>
                      <span>[{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]</span>

                      {q.options && q.options.length > 0 && (
                        <div className="mt-1.5 ml-2 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[13px]">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx}>
                              {String.fromCharCode(97 + oIdx)}) {opt}
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

          <p className="font-bold text-[13px] md:text-[14px] mb-8 mt-4">End of Question Paper</p>

        </div>
      </div>
    </div>
  );
}