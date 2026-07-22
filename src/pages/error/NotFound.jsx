import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, AlertCircle, PackageSearch } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full text-center relative">

        {/* Background Decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-sky-500/10 blur-[80px] rounded-full"></div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          {/* Animated 404 Text */}
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
              repeat: Infinity,
              repeatType: "reverse",
              duration: 2
            }}
            className="text-[12rem] font-black leading-none bg-gradient-to-br from-blue-600 via-sky-500 to-emerald-400 bg-clip-text text-transparent select-none opacity-20 dark:opacity-30"
          >
            404
          </motion.h1>

          <div className="-mt-20">
            <div className="inline-flex p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <PackageSearch size={64} className="text-blue-600 animate-bounce" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-4">
              Ups! Halaman Tidak Ditemukan
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 text-sm leading-relaxed font-medium">
              Sepertinya barang yang Anda cari tidak ada di gudang kami atau Anda tersesat di lorong yang salah.
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all active:scale-95"
              >
                <Home size={18} /> Ke Dashboard
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]"
        >
          Sistem Inventaris PERUMDA Tirta Pakuan • Terminal Error 404
        </motion.div>
      </div>
    </div>
  );
}
