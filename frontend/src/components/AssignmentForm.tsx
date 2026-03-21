"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppStore, QuestionTypeConfig } from "@/lib/store";
import { createAssignment } from "@/lib/api";

const QUESTION_TYPE_LABELS: Record<QuestionTypeConfig["type"], string> = {
  mcq: "Multiple Choice Questions",
  short_answer: "Short Questions",
  long_answer: "Long Answer",
  true_false: "True / False",
  fill_in_blank: "Fill in the Blank",
};

export default function AssignmentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    form,
    setFormField,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    resetForm,
    setCurrentAssignment,
    setJobStatus,
  } = useAppStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (!form.file && (!form.additionalInstructions || !form.additionalInstructions.trim())) {
      newErrors.source = "Source material required";
    }

    if (form.questionTypes.length === 0) {
      newErrors.questionTypes = "At least one question type is required";
    }

    form.questionTypes.forEach((qt, i) => {
      if (qt.count < 1) newErrors[`qt_count_${i}`] = "Count must be at least 1";
      if (qt.marks < 1) newErrors[`qt_marks_${i}`] = "Marks must be at least 1";
    });

    if (Object.keys(newErrors).length > 0) {
      if (newErrors.source) {
        toast.error("Please upload a file or provide instructions.");
      } else if (newErrors.dueDate) {
        toast.error("Please select a Due Date.");
      } else if (newErrors.questionTypes) {
        toast.error("Please add at least one question type.");
      } else {
        toast.error("Please ensure all question counts and marks are at least 1.");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const payload = {
        title: form.title || "Untitled Assignment",
        subject: form.subject || "General",
        grade: form.grade || "10",
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : new Date().toISOString(),
        questionTypes: form.questionTypes,
        totalMarks: form.totalMarks || 100,
        difficulty: form.difficulty || "medium",
        additionalInstructions: form.additionalInstructions,
      };
      formData.append("data", JSON.stringify(payload));
      if (form.file) {
        formData.append("file", form.file);
      }

      const result = await createAssignment(formData);
      setCurrentAssignment(result.id);
      setJobStatus("queued", "Assignment created, generating questions...");
      toast.success("Assignment created! Generating questions...");
      resetForm();
      router.push(`/assignment/${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalQuestions = form.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const calculatedMarks = form.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  return (
    <form onSubmit={handleSubmit} className="relative min-h-[calc(100vh-64px)] pb-40">
      
      <div className="max-w-210 mx-auto px-8 pt-6 mb-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Create Assignment</h1>
          </div>
          <p className="text-[15px] text-gray-400 font-medium ml-4.5">
            Set up a new assignment for your students
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 px-4.5 mb-8">
          <div className="h-1.5 flex-1 bg-gray-700 rounded-full"></div>
          <div className="h-1.5 flex-1 bg-gray-200 rounded-full"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-4xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <h2 className="text-[18px] font-bold text-gray-900 mb-1">Assignment Details</h2>
          <p className="text-[14px] text-gray-400 font-medium mb-8">Basic information about your assignment</p>

          {/* Upload Area */}
          <div className="border-2 border-gray-300 rounded-3xl overflow-hidden mb-8 group cursor-pointer hover:border-gray-400 transition-colors relative">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setFormField("file", e.target.files?.[0] || null)}
            />
            <div className="py-14 flex flex-col items-center justify-center bg-white">
              <svg className="w-8 h-8 text-gray-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="font-bold text-gray-900 text-[15px] tracking-tight">
                {form.file ? form.file.name : "Choose a file or drag & drop it here"}
              </p>
              <p className="mt-1 text-gray-400 text-[13px] font-medium">JPEG, PNG, upto 10MB</p>
              <div className="mt-5 bg-gray-50 text-gray-700 border border-gray-200 px-6 py-2.5 rounded-full text-[13px] font-bold tracking-tight">
                Browse Files
              </div>
            </div>
            <div className="border-t-2 border-dashed border-gray-200 bg-[#F8F9FB] py-3.5 text-center">
              <span className="text-gray-400 text-[13.5px] font-medium">Upload images of your preferred document/image</span>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-[14.5px] font-bold text-gray-800 mb-2">Due Date</label>
            <div className="relative">
              <input
                type="date"
                value={form.dueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormField("dueDate", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-medium text-gray-700 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all bg-white cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
            <div className="min-w-125">
              <div className="grid grid-cols-[1fr_auto_120px_120px] gap-4 mb-3 items-center text-gray-600 text-[13.5px] font-bold px-1">
                <div>Question Type</div>
                <div className="w-4"></div>
                <div className="text-center">No. of Questions</div>
                <div className="text-center">Marks</div>
              </div>

              <div className="space-y-3.5">
                {form.questionTypes.map((qt, index) => (
                  <div key={index} className="grid grid-cols-[1fr_auto_120px_120px] gap-4 items-center">
                    
                    <div className="relative border border-gray-200 rounded-xl bg-white overflow-hidden">
                      <select
                        value={qt.type}
                        onChange={(e) => updateQuestionType(index, "type", e.target.value)}
                        className="w-full appearance-none bg-transparent py-3.5 pl-4 pr-10 text-[14px] font-bold text-gray-700 outline-none cursor-pointer"
                      >
                        {Object.entries(QUESTION_TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => removeQuestionType(index)}
                      className="text-gray-400 hover:text-gray-900 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="flex items-center justify-between border border-gray-100 rounded-full px-1.5 py-1.5 bg-[#F9FAFB]">
                      <button 
                        type="button"
                        onClick={() => updateQuestionType(index, "count", Math.max(1, qt.count - 1))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 text-lg font-medium transition-colors"
                      >-</button>
                      <span className="font-extrabold text-[14px] text-gray-900 w-8 text-center">{qt.count}</span>
                      <button 
                        type="button"
                        onClick={() => updateQuestionType(index, "count", qt.count + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 text-lg font-medium transition-colors"
                      >+</button>
                    </div>

                    <div className="flex items-center justify-between border border-gray-100 rounded-full px-1.5 py-1.5 bg-[#F9FAFB]">
                      <button 
                        type="button"
                        onClick={() => updateQuestionType(index, "marks", Math.max(1, qt.marks - 1))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 text-lg font-medium transition-colors"
                      >-</button>
                      <span className="font-extrabold text-[14px] text-gray-900 w-8 text-center">{qt.marks}</span>
                      <button 
                        type="button"
                        onClick={() => updateQuestionType(index, "marks", qt.marks + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 text-lg font-medium transition-colors"
                      >+</button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addQuestionType}
            className="flex items-center gap-2.5 mt-6 text-[14px] font-extrabold text-gray-900 hover:opacity-70 transition-opacity"
          >
            <div className="w-6 h-6 bg-gray-900 text-white flex items-center justify-center rounded-full shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Add Question Type
          </button>
          
          <div className="text-right mt-8 text-[13.5px] text-gray-500 font-medium tracking-tight space-y-0.5">
            <p>Total Questions : <span className="text-gray-900 font-extrabold ml-1">{totalQuestions}</span></p>
            <p>Total Marks : <span className="text-gray-900 font-extrabold ml-1">{calculatedMarks}</span></p>
          </div>

          <div className="mt-8">
            <label className="block text-[14.5px] font-bold text-gray-800 mb-2">Additional Information (For better output)</label>
            <div className="relative">
              <textarea
                value={form.additionalInstructions}
                onChange={(e) => setFormField("additionalInstructions", e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-[14px] font-medium text-gray-700 h-28 resize-none outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all bg-[#F8F9FB] placeholder:text-gray-400"
              />
              <button type="button" className="absolute right-4 bottom-4 text-gray-800 hover:text-black transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-0 md:left-70 h-40 bg-linear-to-t from-[#E6E8EB] via-[#E6E8EB]/95 to-transparent flex items-end justify-between px-8 md:px-20 pb-10 z-30 pointer-events-none">
        
        <button 
          type="button" 
          onClick={() => router.back()}
          className="pointer-events-auto bg-white border border-gray-200 text-gray-900 px-7 py-3 rounded-full font-bold text-[14.5px] flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Previous
        </button>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="pointer-events-auto bg-[#1A1C1E] text-white px-9 py-3 rounded-full font-bold text-[14.5px] flex items-center gap-2 hover:bg-black disabled:opacity-70 transition-all shadow-xl hover:-translate-y-0.5"
        >
          {isSubmitting ? "Generating..." : "Next"} 
          {!isSubmitting && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>

      </div>
    </form>
  );
}