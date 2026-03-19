"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/DashboardLayout";
import GenerationStatus from "@/components/GenerationStatus";
import QuestionPaper from "@/components/QuestionPaper";
import { useAppStore } from "@/lib/store";
import { useWebSocket } from "@/lib/useWebSocket";
import { getAssignment, regenerateAssignment } from "@/lib/api";

export default function AssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const jobStatus = useAppStore((s) => s.jobStatus);
  const generatedPaper = useAppStore((s) => s.generatedPaper);

  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useWebSocket(id);

  useEffect(() => {
    useAppStore.getState().setCurrentAssignment(id);
    fetchAssignment();
  }, [id]);

  // Polling fallback every 3s while not terminal
  useEffect(() => {
    const interval = setInterval(() => {
      const current = useAppStore.getState().jobStatus;
      if (current === "completed" || current === "failed") return;

      getAssignment(id)
        .then((data) => {
          if (data.status === "completed" && data.generatedPaper) {
            useAppStore.getState().setGeneratedPaper(data.generatedPaper);
            useAppStore.getState().setJobStatus("completed", "Question paper ready");
          } else if (data.status === "failed") {
            useAppStore.getState().setJobStatus("failed", data.error || "Generation failed");
          } else if (data.status === "processing") {
            useAppStore.getState().setJobStatus("processing", "Generating questions...");
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  async function fetchAssignment() {
    try {
      const data = await getAssignment(id);

      if (data.status === "completed" && data.generatedPaper) {
        useAppStore.getState().setGeneratedPaper(data.generatedPaper);
        useAppStore.getState().setJobStatus("completed", "Question paper ready");
      } else if (data.status === "failed") {
        useAppStore.getState().setJobStatus("failed", data.error || "Generation failed");
      } else if (data.status === "processing") {
        useAppStore.getState().setJobStatus("processing", "Generating questions...");
      } else {
        useAppStore.getState().setJobStatus("queued", "Waiting in queue...");
      }
    } catch {
      toast.error("Failed to load assignment");
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      await regenerateAssignment(id);
      useAppStore.getState().setGeneratedPaper(null);
      useAppStore.getState().setJobStatus("queued", "Regeneration started...");
      toast.success("Regenerating questions...");
    } catch (err: any) {
      toast.error(err.message || "Failed to regenerate");
    } finally {
      setIsRegenerating(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading assignment...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* UPDATED: Removed max-w-4xl and mx-auto, changed to w-full px-8 */}
      <div className="w-full px-8 py-8">
        <button
          onClick={() => router.push("/assignments")}
          className="text-[14px] font-medium text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Assignments
        </button>

        {jobStatus !== "completed" && <GenerationStatus />}

        {jobStatus === "completed" && generatedPaper ? (
          <QuestionPaper
            paper={generatedPaper}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        ) : jobStatus === "failed" ? (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-8 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Something went wrong during generation.
            </p>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
            >
              {isRegenerating ? "Retrying..." : "Try Again"}
            </button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}