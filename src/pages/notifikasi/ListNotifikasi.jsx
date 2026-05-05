import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import api from "../../utils/api";
import { getUser } from "../../utils/auth";
import PageHeader from "../../components/common/PageHeader";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ListNotifikasi() {
  const [notif, setNotif] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua"); // semua, unread, read
  const [searchQuery, setSearchQuery] = useState("");
  const user = getUser();

  const loadNotifikasi = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notifikasi/${user.id}`);
      setNotif(res.data);
    } catch (err) {
      console.error("Gagal load notifikasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifikasi();
  }, []);

  const handleReadAll = async () => {
    try {
      await api.put(`/notifikasi/read-all/${user.id}`);
      setNotif(notif.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Gagal update read all", err);
    }
  };

  const handleRead = async (id) => {
    try {
      await api.put(`/notifikasi/${id}`);
      setNotif(notif.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error("Gagal update read", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifikasi/${id}`);
      setNotif(notif.filter(n => n.id !== id));
    } catch (err) {
      console.error("Gagal hapus notif", err);
    }
  };

  const getNotifIconAndColor = (judul = "") => {
    const title = judul.toLowerCase();
    if (title.includes("masuk") || title.includes("📦")) {
      return { icon: <Package size={20} />, bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-600" };
    }
    if (title.includes("keluar") || title.includes("📤")) {
      return { icon: <TrendingDown size={20} />, bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-600" };
    }
    if (title.includes("pengajuan") || title.includes("📑")) {
      return { icon: <ClipboardList size={20} />, bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600" };
    }
    if (title.includes("minimum") || title.includes("⚠️")) {
      return { icon: <AlertTriangle size={20} />, bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-600" };
    }
    return { icon: <Bell size={20} />, bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500" };
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredNotif = notif.filter(n => {
    const matchFilter = 
      filter === "semua" ? true : 
      filter === "unread" ? n.is_read === 0 : 
      n.is_read === 1;
    
    const matchSearch = 
      (n.judul && n.judul.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (n.pesan && n.pesan.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchFilter && matchSearch;
  });

  const totalPages = Math.ceil(filteredNotif.length / itemsPerPage);
  const currentData = filteredNotif.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const unreadCount = notif.filter(n => n.is_read === 0).length;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto pb-12 space-y-6">
        
        <PageHeader 
          icon={<Bell size={24} />}
          title="Pusat Notifikasi"
          subtitle="Semua riwayat pembaruan sistem dan status persetujuan"
          actions={
            unreadCount > 0 && (
              <button 
                onClick={handleReadAll}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
              >
                <CheckCheck size={16} /> Tandai Semua Dibaca
              </button>
            )
          }
        />

        {/* TOOLBAR */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2 flex flex-col md:flex-row items-center gap-2">
          
          {/* SEARCH */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari notifikasi..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden md:block mx-2"></div>

          {/* FILTER TABS */}
          <div className="flex w-full md:w-auto gap-1">
            {[
              { id: "semua", label: "Semua" },
              { id: "unread", label: "Belum Dibaca" },
              { id: "read", label: "Sudah Dibaca" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setFilter(tab.id); setCurrentPage(1); }}
                className={`flex-1 md:flex-none px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === tab.id 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* LIST KONTEN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw size={32} className="mx-auto animate-spin mb-4 text-slate-300" />
              <p className="font-medium text-sm">Memuat notifikasi...</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center opacity-50">
              <Bell size={64} className="text-slate-300 mb-6" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Tidak ada notifikasi</h3>
              <p className="text-slate-500 text-sm max-w-md">
                {searchQuery ? "Tidak ada notifikasi yang cocok dengan pencarian Anda." : "Anda belum memiliki riwayat notifikasi di kategori ini."}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence mode="popLayout">
                  {currentData.map(n => {
                    const ui = getNotifIconAndColor(n.judul);
                    const isUnread = n.is_read === 0;

                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-6 flex flex-col sm:flex-row gap-6 group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          isUnread ? "bg-sky-50/30 dark:bg-sky-900/10" : ""
                        }`}
                      >
                        {/* ICON */}
                        <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center ${ui.bg} ${ui.text}`}>
                          {ui.icon}
                        </div>

                        {/* CONTENT */}
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => isUnread && handleRead(n.id)}
                        >
                          <div className="flex items-center gap-3 mb-1.5">
                            <h4 className={`text-base font-bold ${isUnread ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                              {n.judul}
                            </h4>
                            {isUnread && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                                Baru
                              </span>
                            )}
                          </div>
                          <p className={`text-sm leading-relaxed mb-3 ${isUnread ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
                            {n.pesan}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(n.created_at).toLocaleString("id-ID", { 
                              day: "2-digit", month: "long", year: "numeric", 
                              hour: "2-digit", minute: "2-digit" 
                            })}
                          </p>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-2 sm:self-start opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button 
                              onClick={() => handleRead(n.id)}
                              className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                              title="Tandai Dibaca"
                            >
                              <CheckCheck size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(n.id)}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* PAGINATION NOTIFIKASI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Halaman {currentPage} dari {totalPages}
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
                      {(() => {
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
                              className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${currentPage === p ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500"}`}
                            >
                              {p}
                            </button>
                          )
                        ));
                      })()}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2.5 bg-white dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </MainLayout>
  );
}
