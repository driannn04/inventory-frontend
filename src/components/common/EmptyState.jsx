import React from "react";
import { PackageOpen, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * 🌊 EmptyState Component
 * Displays a beautiful placeholder when no data is available.
 * 
 * Props:
 * - icon: Lucide icon component (default: PackageOpen)
 * - title: Heading text
 * - message: Subheading/description text
 * - actionText: Text for the call-to-action button
 * - onAction: Function to call when button is clicked
 */
export default function EmptyState({ 
  icon: Icon = PackageOpen, 
  title = "Belum Ada Data", 
  message = "Data yang Anda cari tidak ditemukan atau memang belum tersedia.",
  actionText,
  onAction
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {/* 🔮 Glowing Icon Container */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-cyan-500 blur-[60px] opacity-20 animate-pulse" />
        <div className="relative w-24 h-24 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[2rem] border border-blue-100/50 dark:border-slate-700/50 flex items-center justify-center text-cyan-500 shadow-2xl shadow-cyan-500/10 transition-transform hover:scale-110 duration-500">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      </div>

      {/* 📝 Text Content */}
      <div className="max-w-md space-y-3">
        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
          {title}
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          {message}
        </p>
      </div>

      {/* 🚀 Call to Action */}
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="mt-10 flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black text-[10px] uppercase tracking-[0.3em] px-8 py-4 rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-95 transition-all group"
        >
          <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          {actionText}
        </button>
      )}
    </motion.div>
  );
}
