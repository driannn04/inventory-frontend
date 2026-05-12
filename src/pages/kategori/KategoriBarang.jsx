import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getKategori, createKategori, updateKategori, deleteKategori } from "../../services/kategoriService";
import {
  Tags, Plus, Search, RefreshCw, Edit2, Trash2,
  ChevronLeft, ChevronRight, X, Check, FolderOpen,
  Layers, Zap, Info, ArrowUpRight, AlertTriangle,
  History, Activity, BarChart3, ArrowRight
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const categoryColors = [
  { gradient: "from-blue-600 to-indigo-600", light: "bg-blue-50", dark: "dark:bg-blue-900/10", text: "text-blue-600", shadow: "shadow-blue-500/20" },
  { gradient: "from-emerald-500 to-teal-600", light: "bg-emerald-50", dark: "dark:bg-emerald-900/10", text: "text-emerald-600", shadow: "shadow-emerald-500/20" },
  { gradient: "from-amber-500 to-orange-600", light: "bg-amber-50", dark: "dark:bg-amber-900/10", text: "text-amber-600", shadow: "shadow-amber-500/20" },
  { gradient: "from-rose-500 to-pink-600", light: "bg-rose-50", dark: "dark:bg-rose-900/10", text: "text-rose-600", shadow: "shadow-rose-500/20" },
  { gradient: "from-violet-500 to-purple-600", light: "bg-violet-50", dark: "dark:bg-violet-900/10", text: "text-violet-600", shadow: "shadow-violet-500/20" },
];

export default function KategoriBarang() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [form, setForm] = useState({ nama_kategori: "", deskripsi: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try { const res = await getKategori(); setData(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingData(null); setForm({ nama_kategori: "", deskripsi: "" }); setIsModalOpen(true);
  };
  const openEdit = (item) => {
    setEditingData(item); setForm({ nama_kategori: item.nama_kategori || "", deskripsi: item.deskripsi || "" }); setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nama_kategori) { return; }
    setSaving(true);
    try {
      if (editingData) { await updateKategori(editingData.id, form); }
      else { await createKategori(form); }
      setIsModalOpen(false); setEditingData(null); loadData();
    } catch (err) { alert(err.response?.data?.message || "Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item) => {
    import("sweetalert2").then(({ default: Swal }) => {
      Swal.fire({
        title: "Hapus Kategori?",
        html: `Seluruh relasi ke barang <b class="text-rose-600">"${item.nama_kategori}"</b> akan terpengaruh.`,
        icon: "warning", showCancelButton: true, confirmButtonColor: "#e11d48",
        cancelButtonColor: "#94a3b8", confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
        customClass: { popup: "rounded-[2.5rem] shadow-2xl border-none p-8" }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try { await deleteKategori(item.id); loadData(); }
          catch (err) { 
            Swal.fire({
              title: "Gagal!", text: err.response?.data?.message || "Kategori masih digunakan oleh barang.",
              icon: "error", customClass: { popup: "rounded-[2rem]" }
            });
          }
        }
      });
    });
  };

  const filteredData = data.filter(item =>
    item.nama_kategori?.toLowerCase().includes(search.toLowerCase()) ||
    item.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <PageHeader
             icon={<Tags size={24} className="text-blue-600" />}
             title="Kategori Inventaris"
             subtitle="Atur klasifikasi barang untuk kemudahan monitoring stok"
           />
           <div className="flex gap-3">
              <button onClick={loadData} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                 <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              <button onClick={openCreate} className="flex items-center gap-3 bg-slate-900 dark:bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest">
                 <Plus size={18} /> Tambah Kategori
              </button>
           </div>
        </div>

        {/* SUMMARY INSIGHTS AREA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 group hover:border-blue-500/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Kategori</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{data.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 group hover:border-emerald-500/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grup Aktif</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{data.filter(d => d.total_barang > 0).length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 group hover:border-rose-500/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori Kritis</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">{data.filter(d => d.stok_kritis > 0).length}</p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-3 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 group focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
             <Search size={20} />
          </div>
          <input
            type="text" placeholder="Cari nama atau deskripsi kategori..." value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="flex-1 bg-transparent text-sm font-bold text-slate-700 dark:text-white outline-none placeholder:text-slate-300 uppercase tracking-wider"
          />
        </div>

        {/* CONTENT GRID */}
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                 <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse" />
              ))}
           </div>
        ) : currentData.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] py-24 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
               <FolderOpen size={32} className="text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Tidak ada data ditemukan</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {currentData.map((item, index) => {
                const color = categoryColors[index % categoryColors.length];
                const healthRatio = item.total_barang > 0 
                  ? ((item.total_barang - item.stok_kritis) / item.total_barang) * 100 
                  : 100;
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden"
                  >
                    {/* TOP ACCENT BAR */}
                    <div className={`h-2 w-full bg-gradient-to-r ${color.gradient}`} />
                    
                    <div className="p-7 flex-1 flex flex-col">
                      {/* HEADER ICON & ACTIONS */}
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color.gradient} flex items-center justify-center text-white shadow-lg ${color.shadow} transform transition-transform group-hover:rotate-12 duration-300`}>
                          <Tags size={24} />
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(item)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors shadow-sm"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(item)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors shadow-sm"><Trash2 size={14} /></button>
                        </div>
                      </div>

                      {/* TITLE & LINK */}
                      <button 
                        onClick={() => navigate("/barang", { state: { category: item.nama_kategori } })}
                        className="text-left group/title"
                      >
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2 group-hover/title:text-blue-600 transition-colors">
                           {item.nama_kategori}
                           <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight line-clamp-1 mb-4 opacity-70">
                          {item.deskripsi || "Grup Barang Operasional"}
                        </p>
                      </button>

                      {/* HEALTH BAR */}
                      <div className="space-y-1.5 mb-6">
                        <div className="flex justify-between items-end">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kesehatan Stok</span>
                           <span className={`text-[10px] font-black ${healthRatio < 70 ? 'text-rose-500' : 'text-emerald-500'}`}>{Math.round(healthRatio)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${healthRatio}%` }}
                             transition={{ duration: 1, ease: "easeOut" }}
                             className={`h-full rounded-full bg-gradient-to-r ${healthRatio < 70 ? 'from-rose-500 to-orange-400' : 'from-blue-500 to-emerald-400'}`} 
                           />
                        </div>
                      </div>

                      {/* DATA GRID */}
                      <div className="grid grid-cols-2 gap-2 mb-6">
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center gap-2 mb-1">
                               <Layers size={10} className="text-slate-400" />
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Variasi</p>
                            </div>
                            <p className="text-xs font-black text-slate-700 dark:text-white">{item.total_barang || 0} Item</p>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center gap-2 mb-1">
                               <BarChart3 size={10} className="text-slate-400" />
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Stok</p>
                            </div>
                            <p className="text-xs font-black text-slate-700 dark:text-white">{item.total_stok || 0} Unit</p>
                         </div>
                      </div>

                      {/* LAST ACTIVITY SNIPPET */}
                      {item.barang_terakhir && (
                        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-start gap-3">
                           <div className={`w-8 h-8 rounded-lg ${color.light} ${color.dark} ${color.text} flex items-center justify-center shrink-0`}>
                              <History size={14} />
                           </div>
                           <div className="min-w-0">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Baru Masuk</p>
                              <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate uppercase tracking-tight">{item.barang_terakhir}</p>
                           </div>
                        </div>
                      )}
                    </div>

                    {/* SMART HOVER ACTION */}
                    <div 
                      onClick={() => navigate("/barang", { state: { category: item.nama_kategori } })}
                      className="bg-slate-50 dark:bg-slate-800/50 py-3 px-6 text-center cursor-pointer hover:bg-blue-600 hover:text-white transition-all group/action border-t border-slate-50 dark:border-slate-800"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                         Lihat Katalog <ArrowUpRight size={12} className="group-hover/action:translate-x-1 group-hover/action:-translate-y-1 transition-transform" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
               {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-slate-900 dark:bg-blue-600 text-white shadow-lg" : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600"}`}>
                     {i + 1}
                  </button>
               ))}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL SECTION */}
      <AnimatePresence>
         {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" 
               onClick={() => setIsModalOpen(false)} 
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-800 rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden"
             >
               <div className="p-10">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20 mx-auto transform -rotate-6">
                    <Tags size={36} className="text-white" />
                  </div>
                  <div className="text-center mb-10">
                     <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                       {editingData ? "Perbarui Kategori" : "Kategori Baru"}
                     </h2>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic opacity-60">
                        {editingData ? "Ubah detail klasifikasi" : "Definisikan kelompok barang baru"}
                     </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Nama Klasifikasi</label>
                      <input type="text" value={form.nama_kategori} onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })}
                        placeholder="MIs: ATK, Elektronik..." className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Deskripsi Tambahan</label>
                      <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                        placeholder="Berikan konteks untuk kategori ini..." rows={3} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none" />
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col gap-3">
                    <button onClick={handleSave} disabled={saving} className="w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest bg-slate-900 dark:bg-blue-600 text-white shadow-xl shadow-slate-900/10 dark:shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-3">
                      {saving ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                      {editingData ? "Update Sekarang" : "Buat Kategori"}
                    </button>
                    <button onClick={() => setIsModalOpen(false)} className="w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                      Tutup Panel
                    </button>
                  </div>
               </div>
               
               <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-rose-500 transition-colors">
                 <X size={20} />
               </button>
             </motion.div>
           </div>
         )}
      </AnimatePresence>
    </MainLayout>
  );
}
