import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getBarang } from "../../services/barangService";
import { tambahStokMasuk, getStokMasuk } from "../../services/stokService";
import { UPLOAD_URL } from "../../utils/api";

import { PackagePlus, RefreshCw, ChevronLeft, ChevronRight, User, PlusCircle, Package, X, Eye, MapPin, Tag, Calendar, Hash, Layers, FileText, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../components/common/PageHeader";
import { TableSkeleton } from "../../components/common/Skeleton";

export default function StokMasuk() {
  const [barang, setBarang] = useState([]);

  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({ barang_id: "", jumlah: "", keterangan: "" });
  const selectedBarang = barang.find(b => b.id == form.barang_id);

  useEffect(() => { loadBarang(); loadRiwayat(); }, []);
  const loadBarang = async () => {
    try { const res = await getBarang(); setBarang(res.data); } catch (err) { console.error(err); }
  };
  const loadRiwayat = async () => {
    setLoadingData(true);
    try { const res = await getStokMasuk(); setRiwayat(res.data.sort((a, b) => b.id - a.id)); } catch (err) { console.error(err); }
    finally { setLoadingData(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.barang_id || !form.jumlah) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Oops!", text: "Lengkapi data dulu!" }));
      return;
    }
    if (form.jumlah <= 0) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Oops!", text: "Jumlah harus lebih dari 0!" }));
      return;
    }
    try {
      setLoading(true);
      await tambahStokMasuk({ ...form, barang_id: Number(form.barang_id), jumlah: Number(form.jumlah) });
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "success", title: "Berhasil!", text: "Stok berhasil ditambahkan" }));
      loadRiwayat(); loadBarang(); setCurrentPage(1);
      setForm({ barang_id: "", jumlah: "", keterangan: "" });
    } catch (err) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal menambahkan stok" }));
    } finally { setLoading(false); }
  };

  const totalPages = Math.ceil(riwayat.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = riwayat.slice(indexFirst, indexLast);
  const totalMasuk = riwayat.reduce((s, r) => s + Number(r.jumlah), 0);
  
  const recentItems = [...new Map(riwayat.slice(0, 20).map(r => [r.barang_id, r])).values()].slice(0, 4);

  const inputClass = "w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all placeholder-slate-400";

  const getSumberBadge = (ket) => {
    if (!ket) return <span className="text-[9px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-xl uppercase tracking-widest italic">Manual</span>;
    if (ket.startsWith("Scan QR Auto") || ket.startsWith("Scan Auto")) return <span className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50 px-2.5 py-1 rounded-xl uppercase tracking-widest">⚡ Auto Scan</span>;
    if (ket.startsWith("Scan QR")) return <span className="text-[9px] font-black text-sky-600 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-900/50 px-2.5 py-1 rounded-xl uppercase tracking-widest">📱 Scan QR</span>;
    return <span className="text-[9px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-xl uppercase tracking-widest italic">Manual</span>;
  };

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
          icon={<PackagePlus size={22} />}
          title="Stok Masuk"
          subtitle="Inbound logistics & pencatatan penerimaan"
          actions={
            <button onClick={() => { loadRiwayat(); loadBarang(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 transition-all active:scale-95">
              <RefreshCw size={16} />
            </button>
          }
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Total Transaksi", value: riwayat.length, color: "from-blue-700 to-sky-500", shadow: "shadow-blue-500/20" },
            { label: "Total Unit Masuk", value: totalMasuk, color: "from-emerald-600 to-teal-600", shadow: "shadow-emerald-500/20" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-3xl font-black mt-2 bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* MAIN GRID: FORM + TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* FORM */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><PlusCircle size={18} /></div>
              <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Tambah Stok</h2>
            </div>
            
            {recentItems.length > 0 && (
              <div className="bg-slate-50/50 dark:bg-slate-800/30 -mx-8 px-8 py-5 border-y border-slate-100 dark:border-slate-800">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><RefreshCw size={12} /> Input Cepat (Terbaru)</p>
                 <div className="flex flex-wrap gap-2">
                    {recentItems.map(item => (
                       <button 
                          key={item.barang_id}
                          onClick={() => setForm({...form, barang_id: item.barang_id})}
                          className={`border px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 
                          ${form.barang_id == item.barang_id 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 shadow-sm" 
                            : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600"}`}
                       >
                          <Package size={12} />
                          {item.nama_barang}
                       </button>
                    ))}
                 </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Pilih Barang *</label>
              <select name="barang_id" value={form.barang_id} onChange={handleChange} className={inputClass}>
                <option value="">-- Pilih Barang --</option>
                {barang.map(b => <option key={b.id} value={b.id}>{b.nama_barang}</option>)}
              </select>
              {selectedBarang && (
                <p className="text-[10px] font-bold text-slate-400 mt-2 pl-1 uppercase tracking-widest">
                  Stok saat ini: <span className="text-blue-600 font-black">{selectedBarang.stok}</span>
                </p>
              )}
            </div>



            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Jumlah *</label>
              <input type="number" name="jumlah" value={form.jumlah} onChange={handleChange} placeholder="0" min="1" className={inputClass} />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Keterangan</label>
              <textarea name="keterangan" value={form.keterangan} onChange={handleChange} placeholder="Keterangan penerimaan..." rows={3} className={`${inputClass} resize-none`} />
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <PlusCircle size={16} />}
              {loading ? "Menyimpan..." : "Simpan Stok Masuk"}
            </button>
          </div>

          {/* TABLE: RIWAYAT */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Riwayat Stok Masuk</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hal {currentPage} dari {totalPages || 1}</span>
            </div>
            {loadingData ? (
              <div className="p-8">
                <TableSkeleton columns={6} rows={5} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="border-b border-slate-50 dark:border-slate-800">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      <th className="px-8 py-5 w-[5%]">#</th>
                      <th className="px-8 py-5 w-[30%]">Barang</th>
                      <th className="px-8 py-5 w-[12%] text-center">Jumlah</th>
                      <th className="px-8 py-5 w-[18%]">Tanggal</th>
                      <th className="px-8 py-5 w-[25%]">Sumber</th>
                      <th className="px-8 py-5 w-[10%] text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {currentData.length === 0 ? (
                      <tr><td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <Package size={28} className="text-slate-300 dark:text-slate-600" />
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Belum ada riwayat stok masuk</p>
                        </div>
                      </td></tr>
                    ) : currentData.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group" onClick={() => setSelectedItem(r)}>
                        <td className="px-8 py-5 text-[11px] font-bold text-slate-400">{indexFirst + idx + 1}</td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{r.nama_barang}</p>
                          {r.kode_barang && <p className="text-[10px] font-mono text-slate-400 mt-0.5">{r.kode_barang}</p>}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900/50 px-3 py-1.5 rounded-xl">+{r.jumlah}</span>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                          {new Date(r.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded-lg uppercase tracking-widest w-fit italic">Manual / Internal</span>
                            {r.keterangan && <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{r.keterangan}</span>}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <button className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all opacity-0 group-hover:opacity-100" title="Lihat Detail">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-between items-center px-8 py-6 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {indexFirst + 1}–{Math.min(indexLast, riwayat.length)} dari {riwayat.length}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-all"><ChevronLeft size={16} /></button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-all"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== DETAIL MODAL ========== */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-white dark:bg-slate-900 z-10 px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                    <PackagePlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Detail Stok Masuk</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Transaksi #{selectedItem.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body - 2 Columns */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                  
                  {/* Left Column: Visual & Summary */}
                  <div className="md:col-span-5 p-8 bg-slate-50/30 dark:bg-slate-800/20 border-r border-slate-100 dark:border-slate-800/50 flex flex-col gap-6">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 block">Visual Barang</label>
                      <div className="w-full aspect-square rounded-[2rem] overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative group">
                        <img 
                          src={selectedItem.foto ? `${UPLOAD_URL}/${selectedItem.foto}` : "/no-image.png"} 
                          alt={selectedItem.nama_barang} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jumlah Masuk</p>
                        <div className="flex items-end gap-2 text-emerald-600">
                          <span className="text-4xl font-black tracking-tighter">+{selectedItem.jumlah}</span>
                          <span className="text-xs font-bold uppercase pb-1.5">{selectedItem.satuan}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-50 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stok Setelah Masuk</p>
                        <div className="flex items-end gap-2 text-slate-800 dark:text-white">
                          <span className="text-2xl font-black">{selectedItem.stok_sekarang}</span>
                          <span className="text-xs font-bold uppercase pb-1 text-slate-400">{selectedItem.satuan}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Detailed Info */}
                  <div className="md:col-span-7 p-8 space-y-1">
                    <div className="grid grid-cols-1 gap-1">
                      <DetailRow
                        icon={<Package size={16} />}
                        label="Nama Barang"
                        value={selectedItem.nama_barang}
                        color="bg-blue-50 dark:bg-blue-900/30 text-blue-500"
                      />
                      <DetailRow
                        icon={<Hash size={16} />}
                        label="Kode Barang"
                        value={selectedItem.kode_barang}
                        color="bg-slate-50 dark:bg-slate-800 text-slate-400"
                      />
                      <DetailRow
                        icon={<Tag size={16} />}
                        label="Kategori"
                        value={selectedItem.nama_kategori}
                        color="bg-amber-50 dark:bg-amber-900/30 text-amber-500"
                      />
                      <DetailRow
                        icon={<MapPin size={16} />}
                        label="Lokasi Rak"
                        value={selectedItem.lokasi_rak || "-"}
                        color="bg-rose-50 dark:bg-rose-900/30 text-rose-500"
                      />
                      <DetailRow
                        icon={<Calendar size={16} />}
                        label="Waktu Transaksi"
                        value={new Date(selectedItem.tanggal).toLocaleString("id-ID", { 
                          weekday: "long", 
                          day: "2-digit", 
                          month: "long", 
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                        color="bg-sky-50 dark:bg-sky-900/30 text-sky-500"
                      />
                      <DetailRow
                        icon={<FileText size={16} />}
                        label="Keterangan"
                        value={selectedItem.keterangan || "Tanpa keterangan"}
                        color="bg-blue-50 dark:bg-blue-900/30 text-blue-500"
                      />

                      <div className="flex items-start gap-4 py-5 mt-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl px-5 border border-slate-100 dark:border-slate-800">
                        <div className="p-2.5 rounded-xl shrink-0 bg-white dark:bg-slate-700 shadow-sm text-slate-400">
                          <Tag size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sumber Transaksi</p>
                          {getSumberBadge(selectedItem.keterangan)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
                >
                  Selesai & Tutup Detail
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}