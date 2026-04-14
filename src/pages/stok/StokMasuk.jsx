import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getBarang } from "../../services/barangService";
import { tambahStokMasuk, getStokMasuk } from "../../services/stokService";
import { getSuppliers } from "../../services/supplierService";
import { PackagePlus, RefreshCw, ChevronLeft, ChevronRight, User, PlusCircle, Package, X, Eye, MapPin, Tag, Calendar, Hash, Layers, FileText, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../components/common/PageHeader";
import { TableSkeleton } from "../../components/common/Skeleton";

export default function StokMasuk() {
  const [barang, setBarang] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({ barang_id: "", supplier_id: "", jumlah: "", keterangan: "" });
  const selectedBarang = barang.find(b => b.id == form.barang_id);

  useEffect(() => { loadBarang(); loadSuppliers(); loadRiwayat(); }, []);

  const loadSuppliers = async () => {
    try { const res = await getSuppliers(); setSuppliers(res.data); } catch (err) { console.error(err); }
  };
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
      setForm({ barang_id: "", supplier_id: "", jumlah: "", keterangan: "" });
    } catch (err) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal menambahkan stok" }));
    } finally { setLoading(false); }
  };

  const totalPages = Math.ceil(riwayat.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = riwayat.slice(indexFirst, indexLast);
  const totalMasuk = riwayat.reduce((s, r) => s + Number(r.jumlah), 0);

  const inputClass = "w-full px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all placeholder-slate-400";

  const getSumberBadge = (ket) => {
    if (!ket) return <span className="text-[9px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-xl uppercase tracking-widest italic">Manual</span>;
    if (ket.startsWith("Scan QR Auto") || ket.startsWith("Scan Auto")) return <span className="text-[9px] font-black text-violet-600 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-900/50 px-2.5 py-1 rounded-xl uppercase tracking-widest">⚡ Auto Scan</span>;
    if (ket.startsWith("Scan QR")) return <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-900/50 px-2.5 py-1 rounded-xl uppercase tracking-widest">📱 Scan QR</span>;
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
            { label: "Total Transaksi", value: riwayat.length, color: "from-blue-600 to-indigo-600", shadow: "shadow-blue-500/20" },
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
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><PlusCircle size={18} /></div>
              <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Tambah Stok</h2>
            </div>

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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Supplier / Sumber</label>
              <select name="supplier_id" value={form.supplier_id} onChange={handleChange} className={inputClass}>
                <option value="">-- Pilih Supplier (Opsional) --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama_supplier}</option>)}
              </select>
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
                            {r.nama_supplier ? (
                              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                <User size={11} />
                                <span className="text-[10px] font-black uppercase tracking-wide">{r.nama_supplier}</span>
                              </div>
                            ) : (
                              <span className="text-[9px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded-lg uppercase tracking-widest w-fit italic">Manual</span>
                            )}
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
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"}`}>{i + 1}</button>
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
              className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
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

              {/* Modal Body */}
              <div className="px-8 py-6 space-y-1">
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
                  icon={<Layers size={16} />}
                  label="Jumlah Masuk"
                  value={
                    <span className="text-emerald-600 font-black text-lg">+{selectedItem.jumlah} <span className="text-xs text-slate-400 font-bold">{selectedItem.satuan}</span></span>
                  }
                  color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500"
                />
                <DetailRow
                  icon={<Calendar size={16} />}
                  label="Tanggal"
                  value={new Date(selectedItem.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                  color="bg-sky-50 dark:bg-sky-900/30 text-sky-500"
                />
                <DetailRow
                  icon={<Truck size={16} />}
                  label="Supplier"
                  value={selectedItem.nama_supplier || "Input Manual / Internal"}
                  color="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500"
                />
                <DetailRow
                  icon={<MapPin size={16} />}
                  label="Lokasi Rak"
                  value={selectedItem.lokasi_rak}
                  color="bg-rose-50 dark:bg-rose-900/30 text-rose-500"
                />
                <DetailRow
                  icon={<FileText size={16} />}
                  label="Keterangan"
                  value={selectedItem.keterangan}
                  color="bg-violet-50 dark:bg-violet-900/30 text-violet-500"
                />

                {/* Sumber Badge */}
                <div className="flex items-start gap-3 py-3">
                  <div className="p-2 rounded-xl shrink-0 bg-slate-50 dark:bg-slate-800 text-slate-400">
                    <Tag size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sumber Input</p>
                    {getSumberBadge(selectedItem.keterangan)}
                  </div>
                </div>

                {/* Stok Info */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stok Saat Ini</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{selectedItem.stok_sekarang} <span className="text-sm text-slate-400 font-bold">{selectedItem.satuan}</span></p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}