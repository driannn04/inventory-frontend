import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Plus, Search, Pencil, Trash2, QrCode, Download, ScrollText, Package, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import BarangModal from "../../components/modals/BarangModal";
import { getBarang, deleteBarang, getQR, downloadQR } from "../../services/barangService";
import { Link } from "react-router-dom";
import { showSuccess, showError, confirmDelete } from "../../utils/swalHelper";
import PageHeader from "../../components/common/PageHeader";
import { TableSkeleton } from "../../components/common/Skeleton";
import ImagePreview from "../../components/common/ImagePreview";

export default function Barang() {
  const [openModal, setOpenModal] = useState(false);
  const [barang, setBarang] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [search, setSearch] = useState("");
  const [qrModal, setQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrName, setQrName] = useState("");
  const [qrId, setQrId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 8;

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

  const filteredBarang = barang.filter((item) =>
    fuzzyMatch(search, item.nama_barang)
  );
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
          title="Katalog Barang"
          subtitle="Manajemen inventaris barang gudang"
          badge={{ label: "Total Item", value: barang.length }}
          actions={
            <>
              <button onClick={loadBarang} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all hover:shadow-sm active:scale-95">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => { setSelectedBarang(null); setOpenModal(true); }}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
              >
                <Plus size={16} /> Tambah Barang
              </button>
            </>
          }
        />

        {/* MODAL */}
        <BarangModal open={openModal} setOpen={setOpenModal} reload={loadBarang} editData={selectedBarang} />

        {/* SEARCH BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="outline-none flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium"
          />
          {search && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredBarang.length} hasil</span>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="p-8">
              <TableSkeleton columns={6} rows={5} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <th className="px-8 py-5">Foto</th>
                    <th className="px-8 py-5">Nama Barang</th>
                    <th className="px-8 py-5">Kategori</th>
                    <th className="px-8 py-5">Stok</th>
                    <th className="px-8 py-5">Lokasi Rak</th>
                    <th className="px-8 py-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {currentBarang.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <Package size={28} className="text-slate-300 dark:text-slate-600" />
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Belum ada barang</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {currentBarang.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-5">
                        <ImagePreview
                          src={item.foto ? `http://localhost:5000/uploads/${item.foto}` : "/no-image.png"}
                          alt={item.nama_barang}
                          size="md"
                        />
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.nama_barang}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">{item.kode_barang}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-xl uppercase tracking-wide">{item.nama_kategori}</span>
                      </td>
                      <td className="px-8 py-5">
                        {item.stok <= item.stok_minimum ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-rose-600 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-900/50 px-3 py-1.5 rounded-xl">
                            ⚠ {item.stok}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-900/50 px-3 py-1.5 rounded-xl">
                            {item.stok}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{item.lokasi_rak || "-"}</td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center items-center gap-1.5">
                          <button onClick={() => handleEdit(item)} title="Edit" className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 transition-all group-hover:opacity-100">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} title="Hapus" className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 transition-all">
                            <Trash2 size={15} />
                          </button>
                          <button onClick={() => handleShowQR(item)} title="QR Code" className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 transition-all">
                            <QrCode size={15} />
                          </button>
                          <Link to={`/barang/${item.id}/kartu-stok`} title="Kartu Stok" className="p-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-900/30 text-slate-400 hover:text-violet-600 transition-all">
                            <ScrollText size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION CATALOG */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredBarang.length)} dari {filteredBarang.length} data
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
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentPage(i + 1)} 
                      className={`w-8 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
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
    </MainLayout>
  );
}