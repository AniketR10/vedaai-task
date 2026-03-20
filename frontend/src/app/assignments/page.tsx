"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getAssignments, deleteAssignment } from "@/lib/api";
import toast from "react-hot-toast";
import { Assignment } from "@/lib/store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/ws";

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getAssignments()
      .then(setAssignments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ws for real-time status updates
  useEffect(() => {
    const activeIds = assignments
      .filter((a) => a.status === "pending" || a.status === "processing")
      .map((a) => a._id);

    if (activeIds.length === 0) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const ws = new WebSocket(`${WS_URL}?assignmentId=${activeIds[0]}`);
    wsRef.current = ws;

    ws.onopen = () => {
      activeIds.forEach((id) => {
        ws.send(JSON.stringify({ type: "subscribe", assignmentId: id }));
      });
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const id = msg.assignmentId;
        if (!id) return;

        if (msg.type === "job_complete") {
          setAssignments((prev) =>
            prev.map((a) => (a._id === id ? { ...a, status: "completed" } : a))
          );
        } else if (msg.type === "job_error") {
          setAssignments((prev) =>
            prev.map((a) => (a._id === id ? { ...a, status: "failed" } : a))
          );
        } else if (msg.data?.status) {
          setAssignments((prev) =>
            prev.map((a) => (a._id === id ? { ...a, status: msg.data.status } : a))
          );
        }
      } catch {}
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [assignments]);

  async function handleDelete(id: string) {
    setOpenMenu(null);
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Assignment deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-64px)] bg-linear-to-r flex flex-col from-[#c0c3cb] via-[#E6E8EB] to-[#E6E8EB] from-0% via-5% to-5% relative pb-32">
        {loading ? (
          <div className="flex items-center justify-center h-full pt-32 flex-1">
            <svg className="w-8 h-8 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : assignments.length === 0 ? (
          
          /* ========== UPDATED EMPTY STATE ========== */
          <div className="flex flex-col items-center justify-center flex-1 px-4 mt-8">
            
            {/* Custom Empty State Illustration */}
            <div className="relative w-70 h-60 flex items-center justify-center mb-6">
              
              {/* Background Decor */}
              <svg className="absolute top-12 left-6 w-10.5 h-10.5 text-[#1F2A37]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 10 70 C 10 40, 50 30, 40 60 C 35 75, 15 70, 25 50 C 35 30, 70 30, 80 10" />
              </svg>
              
              <svg className="absolute bottom-12 left-12 w-5 h-5 text-[#60A5FA]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2z" />
              </svg>
              
              <div className="absolute bottom-20 right-10 w-1.75 h-1.75 rounded-full bg-[#5282CA]" />

              <div className="absolute top-8 right-14 w-13 h-6.5 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center px-2.5 gap-2 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#B29EF8]" />
                <div className="h-2 w-5 bg-gray-200 rounded-full" />
              </div>

              {/* Main Document */}
              <div className="relative w-32 h-44 bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-gray-100 p-5 flex flex-col gap-3.5 z-0">
                <div className="w-10 h-2.5 bg-[#17202A] rounded-full" />
                <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full" />
                <div className="w-4/5 h-2.5 bg-[#E2E8F0] rounded-full" />
                <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full" />
                <div className="w-3/5 h-2.5 bg-[#E2E8F0] rounded-full" />
              </div>

              <div className="absolute right-12 bottom-6 z-20">
                <div className="relative w-25 h-25 rounded-full border-8 border-[#E8E6F3] bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <svg className="w-12 h-12 text-[#FE4B4B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div className="absolute -bottom-8.5 -right-5.5 w-6.5 h-16 bg-[#E8E6F3] rounded-full -rotate-40 origin-top-left" />
                </div>
              </div>
            </div>

            <h2 className="text-[17px] font-bold text-gray-900 mb-2">No assignments yet</h2>
            <p className="text-[13px] text-[#71717A] font-medium text-center max-w-105 mb-8 leading-[1.6]">
              Create your first assignment to start collecting and grading student
              submissions. You can set up rubrics, define marking criteria, and let AI
              assist with grading.
            </p>

            <Link
              href="/"
              className="bg-[#18181B] text-white px-7 py-3 rounded-full font-bold text-[13.5px] flex items-center gap-2 hover:bg-black transition-all shadow-md hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Assignment
            </Link>
          </div>          
        ) : (
          
          <div className="px-8 py-8 flex-1">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">Assignments</h2>
              </div>
              <p className="text-[15px] text-gray-400 font-medium ml-4.5">
                Manage and create assignments for your classes.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white px-5 py-3 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <button className="inline-flex items-center gap-2 text-[15px] font-medium text-gray-400 hover:text-gray-800 transition-colors shrink-0 pl-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filter By
              </button>

              <div className="relative w-full sm:w-auto sm:min-w-[320px]">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-5 py-2.5 bg-white border border-gray-200 rounded-full text-[14px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-shadow"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filtered.map((a) => (
                <div
                  key={a._id}
                  className="relative bg-white rounded-3xl border border-gray-100 p-7 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 flex flex-col justify-between min-h-45"
                >
                  <div className="flex justify-between items-start">
                    <Link href={`/assignment/${a._id}`} className="block flex-1 pr-6">
                      <h3 className="text-[22px] font-extrabold text-gray-900 tracking-tight hover:text-gray-600 transition-colors">
                        {a.title}
                      </h3>

                      {(a.status === "pending" || a.status === "processing") && (
                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {a.status === "pending" ? "Queued" : "Generating..."}
                          </span>
                        </div>
                      )}
                      {a.status === "failed" && (
                        <div className="mt-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                            Failed
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenMenu(openMenu === a._id ? null : a._id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>

                      {openMenu === a._id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-20"
                        >
                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              router.push(`/assignment/${a._id}`);
                            }}
                            className="w-full text-left px-5 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            View Assignment
                          </button>
                          <button
                            onClick={() => handleDelete(a._id)}
                            className="w-full text-left px-5 py-2.5 text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    <div className="text-[14px]">
                      <span className="font-extrabold text-gray-900">Assigned on</span>
                      <span className="font-bold text-gray-900"> : </span>
                      <span className="font-medium text-gray-600">{formatDate(a.createdAt)}</span>
                    </div>
                    {a.dueDate && (
                      <div className="text-[14px]">
                        <span className="font-extrabold text-gray-900">Due</span>
                        <span className="font-bold text-gray-900"> : </span>
                        <span className="font-medium text-gray-600">{formatDate(a.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {filtered.length === 0 && search && (
              <div className="text-center py-12 text-gray-500 font-medium">
                No assignments match "{search}"
              </div>
            )}
          </div>
        )}

        {assignments.length > 0 && (
          <div className="fixed bottom-0 right-0 left-0 md:left-70 h-32 bg-linear-to-t from-[#E6E8EB] via-[#E6E8EB]/90 to-transparent pointer-events-none flex items-end justify-center pb-8 z-30">
            <Link
              href="/assignment/create"
              className="pointer-events-auto flex items-center gap-2 bg-[#1A1C1E] hover:bg-black text-white px-7 py-3.5 rounded-full font-medium text-[15px] shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Assignment
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}