import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getBarang } from "../../services/barangService";
import { tambahStokMasuk, getStokMasuk } from "../../services/stokService";
import { UPLOAD_URL } from "../../utils/api";
import { PackagePlus, RefreshCw, ChevronLeft, ChevronRight, PlusCircle, Package, X, Eye, MapPin, Tag, Calendar, Hash, Layers, FileText, Search, Check, RotateCcw, History, Filter } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [periodPreset, setPeriodPreset] = useState("all");
  const [isOpenBarangDropdown, setIsOpenBarangDropdown] = useState(false);
  const [searchBarang, setSearchBarang] = useState("");

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

  const handlePreset = (preset) => {
    setPeriodPreset(preset);
    setCurrentPage(1);
    const now = new Date();
    
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`;
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "month") {
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const firstDay = `${yyyy}-${mm}-01`;
      const lastDayObj = new Date(yyyy, now.getMonth() + 1, 0);
      const lastDd = String(lastDayObj.getDate()).padStart(2, "0");
      const lastDay = `${yyyy}-${mm}-${lastDd}`;
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === "year") {
      const yyyy = now.getFullYear();
      setStartDate(`${yyyy}-01-01`);
      setEndDate(`${yyyy}-12-31`);
    }
  };

  const handleDateChange = (type, val) => {
    setPeriodPreset("custom");
    setCurrentPage(1);

    const s = type === "start" ? val : startDate;
    const e = type === "end" ? val : endDate;

    if (s && e) {
      const dStart = new Date(s);
      const dEnd = new Date(e);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (dStart > dEnd) {
        import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Tanggal Salah", text: "Tanggal mulai tidak boleh melebihi tanggal akhir." }));
        return;
      }

      if (dStart > today || dEnd > today) {
        import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Tanggal Salah", text: "Tanggal tidak boleh melebihi hari ini." }));
        return;
      }
    }

    if (type === "start") setStartDate(val);
    if (type === "end") setEndDate(val);
  };

  const handleResetFilter = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setPeriodPreset("all");
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    if (!form.barang_id || !form.jumlah) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Lengkapi Data", text: "Pilih barang dan jumlah!" }));
      return;
    }
    try {
      setLoading(true);
      await tambahStokMasuk({ ...form, barang_id: Number(form.barang_id), jumlah: Number(form.jumlah) });
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "success", title: "Berhasil!", text: "Stok masuk berhasil disimpan" }));
      loadRiwayat(); loadBarang(); setCurrentPage(1);
      setForm({ barang_id: "", jumlah: "", keterangan: "" });
    } catch (err) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal menyimpan data" }));
    } finally { setLoading(false); }
  };

  const filtered = riwayat.filter(r => {
    const matchSearch = 
      (r.nama_barang?.toLowerCase() || "").includes(search.toLowerCase()) || 
      (r.kode_barang?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (r.keterangan?.toLowerCase() || "").includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (startDate || endDate) {
      if (!r.tanggal) return false;
      const rDate = new Date(r.tanggal);
      rDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        if (rDate < sDate) return false;
      }

      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        if (rDate > eDate) return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = filtered.slice(indexFirst, indexLast);
  const totalMasuk = riwayat.reduce((s, r) => s + Number(r.jumlah), 0);
  
  const recentItems = [...new Map(riwayat.slice(0, 20).map(r => [r.barang_id, r])).values()].slice(0, 4);

  const DetailRow = ({ icon, label, value, color }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
      <div className={`p-2 rounded-xl shrink-0 ${color || "bg-slate-50 dark:bg-slate-800 text-slate-400"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-white break-words">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        <PageHeader
          icon={<PackagePlus size={22} />}
          title="Stok Masuk"
          subtitle="Manajemen penerimaan dan penambahan stok barang"
          actions={
            <button onClick={() => { loadRiwayat(); loadBarang(); }} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-all active:scale-95">
              <RefreshCw size={16} />
            </button>
          }
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Total Transaksi", value: riwayat.length, color: "from-blue-600 to-sky-500", icon: <RefreshCw size={16} /> },
            { label: "Total Unit Masuk", value: totalMasuk, color: "from-emerald-500 to-teal-600", icon: <PackagePlus size={16} /> },
          ].map((s, i) => (
            <div key={i} className="relative overflow-hidden p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-sm`}>{s.icon}</div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{s.value.toLocaleString()}</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* LEFT: INPUT FORM */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <PlusCircle size={20} />
                  </div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Input Stok Masuk</h2>
                </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Barang</label>
                  <div className="relative">
                    {/* Selector Trigger Box */}
                    <div
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-2xl transition-all hover:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 outline-none"
                    >
                      <div 
                        className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                        onClick={() => setIsOpenBarangDropdown(!isOpenBarangDropdown)}
                      >
                        {selectedBarang ? (
                          <>
                            <img
                              src={selectedBarang.foto ? `${UPLOAD_URL}/${selectedBarang.foto}` : "/no-image.png"}
                              alt={selectedBarang.nama_barang}
                              className="w-10 h-10 rounded-xl object-cover bg-white shadow-sm border border-slate-100 dark:border-slate-800 shrink-0"
                            />
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-xs font-black text-slate-800 dark:text-white uppercase truncate leading-tight">{selectedBarang.nama_barang}</p>
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{selectedBarang.kode_barang}</span>
                                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full shrink-0"></span>
                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md uppercase shrink-0">Stok: {selectedBarang.stok} {selectedBarang.satuan}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest py-2 pl-1">-- PILIH BARANG --</span>
                        )}
                      </div>

                      {/* Action Button: X (Clear) or CARI (Search) */}
                      {selectedBarang ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm({ ...form, barang_id: "" });
                          }}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all shrink-0"
                          title="Batal pilih barang"
                        >
                          <X size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsOpenBarangDropdown(!isOpenBarangDropdown)}
                          className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-200 transition-all shrink-0"
                        >
                          Cari
                        </button>
                      )}
                    </div>

                    {/* Custom Searchable Dropdown Overlay */}
                    {isOpenBarangDropdown && (
                      <>
                        <div className="fixed inset-0 z-[40]" onClick={() => setIsOpenBarangDropdown(false)} />
                        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] z-[50] overflow-hidden animate-slideDown flex flex-col max-h-[350px]">
                          {/* Search Input inside Dropdown */}
                          <div className="p-4 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
                            <Search size={14} className="text-slate-400" />
                            <input
                              type="text"
                              placeholder="Ketik nama atau kode barang..."
                              value={searchBarang}
                              onChange={(e) => setSearchBarang(e.target.value)}
                              className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 dark:text-white placeholder-slate-400 w-full uppercase"
                              autoFocus
                            />
                            {searchBarang && (
                              <button onClick={() => setSearchBarang("")} className="p-1 text-slate-300 hover:text-rose-500">
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          {/* Scrollable list */}
                          <div className="overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
                            {barang.filter(b => 
                              (b.nama_barang?.toLowerCase() || "").includes(searchBarang.toLowerCase()) ||
                              (b.kode_barang?.toLowerCase() || "").includes(searchBarang.toLowerCase())
                            ).length === 0 ? (
                              <p className="p-6 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Barang tidak ditemukan</p>
                            ) : (
                              barang.filter(b => 
                                (b.nama_barang?.toLowerCase() || "").includes(searchBarang.toLowerCase()) ||
                                (b.kode_barang?.toLowerCase() || "").includes(searchBarang.toLowerCase())
                              ).map(b => (
                                <div
                                  key={b.id}
                                  onClick={() => {
                                    setForm({ ...form, barang_id: b.id });
                                    setIsOpenBarangDropdown(false);
                                    setSearchBarang("");
                                  }}
                                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${
                                    form.barang_id == b.id ? "bg-blue-50/30 dark:bg-blue-900/5" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={b.foto ? `${UPLOAD_URL}/${b.foto}` : "/no-image.png"}
                                      alt={b.nama_barang}
                                      className="w-10 h-10 rounded-xl object-cover bg-white shadow-sm border border-slate-100 dark:border-slate-800"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase leading-tight truncate max-w-[180px]">{b.nama_barang}</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{b.kode_barang} {b.lokasi_rak ? `• ${b.lokasi_rak}` : ""}</p>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-xl border shrink-0 ${
                                    b.stok <= b.stok_minimum 
                                      ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/50" 
                                      : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                  }`}>
                                    {b.stok} {b.satuan}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="jumlah" 
                      value={form.jumlah} 
                      onChange={handleChange} 
                      placeholder="0" 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-white" 
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">{selectedBarang?.satuan || "UNIT"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan</label>
                  <textarea 
                    name="keterangan" 
                    value={form.keterangan} 
                    onChange={handleChange} 
                    placeholder="CATATAN..." 
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700 dark:text-white uppercase resize-none" 
                  />
                </div>
              </div>
            </div>

              <button 
                onClick={handleSubmit} 
                disabled={loading || !form.barang_id || !form.jumlah} 
                className="w-full py-4 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 mt-8"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                Simpan Stok Masuk
              </button>
            </div>
          </div>

          {/* RIGHT: HISTORY TABLE */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex-1 flex flex-col">
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <History size={16} className="text-blue-500" /> Riwayat Transaksi
                  </h2>
                  <div className="relative w-full sm:w-[220px]">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="CARI DATA..." 
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] outline-none font-bold uppercase"
                    />
                  </div>
                </div>

                {/* FILTER BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: "all", label: "Semua" },
                      { id: "today", label: "Hari Ini" },
                      { id: "month", label: "Bulan Ini" },
                      { id: "year", label: "Tahun Ini" },
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => handlePreset(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                          periodPreset === p.id 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                      <Calendar size={12} className="text-slate-400" />
                      <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => handleDateChange("start", e.target.value)}
                        className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-200 outline-none"
                      />
                      <span className="text-[9px] font-black text-slate-400">s/d</span>
                      <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => handleDateChange("end", e.target.value)}
                        className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-200 outline-none"
                      />
                    </div>
                    {(startDate || endDate || search || periodPreset !== "all") && (
                      <button
                        onClick={handleResetFilter}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 transition-colors"
                        title="Reset Filter"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            {loadingData ? (
              <div className="p-8">
                <TableSkeleton columns={6} rows={5} />
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-50 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-5">#</th>
                      <th className="px-8 py-5">Barang</th>
                      <th className="px-8 py-5 text-center">Jumlah</th>
                      <th className="px-8 py-5 text-center">Via</th>
                      <th className="px-8 py-5">Tanggal</th>
                      <th className="px-8 py-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {currentData.length === 0 ? (
                      <tr><td colSpan={6} className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Data tidak ditemukan</td></tr>
                    ) : currentData.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => setSelectedItem(r)}>
                        <td className="px-8 py-4 text-[11px] font-bold text-slate-400">{indexFirst + i + 1}</td>
                        <td className="px-8 py-4">
                          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{r.nama_barang}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-widest">{r.kode_barang}</p>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800">+{r.jumlah}</span>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${
                            r.keterangan?.toLowerCase().includes("scan")
                              ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30"
                              : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                          }`}>
                            {r.keterangan?.toLowerCase().includes("scan") ? "Scan QR" : "Manual"}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-xs font-bold text-slate-500">
                          {new Date(r.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-8 py-4 text-center">
                          <button className="flex items-center gap-1.5 mx-auto bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 transition-all text-[9px] font-black uppercase tracking-widest">
                            <Eye size={12} /> Detail
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{indexFirst + 1}—{Math.min(indexLast, filtered.length)} dari {filtered.length}</span>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }} disabled={currentPage === 1} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-all"><ChevronLeft size={16} /></button>
                  
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
                        <span key={`sep-${i}`} className="px-2 text-slate-400 font-black">...</span>
                      ) : (
                        <button 
                          key={p} 
                          onClick={(e) => { e.stopPropagation(); setCurrentPage(p); }} 
                          className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === p ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"}`}
                        >
                          {p}
                        </button>
                      )
                    ));
                  })()}

                  <button onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} disabled={currentPage === totalPages} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-all"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

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
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Detail Penerimaan Stok</h3>
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
                        color="bg-blue-50 dark:bg-blue-900/30 text-blue-500"
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
                        color="bg-slate-50 dark:bg-slate-800 text-slate-400"
                      />
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