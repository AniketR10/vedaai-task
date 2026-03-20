"use client";

import { usePathname, useRouter } from "next/navigation";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Create Assessment",
  "/assignments": "Assignments",
  "/groups": "My Groups",
  "/library": "My Library",
  "/toolkit": "AI Teacher's Toolkit",
};

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Dynamic Title Logic
  let title = ROUTE_TITLES[pathname] || "Dashboard";
  if (pathname.startsWith("/assignment/")) {
    title = pathname.includes("create") ? "Create Assessment" : "Assignment Details";
  }

  return (
    // Floating, slimmer header. Sticky top-4 keeps the gap when scrolling.
    <header className="hidden md:flex items-center justify-between bg-white rounded-full px-5 py-2.5 mt-4 mx-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-200 sticky top-4 z-40 shrink-0">
      
      {/* Left side: Back button + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1"></div>

        <div className="flex items-center gap-2.5 text-gray-700">
          <svg className="w-4.5 h-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
          </svg>
          <h1 className="text-[14.5px] font-semibold text-gray-800">{title}</h1>
        </div>
      </div>

      {/* Right side: Notifications + Profile */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <button className="relative p-1.5 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5A36] border-[1.5px] border-white rounded-full" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1"></div>

        {/* Profile (Removed redundant JD text circle) */}
        <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity pl-1">
          <img 
            src="https://i.pravatar.cc/150?img=11" 
            alt="John Doe" 
            className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" 
          />
          <span className="text-[14px] font-bold text-gray-800">John Doe</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5-7.5-7.5-7.5" />
          </svg>
        </div>
        
      </div>
    </header>
  );
}