import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getKategori, createKategori, updateKategori, deleteKategori } from "../../services/kategoriService";
import {
  Tags, Plus, Search, RefreshCw, Edit2, Trash2,
  ChevronLeft, ChevronRight, X, Check, FolderOpen
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

const categoryColors = [
  { gradient: "from-blue-500 to-cyan-500", light: "bg-blue-50 text-blue-600", border: "border-blue-100" },
  { gradient: "from-emerald-500 to-teal-500", light: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
  { gradient: "from-sky-400 to-blue-500", light: "bg-sky-50 text-sky-600", border: "border-sky-100" },
  { gradient: "from-amber-500 to-orange-500", light: "bg-amber-50 text-amber-600", border: "border-amber-100" },
  { gradient: "from-pink-500 to-rose-500", light: "bg-pink-50 text-pink-600", border: "border-pink-100" },
  { gradient: "from-blue-500 to-sky-500", light: "bg-blue-50 text-blue-600", border: "border-blue-100" },
];

export default function KategoriBarang() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
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
    if (!form.nama_kategori) { alert("Nama kategori wajib diisi!"); return; }
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
        title: "Hapus Kategori?", text: `Yakin hapus "${item.nama_kategori}"?`,
        icon: "warning", showCancelButton: true, confirmButtonColor: "#e11d48",
        cancelButtonColor: "#94a3b8", confirmButtonText: "Hapus",
        customClass: { popup: "rounded-3xl shadow-xl" }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try { await deleteKategori(item.id); loadData(); }
          catch (err) { alert(err.response?.data?.message || "Gagal menghapus"); }
        }
      });
    });
  };

  const filtered = data.filter(item =>
    item.nama_kategori?.toLowerCase().includes(search.toLowerCase()) ||
    item.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        {/* PAGE HEADER */}
        <PageHeader
          icon={<Tags size={22} />}
          title="Kategori Barang"
          subtitle="Kelola pengelompokan jenis barang"
          badge={{ label: "Total", value: data.length }}
          actions={
            <>
              <button onClick={loadData} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all active:scale-95">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest">
                <Plus size={16} /> Tambah
              </button>
            </>
          }
        />

        {/* SEARCH */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text" placeholder="Cari kategori..." value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="outline-none flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
          />
          {search && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} hasil</span>}
        </div>

        {/* GRID CARDS */}
        {currentData.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 py-24 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={28} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Belum ada kategori</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentData.map((item, index) => {
              const color = categoryColors[index % categoryColors.length];
              return (
                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                  {/* Top color bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${color.gradient}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color.gradient} flex items-center justify-center shadow-md`}>
                          <Tags size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">{item.nama_kategori}</h3>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID #{item.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(item)} className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {item.deskripsi && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed line-clamp-2">{item.deskripsi}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm">
              <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500"}`}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Modal Header */}
            <div className="flex flex-col items-center pt-10 pb-8 px-8 border-b border-slate-50 dark:border-slate-800">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center mb-5 shadow-xl shadow-blue-500/30">
                <Tags size={28} className="text-white" />
              </div>
              <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {editingData ? "Edit Kategori" : "Tambah Kategori"}
              </h2>
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">Kelompok tipe barang</p>
            </div>
            {/* Modal Body */}
            <div className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nama Kategori *</label>
                <input type="text" value={form.nama_kategori} onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })}
                  placeholder="Contoh: ATK, Perpipaan..." className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all placeholder-slate-400" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Keterangan singkat..." rows={3} className="w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all resize-none placeholder-slate-400" />
              </div>
            </div>
            {/* Modal Footer */}
            <div className="px-8 pb-8 flex flex-col gap-3">
              <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                {editingData ? "Simpan Perubahan" : "Tambah Kategori"}
              </button>
              <button onClick={() => setIsModalOpen(false)} className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                Batalkan
              </button>
            </div>
            {/* Close button */}
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
