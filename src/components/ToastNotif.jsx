import { X, Info, AlertTriangle, CheckCircle, Bell, PackagePlus, PackageMinus, ClipboardList, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ToastNotif({ data, onClose }) {
  
  // Menentukan ikon dan warna berdasarkan konteks judul
  const getTypeDetails = () => {
    const judul = data.judul?.toLowerCase() || "";
    
    // 📦 STOK MASUK / PENERIMAAN
    if (judul.includes("penerimaan") || judul.includes("stok masuk") || judul.includes("registrasi")) {
      return {
        icon: <PackagePlus size={20} className="text-emerald-500" />,
        borderColor: "border-emerald-100 dark:border-emerald-900/30",
        bgColor: "bg-emerald-50/80 dark:bg-emerald-950/40",
        accent: "bg-emerald-500"
      };
    }
    
    // 📤 STOK KELUAR / PENGELUARAN
    if (judul.includes("pengeluaran") || judul.includes("stok keluar")) {
      return {
        icon: <PackageMinus size={20} className="text-orange-500" />,
        borderColor: "border-orange-100 dark:border-orange-900/30",
        bgColor: "bg-orange-50/80 dark:bg-orange-950/40",
        accent: "bg-orange-500"
      };
    }

    // ✅ PENGAJUAN DISETUJUI / SELESAI
    if (judul.includes("disetujui") || judul.includes("selesai") || judul.includes("berhasil")) {
      return {
        icon: <CheckCircle size={20} className="text-blue-500" />,
        borderColor: "border-blue-100 dark:border-blue-900/30",
        bgColor: "bg-blue-50/80 dark:bg-blue-950/40",
        accent: "bg-blue-500"
      };
    }

    // 📋 PENGAJUAN BARU / BUTUH APPROVAL
    if (judul.includes("pengajuan baru") || judul.includes("butuh") || judul.includes("perlu")) {
      return {
        icon: <ClipboardList size={20} className="text-cyan-500" />,
        borderColor: "border-cyan-100 dark:border-cyan-900/30",
        bgColor: "bg-cyan-50/80 dark:bg-cyan-950/40",
        accent: "bg-cyan-500"
      };
    }

    // ❌ DITOLAK / HAPUS / BATAL
    if (judul.includes("ditolak") || judul.includes("hapus") || judul.includes("batal") || judul.includes("penghapusan")) {
      return {
        icon: <Trash2 size={20} className="text-rose-500" />,
        borderColor: "border-rose-100 dark:border-rose-900/30",
        bgColor: "bg-rose-50/80 dark:bg-rose-950/40",
        accent: "bg-rose-500"
      };
    }

    // ⚠️ PERINGATAN / STOK MENIPIS
    if (judul.includes("perhatian") || judul.includes("menipis")) {
      return {
        icon: <AlertTriangle size={20} className="text-amber-500" />,
        borderColor: "border-amber-100 dark:border-amber-900/30",
        bgColor: "bg-amber-50/80 dark:bg-amber-950/40",
        accent: "bg-amber-500"
      };
    }

    // DEFAULT
    return {
      icon: <Bell size={20} className="text-slate-500" />,
      borderColor: "border-slate-100 dark:border-slate-900/30",
      bgColor: "bg-slate-50/80 dark:bg-slate-950/40",
      accent: "bg-slate-500"
    };
  };

  const { icon, borderColor, bgColor, accent } = getTypeDetails();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={`
        ${bgColor} ${borderColor} backdrop-blur-md border 
        shadow-2xl shadow-slate-200/50 dark:shadow-none
        rounded-2xl p-4 w-80 flex items-start gap-4 
        relative overflow-hidden group
      `}
    >
      {/* Accent Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />

      <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border ${borderColor}`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <p className="font-black text-slate-800 dark:text-white text-[13px] leading-tight mb-1 uppercase tracking-tight">
          {data.judul}
        </p>
        <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 leading-snug">
          {data.pesan}
        </p>
      </div>

      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-300 hover:text-slate-500 dark:hover:text-white transition-all"
      >
        <X size={14} />
      </button>

      {/* Timer Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800/50">
        <motion.div 
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 4, ease: "linear" }}
          className={`h-full ${accent}`}
        />
      </div>
    </motion.div>
  );
}