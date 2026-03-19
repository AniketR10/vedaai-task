"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-70 h-[calc(100vh-32px)] my-4 ml-4 bg-white rounded-4xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col p-5 relative z-40 shrink-0">
      
      <div className="flex items-center gap-3 px-3 pt-2 mb-8">
        <img 
          decoding="auto" 
          src="https://framerusercontent.com/images/3Cq5t9KRqg77eLpJOhnQR0KZ558.png?width=160&height=160" 
          alt="VedaAI Logo"
          className="w-8 h-8 object-contain shrink-0"
        />
        <span className="text-[22px] font-extrabold tracking-tight text-gray-900">
          VedaAI
        </span>
      </div>

      <div className="px-1 mb-8">
        <Link 
          href="/"
          className="w-full bg-[#27292D] border-2 border-[#E95C3F] hover:bg-black text-white rounded-full py-3.5 px-4 items-center justify-center gap-2 text-[15px] font-semibold transition-all shadow-sm block text-center"
        >
          <svg className="inline-block" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18M3 12h18" />
            <path d="m19 5-2 2M5 19l2-2" />
          </svg>
          Create Assignment
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 px-1">
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-colors ${
            pathname === "/" ? "bg-[#F4F4F5] text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
          </svg>
          Home
        </Link>

        <Link 
          href="/groups" 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-colors ${
            pathname?.startsWith("/groups") ? "bg-[#F4F4F5] text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          My Groups
        </Link>

        <Link 
          href="/assignments" 
          className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-colors ${
            pathname?.startsWith("/assignments") ? "bg-[#F4F4F5] text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-3 text-[15px] font-medium transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span className={pathname?.startsWith("/assignments") ? "font-bold text-gray-900" : ""}>Assignments</span>
          </div>
          <span className="bg-[#FF5A36] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
            10
          </span>
        </Link>

        <Link 
          href="/toolkit" 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-colors ${
            pathname?.startsWith("/toolkit") ? "bg-[#F4F4F5] text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          AI Teacher's Toolkit
        </Link>

        <Link 
          href="/library" 
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-colors ${
            pathname?.startsWith("/library") ? "bg-[#F4F4F5] text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
          My Library
        </Link>
      </nav>

      <div className="mt-auto pt-2 px-1">
        <Link 
          href="/settings" 
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-colors mb-3 ${
            pathname?.startsWith("/settings") ? "bg-[#F4F4F5] text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Settings
        </Link>

        <div className="bg-[#F4F4F5] rounded-[22px] p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-200/50 transition-colors">
          <div className="w-10.5 h-10.5 rounded-full bg-[#FFE3D6] flex items-center justify-center shrink-0 overflow-hidden border border-white">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" fill="#D97757"/>
              <path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" fill="#D97757"/>
            </svg>
          </div>
          
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] font-extrabold text-gray-900 truncate tracking-tight">
              Delhi Public School
            </span>
            <span className="text-[12px] text-gray-500 font-medium truncate mt-0.5">
              Bokaro Steel City
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}