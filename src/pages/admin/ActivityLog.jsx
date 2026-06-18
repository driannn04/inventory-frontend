import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getAuditLogs, exportAuditLogs } from "../../services/auditService";
import { History, User, Search, Filter, ShieldCheck, Clock, RefreshCw, Activity, X, ChevronLeft, ChevronRight, Eye, Hash, FileText, Database, Shield, PackagePlus, PackageMinus, Edit, Trash2, CheckCircle, Globe, Monitor, Code, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Audit log activity component
import PageHeader from "../../components/common/PageHeader";

const AKSI_CONFIG = {
  MASUK:   { cls: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30", icon: <PackagePlus size={14} />, label: "Stok Masuk" },
  KELUAR:  { cls: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30", icon: <PackageMinus size={14} />, label: "Stok Keluar" },
  PENGELUARAN: { cls: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30",         icon: <PackageMinus size={14} />, label: "Pengeluaran" },
  TAMBAH:  { cls: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30", icon: <PackagePlus size={14} />, label: "Tambah" },
  Tambah:  { cls: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30", icon: <PackagePlus size={14} />, label: "Tambah" },
  EDIT:    { cls: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30",         icon: <Edit size={14} />,        label: "Edit" },
  Edit:    { cls: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30",         icon: <Edit size={14} />,        label: "Edit" },
  HAPUS:   { cls: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30",         icon: <Trash2 size={14} />,      label: "Hapus" },
  Hapus:   { cls: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30",         icon: <Trash2 size={14} />,      label: "Hapus" },
  APPROVE: { cls: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30",         icon: <CheckCircle size={14} />, label: "Approve" },
  REJECT:  { cls: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30",         icon: <X size={14} />,           label: "Reject" },
  LOGIN:   { cls: "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/30",           icon: <Shield size={14} />,      label: "Login" },
  Audit:   { cls: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30",   icon: <Search size={14} />,      label: "Audit" },
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
  const [exporting, setExporting] = useState(false);
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

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await exportAuditLogs();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const ts = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
      link.setAttribute("download", `Audit_Log_Inventory_${ts}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Gagal mengekspor data");
    } finally {
      setExporting(false);
    }
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

        {/* TOOLBAR: SEARCH & FILTERS - COMPACT */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[300px] bg-white dark:bg-slate-900 rounded-2xl px-6 py-3 border border-slate-100 dark:border-slate-800 flex items-center gap-3 shadow-sm focus-within:border-blue-500 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" placeholder="Cari user atau aktivitas..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none flex-1 bg-transparent text-sm font-medium dark:text-white" 
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-2 shadow-sm">
              <Filter size={14} className="text-slate-400" />
              <select value={filterAksi} onChange={(e) => setFilterAksi(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest outline-none">
                <option value="Semua">Semua Aksi</option>
                <option value="MASUK">Stok Masuk</option>
                <option value="KELUAR">Stok Keluar</option>
                <option value="TAMBAH">Tambah Data</option>
                <option value="EDIT">Edit Data</option>
                <option value="HAPUS">Hapus Data</option>
                <option value="LOGIN">Login</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {exporting ? <RefreshCw size={14} className="animate-spin" /> : <FileDown size={14} />}
              {exporting ? "..." : "Export"}
            </button>
          </div>
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
              let aksiKey = log.aksi;
              if (log.aksi === "TAMBAH" && log.tipe_data === "STOK KELUAR") aksiKey = "KELUAR";
              if (log.aksi === "TAMBAH" && log.tipe_data === "STOK MASUK")  aksiKey = "MASUK";
              
              const config = AKSI_CONFIG[aksiKey] || AKSI_CONFIG[log.aksi] || { cls: "bg-slate-50 text-slate-500", icon: <FileText size={14} />, label: log.aksi };
              return (
                <div
                  key={log.id}
                  className="px-8 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all flex items-center gap-6 cursor-pointer group"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-lg ${config.cls}`}>
                    {config.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{log.nama_user}</span>
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase tracking-widest">{log.role}</span>
                      <div className="flex items-center gap-2 ml-auto opacity-40 group-hover:opacity-100 transition-opacity">
                         {log.ip_address && <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><Globe size={10}/> {log.ip_address}</div>}
                         {log.user_agent && <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><Monitor size={10}/> {log.user_agent.includes('Windows') ? 'PC' : 'Mobile'}</div>}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">{log.keterangan}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-slate-800 dark:text-white">{formatRelativeTime(log.created_at)}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
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
                  {(() => {
                    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
                    const pages = [];
                    for (let i = 1; i <= totalPages; i++) {
                      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                        pages.push(i);
                      } else if (i === currentPage - 2 || i === currentPage + 2) {
                        pages.push("...");
                      }
                    }
                    return pages.filter((v, i, a) => a.indexOf(v) === i).map((p, i) => (
                      p === "..." ? (
                        <span key={`sep-${i}`} className="px-1 text-slate-400 font-black">...</span>
                      ) : (
                        <button 
                          key={p} 
                          onClick={() => setCurrentPage(p)} 
                          className={`w-8 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${currentPage === p ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                        >
                          {p}
                        </button>
                      )
                    ));
                  })()}
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
          // 🔥 SMART MAPPING: Perbaiki visual log lama agar tetap akurat
          let aksiKey = selectedLog.aksi;
          if (selectedLog.aksi === "TAMBAH" && selectedLog.tipe_data === "STOK KELUAR") aksiKey = "KELUAR";
          if (selectedLog.aksi === "TAMBAH" && selectedLog.tipe_data === "STOK MASUK")  aksiKey = "MASUK";

          const config = AKSI_CONFIG[aksiKey] || AKSI_CONFIG[selectedLog.aksi] || { cls: "bg-slate-50 text-slate-500 border border-slate-200", dot: "bg-slate-400", icon: "📋" };
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
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl flex items-center justify-center ${config.cls}`}>
                      {typeof config.icon === 'string' ? config.icon : 
                        <config.icon.type {...config.icon.props} size={22} />
                      }
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
                <div className="px-8 py-6 overflow-y-auto custom-scrollbar flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                    <div className="space-y-1">
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
                            {config.icon} {config.label}
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
                    </div>

                    <div className="space-y-1">
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
                      {selectedLog.ip_address && (
                        <DetailRow
                          icon={<Globe size={16} />}
                          label="IP Address"
                          value={selectedLog.ip_address}
                          color="bg-slate-50 dark:bg-slate-800 text-slate-400"
                        />
                      )}
                      {selectedLog.user_agent && (
                        <DetailRow
                          icon={<Monitor size={16} />}
                          label="Perangkat / Browser"
                          value={<span className="text-[11px] leading-tight block">{selectedLog.user_agent}</span>}
                          color="bg-slate-50 dark:bg-slate-800 text-slate-400"
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <DetailRow
                      icon={<FileText size={16} />}
                      label="Keterangan Lengkap"
                      value={selectedLog.keterangan}
                      color="bg-blue-50 dark:bg-blue-900/30 text-blue-500"
                    />
                  </div>

                  {/* COMPARISON DATA (IF ANY) */}
                  {(selectedLog.data_lama || selectedLog.data_baru) && (
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-6">
                        <Code size={18} className="text-blue-500" />
                        <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Detail Perubahan Data</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {selectedLog.data_lama && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Kondisi Sebelumnya</p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Old State</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-rose-50/20 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-900/20 max-h-[350px] overflow-auto custom-scrollbar">
                              <pre className="text-[11px] font-mono text-rose-700 dark:text-rose-400 leading-relaxed">
                                {JSON.stringify(JSON.parse(selectedLog.data_lama), null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                        {selectedLog.data_baru && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Kondisi Terbaru</p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">New State</span>
                            </div>
                            <div className="p-5 rounded-2xl bg-emerald-50/20 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20 max-h-[350px] overflow-auto custom-scrollbar">
                              <pre className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                {JSON.stringify(JSON.parse(selectedLog.data_baru), null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Waktu Relatif */}
                  <div className="mt-8 p-5 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Time Stamp</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{formatRelativeTime(selectedLog.created_at)}</p>
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
