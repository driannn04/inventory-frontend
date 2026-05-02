import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../utils/api";
import PageHeader from "../../components/common/PageHeader";
import {
  BarChart3, FileSpreadsheet, FileText, Search,
  Calendar, Filter, RefreshCw, ArrowUpDown, Package,
  TrendingUp, TrendingDown, ClipboardList, ChevronLeft, ChevronRight, FileSearch
} from "lucide-react";
import { TableSkeleton } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

export default function Laporan() {
  const [jenis, setJenis] = useState("stok");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      let res;
      if (jenis === "stok") {
        res = await api.get("/laporan/stok");
      } else if (jenis === "masuk") {
        if (!startDate || !endDate) {
          import("sweetalert2").then(({default: Swal}) => Swal.fire({ icon: "warning", title: "Oops!", text: "Tentukan rentang tanggal!" }));
          setLoading(false);
          return;
        }
        res = await api.get(`/laporan/barang-masuk?start=${startDate}&end=${endDate}`);
      } else {
        if (!startDate || !endDate) {
          import("sweetalert2").then(({default: Swal}) => Swal.fire({ icon: "warning", title: "Oops!", text: "Tentukan rentang tanggal!" }));
          setLoading(false);
          return;
        }
        res = await api.get(`/laporan/barang-keluar?start=${startDate}&end=${endDate}`);
      }
      setData(res.data);
      setLoaded(true);
      setCurrentPage(1);
    } catch (err) {
      import("sweetalert2").then(({default: Swal}) => Swal.fire({ icon: "error", title: "Gagal", text: "Gagal mengambil data laporan" }));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      let endpoint = "";
      let filename = "";
      
      if (jenis === "stok") {
        endpoint = `/export/${format}/stok`;
        filename = `laporan_stok.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      } else if (jenis === "masuk") {
        endpoint = `/export/${format}/barang-masuk?start=${startDate}&end=${endDate}`;
        filename = `laporan_barang_masuk.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      } else {
        endpoint = `/export/${format}/barang-keluar?start=${startDate}&end=${endDate}`;
        filename = `laporan_barang_keluar.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      }

      const res = await api.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      import("sweetalert2").then(({default: Swal}) => 
        Swal.fire({ icon: "success", title: "Export Berhasil", text: "Laporan sedang didownload...", timer: 2000, showConfirmButton: false })
      );

    } catch (err) {
      import("sweetalert2").then(({default: Swal}) => Swal.fire({ icon: "error", title: "Gagal Export", text: "Terjadi kesalahan saat mengunduh laporan." }));
    }
  };

  const jenisOptions = [
    { value: "stok", label: "Stok Saat Ini", icon: Package, color: "blue" },
    { value: "masuk", label: "Barang Masuk", icon: TrendingUp, color: "emerald" },
    { value: "keluar", label: "Barang Keluar", icon: TrendingDown, color: "rose" },
  ];

  const getTableColumns = () => {
    if (jenis === "stok") return ["Kode Barang", "Nama Barang", "Stok"];
    return ["Nama Barang", "Jumlah", "Tanggal"];
  };

  const getTableRow = (item) => {
    if (jenis === "stok") {
      return [item.kode_barang, item.nama_barang, item.stok];
    }
    return [
      item.nama_barang,
      item.jumlah,
      new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    ];
  };

  // Summary stats
  const totalItems = data.length;
  const totalQty = data.reduce((sum, item) => sum + (parseInt(item.jumlah || item.stok) || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-4 pb-10">

        <PageHeader
          icon={<BarChart3 size={22} />}
          title="Laporan"
          subtitle="Reporting & analytics sistem inventori"
          actions={
            loaded && data.length > 0 ? (
              <div className="flex gap-2">
                <button onClick={() => handleExport('excel')} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-100 dark:border-slate-700 px-4 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  <FileSpreadsheet size={14} className="text-emerald-600" /> Excel
                </button>
                <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-rose-500/30 px-4 py-2.5 rounded-xl shadow-lg transition-all text-[10px] font-black uppercase tracking-widest text-white">
                  <FileText size={14} /> PDF
                </button>
              </div>
            ) : null
          }
        />

        {/* FILTER PANEL */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Filter size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Filter Laporan</span>
          </div>

          {/* Jenis Laporan Pills */}
          <div className="flex flex-wrap gap-2">
            {jenisOptions.map(opt => {
              const Icon = opt.icon;
              const isActive = jenis === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setJenis(opt.value); setData([]); setLoaded(false); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-sky-600 text-white shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon size={14} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Tanggal Filter */}
          {(jenis === "masuk" || jenis === "keluar") && (
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Dari Tanggal</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-sky-500 transition"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Sampai Tanggal</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-sky-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={fetchLaporan}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black px-6 py-3 rounded-xl hover:from-blue-700 hover:to-sky-600 transition-all shadow-md active:scale-95 text-sm uppercase"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            Tampilkan Laporan
          </button>
        </div>

        {/* RESULTS */}
        {loaded && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                    <ClipboardList size={18} className="text-sky-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Item</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{totalItems}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <ArrowUpDown size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {jenis === "stok" ? "Total Stok" : "Total Qty"}
                    </p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white">{totalQty.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <AnimatePresence mode="wait">
              {loading ? (
                <div key="loading" className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <TableSkeleton columns={getTableColumns().length + 1} rows={8} />
                </div>
              ) : data.length === 0 ? (
                <div key="empty" className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <EmptyState 
                    icon={FileSearch} 
                    title="Laporan Tidak Ditemukan" 
                    message={`Tidak ada data ${jenisOptions.find(o => o.value === jenis)?.label} untuk filter yang Anda tentukan.`}
                  />
                </div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                          <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-12">#</th>
                          {getTableColumns().map((col, i) => (
                            <th key={i} className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="p-6 text-slate-400 font-mono text-xs">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                            {getTableRow(item).map((val, i) => (
                              <td key={i} className="p-6 text-slate-800 dark:text-slate-300 font-bold uppercase tracking-tight text-xs group-hover:text-blue-600 transition-colors">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* PAGINATION LAPORAN */}
                  {data.length > itemsPerPage && (
                    <div className="flex items-center justify-between p-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Hal {currentPage} dari {Math.ceil(data.length / itemsPerPage)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2.5 bg-white dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <div className="flex px-1 gap-1.5 items-center">
                          {[...Array(Math.ceil(data.length / itemsPerPage))].map((_, i) => {
                            const totalPages = Math.ceil(data.length / itemsPerPage);
                            if (totalPages > 5) {
                               if (i !== 0 && i !== totalPages - 1 && Math.abs(i + 1 - currentPage) > 1) {
                                  if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-slate-300">...</span>;
                                  return null;
                               }
                            }
                            return (
                              <button 
                                key={i} 
                                onClick={() => setCurrentPage(i + 1)} 
                                className={`w-9 h-9 rounded-xl text-[10px] font-black uppercase transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                              >
                                {i + 1}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(data.length / itemsPerPage), p + 1))}
                          disabled={currentPage === Math.ceil(data.length / itemsPerPage)}
                          className="p-2.5 bg-white dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </MainLayout>
  );
}
