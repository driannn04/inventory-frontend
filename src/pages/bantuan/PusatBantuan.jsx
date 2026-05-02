import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { motion } from "framer-motion";
import { 
  CircleHelp, 
  BookOpen, 
  PackageSearch, 
  CheckCircle2, 
  Clock,
  ShieldCheck,
  Package,
  Info
} from "lucide-react";

export default function PusatBantuan() {
  const sopSteps = [
    {
      title: "1. Pembuatan Pengajuan (Staff)",
      desc: "Masuk ke menu 'Buat Pengajuan'. Pilih barang yang dibutuhkan dari katalog, tentukan jumlah, dan pilih tingkat urgensi. Pastikan alasan pengajuan diisi dengan jelas agar mempercepat proses verifikasi.",
      icon: <PackageSearch size={24} />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      title: "2. Verifikasi Asisten Manager",
      desc: "Status berkas akan menjadi 'Menunggu Asisten Manager'. Di tahap ini, atasan langsung Anda akan meninjau apakah permintaan barang tersebut sesuai dengan kebutuhan divisi.",
      icon: <ShieldCheck size={24} />,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
    },
    {
      title: "3. Persetujuan Akhir Manager",
      desc: "Jika disetujui Asmen, berkas naik ke Manager (Status: 'Menunggu Manager'). Manager akan memberikan persetujuan akhir berdasarkan prioritas dan ketersediaan inventaris perusahaan.",
      icon: <CheckCircle2 size={24} />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      title: "4. Pengambilan di Gudang",
      desc: "Setelah status berubah menjadi 'Menunggu Gudang', silakan datang ke bagian Logistik. Petugas gudang akan memindai berkas/QR Anda, menyerahkan fisik barang, dan menyelesaikan status di sistem.",
      icon: <Package size={24} />,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
    }
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-lg shadow-blue-500/20"
        >
          <CircleHelp size={200} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <BookOpen size={12} /> Panduan Sistem
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 leading-tight">
              Standar Operasional <br /> Prosedur (SOP) Digital
            </h1>
            <p className="text-blue-50 font-medium text-sm md:text-base leading-relaxed opacity-90">
              Pusat informasi resmi alur pengajuan barang inventaris PDAM Tirta Pakuan Bogor. Pahami aturan dan prosedur untuk memperlancar proses permintaan barang Anda.
            </p>
          </div>
        </motion.div>

        {/* SECTION TITLE */}
        <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Clock size={18} />
            </div>
            <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Urutan Langkah Pengajuan</h2>
        </div>

        {/* SOP STEPS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sopSteps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 ${step.color}`}>
                {step.icon}
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* INFORMASI PENTING (REPLACING SUPPORT CONTACT) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
            <Info size={40} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-2">Informasi Penting Pengambilan</h4>
            <ul className="space-y-2">
                <li className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500" /> Pengajuan yang sudah disetujui Manager wajib diambil maksimal 3x24 jam.
                </li>
                <li className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500" /> Tunjukkan Nomor Berkas atau QR Code di menu riwayat kepada petugas Gudang.
                </li>
                <li className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500" /> Pastikan barang yang diterima sesuai dengan data yang Anda input di sistem.
                </li>
            </ul>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
