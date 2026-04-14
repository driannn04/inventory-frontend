import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../services/supplierService";
import SupplierModal from "./SupplierModal";
import {
  Users, Plus, Search, RefreshCw, Edit2, Trash2,
  MapPin, Phone, Mail, User, ChevronLeft, ChevronRight, Hash
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

export default function Supplier() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try { const res = await getSuppliers(); setData(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async (form) => {
    try {
      if (editingData) { await updateSupplier(editingData.id, form); }
      else { await createSupplier(form); }
      setIsModalOpen(false); setEditingData(null); loadData();
    } catch (err) { alert(err.response?.data?.message || "Gagal menyimpan data"); }
  };

  const handleDelete = async (id) => {
    import("sweetalert2").then(({ default: Swal }) => {
      Swal.fire({
        title: "Hapus Supplier?", text: "Yakin ingin menghapus supplier ini?",
        icon: "warning", showCancelButton: true, confirmButtonColor: "#e11d48",
        cancelButtonColor: "#94a3b8", confirmButtonText: "Hapus",
        customClass: { popup: "rounded-3xl shadow-xl" }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try { await deleteSupplier(id); loadData(); }
          catch (err) { alert(err.response?.data?.message || "Gagal menghapus"); }
        }
      });
    });
  };

  const filtered = data.filter(item =>
    item.nama_supplier?.toLowerCase().includes(search.toLowerCase()) ||
    item.kode_supplier?.toLowerCase().includes(search.toLowerCase()) ||
    item.pic?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = filtered.slice(indexFirst, indexLast);

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        <PageHeader
          icon={<Users size={22} />}
          title="Data Supplier"
          subtitle="Manajemen mitra & rantai pasok"
          badge={{ label: "Total", value: data.length }}
          actions={
            <>
              <button onClick={loadData} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 transition-all active:scale-95">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button onClick={() => { setEditingData(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest">
                <Plus size={16} /> Tambah Supplier
              </button>
            </>
          }
        />

        {/* SEARCH */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input type="text" placeholder="Cari supplier, kode, atau PIC..." value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="outline-none flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
          />
          {search && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} hasil</span>}
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="border-b border-slate-50 dark:border-slate-800">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <th className="px-8 py-5">Detail Perusahaan</th>
                  <th className="px-8 py-5">Kontak & PIC</th>
                  <th className="px-8 py-5">Alamat</th>
                  <th className="px-8 py-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {currentData.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <Users size={28} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Belum ada data supplier</p>
                    </div>
                  </td></tr>
                ) : currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20">
                          {item.nama_supplier?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.nama_supplier}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Hash size={9} className="text-slate-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.kode_supplier || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2"><User size={13} className="text-indigo-400" /><span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.pic || "Belum ada PIC"}</span></div>
                        <div className="flex items-center gap-2"><Phone size={13} className="text-slate-300" /><span className="text-xs text-slate-500 dark:text-slate-400">{item.no_telp || "-"}</span></div>
                        <div className="flex items-center gap-2"><Mail size={13} className="text-slate-300" /><span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{item.email || "-"}</span></div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-start gap-2 max-w-[220px]">
                        <MapPin size={13} className="text-slate-300 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{item.alamat || "Alamat belum diinput"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setEditingData(item); setIsModalOpen(true); }} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-all" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 transition-all" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-8 py-6 border-t border-slate-50 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hal {currentPage} dari {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-all">
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"}`}>{i + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <SupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} editingData={editingData} />
    </MainLayout>
  );
}
