import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Plus, Search, Pencil, Trash2, QrCode, Download, ScrollText, Package, RefreshCw, ChevronLeft, ChevronRight, LayoutGrid, List, Filter, AlertTriangle, Boxes, ListFilter } from "lucide-react";
import BarangModal from "../../components/modals/BarangModal";
import { getBarang, deleteBarang, getQR, downloadQR } from "../../services/barangService";
import { UPLOAD_URL } from "../../utils/api";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [barang, setBarang] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState(location.state?.category || "");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState((role === 'staff' || role === 'asisten_manager' || role === 'manager') ? "card" : "table");
  const [qrModal, setQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrName, setQrName] = useState("");
  const [qrId, setQrId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [showTrace, setShowTrace] = useState(false);
  const [traceId, setTraceId] = useState(null);
  const [traceName, setTraceName] = useState("");
  const itemsPerPage = 10; 

  useEffect(() => { 
    loadBarang();
    // Bersihkan state setelah digunakan agar tidak nyangkut saat refresh
    if (location.state?.category) {
      window.history.replaceState({}, document.title);
    }
  }, []);

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

  const categories = [...new Set(barang.map(b => b.nama_kategori))];

  const filteredBarang = barang.filter((item) => {
    const matchSearch = (item.nama_barang?.toLowerCase() || "").includes(search.toLowerCase()) || 
                       (item.kode_barang?.toLowerCase() || "").includes(search.toLowerCase());
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

  const stats = [
    { key: "all", label: "Semua Barang", color: "from-slate-600 to-slate-500", icon: <LayoutGrid size={16} />, count: barang.length },
    { key: "aman", label: "Stok Aman", color: "from-emerald-500 to-teal-600", icon: <Boxes size={16} />, count: barang.filter(b => b.stok > b.stok_minimum).length },
    { key: "kritis", label: "Stok Menipis", color: "from-amber-500 to-orange-500", icon: <AlertTriangle size={16} />, count: barang.filter(b => b.stok > 0 && b.stok <= b.stok_minimum).length },
    { key: "habis", label: "Stok Habis", color: "from-rose-500 to-pink-600", icon: <Package size={16} />, count: barang.filter(b => b.stok <= 0).length },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        <PageHeader
          icon={<Package size={22} />}
          title={role === 'staff' ? "Galeri Barang" : "Katalog Barang"}
          subtitle="Manajemen dan monitoring stok inventaris operasional"
          actions={
            <div className="flex gap-2">
              <button onClick={loadBarang} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-all">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              {(role === 'admin' || role === 'gudang') && (
                <button onClick={() => { setSelectedBarang(null); setOpenModal(true); }} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest">
                  <Plus size={16} /> Tambah Barang
                </button>
              )}
            </div>
          }
        />

        <BarangModal open={openModal} setOpen={setOpenModal} reload={loadBarang} editData={selectedBarang} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <button 
              key={s.key} 
              onClick={() => { setFilterStatus(s.key); setCurrentPage(1); }}
              className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 text-left group
                ${filterStatus === s.key 
                  ? "bg-white dark:bg-slate-900 border-blue-500 ring-4 ring-blue-500/5 shadow-md shadow-blue-500/5 scale-[1.02]" 
                  : "bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110`}>
                  {s.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-lg font-black leading-none ${filterStatus === s.key ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}`}>
                    {s.count}
                  </span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{s.label}</p>
                </div>
              </div>
              {filterStatus === s.key && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* TOOLBAR: SEARCH & FILTERS */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] px-6 py-3 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input 
              type="text" placeholder="Cari nama atau kode barang..." value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="outline-none flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium" 
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-slate-100 dark:border-slate-800 pr-4">
              <ListFilter size={14} className="text-slate-400" />
              <select value={filterKategori} onChange={(e) => { setFilterKategori(e.target.value); setCurrentPage(1); }}
                className="bg-transparent border-none text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest outline-none cursor-pointer">
                <option value="">Semua Kategori</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
              <button onClick={() => { setViewMode("table"); setCurrentPage(1); }} className={`p-1.5 rounded-lg transition-all ${viewMode === "table" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400"}`}>
                <List size={16} />
              </button>
              <button onClick={() => { setViewMode("card"); setCurrentPage(1); }} className={`p-1.5 rounded-lg transition-all ${viewMode === "card" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400"}`}>
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
          <EmptyState icon={Package} title="Barang Tidak Ditemukan" message="Coba sesuaikan filter atau kata kunci pencarian Anda." />
        ) : viewMode === "table" ? (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-50 dark:border-slate-800">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Foto</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Barang</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Kategori</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stok</th>
                    {role !== 'staff' && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lokasi</th>}
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {currentBarang.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-3 text-center">
                        <div className="flex justify-center">
                          <ImagePreview src={item.foto ? `${UPLOAD_URL}/${item.foto}` : "/no-image.png"} alt={item.nama_barang} size="sm" />
                        </div>
                      </td>
                      <td className="px-8 py-3">
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.nama_barang}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">{item.kode_barang}</p>
                      </td>
                      <td className="px-8 py-3 text-center">
                        <span className="text-[10px] font-black text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-xl uppercase tracking-widest">{item.nama_kategori}</span>
                      </td>
                      <td className="px-8 py-3">
                        <div className="flex justify-center">
                          <div className="inline-flex divide-x divide-slate-100 dark:divide-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="px-3 py-2 flex flex-col items-center min-w-[60px]">
                              <span className={`text-[13px] font-black ${Number(item.stok_tersedia) <= 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>{item.stok_tersedia}</span>
                              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5 tracking-tighter">Ready</span>
                            </div>
                            {/* RESERVED (TABLE VIEW) */}
                            {Number(item.stok) - Number(item.stok_tersedia) > 0 && (
                              <button 
                                onClick={() => { setTraceId(item.id); setTraceName(item.nama_barang); setShowTrace(true); }}
                                className="px-3 py-2 flex flex-col items-center min-w-[60px] bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 transition-colors"
                              >
                                <span className="text-[13px] font-black text-amber-500">{Number(item.stok) - Number(item.stok_tersedia)}</span>
                                <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mt-0.5 tracking-tighter">Pesan</span>
                              </button>
                            )}
                            <div className="px-3 py-2 flex flex-col items-center min-w-[60px] bg-white/40 dark:bg-slate-900/40">
                              <span className="text-[13px] font-black text-slate-500">{item.stok}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 tracking-tighter">Fisik</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      {role !== 'staff' && (
                        <td className="px-8 py-3 text-center text-[10px] font-bold text-slate-400 uppercase">{item.lokasi_rak || "-"}</td>
                      )}
                      <td className="px-8 py-3">
                        <div className="flex justify-center items-center gap-2">
                           {(role === 'admin' || role === 'gudang') && (
                            <>
                              <button onClick={() => handleEdit(item)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600 transition-all shadow-sm"><Pencil size={14} /></button>
                              <button onClick={() => handleDelete(item.id)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-600 transition-all shadow-sm"><Trash2 size={14} /></button>
                              <button onClick={() => handleShowQR(item)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-emerald-600 transition-all shadow-sm"><QrCode size={14} /></button>
                            </>
                          )}
                          <Link to={`/barang/${item.id}/kartu-stok`} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-600 transition-all shadow-sm"><ScrollText size={14} /></Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {currentBarang.map((item) => (
                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-3 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 group flex flex-col"
                >
                  <div className="relative mb-4 rounded-[1.8rem] overflow-hidden aspect-square bg-slate-50 dark:bg-slate-800">
                    <img src={item.foto ? `${UPLOAD_URL}/${item.foto}` : "/no-image.png"} alt={item.nama_barang} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {Number(item.stok_tersedia) <= 0 && (
                      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-10"><span className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Habis</span></div>
                    )}
                    
                    {/* RESTORE ADMIN ACTIONS OVERLAY */}
                    {(role === 'admin' || role === 'gudang') && (
                      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => handleEdit(item)} className="p-2.5 bg-white/90 dark:bg-slate-800/90 text-blue-600 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white backdrop-blur-sm transition-colors border border-slate-200/50 dark:border-slate-700/50"><Pencil size={14} /></button>
                        <button onClick={() => handleShowQR(item)} className="p-2.5 bg-white/90 dark:bg-slate-800/90 text-emerald-600 rounded-xl shadow-lg hover:bg-emerald-600 hover:text-white backdrop-blur-sm transition-colors border border-slate-200/50 dark:border-slate-700/50"><QrCode size={14} /></button>
                      </div>
                    )}
                  </div>
                  <div className="px-2 flex-1 flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{item.nama_kategori}</span>
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-[14px] line-clamp-2 leading-tight mb-4 group-hover:text-blue-600 transition-colors">{item.nama_barang}</h3>
                    <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/50">
                      <div className="flex justify-between items-center px-2">
                        <div className="flex flex-col">
                          <span className={`text-[14px] font-black ${Number(item.stok_tersedia) <= 0 ? 'text-rose-500' : 'text-slate-800 dark:text-white'}`}>{item.stok_tersedia}</span>
                          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Ready</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50"></div>
                        
                        {/* RESERVED INFO */}
                        {Number(item.stok) - Number(item.stok_tersedia) > 0 && (
                          <>
                            <button 
                              onClick={() => { setTraceId(item.id); setTraceName(item.nama_barang); setShowTrace(true); }}
                              className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer group/trace"
                            >
                              <span className="text-[14px] font-black text-amber-500 group-hover/trace:underline">{Number(item.stok) - Number(item.stok_tersedia)}</span>
                              <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Pesan</span>
                            </button>
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 opacity-50"></div>
                          </>
                        )}

                        <div className="flex flex-col items-end">
                          <span className="text-[14px] font-black text-slate-400">{item.stok}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fisik</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 px-2">
                    {role === 'staff' ? (
                      <button 
                        onClick={() => navigate("/buat-pengajuan", { state: { directItem: item } })}
                        disabled={Number(item.stok_tersedia) <= 0}
                        className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2
                          ${Number(item.stok_tersedia) > 0 
                            ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
                      >
                        <Plus size={14} /> Ajukan Barang
                      </button>
                    ) : (
                      <Link to={`/barang/${item.id}/kartu-stok`} className="w-full py-3 bg-white dark:bg-slate-900 text-blue-600 border-2 border-blue-50 dark:border-blue-900/50 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2 active:scale-95"><ScrollText size={14} /> Kartu Stok</Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 mt-8 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Menampilkan {indexFirst + 1}–{Math.min(indexLast, filteredBarang.length)} dari {filteredBarang.length} data
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 disabled:opacity-30 active:scale-95 transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="hidden sm:flex px-2 gap-1.5 items-center">
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
                        className={`w-8 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${currentPage === p ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
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
                className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 disabled:opacity-30 active:scale-95 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {qrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-10 text-center space-y-6 w-full max-w-xs">
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{qrName}</h2>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl inline-block"><img src={qrData} className="w-44 mx-auto rounded-xl" alt="QR Code" /></div>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleDownloadQR(qrId)} className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all"><Download size={15} /> Unduh QR</button>
              <button onClick={() => setQrModal(false)} className="w-full py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
      <TraceOrderModal open={showTrace} setOpen={setShowTrace} barangId={traceId} barangName={traceName} />
    </MainLayout>
  );
}