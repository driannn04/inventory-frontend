import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "../common/CommandPalette";

export default function MainLayout({ children }) {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* 🔮 MAGIC COMMAND PALETTE */}
      <CommandPalette />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 z-50">
        <Sidebar />
      </div>

      {/* Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* Topbar */}
        <Topbar />

        {/* Page Content with Scaling & Spacing */}
        <div className="flex-1 p-6 md:p-10 lg:p-12 transition-all">
          <div className="max-w-[1500px] mx-auto w-full">
            {children}
          </div>
        </div>

      </div>

    </div>
  );
}