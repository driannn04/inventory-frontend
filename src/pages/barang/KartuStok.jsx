import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import {
  getKartuStokByBarangWithFilter,
  exportKartuStokExcel,
  exportKartuStokPDF
} from "../../services/barangService";
import { 
    ArrowLeftRight, 
    ArrowLeft, 
    ArrowDownToLine, 
    ArrowUpFromLine, 
    FileSpreadsheet, 
    FileText,
    History,
    RefreshCw,
    Filter,
    Package,
    Info
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

const formatTanggal = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export default function KartuStok() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState("");
  const [showInfoAwal, setShowInfoAwal] = useState(false);
  const [showInfoAkhir, setShowInfoAkhir] = useState(false);

  const rows = useMemo(() => data?.mutasi || [], [data]);
  const pakaiFilterPeriode = Boolean(startDate && endDate);

  const buildParams = () => {
    if (startDate && endDate) {
      return { start: startDate, end: endDate };
    }
    return {};
  };

  const loadData = async (customParams = null) => {
    setLoading(true);
    setError("");
    try {
      const params = customParams || buildParams();
      const res = await getKartuStokByBarangWithFilter(id, params);
      setData(res.data);
    } catch (err) {
      const message = err?.response?.data?.message || "Gagal mengambil kartu stok";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleApplyFilter = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError("Isi tanggal mulai dan tanggal akhir sekaligus");
      return;
    }
    setError("");
    loadData(buildParams());
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setError("");
    loadData({});
  };

  const triggerDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    setDownloading("excel");
    setError("");
    try {
      const res = await exportKartuStokExcel(id, buildParams());
      const kode = data?.barang?.kode_barang || id;
      triggerDownload(res.data, `kartu_stok_${kode}.xlsx`);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal export Excel");
    } finally {
      setDownloading("");
    }
  };

  const handleExportPDF = async () => {
    setDownloading("pdf");
    setError("");
    try {
      const res = await exportKartuStokPDF(id, buildParams());
      const kode = data?.barang?.kode_barang || id;
      triggerDownload(res.data, `kartu_stok_${kode}.pdf`);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal export PDF");
    } finally {
      setDownloading("");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        
        {/* PAGE HEADER */}
        <PageHeader
          icon={<History size={22} />}
          title="Kartu Stok (Buku Besar)"
          subtitle="Lacak seluruh riwayat pergerakan fisik barang (masuk/keluar) secara transparan layaknya buku rekening bank."
          badge={{ label: "Periode", value: pakaiFilterPeriode ? `${formatTanggal(startDate)} - ${formatTanggal(endDate)}` : "Semua Waktu" }}
          actions={
            <Link
                to="/barang"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 active:scale-95 shadow-sm"
            >
                <ArrowLeft size={16} /> Kembali ke Katalog
            </Link>
          }
        />

        {/* FILTER BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
             
            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Filter size={12}/> Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm font-bold dark:text-white transition-all text-slate-600"
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm font-bold dark:text-white transition-all text-slate-600"
              />
            </div>
            
            <div className="md:col-span-3 flex gap-2">
              <button
                onClick={handleApplyFilter}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all"
              >
                Terapkan
              </button>
              <button
                onClick={handleResetFilter}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Reset
              </button>
            </div>
            
            <div className="md:col-span-3 flex justify-end gap-2">
              <button
                onClick={handleExportExcel}
                disabled={loading || downloading !== ""}
                className="flex items-center gap-2 justify-center py-3 px-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 active:scale-95 transition-all disabled:opacity-50"
              >
                {downloading === "excel" ? <RefreshCw size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                EXCEL
              </button>
              <button
                onClick={handleExportPDF}
                disabled={loading || downloading !== ""}
                className="flex items-center gap-2 justify-center py-3 px-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 border border-rose-200 dark:border-rose-800 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 active:scale-95 transition-all disabled:opacity-50"
              >
                {downloading === "pdf" ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
                PDF
              </button>
            </div>
            
          </div>
          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-70">
            * Saldo mempresentasikan kuantitas stok barang fisik (PCS/Unit), bukan nilai moneter.
          </p>
        </div>

        {loading && (
          <div className="rounded-[2.5rem] bg-white p-12 text-center shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 animate-pulse">
            <RefreshCw size={32} className="mx-auto text-slate-300 animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Ledger Kartu Stok...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400 text-center font-bold text-sm">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* STAT CARDS OVERVIEW */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 mb-6">
              {/* Identitas Barang */}
              <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                <div className="flex gap-2 items-center mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600"><Package size={16}/></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identitas Barang</p>
                </div>
                <p className="text-[15px] font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-2 leading-snug mb-1">{data.barang.nama_barang}</p>
                <p className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-auto">ID: {data.barang.kode_barang}</p>
              </div>
              
              {/* Saldo Awal Periode */}
              <div className={`rounded-[2rem] p-6 shadow-sm border flex flex-col justify-center relative ${pakaiFilterPeriode ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-200 dark:border-slate-700'}`}>
                <div className="flex items-center gap-1.5 mb-3 relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Saldo Awal</p>
                  <button 
                    onClick={() => setShowInfoAwal(!showInfoAwal)}
                    onBlur={() => setShowInfoAwal(false)}
                    className="text-slate-300 hover:text-blue-500 transition-colors focus:outline-none"
                  >
                    <Info size={14} className={showInfoAwal ? "text-blue-500" : ""} />
                  </button>
                  
                  {/* Custom Clickable Tooltip */}
                  {showInfoAwal && (
                    <div className="absolute top-6 left-0 w-[250px] z-20 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold p-3 rounded-xl shadow-xl shadow-slate-900/20 border border-slate-700 dark:border-slate-600 animate-in fade-in zoom-in duration-200">
                      Jumlah stok barang tepat sebelum periode tanggal ini dimulai. Jika minus (-), berarti ada riwayat barang keluar yang tidak didahului riwayat barang masuk (misal: stok awal waktu sistem baru dipakai tidak diinput ke dalam mutasi).
                      {/* Segitiga panah */}
                      <div className="absolute -top-1.5 left-24 w-3 h-3 bg-slate-800 dark:bg-slate-700 rotate-45 border-l border-t border-slate-700 dark:border-slate-600"></div>
                    </div>
                  )}
                </div>
                {pakaiFilterPeriode ? (
                  <>
                    <p className="text-4xl font-black text-slate-700 dark:text-slate-300">
                      {data.summary.saldo_awal_estimasi} <span className="text-[11px] text-slate-400 uppercase tracking-widest">Unit</span>
                    </p>
                    <p className="mt-2 text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md self-start border border-emerald-100 dark:border-emerald-900/30">Dihitung per {formatTanggal(startDate)}</p>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 opacity-60">
                    <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Semua Waktu</p>
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                      Menampilkan riwayat dari awal. Gunakan filter tanggal di atas jika ingin melihat saldo awal pada periode tertentu.
                    </p>
                  </div>
                )}
              </div>
              
              {/* Mutasi In/Out */}
              <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 text-center">Total Mutasi Fisik</p>
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col items-center">
                        <p className="text-3xl font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">+{data.summary.total_masuk}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-2">Masuk (In)</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <div className="flex flex-col items-center">
                        <p className="text-3xl font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-2xl border border-rose-100 dark:border-rose-900/30">-{data.summary.total_keluar}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 mt-2">Keluar (Out)</p>
                    </div>
                </div>
              </div>
              
              {/* Saldo Akhir */}
              <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-sky-500 p-6 shadow-lg shadow-blue-500/20 border border-blue-400 flex flex-col justify-center relative overflow-visible group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex items-center gap-1.5 mb-2 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Stok Akhir Fisik</p>
                  <button 
                    onClick={() => setShowInfoAkhir(!showInfoAkhir)}
                    onBlur={() => setShowInfoAkhir(false)}
                    className="text-blue-200 hover:text-white transition-colors focus:outline-none"
                  >
                    <Info size={14} className={showInfoAkhir ? "text-white" : ""} />
                  </button>

                  {/* Custom Clickable Tooltip */}
                  {showInfoAkhir && (
                    <div className="absolute top-6 left-0 w-[220px] z-20 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold p-3 rounded-xl shadow-2xl shadow-slate-900/20 border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                      Jumlah akhir stok barang di gudang secara riil saat ini (hasil kalkulasi matematis: Saldo Awal + Masuk - Keluar).
                      {/* Segitiga panah */}
                      <div className="absolute -top-1.5 left-24 w-3 h-3 bg-white dark:bg-slate-800 rotate-45 border-l border-t border-slate-100 dark:border-slate-700"></div>
                    </div>
                  )}
                </div>
                <div className="flex items-end gap-2 relative z-10">
                  <p className="text-5xl font-black text-white leading-none tracking-tighter">
                    {data.summary.stok_akhir}
                  </p>
                  <span className="text-xs font-black text-blue-200 uppercase tracking-widest mb-1.5">Unit</span>
                </div>
                {pakaiFilterPeriode ? (
                  <p className="mt-3 text-[9px] font-bold text-white/80 uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 inline-block self-start">Per {formatTanggal(endDate)}</p>
                ) : (
                  <p className="mt-3 text-[9px] font-bold text-white/80 uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 inline-block self-start">Stok Saat Ini (Realtime)</p>
                )}
              </div>
            </div>

            {/* TABEL MUTASI / LEDGER */}
            <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-50 p-6 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><ArrowLeftRight size={18} /></div>
                    <h2 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Detail Mutasi (Buku Besar)</h2>
                </div>
              </div>

              <div className="max-h-[560px] overflow-auto custom-scrollbar px-2 pb-2">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      <th className="px-6 py-5 text-center">Tanggal</th>
                      <th className="px-6 py-5 text-center">Aktivitas Mutasi</th>
                      <th className="px-6 py-5 text-center">In/Out</th>
                      <th className="px-6 py-5 text-center">Saldo Awal</th>
                      <th className="px-6 py-5 text-center">Saldo Akhir</th>
                      <th className="px-6 py-5 text-center">Referensi ID</th>
                      <th className="px-6 py-5 text-center">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 pl-2">
                    {rows.length === 0 && (
                      <tr>
                        <td className="px-6 py-16 text-center align-middle" colSpan={7}>
                          <div className="flex flex-col items-center justify-center gap-2">
                            <History size={32} className="text-slate-300" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada riwayat mutasi untuk barang ini di periode tersebut.</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {rows.map((row) => (
                      <tr key={`${row.jenis}-${row.id}-${row.tanggal}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5 align-middle text-center">
                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{formatTanggal(row.tanggal)}</span>
                        </td>
                        <td className="px-6 py-5 align-middle text-center">
                          {row.jenis === "masuk" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-900/50 dark:text-emerald-400 shadow-sm">
                              <ArrowDownToLine size={12} /> Barang Masuk
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-rose-600 dark:bg-rose-900/30 dark:border-rose-900/50 dark:text-rose-400 shadow-sm">
                              <ArrowUpFromLine size={12} /> Barang Keluar
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 align-middle text-center">
                            <span className={`text-[15px] font-black ${row.jenis === "masuk" ? "text-emerald-500" : "text-rose-500"}`}>
                                {row.jenis === "masuk" ? "+" : "-"}{row.jumlah}
                            </span>
                        </td>
                        <td className="px-6 py-5 align-middle text-center">
                          <span className="text-[13px] font-black text-slate-400">{row.saldo_sebelum}</span>
                        </td>
                        <td className="px-6 py-5 align-middle text-center">
                            <span className="text-[14px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-900/30 px-4 py-1.5 rounded-xl">
                                {row.saldo_setelah}
                            </span>
                        </td>
                        <td className="px-6 py-5 align-middle text-center">
                          {row.pengajuan_id ? <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 border border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest shadow-sm">PGJ-{row.pengajuan_id}</span> : <span className="text-[9px] font-bold text-slate-400 italic uppercase tracking-widest">Manual</span>}
                        </td>
                        <td className="px-6 py-5 align-middle text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{row.keterangan || <span className="italic opacity-50">-</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
