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
              <button onClick={openCreate} className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25 hover:scale-[1.05] active:scale-95 transition-all font-black text-xs uppercase tracking-[0.2em]">
                 <Plus size={18} strokeWidth={3} /> Tambah Kategori
              </button>
           </div>
        </div>

        {/* SUMMARY INSIGHTS AREA - SIMPLIFIED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Kategori</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{data.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grup Aktif</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{data.filter(d => d.total_barang > 0).length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Kritis</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{data.filter(d => d.stok_kritis > 0).length}</p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-3 shadow-sm border border-slate-100 dark:border-slate-800/50 flex items-center gap-4 group focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
             <Search size={20} />
          </div>
          <input
            type="text" placeholder="CARI NAMA ATAU DESKRIPSI KATEGORI..." value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="flex-1 bg-transparent text-sm font-black text-slate-700 dark:text-white outline-none placeholder:text-slate-300 uppercase tracking-[0.2em]"
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
          <div className="bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm rounded-[3rem] py-24 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
               <FolderOpen size={40} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic">Tidak ada data ditemukan</h3>
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
                    className="group relative bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col overflow-hidden"
                  >
                    {/* TOP ACCENT BAR & GRADIENT OVERLAY */}
                    <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-br ${color.gradient} opacity-[0.03] dark:opacity-[0.08]`} />
                    <div className={`h-2 w-full bg-gradient-to-r ${color.gradient}`} />
                    
                    <div className="p-7 flex-1 flex flex-col relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color.gradient} flex items-center justify-center text-white shadow-lg ${color.shadow}`}>
                           <Tags size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition-all"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(item)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </div>

                      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-1 line-clamp-1">
                        {item.nama_kategori}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight line-clamp-2 mb-6">
                        {item.deskripsi || "Grup Barang Operasional"}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Variasi</p>
                            <p className="text-xs font-black text-slate-700 dark:text-white">{item.total_barang || 0} Item</p>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Total Stok</p>
                            <p className="text-xs font-black text-slate-700 dark:text-white">{item.total_stok || 0} Unit</p>
                         </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate("/barang", { state: { category: item.nama_kategori } })}
                      className="py-3 px-6 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all border-t border-slate-50 dark:border-slate-800"
                    >
                      Buka Katalog <ArrowRight size={12} className="inline ml-1" />
                    </button>
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
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600"}`}>
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

      {/* MODAL SECTION - OVERHAULED TO PREMIUM COMMAND CENTER */}
      <AnimatePresence>
         {isModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl" 
               onClick={() => setIsModalOpen(false)} 
             />
             <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden p-10"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Tags size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      {editingData ? "Edit Kategori" : "Kategori Baru"}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Klasifikasi Barang Inventaris
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nama Kategori</label>
                    <input 
                      type="text" 
                      value={form.nama_kategori} 
                      onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })}
                      placeholder="MIs: ATK, Alat Kantor..." 
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Deskripsi</label>
                    <textarea 
                      value={form.deskripsi} 
                      onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                      placeholder="Penjelasan singkat..." 
                      rows={3} 
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 transition-all resize-none" 
                    />
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
                    Batal
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saving || !form.nama_kategori}
                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 hover:scale-105 transition-all"
                  >
                    {saving ? "Menyimpan..." : (editingData ? "Update Kategori" : "Tambah Kategori")}
                  </button>
                </div>

                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500">
                  <X size={20} />
                </button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </MainLayout>
  );
}
