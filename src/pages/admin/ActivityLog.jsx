import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getAuditLogs } from "../../services/auditService";
import { History, User, Search, Filter, ShieldCheck, Clock, RefreshCw, Activity, X, ChevronLeft, ChevronRight, Eye, Hash, FileText, Database, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../components/common/PageHeader";

const AKSI_CONFIG = {
  Tambah: { cls: "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-900/50", dot: "bg-emerald-500", icon: "➕" },
  Edit:   { cls: "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-900/50",     dot: "bg-blue-500", icon: "✏️" },
  Hapus:  { cls: "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-900/50",     dot: "bg-rose-500", icon: "🗑️" },
  Audit:  { cls: "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50", dot: "bg-amber-500", icon: "🔍" },
  Login:  { cls: "bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-900/30 dark:border-sky-900/50",           dot: "bg-sky-500", icon: "🔑" },
};

const formatRelativeTime = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAksi, setFilterAksi] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try { const res = await getAuditLogs(); setLogs(res.data); setCurrentPage(1); }
    catch (err) { console.error("Gagal memuat log:", err); }
    finally { setLoading(false); }
  };

  const filteredLogs = logs.filter(log => {
    const matchSearch = log.nama_user?.toLowerCase().includes(searchTerm.toLowerCase()) || log.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAksi = filterAksi === "Semua" || log.aksi === filterAksi;
    return matchSearch && matchAksi;
  });

  const DetailRow = ({ icon, label, value, color }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
      <div className={`p-2 rounded-xl shrink-0 ${color || "bg-slate-50 dark:bg-slate-800 text-slate-400"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-white break-words">{value || <span className="italic text-slate-300">-</span>}</p>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        <PageHeader
          icon={<History size={22} />}
          title="Log Aktivitas Sistem"
          subtitle="Audit trail seluruh perubahan data pengguna"
          badge={{ label: "Total Log", value: logs.length }}
          actions={
            <button onClick={fetchLogs} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 transition-all active:scale-95">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          }
        />

        {/* FILTER BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input type="text" placeholder="Cari user atau aktivitas..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select value={filterAksi} onChange={(e) => setFilterAksi(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 rounded-xl py-2 px-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
              <option value="Semua">Semua Aksi</option>
              <option value="Tambah">Tambah</option>
              <option value="Edit">Edit</option>
              <option value="Hapus">Hapus</option>
              <option value="Audit">Audit</option>
              <option value="Login">Login</option>
            </select>
          </div>
          {(searchTerm || filterAksi !== "Semua") && (
            <button onClick={() => { setSearchTerm(""); setFilterAksi("Semua"); }} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-all">
              <X size={15} />
            </button>
          )}
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto">{filteredLogs.length} entri</span>
        </div>

        {/* LOG LIST */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
            <Activity size={16} className="text-blue-500" />
            <h2 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Catatan Aktivitas Terkini</h2>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="px-8 py-6 animate-pulse flex gap-5">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl w-1/4" />
                    <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-1/2" />
                    <div className="h-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-1/5" />
                  </div>
                </div>
              ))
            ) : filteredLogs.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={28} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada log aktivitas ditemukan</p>
              </div>
            ) : filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((log) => {
              const config = AKSI_CONFIG[log.aksi] || { cls: "bg-slate-50 text-slate-500 border border-slate-200", dot: "bg-slate-400", icon: "📋" };
              return (
                <div
                  key={log.id}
                  className="px-8 py-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors flex items-start gap-5 cursor-pointer group"
                  onClick={() => setSelectedLog(log)}
                >
                  {/* Icon */}
                  <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${config.cls}`}>
                    <User size={18} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{log.nama_user}</span>
                        <span className="text-[9px] font-black px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 uppercase tracking-widest">{log.role}</span>
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-widest ${config.cls}`}>{config.icon} {log.aksi}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                        <Clock size={11} />
                        {formatRelativeTime(log.created_at)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{log.keterangan}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {log.tipe_data && (
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/50 px-2 py-0.5 rounded-lg">{log.tipe_data}</span>
                      )}
                      {log.target_id && (
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded-lg">ID: {log.target_id}</span>
                      )}
                    </div>
                  </div>
                  {/* Eye icon on hover */}
                  <button className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all opacity-0 group-hover:opacity-100 shrink-0 self-center" title="Lihat Detail">
                    <Eye size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* PAGINATION LOGS */}
          {filteredLogs.length > itemsPerPage && (
            <div className="flex items-center justify-between p-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredLogs.length)} dari {filteredLogs.length} data
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex px-2 gap-1.5 items-center">
                  {[...Array(Math.ceil(filteredLogs.length / itemsPerPage))].map((_, i) => {
                    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
                    if (totalPages > 7) {
                        if (i !== 0 && i !== totalPages - 1 && Math.abs(i + 1 - currentPage) > 1) {
                          if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-slate-400">...</span>;
                          return null;
                        }
                    }
                    return (
                      <button 
                        key={i} 
                        onClick={() => setCurrentPage(i + 1)} 
                        className={`w-8 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredLogs.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(filteredLogs.length / itemsPerPage)}
                  className="p-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== DETAIL MODAL ========== */}
      <AnimatePresence>
        {selectedLog && (() => {
          const config = AKSI_CONFIG[selectedLog.aksi] || { cls: "bg-slate-50 text-slate-500 border border-slate-200", dot: "bg-slate-400", icon: "📋" };
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedLog(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${config.cls}`}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Detail Log Aktivitas</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Log #{selectedLog.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLog(null)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                    <X size={16} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="px-8 py-6 space-y-1">
                  <DetailRow
                    icon={<User size={16} />}
                    label="Pengguna"
                    value={
                      <div className="flex items-center gap-2">
                        <span>{selectedLog.nama_user}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${config.cls}`}>{selectedLog.role}</span>
                      </div>
                    }
                    color="bg-blue-50 dark:bg-blue-900/30 text-blue-500"
                  />
                  <DetailRow
                    icon={<Activity size={16} />}
                    label="Jenis Aksi"
                    value={
                      <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest inline-flex items-center gap-1.5 ${config.cls}`}>
                        {config.icon} {selectedLog.aksi}
                      </span>
                    }
                    color="bg-amber-50 dark:bg-amber-900/30 text-amber-500"
                  />
                  <DetailRow
                    icon={<Database size={16} />}
                    label="Tipe Data"
                    value={selectedLog.tipe_data || "Umum"}
                    color="bg-blue-50 dark:bg-blue-900/30 text-blue-500"
                  />
                  {selectedLog.target_id && (
                    <DetailRow
                      icon={<Hash size={16} />}
                      label="Target ID"
                      value={`#${selectedLog.target_id}`}
                      color="bg-slate-50 dark:bg-slate-800 text-slate-400"
                    />
                  )}
                  <DetailRow
                    icon={<FileText size={16} />}
                    label="Keterangan Lengkap"
                    value={selectedLog.keterangan}
                    color="bg-blue-50 dark:bg-blue-900/30 text-blue-500"
                  />
                  <DetailRow
                    icon={<Clock size={16} />}
                    label="Waktu Aktivitas"
                    value={
                      <div>
                        <p className="text-sm font-bold">{new Date(selectedLog.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</p>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5">{new Date(selectedLog.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                      </div>
                    }
                    color="bg-sky-50 dark:bg-sky-900/30 text-sky-500"
                  />

                  {/* Waktu Relatif */}
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Relatif</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{formatRelativeTime(selectedLog.created_at)}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </MainLayout>
  );
}
