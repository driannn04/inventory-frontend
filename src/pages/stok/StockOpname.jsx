import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getOpnameHistory, createOpname } from "../../services/opnameService";
import { getBarang } from "../../services/barangService";
import { ClipboardList, Plus, AlertTriangle, CheckCircle2, History, Search, RefreshCw, X, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

export default function StockOpname() {
  const [history, setHistory] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [form, setForm] = useState({ barang_id: "", stok_fisik: "", catatan: "" });
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, barangRes] = await Promise.all([getOpnameHistory(), getBarang()]);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      setBarangList(Array.isArray(barangRes.data) ? barangRes.data : []);
    } catch (error) { console.error("Gagal memuat data:", error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.barang_id || form.stok_fisik === "") return;
    setSubmitting(true);
    try {
      await createOpname(form);
      setShowModal(false); setForm({ barang_id: "", stok_fisik: "", catatan: "" }); setSelectedBarang(null);
      fetchData();
    } catch (error) { alert(error.response?.data?.message || "Gagal menyimpan opname"); }
    finally { setSubmitting(false); }
  };

  const filteredBarangList = (Array.isArray(barangList) ? barangList : []).filter(b =>
    b.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.kode_barang?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 text-sm dark:text-white transition-all placeholder-slate-400";

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        <PageHeader
          icon={<ClipboardList size={22} />}
          title="Stock Opname"
          subtitle="Audit fisik & rekonsiliasi stok gudang"
          badge={{ label: "Total Audit", value: history.length }}
          actions={
            <>
              <button onClick={fetchData} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 transition-all active:scale-95">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest">
                <Plus size={16} /> Buat Audit Baru
              </button>
            </>
          }
        />

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Riwayat Audit", value: history.length, color: "from-blue-600 to-indigo-600" },
            { label: "Selisih Ditemukan",   value: history.filter(h => h.selisih !== 0).length, color: "from-rose-600 to-pink-600" },
            { label: "Data Akurat (Sesuai)", value: history.filter(h => h.selisih === 0).length, color: "from-emerald-600 to-teal-600" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-3xl font-black mt-2 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* HISTORY TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
            <History size={16} className="text-slate-400" />
            <h2 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Riwayat Opname</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="border-b border-slate-50 dark:border-slate-800">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <th className="px-8 py-5">Tanggal</th>
                  <th className="px-8 py-5">Barang</th>
                  <th className="px-8 py-5 text-center">Stok Sistem</th>
                  <th className="px-8 py-5 text-center">Stok Fisik</th>
                  <th className="px-8 py-5 text-center">Selisih</th>
                  <th className="px-8 py-5">Oleh</th>
                  <th className="px-8 py-5">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-8 py-5"><div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl" /></td>
                      ))}
                    </tr>
                  ))
                ) : history.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Belum ada riwayat audit stok</p>
                  </td></tr>
                ) : history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300">{new Date(h.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">{new Date(h.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{h.nama_barang}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{h.kode_barang}</p>
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-black text-slate-600 dark:text-slate-400 font-mono">{h.stok_sistem}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-[11px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50 px-3 py-1.5 rounded-xl">{h.stok_fisik}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {h.selisih === 0 ? (
                        <span className="flex items-center justify-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                          <CheckCircle2 size={10} /> Sesuai
                        </span>
                      ) : (
                        <span className={`flex items-center justify-center gap-1.5 text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${h.selisih > 0 ? "text-blue-600 bg-blue-50 border-blue-200" : "text-rose-600 bg-rose-50 border-rose-200"}`}>
                          <AlertTriangle size={10} /> {h.selisih > 0 ? `+${h.selisih}` : h.selisih}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400">{h.nama_user}</td>
                    <td className="px-8 py-5 text-[11px] text-slate-400 italic max-w-[160px] truncate">{h.catatan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION STOCK OPNAME */}
          {history.length > itemsPerPage && (
            <div className="flex items-center justify-between p-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, history.length)} dari {history.length} data
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
                  {[...Array(Math.ceil(history.length / itemsPerPage))].map((_, i) => {
                    const totalPages = Math.ceil(history.length / itemsPerPage);
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
                        className={`w-8 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(history.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(history.length / itemsPerPage)}
                  className="p-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex flex-col items-center pt-10 pb-8 px-8 border-b border-slate-50 dark:border-slate-800">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-5 shadow-xl shadow-blue-500/30">
                <ClipboardList size={28} className="text-white" />
              </div>
              <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">Audit Fisik Barang</h2>
              <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">Hitung & rekonsiliasi stok fisik</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* BARANG */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Pilih Barang *</label>
                  {!selectedBarang ? (
                    <div className="relative">
                      <Search size={15} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Cari Nama / Kode Barang..." className={`${inputClass} pl-12`}
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setInputFocused(true)} onBlur={() => setTimeout(() => setInputFocused(false), 200)} />
                      {(searchTerm || inputFocused) && (
                        <div className="absolute top-full left-0 right-0 z-[110] max-h-48 overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mt-2 rounded-2xl shadow-xl">
                          {filteredBarangList.length === 0 ? (
                            <p className="p-4 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">Barang tidak ditemukan</p>
                          ) : filteredBarangList.slice(0, 20).map(b => (
                            <div key={b.id} onClick={() => { setSelectedBarang(b); setForm({ ...form, barang_id: b.id }); setSearchTerm(""); }}
                              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors">
                              <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{b.nama_barang}</p>
                              <p className="text-[9px] font-bold text-slate-400 flex justify-between mt-0.5 uppercase tracking-widest">
                                <span>{b.kode_barang}</span><span className="font-mono">Stok: {b.stok}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-black text-blue-700 dark:text-blue-300 uppercase tracking-tight">{selectedBarang.nama_barang}</p>
                        <p className="text-[10px] font-bold text-blue-500 mt-0.5 uppercase tracking-widest">Stok Sistem: {selectedBarang.stok}</p>
                      </div>
                      <button type="button" onClick={() => { setSelectedBarang(null); setForm({ ...form, barang_id: "" }); }}
                        className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all border border-slate-100 dark:border-slate-700">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Jumlah Fisik Ditemukan *</label>
                  <input type="number" required placeholder="Contoh: 10" className={inputClass}
                    value={form.stok_fisik} onChange={(e) => setForm({ ...form, stok_fisik: e.target.value })} />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Catatan / Alasan</label>
                  <textarea placeholder="Misal: Barang rusak atau selisih audit triwulan..." className={`${inputClass} h-24 resize-none`}
                    value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition-all">
                    Batal
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                    {submitting ? <RefreshCw size={15} className="animate-spin" /> : null}
                    {submitting ? "Menyimpan..." : "Simpan Hasil Audit"}
                  </button>
                </div>
              </form>
            </div>
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors border border-slate-100 dark:border-slate-700">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
