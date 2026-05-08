import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../utils/api";
import PageHeader from "../../components/common/PageHeader";

import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Database,
  RefreshCw,
  Trash2,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import Swal from "sweetalert2";

export default function Settings() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    try {
      Swal.fire({
        title: "Menyiapkan Backup...",
        text: "Sistem sedang mengumpulkan data database",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const token = localStorage.getItem("token");
      window.location.href = `${api.defaults.baseURL}/settings/backup?token=${token}`;
      
      setTimeout(() => {
        Swal.close();
        Swal.fire({
          icon: "success",
          title: "Selesai",
          text: "File database (.sql) berhasil diunduh",
          timer: 2000,
          showConfirmButton: false
        });
      }, 2000);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan saat membuat backup" });
    }
  };

  const handleClearCache = async () => {
    try {
      const result = await Swal.fire({
        title: "Bersihkan Cache?",
        text: "Ini akan menyegarkan sistem dan memori library gambar.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e11d48",
        confirmButtonText: "Ya, Bersihkan",
        cancelButtonText: "Batal",
        customClass: { popup: "rounded-[2.5rem]" }
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Membersihkan...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        await api.post("/settings/clear-cache");

        Swal.fire({
          icon: "success",
          title: "Selesai",
          text: "Cache sistem berhasil dibersihkan",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal membersihkan cache sistem" });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">

        <PageHeader
          icon={<SettingsIcon size={22} />}
          title="Pemeliharaan Sistem"
          subtitle="Manajemen database dan keandalan sistem"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT: SYSTEM INFO */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="text-emerald-500" size={24} />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">Status Keamanan</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-center gap-3 text-emerald-600">
                    <CheckCircle2 size={18} />
                    <div>
                      <p className="text-[11px] font-black uppercase">Database Connected</p>
                      <p className="text-[9px] font-bold opacity-70">Koneksi MySQL stabil</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-3 text-blue-600">
                    <ShieldCheck size={18} />
                    <div>
                      <p className="text-[11px] font-black uppercase">Role Based Access</p>
                      <p className="text-[9px] font-bold opacity-70">Akses terbatas untuk Admin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Penting</p>
                  <p className="text-xs font-bold leading-relaxed">Lakukan backup database secara rutin (setiap minggu) untuk menghindari kehilangan data yang tidak terduga.</p>
               </div>
               <Database className="absolute -right-4 -bottom-4 text-white/5 group-hover:rotate-12 transition-transform duration-500" size={120} />
            </div>
          </div>

          {/* RIGHT: ACTIONS */}
          <div className="md:col-span-7 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Database Management</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ekspor dan pembersihan memori sistem</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleBackup}
                  className="w-full flex items-center justify-between p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] shadow-xl shadow-blue-500/20 transition-all font-black group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Database size={24} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs uppercase tracking-widest block">Backup Database Utama</span>
                      <span className="text-[10px] text-blue-100 font-bold uppercase opacity-70">Unduh Format .SQL</span>
                    </div>
                  </div>
                  <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                </button>

                <div className="pt-6">
                  <div className="p-8 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border-2 border-rose-100 dark:border-rose-900/30 space-y-6">
                    <div className="flex items-center gap-3 text-rose-600">
                      <Trash2 size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Pembersihan Berkala</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                      Jika aplikasi terasa lambat saat memuat gambar barang, silakan bersihkan cache sistem untuk menyegarkan memori server.
                    </p>
                    <button
                      onClick={handleClearCache}
                      className="w-full py-4 bg-white dark:bg-slate-800 text-rose-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 dark:border-rose-800"
                    >
                      Bersihkan Cache Sistem
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
