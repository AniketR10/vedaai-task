"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#E6E8EB] overflow-hidden font-sans">
      
      <Sidebar />

<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-linear-to-r from-[#ccced3] via-[#E6E8EB] to-[#E6E8EB] via-15%">        
        <div className="hidden md:block">
          <TopBar />
        </div>

        <div className="md:hidden pt-4 px-4 shrink-0 z-40 relative">
          <div className="bg-white rounded-full px-5 py-3.5 flex items-center justify-between shadow-sm border border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#FF6B00] to-[#B32400] flex items-center justify-center shrink-0 shadow-sm">
                <img 
                  src="https://framerusercontent.com/images/3Cq5t9KRqg77eLpJOhnQR0KZ558.png?width=160&height=160" 
                  alt="VedaAI Logo" 
                  className="w-7 h-7 object-contain" 
                />
              </div>
              <span className="text-[18px] font-extrabold tracking-tight text-gray-900">VedaAI</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative text-gray-600 hover:text-black">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="absolute top-0 right-0.5 w-2 h-2 bg-[#FF5A36] border-2 border-white rounded-full"></span>
              </button>
              
              <Link href="/" className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
              </Link>
              
              <button className="text-gray-600 hover:text-black shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto pb-32 md:pb-0">
          {children}
        </main>

        <div className="md:hidden fixed bottom-28 right-6 z-50">
          <Link href="/" className="w-13 h-13 bg-white rounded-full shadow-xl flex items-center justify-center text-[#FF5A36] border border-gray-100 hover:scale-105 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Link>
        </div>

        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
          <div className="bg-[#1A1C1E] rounded-full px-6 py-4 flex items-center justify-between shadow-2xl">
            
            <Link href="/" className="flex flex-col items-center gap-1 min-w-15">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname === "/" ? "white" : "#6b7280"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              </svg>
              <span className={`text-[11px] font-medium ${pathname === "/" ? "text-white font-bold" : "text-gray-500"}`}>Home</span>
            </Link>

            <div className="flex flex-col items-center gap-1 min-w-15 cursor-default">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname?.startsWith("/groups") ? "white" : "#6b7280"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className={`text-[11px] font-medium ${pathname?.startsWith("/groups") ? "text-white font-bold" : "text-gray-500"}`}>My Groups</span>
            </div>

            <Link href="/assignments" className="flex flex-col items-center gap-1 min-w-15">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname?.startsWith("/assignment") ? "white" : "#6b7280"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span className={`text-[11px] font-medium ${pathname?.startsWith("/assignment") ? "text-white font-bold" : "text-gray-500"}`}>Library</span>
            </Link>

            <div className="flex flex-col items-center gap-1 min-w-15 cursor-default">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pathname?.startsWith("/toolkit") ? "white" : "#6b7280"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
              <span className={`text-[11px] font-medium ${pathname?.startsWith("/toolkit") ? "text-white font-bold" : "text-gray-500"}`}>AI Toolkit</span>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}