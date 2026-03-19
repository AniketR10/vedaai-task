"use client";

import DashboardLayout from "@/components/DashboardLayout";
import AssignmentForm from "@/components/AssignmentForm";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Assessment
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Configure your assessment parameters and let AI generate a
            structured question paper.
          </p>
        </div>
        <AssignmentForm />
      </div>
    </DashboardLayout>
  );
}
