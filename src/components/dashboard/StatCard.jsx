import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ title, value, icon, color, trend }) {
  const colorVariants = {
    blue: "from-blue-600 to-sky-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30",
    sky: "from-sky-500 to-cyan-500 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-900/30",
    green: "from-emerald-600 to-teal-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30",
    red: "from-rose-600 to-pink-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30",
    amber: "from-amber-500 to-orange-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30"
  };

  const gradientVariants = {
    blue: "from-blue-600 to-sky-500",
    sky: "from-sky-500 to-cyan-500",
    green: "from-emerald-600 to-teal-500",
    red: "from-rose-600 to-pink-500",
    amber: "from-amber-500 to-orange-500"
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 group overflow-hidden"
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientVariants[color]} flex items-center justify-center text-white shadow-lg shadow-${color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
        
        <div className="flex flex-col">
          <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mt-2 group-hover:text-slate-500 transition-colors">
            {title}
          </p>
        </div>

        {trend && (
          <div className="ml-auto self-start">
            <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 ${trend.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {trend.up ? '↑' : '↓'} {trend.value}%
            </div>
          </div>
        )}
      </div>

      {/* Decorative background element */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradientVariants[color]} opacity-[0.03] group-hover:opacity-[0.06] blur-2xl transition-opacity duration-500`}></div>
    </motion.div>
  );
}