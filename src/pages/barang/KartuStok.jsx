import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import {
  getKartuStokByBarangWithFilter,
  exportKartuStokExcel,
  exportKartuStokPDF
} from "../../services/barangService";
import { ArrowLeftRight, ArrowLeft, ArrowDownToLine, ArrowUpFromLine, FileSpreadsheet, FileText } from "lucide-react";

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
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Pergerakan stok per barang</p>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Kartu Stok</h1>
          </div>
          <Link
            to="/barang"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            <ArrowLeft size={16} />
            Kembali ke Barang
          </Link>
        </div>

        <div className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleApplyFilter}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Terapkan Filter
              </button>
              <button
                onClick={handleResetFilter}
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Reset
              </button>
            </div>
            <div className="flex items-end justify-start gap-2 md:justify-end">
              <button
                onClick={handleExportExcel}
                disabled={loading || downloading !== ""}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <FileSpreadsheet size={16} />
                {downloading === "excel" ? "Mengekspor..." : "Export Excel"}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={loading || downloading !== ""}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <FileText size={16} />
                {downloading === "pdf" ? "Mengekspor..." : "Export PDF"}
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Catatan: di halaman ini, saldo berarti jumlah stok barang (unit), bukan nilai uang.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-6 shadow dark:bg-slate-800">
            <p className="text-slate-600 dark:text-slate-300">Memuat data kartu stok...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Barang</p>
                <p className="mt-1 font-semibold text-slate-800 dark:text-white">{data.barang.nama_barang}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{data.barang.kode_barang}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Saldo Awal Periode (estimasi)
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                  {data.summary.saldo_awal_estimasi ?? "-"} {data.summary.saldo_awal_estimasi !== null ? data.barang.satuan || "" : ""}
                </p>
                {!pakaiFilterPeriode && (
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Isi filter tanggal untuk melihat saldo awal periode.
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Barang Masuk / Keluar</p>
                <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  +{data.summary.total_masuk}
                </p>
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  -{data.summary.total_keluar}
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow dark:bg-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Stok Akhir</p>
                <p className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-400">
                  {data.summary.stok_akhir} {data.barang.satuan || ""}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-slate-800">
              <div className="flex items-center gap-2 border-b border-slate-100 p-4 dark:border-slate-700">
                <ArrowLeftRight size={16} className="text-slate-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Riwayat Mutasi</p>
              </div>

              <div className="max-h-[560px] overflow-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="sticky top-0 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left">Tanggal</th>
                      <th className="px-4 py-3 text-left">Jenis</th>
                      <th className="px-4 py-3 text-left">Jumlah</th>
                      <th className="px-4 py-3 text-left">Saldo Sebelum</th>
                      <th className="px-4 py-3 text-left">Saldo Setelah</th>
                      <th className="px-4 py-3 text-left">Referensi Pengajuan</th>
                      <th className="px-4 py-3 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {rows.length === 0 && (
                      <tr>
                        <td className="px-4 py-5 text-slate-500 dark:text-slate-400" colSpan={7}>
                          Belum ada mutasi untuk barang ini.
                        </td>
                      </tr>
                    )}

                    {rows.map((row) => (
                      <tr key={`${row.jenis}-${row.id}-${row.tanggal}`}>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatTanggal(row.tanggal)}</td>
                        <td className="px-4 py-3">
                          {row.jenis === "masuk" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              <ArrowDownToLine size={12} /> Masuk
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                              <ArrowUpFromLine size={12} /> Keluar
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{row.jumlah}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.saldo_sebelum}</td>
                        <td className="px-4 py-3 font-semibold text-sky-700 dark:text-sky-400">{row.saldo_setelah}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {row.pengajuan_id ? `PGJ-ID ${row.pengajuan_id}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.keterangan || "-"}</td>
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
