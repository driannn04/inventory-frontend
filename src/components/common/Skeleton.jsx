import React from "react";
import { motion } from "framer-motion";

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="w-full animate-pulse transition-all">
      <table className="w-full text-left min-w-[700px]">
        <thead className="border-b border-slate-50 dark:border-slate-800">
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={`th-${i}`} className="px-8 py-5">
                <div className="h-3 bg-slate-200 dark:bg-slate-700/50 rounded-full w-1/2"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {[...Array(rows)].map((_, r) => (
            <tr key={`tr-${r}`}>
              {[...Array(columns)].map((_, c) => (
                <td key={`td-${r}-${c}`} className="px-8 py-5">
                  {(c === 1 || c === 4) ? (
                    // Spesial untuk kolom yang lebih panjang (Barang/Sumber)
                    <div className="flex flex-col gap-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded-lg w-3/4"></div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800/60 rounded-full w-1/3"></div>
                    </div>
                  ) : c === columns - 1 ? (
                    // Spesial untuk kolom Aksi
                    <div className="flex justify-center">
                       <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                    </div>
                  ) : (
                    // Kolom normal
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/80 rounded-lg w-full"></div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="w-full flex gap-3 animate-pulse">
      <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex-1"></div>
      <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl w-32 hidden md:block"></div>
    </div>
  );
}

export function ListBarangSkeleton() {
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-2 bg-white dark:bg-slate-900 animate-pulse space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
           <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
           <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
        </div>
      ))}
    </div>
  );
}
