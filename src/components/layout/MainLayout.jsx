import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "../common/CommandPalette";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#eef2f7] dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">

      {/* 🔮 MAGIC COMMAND PALETTE */}
      <CommandPalette />

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - off-canvas on mobile, fixed on large screens */}
      <div className={`fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0 transition-all duration-300">

        {/* Topbar */}
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content with Scaling & Spacing */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 transition-all overflow-x-hidden">
          <div className="w-full">
            {children}
          </div>
        </div>

      </div>

    </div>
  );
}