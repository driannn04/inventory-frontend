import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Plus, PlusCircle, Zap, Search, Pencil, Trash2, QrCode, Download, ScrollText, Package, RefreshCw, ChevronLeft, ChevronRight, LayoutGrid, List, Filter, AlertTriangle, Users } from "lucide-react";
import BarangModal from "../../components/modals/BarangModal";
import { getBarang, deleteBarang, getQR, downloadQR } from "../../services/barangService";
import { UPLOAD_URL } from "../../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError, confirmDelete } from "../../utils/swalHelper";
import { getRole } from "../../utils/auth";
import PageHeader from "../../components/common/PageHeader";
import { TableSkeleton } from "../../components/common/Skeleton";
import ImagePreview from "../../components/common/ImagePreview";
import TraceOrderModal from "../../components/modals/TraceOrderModal";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../../components/common/EmptyState";

export default function Barang() {
  const role = getRole();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [barang, setBarang] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState((role === 'staff' || role === 'asisten_manager' || role === 'manager') ? "card" : "table");
  const [qrModal, setQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrName, setQrName] = useState("");
  const [qrId, setQrId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // State for Trace Order
  const [showTrace, setShowTrace] = useState(false);
  const [traceId, setTraceId] = useState(null);
  const [traceName, setTraceName] = useState("");
  const itemsPerPage = viewMode === "card" ? 12 : 8;

  useEffect(() => { loadBarang(); }, []);

  const loadBarang = async () => {
    setLoading(true);
    try {
      const res = await getBarang();
      setBarang(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    confirmDelete("Hapus Barang?", "Yakin ingin menghapus barang ini?").then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBarang(id);
          showSuccess("Barang berhasil dihapus");
          loadBarang();
        } catch (err) { showError(err.response?.data?.message || "Gagal menghapus"); }
      }
    });
  };

  const handleEdit = (item) => { setSelectedBarang(item); setOpenModal(true); };

  const handleShowQR = async (item) => {
    try {
      const res = await getQR(item.id);
      setQrData(res.data.qr_code); setQrName(res.data.barang); setQrId(item.id); setQrModal(true);
    } catch (err) { showError("Gagal mengambil QR"); }
  };

  const handleDownloadQR = async (id) => {
    try {
      const res = await downloadQR(id);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url; link.setAttribute("download", `QR_${qrName || id}.png`);
      document.body.appendChild(link); link.click();
      link.parentNode.removeChild(link); window.URL.revokeObjectURL(url);
    } catch (err) { showError("Gagal mengunduh QR"); }
  };

  const fuzzyMatch = (pattern, str) => {
    if (!pattern) return true;
    const cleanPattern = pattern.toLowerCase().replace(/\s+/g, '');
    const cleanStr = str.toLowerCase();
    let pIdx = 0;
    for (let i = 0; i < cleanStr.length; i++) {
      if (cleanStr[i] === cleanPattern[pIdx]) pIdx++;
      if (pIdx === cleanPattern.length) return true;
    }
    return false;
  };

  const categories = [...new Set(barang.map(b => b.nama_kategori))];

  const stats = {
    total: barang.length,
    kritis: barang.filter(b => b.stok > 0 && b.stok <= b.stok_minimum).length,
    habis: barang.filter(b => b.stok <= 0).length,
    kategori: categories.length
  };

  const filteredBarang = barang.filter((item) => {
    const matchSearch = fuzzyMatch(search, item.nama_barang) || fuzzyMatch(search, item.kode_barang);
    const matchKategori = filterKategori ? item.nama_kategori === filterKategori : true;
    const matchStatus =
      filterStatus === "all" ? true :
        filterStatus === "aman" ? item.stok > item.stok_minimum :
          filterStatus === "kritis" ? (item.stok > 0 && item.stok <= item.stok_minimum) :
            filterStatus === "habis" ? item.stok <= 0 : true;

    return matchSearch && matchKategori && matchStatus;
  });

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentBarang = filteredBarang.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        {/* PAGE HEADER */}
        <PageHeader
          icon={<Package size={22} />}
          title={
            role === 'staff' ? "Galeri Barang" :
            (role === 'asisten_manager' || role === 'manager') ? "Pantau Stok Barang" :
            "Katalog Barang"
          }
          subtitle={
            role === 'staff' ? "Cari dan pilih barang kebutuhan operasional Anda" :
            (role === 'asisten_manager' || role === 'manager') ? "Monitoring ketersediaan stok inventaris" :
            "Manajemen inventaris barang gudang"
          }
          badge={{ label: "Total Tersedia", value: barang.length }}
          actions={
            <>
              <button onClick={loadBarang} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all hover:shadow-sm active:scale-95">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              {(role === 'admin' || role === 'gudang') && (
                <button
                  onClick={() => { setSelectedBarang(null); setOpenModal(true); }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
                >
                  <Plus size={16} /> Tambah Barang
                </button>
              )}
            </>
          }
        />

        {/* MODAL */}
        <BarangModal open={openModal} setOpen={setOpenModal} reload={loadBarang} editData={selectedBarang} />

        {/* STATS ROW — Hanya tampil untuk Admin/Gudang */}
        {role !== 'staff' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-blue-500" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Barang</p>
              </div>
              <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <List size={14} className="text-emerald-500" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kategori</p>
              </div>
              <p className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats.kategori}</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-900/50 shadow-sm relative overflow-hidden flex flex-col items-start">
              <AlertTriangle className="absolute -right-4 -bottom-4 text-rose-100 dark:text-rose-900/30" size={64} />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <AlertTriangle size={14} className="text-rose-500" />
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Stok Menipis</p>
              </div>
              <p className="text-2xl font-black text-rose-600 relative z-10">{stats.kritis}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Stok Kosong / Habis</p>
              <p className="text-2xl font-black text-slate-600 dark:text-slate-400">{stats.habis}</p>
            </div>
          </div>
        )}

        {/* TOOLBAR: SEARCH & FILTERS */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari nama / kode barang..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="outline-none flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-5">
              <Filter size={15} className="text-slate-400" />
              <select value={filterKategori} onChange={(e) => { setFilterKategori(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest outline-none cursor-pointer">
                <option value="">Semua Kategori</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-5">
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest outline-none cursor-pointer">
                <option value="all">Semua Status</option>
                <option value="aman">Stok Aman</option>
                <option value="kritis">Stok Menipis</option>
                <option value="habis">Habis</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700 ml-1">
              <button onClick={() => { setViewMode("table"); setCurrentPage(1); }} className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                <List size={16} />
              </button>
              <button onClick={() => { setViewMode("card"); setCurrentPage(1); }} className={`p-1.5 rounded-lg transition-all ${viewMode === "card" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
            <TableSkeleton columns={6} rows={5} />
          </div>
        ) : currentBarang.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <EmptyState 
              icon={Package} 
              title="Barang Tidak Ditemukan" 
              message={search ? `Tidak ada barang yang cocok dengan kata kunci "${search}"` : "Katalog barang masih kosong atau belum ada data yang sesuai dengan filter Anda."}
              actionText={(role === 'admin' || role === 'gudang') && !search ? "Tambah Barang Baru" : null}
              onAction={() => { setSelectedBarang(null); setOpenModal(true); }}
            />
          </div>
        ) : viewMode === "table" ? (
          /* TABLE VIEW */
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <th className="px-6 py-5 text-center">Foto</th>
                    <th className="px-6 py-5 text-left">Nama Barang</th>
                    <th className="px-6 py-5 text-center">Kategori</th>
                    <th className="px-6 py-5 text-center">Stok Inventaris</th>
                    {role !== 'staff' && <th className="px-6 py-5 text-center">Lokasi</th>}
                    <th className="px-6 py-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {currentBarang.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="flex justify-center">
                          <ImagePreview src={item.foto ? `${UPLOAD_URL}/${item.foto}` : "/no-image.png"} alt={item.nama_barang} size="md" />
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-left">
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.nama_barang}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">{item.kode_barang}</p>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className="inline-block text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-xl uppercase tracking-widest">{item.nama_kategori}</span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        {(() => {
                          const available = Number(item.stok_tersedia || 0);
                          const physical = Number(item.stok || 0);
                          const reserved = physical - available;

                          if (role === 'staff') {
                            return (
                              <div className="flex justify-center">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm ${
                                  available <= 0 ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/20 dark:border-rose-900/30' : 
                                  available <= 5 ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-900/30' : 
                                  'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900/30'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${available <= 0 ? 'bg-rose-500' : available <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    {available <= 0 ? 'Habis' : `Sisa ${available} ${item.satuan || ''}`}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div className="flex justify-center">
                              <div className="inline-flex divide-x divide-slate-200 dark:divide-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                                {/* Siap Pakai */}
                                <div className="px-4 py-2 flex flex-col items-center justify-center bg-white dark:bg-slate-900 min-w-[70px]">
                                  <span className={`text-[13px] font-black ${available <= 0 ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>
                                    {available}
                                  </span>
                                  <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Tersedia</span>
                                </div>

                                {/* Dipesan */}
                                {reserved > 0 && (
                                  <button 
                                    onClick={() => { setTraceId(item.id); setTraceName(item.nama_barang); setShowTrace(true); }}
                                    className="px-4 py-2 flex flex-col items-center justify-center bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors min-w-[70px] group"
                                    title="Lihat detail pemesanan"
                                  >
                                    <span className="text-[13px] font-black text-amber-500 group-hover:text-amber-600 transition-colors">
                                      {reserved}
                                    </span>
                                    <span className="text-[8px] font-bold text-amber-500/80 group-hover:text-amber-600 uppercase tracking-widest mt-0.5 border-b border-dashed border-amber-300">Dipesan</span>
                                  </button>
                                )}

                                {/* Fisik */}
                                <div className="px-4 py-2 flex flex-col items-center justify-center min-w-[70px]">
                                  <span className="text-[13px] font-black text-slate-600 dark:text-slate-300">
                                    {physical}
                                  </span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fisik</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      {role !== 'staff' && (
                        <td className="px-6 py-4 align-middle text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          {item.lokasi_rak || "-"}
                        </td>
                      )}
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="flex justify-center items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(role === 'admin' || role === 'gudang') && (
                            <>
                              <button onClick={() => handleEdit(item)} title="Edit" className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 transition-all"><Pencil size={15} /></button>
                              <button onClick={() => handleDelete(item.id)} title="Hapus" className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 transition-all"><Trash2 size={15} /></button>
                            </>
                          )}
                          {(role === 'admin' || role === 'gudang') && (
                            <button onClick={() => handleShowQR(item)} title="QR Code" className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 transition-all"><QrCode size={15} /></button>
                          )}
                          {role === 'staff' ? (
                            item.stok_tersedia > 0 ? (
                              <button
                                onClick={() => navigate("/buat-pengajuan", { state: { directItem: item } })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                              >
                                <Plus size={12} /> Ajukan
                              </button>
                            ) : (
                              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest cursor-not-allowed">
                                Habis
                              </span>
                            )
                          ) : (
                            <Link to={`/barang/${item.id}/kartu-stok`} title="Kartu Stok" className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 transition-all"><ScrollText size={15} /></Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* CARD VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {currentBarang.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] p-3 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20 transition-all duration-300 group flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative mb-4 rounded-[1.5rem] overflow-hidden aspect-square bg-slate-50 dark:bg-slate-800">
                    <img src={item.foto ? `${UPLOAD_URL}/${item.foto}` : "/no-image.png"} alt={item.nama_barang} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* Out of Stock Overlay */}
                    {Number(item.stok_tersedia || 0) <= 0 && (
                      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                         <span className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/50">Habis</span>
                      </div>
                    )}

                    {/* Admin Actions Overlay (Top Right) */}
                    {(role === 'admin' || role === 'gudang') && (
                      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => handleEdit(item)} className="p-2.5 bg-white/90 dark:bg-slate-800/90 text-blue-600 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white backdrop-blur-sm transition-colors border border-slate-200/50 dark:border-slate-700/50"><Pencil size={14} /></button>
                        <button onClick={() => handleShowQR(item)} className="p-2.5 bg-white/90 dark:bg-slate-800/90 text-emerald-600 rounded-xl shadow-lg hover:bg-emerald-600 hover:text-white backdrop-blur-sm transition-colors border border-slate-200/50 dark:border-slate-700/50"><QrCode size={14} /></button>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="px-2 flex-1 flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">{item.nama_kategori}</span>
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-[14px] line-clamp-2 leading-snug mb-4 group-hover:text-blue-600 transition-colors">{item.nama_barang}</h3>
                    
                    {/* Stock Detail Section */}
                    {(() => {
                      const available = Number(item.stok_tersedia || 0);
                      const physical = Number(item.stok || 0);
                      const reserved = physical - available;

                      return (
                        <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800/50">
                          {role === 'staff' ? (
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${available <= 0 ? 'bg-rose-500' : available <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              <span className={`text-[11px] font-black uppercase tracking-widest ${available <= 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                {available <= 0 ? 'Stok Habis' : `Tersedia ${available} ${item.satuan}`}
                              </span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col">
                                <span className="text-[13px] font-black text-slate-800 dark:text-white">{available}</span>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Tersedia</span>
                              </div>
                              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                              <button 
                                onClick={() => {
                                  if (reserved > 0) {
                                    setTraceId(item.id);
                                    setTraceName(item.nama_barang);
                                    setShowTrace(true);
                                  }
                                }}
                                className={`flex flex-col items-center ${reserved > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default opacity-50'}`}
                              >
                                <span className={`text-[13px] font-black ${reserved > 0 ? 'text-amber-500' : 'text-slate-400'}`}>{reserved}</span>
                                <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${reserved > 0 ? 'text-amber-500 border-b border-dashed border-amber-300' : 'text-slate-400'}`}>Dipesan</span>
                              </button>
                              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                              <div className="flex flex-col items-end">
                                <span className="text-[13px] font-black text-slate-500">{physical}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fisik</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Action Button Section */}
                  <div className="mt-4 px-2">
                    {role === 'staff' ? (
                      <button 
                        onClick={() => navigate("/buat-pengajuan", { state: { directItem: item } })}
                        disabled={Number(item.stok_tersedia || 0) <= 0}
                        className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2
                          ${Number(item.stok_tersedia || 0) > 0 
                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                      >
                        <Plus size={14} /> {Number(item.stok_tersedia || 0) > 0 ? 'Ajukan Barang' : 'Tidak Tersedia'}
                      </button>
                    ) : (
                      <Link 
                        to={`/barang/${item.id}/kartu-stok`} 
                        className="w-full py-3 bg-white dark:bg-slate-900 text-blue-600 border-2 border-blue-100 dark:border-blue-900/50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <ScrollText size={14} /> Histori Mutasi
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 mt-8 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Hal {currentPage} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex px-1 gap-1.5 items-center">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-[11px] font-black uppercase transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR MODAL */}
      {qrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-10 text-center space-y-6 w-full max-w-xs">
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{qrName}</h2>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl inline-block">
              <img src={qrData} className="w-44 mx-auto rounded-xl" alt="QR Code" />
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDownloadQR(qrId)} className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all">
                <Download size={15} /> Unduh QR
              </button>
              <button onClick={() => setQrModal(false)} className="w-full py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* TRACE ORDER MODAL */}
      <TraceOrderModal 
        open={showTrace} 
        setOpen={setShowTrace} 
        barangId={traceId} 
        barangName={traceName} 
      />

    </MainLayout>
  );
}