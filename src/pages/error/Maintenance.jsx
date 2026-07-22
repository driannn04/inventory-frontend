import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Clock, Settings, HardHat, RefreshCw, ArrowRight } from "lucide-react";
import axios from "axios";

export default function Maintenance() {
  const [isChecking, setIsChecking] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const checkServerStatus = async () => {
    setIsChecking(true);
    try {
      // Kita coba panggil endpoint base API
      // Jika berhasil merespons (meskipun 401/403), berarti server sudah UP
      await axios.get(`${apiUrl}/barang`, { timeout: 3000 });

      // Jika sampai di sini tanpa Network Error, server sudah hidup
      window.location.href = "/";
    } catch (error) {
      // Jika errornya bukan Network Error (artinya ada respons dari server)
      if (error.response) {
        window.location.href = "/";
      }
      console.log("Server masih dalam pemeliharaan...");
    } finally {
      setTimeout(() => setIsChecking(false), 1000);
    }
  };

  useEffect(() => {
    // Jalankan pengecekan otomatis setiap 10 detik
    const interval = setInterval(() => {
      checkServerStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full relative">

        {/* Animated Background Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
          <Settings size={200} className="absolute -top-10 -left-10 animate-spin-slow" />
          <Wrench size={150} className="absolute -bottom-10 -right-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-amber-100 dark:border-amber-900/30 mb-8">
            <HardHat size={64} className="text-amber-500" />
          </div>

          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter">
            Sistem Sedang <span className="text-amber-500">Upgrade</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm leading-relaxed max-w-md mx-auto font-medium">
            Kami sedang melakukan pemeliharaan rutin untuk meningkatkan performa dan keamanan sistem inventaris. Mohon tunggu beberapa saat.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm mx-auto">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <Clock size={20} className="mx-auto mb-2 text-blue-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimasi Selesai</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">5 - 10 Menit</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <Settings size={20} className="mx-auto mb-2 text-emerald-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Update</p>
              <p className="text-xs font-bold text-slate-800 dark:text-white mt-1">Auto-Reconnect</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-900/30">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></div>
              Menunggu Server Aktif...
            </div>

            <button
              onClick={checkServerStatus}
              disabled={isChecking}
              className="group flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isChecking ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              )}
              Hubungkan Sekarang
            </button>
          </div>

          <p className="mt-20 text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">
            PERUMDA Tirta Pakuan • Engineering Team
          </p>
        </motion.div>
      </div>
    </div>
  );
}
