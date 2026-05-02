import React from "react";
import { motion } from "framer-motion";

/**
 * 🌊 Aqua Shimmer Animation Overlay
 */
const ShimmerOverlay = () => (
  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-cyan-400/5 to-transparent animate-[shimmer_2s_infinite]" />
);

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full transition-all overflow-hidden relative">
      <table className="w-full text-left min-w-[700px] border-separate border-spacing-y-2">
        <thead className="border-b border-blue-50/50 dark:border-slate-800">
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={`th-${i}`} className="px-8 py-4">
                <div className="h-2.5 bg-blue-100/50 dark:bg-slate-800 rounded-full w-1/2 relative overflow-hidden">
                  <ShimmerOverlay />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, r) => (
            <tr key={`tr-${r}`} className="group">
              {[...Array(columns)].map((_, c) => (
                <td key={`td-${r}-${c}`} className="px-8 py-5 bg-white/40 dark:bg-slate-900/40 first:rounded-l-[1.5rem] last:rounded-r-[1.5rem]">
                  {(c === 1 || c === 4) ? (
                    <div className="flex flex-col gap-2">
                      <div className="h-4 bg-blue-50/80 dark:bg-slate-800/60 rounded-lg w-3/4 relative overflow-hidden">
                        <ShimmerOverlay />
                      </div>
                      <div className="h-2 bg-blue-50/40 dark:bg-slate-800/40 rounded-full w-1/3 relative overflow-hidden">
                        <ShimmerOverlay />
                      </div>
                    </div>
                  ) : c === columns - 1 ? (
                    <div className="flex justify-center">
                       <div className="h-10 w-10 bg-blue-50/60 dark:bg-slate-800 rounded-2xl relative overflow-hidden">
                         <ShimmerOverlay />
                       </div>
                    </div>
                  ) : (
                    <div className="h-4 bg-blue-50/60 dark:bg-slate-800/80 rounded-xl w-full relative overflow-hidden">
                      <ShimmerOverlay />
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="w-full flex gap-4">
      <div className="h-14 bg-white/60 dark:bg-slate-900/60 border border-blue-100/50 dark:border-slate-800 rounded-2xl flex-1 relative overflow-hidden">
        <ShimmerOverlay />
      </div>
      <div className="h-14 bg-white/60 dark:bg-slate-900/60 border border-blue-100/50 dark:border-slate-800 rounded-2xl w-36 hidden md:block relative overflow-hidden">
        <ShimmerOverlay />
      </div>
    </div>
  );
}

export function ListBarangSkeleton() {
  return (
    <div className="border border-blue-100/50 dark:border-slate-800 rounded-3xl p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 flex justify-between items-center bg-blue-50/30 dark:bg-slate-800/50 rounded-2xl relative overflow-hidden">
           <div className="space-y-2 flex-1">
             <div className="h-4 bg-blue-100/50 dark:bg-slate-700 rounded-lg w-1/2 relative overflow-hidden">
                <ShimmerOverlay />
             </div>
             <div className="h-2 bg-blue-50/50 dark:bg-slate-800 rounded-full w-1/4 relative overflow-hidden">
                <ShimmerOverlay />
             </div>
           </div>
           <div className="h-10 bg-blue-100/50 dark:bg-slate-700 rounded-xl w-24 relative overflow-hidden">
              <ShimmerOverlay />
           </div>
        </div>
      ))}
    </div>
  );
}
