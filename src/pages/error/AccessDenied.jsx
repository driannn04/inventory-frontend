import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Home, ArrowLeft, Lock } from "lucide-react";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center relative">
        
        {/* Background Decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-rose-500/10 blur-[100px] rounded-full"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <div className="relative inline-block mb-8">
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-rose-100 dark:border-rose-900/30">
               <ShieldAlert size={80} className="text-rose-500 animate-pulse" />
            </div>
            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-4 -right-4 p-3 bg-amber-500 text-white rounded-2xl shadow-lg"
            >
                <Lock size={20} />
            </motion.div>
          </div>
          
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4 uppercase tracking-tight">
            Akses Dibatasi
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10 text-sm leading-relaxed font-medium">
            Maaf, akun Anda tidak memiliki izin untuk mengakses area ini. Silakan hubungi Admin jika Anda merasa ini adalah kesalahan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm shadow-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all active:scale-95"
            >
              <ArrowLeft size={18} /> Kembali
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 transition-all active:scale-95"
            >
              <Home size={18} /> Ke Dashboard
            </button>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800/50">
             <p className="text-[10px] font-black text-rose-500/50 uppercase tracking-[0.4em]">Security Protocol Active • 403 Forbidden</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
