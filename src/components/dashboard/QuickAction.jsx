import { useNavigate } from "react-router-dom";
import { Plus, ArrowDownCircle, ArrowUpCircle, ScanLine } from "lucide-react";
import { motion } from "framer-motion";

export default function QuickAction() {
  const navigate = useNavigate();

  const actions = [
    { 
      label: "Tambah Barang", 
      sub: "Katalog",
      icon: <Plus size={20} />, 
      path: "/barang", 
      color: "bg-blue-600",
      shadow: "shadow-blue-100"
    },
    { 
      label: "Stok Masuk", 
      sub: "Inbound",
      icon: <ArrowDownCircle size={20} />, 
      path: "/stok-masuk", 
      color: "bg-emerald-600",
      shadow: "shadow-emerald-100"
    },
    { 
      label: "Stok Keluar", 
      sub: "Outbound",
      icon: <ArrowUpCircle size={20} />, 
      path: "/stok-keluar", 
      color: "bg-rose-600",
      shadow: "shadow-rose-100"
    },
    { 
      label: "Scan QR", 
      sub: "Cepat",
      icon: <ScanLine size={20} />, 
      path: "/scan", 
      color: "bg-amber-500",
      shadow: "shadow-amber-100"
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Aksi Cepat</h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Pusat Kendali Pro</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((a, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(a.path)}
            className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left group"
          >
            <div className={`p-3 rounded-2xl ${a.color} text-white shadow-lg ${a.shadow} dark:shadow-none mb-3 transform transition-transform group-hover:rotate-12`}>
              {a.icon}
            </div>
            <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{a.label}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">{a.sub}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}