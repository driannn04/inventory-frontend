import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ title, value, icon, color, trend }) {
  const colors = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    sky: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
    green: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    red: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10"
  };

  const iconColors = {
    blue: "bg-blue-600",
    sky: "bg-sky-500",
    green: "bg-emerald-500",
    red: "bg-rose-500",
    amber: "bg-amber-500"
  };

  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="relative bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 overflow-hidden group"
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-tight">{title}</p>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{value}</h2>
          </div>
          
          {trend && (
            <div className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold ${trend.up ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {trend.up ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl ${iconColors[color]} text-white shadow-lg shadow-${color}-200/50 dark:shadow-none group-hover:scale-105 transition-transform duration-300`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
      </div>

      <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-10 ${colors[color]}`}></div>
    </motion.div>
  );
}