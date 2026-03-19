"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#E6E8EB] overflow-hidden font-sans">
      
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      
    </div>
  );
}