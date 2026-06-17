import { useState, useMemo } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../utils/api";
import { getRole } from "../../utils/auth";
import PageHeader from "../../components/common/PageHeader";
import {
  BarChart3, FileSpreadsheet, FileText, Search,
  Calendar, RefreshCw, Package, Download,
  TrendingUp, TrendingDown, ChevronLeft, ChevronRight,
  FileSearch, Hash, Layers, Clock
} from "lucide-react";
import { TableSkeleton } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase() || "";
  let color = "bg-slate-100 text-slate-600";
  if (s.includes("approved") || s.includes("diterima") || s.includes("selesai")) color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  else if (s.includes("pending")) color = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  else if (s.includes("rejected") || s.includes("ditolak")) color = "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
  return <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${color}`}>{status}</span>;
};

export default function Laporan() {
  const role = getRole();
  const [jenis, setJenis] = useState("stok");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 15;

  // Quick date presets
  const setPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      let res;
      if (jenis === "stok") {
        res = await api.get("/laporan/stok");
      } else {
        if (!startDate || !endDate) {
          import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Oops!", text: "Tentukan rentang tanggal terlebih dahulu." }));
          setLoading(false);
          return;
        }
        const endpoint = { masuk: "/laporan/barang-masuk", keluar: "/laporan/barang-keluar" }[jenis];
        res = await api.get(`${endpoint}?start=${startDate}&end=${endDate}`);
      }
      setData(res.data);
      setLoaded(true);
      setCurrentPage(1);
      setSearchQuery("");
    } catch (err) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "error", title: "Gagal", text: "Gagal mengambil data laporan." }));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const base = `/export/${format}`;
      let endpoint, filename;
      if (jenis === "stok") {
        endpoint = `${base}/stok`;
        filename = `laporan_stok.${format === "excel" ? "xlsx" : "pdf"}`;
      } else {
        const map = { masuk: "barang-masuk", keluar: "barang-keluar" };
        endpoint = `${base}/${map[jenis]}?start=${startDate}&end=${endDate}`;
        filename = `laporan_${map[jenis]}.${format === "excel" ? "xlsx" : "pdf"}`;
      }
      const res = await api.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "success", title: "Berhasil!", text: "File sedang diunduh...", timer: 2000, showConfirmButton: false }));
    } catch {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "error", title: "Gagal Export", text: "Terjadi kesalahan saat mengunduh." }));
    }
  };

  // Report type cards
  const reportTypes = useMemo(() => {
    const types = [
      { value: "stok", label: "Stok Saat Ini", desc: "Posisi stok barang terkini", icon: Package, gradient: "from-blue-500 to-cyan-500" },
    ];
    if (role === "admin" || role === "gudang") {
      types.push({ value: "masuk", label: "Barang Masuk", desc: "Penerimaan barang dari supplier", icon: TrendingUp, gradient: "from-emerald-500 to-teal-500" });
    }
    types.push({ value: "keluar", label: "Barang Keluar", desc: "Pengeluaran barang per pengajuan", icon: TrendingDown, gradient: "from-rose-500 to-pink-500" });
    return types;
  }, [role]);

  // Table config per report type
  const getColumns = () => {
    if (jenis === "stok") return ["Kode Barang", "Nama Barang", "Satuan", "Stok"];
    if (jenis === "masuk") return ["Kode Barang", "Nama Barang", "Satuan", "Jumlah", "Keterangan"];
    return ["Kode Barang", "Nama Barang", "Satuan", "Jumlah", "Penerima / Unit"];
  };

  const getRow = (item) => {
    if (jenis === "stok") return { cells: [item.kode_barang, item.nama_barang, item.satuan || "Pcs", item.stok] };
    if (jenis === "masuk") return { cells: [item.kode_barang || "-", item.nama_barang, item.satuan || "Pcs", item.jumlah, item.keterangan || "-"] };
    return { cells: [item.kode_barang || "-", item.nama_barang, item.satuan || "Pcs", item.jumlah, `${item.pemohon || "-"} / ${item.unit || "-"}`] };
  };
  // Filtered & searched data
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  }, [data, searchQuery]);

  // Group data by date for masuk/keluar
  const groupedByDate = useMemo(() => {
    if (jenis === "stok") return null;
    const groups = {};
    filteredData.forEach(item => {
      const dateKey = new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return groups;
  }, [filteredData, jenis]);

  const isGrouped = jenis !== "stok";

  // Summary KPIs
  const totalRows = filteredData.length;
  const totalQty = filteredData.reduce((sum, i) => sum + (parseInt(i.jumlah || i.stok) || 0), 0);
  const uniqueItems = new Set(filteredData.map(i => i.nama_barang || i.kode_barang)).size;

  const totalPages = Math.ceil(totalRows / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const needsDateFilter = jenis !== "stok";

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        <PageHeader icon={<BarChart3 size={22} />} title="Pusat Laporan" subtitle="Analisis & pelaporan data inventaris" />

        {/* ============ REPORT TYPE SELECTOR ============ */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const active = jenis === type.value;
            return (
              <button key={type.value} onClick={() => { setJenis(type.value); setData([]); setLoaded(false); setSearchQuery(""); }}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 group overflow-hidden ${
                  active
                    ? "border-sky-500 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/50 dark:to-blue-950/50 shadow-lg shadow-sky-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${
                  active ? `bg-gradient-to-br ${type.gradient} shadow-lg` : "bg-slate-100 dark:bg-slate-800 group-hover:scale-110"
                }`}>
                  <Icon size={18} className={active ? "text-white" : "text-slate-500"} />
                </div>
                <p className={`text-sm font-bold ${active ? "text-sky-700 dark:text-sky-400" : "text-slate-700 dark:text-slate-300"}`}>{type.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{type.desc}</p>
                {active && <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />}
              </button>
            );
          })}
        </div>

        {/* ============ FILTER PANEL ============ */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          {needsDateFilter ? (
            <div className="space-y-4">
              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Periode Cepat:</span>
                {[{ label: "Hari Ini", days: 0 }, { label: "7 Hari", days: 7 }, { label: "30 Hari", days: 30 }, { label: "3 Bulan", days: 90 }].map((p) => (
                  <button key={p.label} onClick={() => setPreset(p.days)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-sky-100 hover:text-sky-700 dark:hover:bg-sky-900/30 dark:hover:text-sky-400 transition-all"
                  >{p.label}</button>
                ))}
              </div>
              {/* Date Inputs + Generate */}
              <div className="flex flex-col md:flex-row items-end gap-3">
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Dari</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-sky-500/50 transition" />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Sampai</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-sky-500/50 transition" />
                  </div>
                </div>
                <button onClick={fetchLaporan} disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95 text-sm whitespace-nowrap disabled:opacity-50">
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                  Tampilkan
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Laporan Stok Real-Time</p>
                <p className="text-xs text-slate-400">Menampilkan posisi stok barang saat ini di gudang</p>
              </div>
              <button onClick={fetchLaporan} disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95 text-sm disabled:opacity-50">
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                Tampilkan
              </button>
            </div>
          )}
        </div>

        {/* ============ RESULTS ============ */}
        <AnimatePresence mode="wait">
          {loaded && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Hash size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Baris</p>
                      <p className="text-xl font-black text-slate-800 dark:text-white">{totalRows.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Layers size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{jenis === "stok" ? "Total Stok" : "Total Qty"}</p>
                      <p className="text-xl font-black text-slate-800 dark:text-white">{totalQty.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                      <Package size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Barang</p>
                      <p className="text-xl font-black text-slate-800 dark:text-white">{uniqueItems}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toolbar: Search + Export */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="relative flex-1 w-full">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Cari di dalam data laporan..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-sky-500/50 transition" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleExport("excel")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all text-xs font-bold">
                    <FileSpreadsheet size={14} /> Excel
                  </button>
                  <button onClick={() => handleExport("pdf")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:shadow-lg hover:shadow-rose-500/25 transition-all text-xs font-bold">
                    <FileText size={14} /> PDF
                  </button>
                </div>
              </div>

              {/* Data Table */}
              {loading ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <TableSkeleton columns={getColumns().length + 1} rows={8} />
                </div>
              ) : filteredData.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <EmptyState icon={FileSearch} title="Data Tidak Ditemukan"
                    message={searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : `Tidak ada data ${reportTypes.find(r => r.value === jenis)?.label} untuk filter yang ditentukan.`} />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-14">#</th>
                          {getColumns().map((col, i) => (
                            <th key={i} className="px-5 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {isGrouped && groupedByDate ? (
                          Object.entries(groupedByDate).map(([dateText, items], groupIdx) => (
                            <>
                              <tr key={`group-${groupIdx}`} className="bg-sky-50 dark:bg-sky-900/20 border-y border-sky-200 dark:border-sky-800">
                                <td className="px-5 py-3 text-sky-700 dark:text-sky-400 font-black text-xs">{groupIdx + 1}</td>
                                <td colSpan={getColumns().length} className="px-5 py-3 text-sky-700 dark:text-sky-400 font-black text-xs">
                                  <div className="flex items-center gap-2">
                                    <Calendar size={14} />
                                    Tanggal {dateText}
                                  </div>
                                </td>
                              </tr>
                              {items.map((item, idx) => {
                                const row = getRow(item);
                                return (
                                  <tr key={`${groupIdx}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-3.5 text-slate-400 font-mono text-xs"></td>
                                    {row.cells.map((val, i) => (
                                      <td key={i} className="px-5 py-3.5 text-slate-700 dark:text-slate-300 text-xs font-semibold">{val}</td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </>
                          ))
                        ) : (
                          paginatedData.map((item, idx) => {
                            const row = getRow(item);
                            const rowNum = (currentPage - 1) * itemsPerPage + idx + 1;
                            return (
                              <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{rowNum}</td>
                                {row.cells.map((val, i) => (
                                  <td key={i} className="px-5 py-3.5 text-slate-700 dark:text-slate-300 text-xs font-semibold">{val}</td>
                                ))}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalRows)} dari {totalRows}
                      </span>
                      <div className="flex gap-1.5">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition disabled:opacity-30">
                          <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let page;
                          if (totalPages <= 5) page = i + 1;
                          else if (currentPage <= 3) page = i + 1;
                          else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                          else page = currentPage - 2 + i;
                          return (
                            <button key={page} onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                currentPage === page
                                  ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/25"
                                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}>{page}</button>
                          );
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition disabled:opacity-30">
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
