"use client";

import { useAppStore } from "@/lib/store";

export default function GenerationStatus() {
  const { jobStatus, jobProgress, jobMessage } = useAppStore();

  if (jobStatus === "idle") return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        {jobStatus === "processing" || jobStatus === "queued" ? (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-indigo-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : jobStatus === "completed" ? (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900">
            {jobStatus === "queued" && "Queued for Generation"}
            {jobStatus === "processing" && "Generating Questions..."}
            {jobStatus === "completed" && "Generation Complete!"}
            {jobStatus === "failed" && "Generation Failed"}
          </h3>
          {jobMessage && (
            <p className="text-sm text-gray-500 mt-0.5">{jobMessage}</p>
          )}
        </div>
      </div>

      {(jobStatus === "processing" || jobStatus === "queued") && (
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${jobProgress || 10}%` }}
          />
        </div>
      )}
    </div>
  );
}
