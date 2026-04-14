import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getPengajuan } from "../../services/pengajuanService";
import { getRole } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Plus, RefreshCw, Search, ChevronLeft, ChevronRight, Eye, Zap, X } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { TableSkeleton } from "../../components/common/Skeleton";

const STATUS_CONFIG = {
  pending_assessment: { label: "Menunggu Asesmen", cls: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50" },
  pending_manager:    { label: "Menunggu Manager",  cls: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-900/50" },
  pending_gudang:     { label: "Menunggu Gudang",   cls: "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:border-violet-900/50" },
  completed:          { label: "Selesai",            cls: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-900/50" },
  rejected:           { label: "Ditolak",            cls: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-900/50" },
};

const URGENCY_CONFIG = {
  darurat: "bg-rose-50 text-rose-600 border border-rose-200",
  penting: "bg-amber-50 text-amber-600 border border-amber-200",
  normal:  "bg-blue-50 text-blue-600 border border-blue-200",
};

export default function ListPengajuan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const role = getRole();
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try { const res = await getPengajuan(); setData(res.data); }
    catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const canProcess = (item) => {
    if (role === "admin") return true;
    if (role === "asesmen" && item.status === "pending_assessment") return true;
    if (role === "manager" && item.status === "pending_manager") return true;
    if (role === "gudang" && item.status === "pending_gudang") return true;
    return false;
  };

  const countByStatus = (s) => data.filter(d => d.status === s).length;

  const fuzzyMatch = (pattern, str) => {
    if (!pattern) return true;
    const cleanPattern = pattern.toLowerCase().replace(/\s+/g, '');
    const cleanStr = str?.toLowerCase() || "";
    let pIdx = 0;
    for (let i = 0; i < cleanStr.length; i++) {
        if (cleanStr[i] === cleanPattern[pIdx]) pIdx++;
        if (pIdx === cleanPattern.length) return true;
    }
    return false;
  };

  const filtered = data.filter(item => {
    const matchSearch = fuzzyMatch(search, item.nomor_pengajuan) || fuzzyMatch(search, item.nama);
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = filtered.slice(indexFirst, indexLast);

  const statStrips = [
    { key: "pending_assessment", label: "Asesmen",  color: "from-amber-500 to-orange-500", shadow: "shadow-amber-200" },
    { key: "pending_manager",    label: "Manager",   color: "from-blue-500 to-indigo-500",  shadow: "shadow-blue-200" },
    { key: "pending_gudang",     label: "Gudang",    color: "from-violet-500 to-purple-500", shadow: "shadow-violet-200" },
    { key: "completed",          label: "Selesai",   color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-200" },
    { key: "rejected",           label: "Ditolak",   color: "from-rose-500 to-pink-500",    shadow: "shadow-rose-200" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        <PageHeader
          icon={<ClipboardList size={22} />}
          title="Daftar Pengajuan"
          subtitle={`Alur persetujuan barang • ${data.length} total pengajuan`}
          actions={
            <>
              <button onClick={loadData} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 transition-all active:scale-95">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              {(role === "staff" || role === "admin") && (
                <button onClick={() => navigate("/buat-pengajuan")} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest">
                  <Plus size={16} /> Buat Pengajuan
                </button>
              )}
            </>
          }
        />

        {/* STAT STRIPS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {statStrips.map((s) => (
            <button key={s.key} onClick={() => setFilterStatus(filterStatus === s.key ? "" : s.key)}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-left ${filterStatus === s.key ? `border-transparent ring-2 ring-offset-2 ring-blue-500` : "border-slate-100 dark:border-slate-800 hover:shadow-md"}`}>
              <div className={`text-2xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent leading-none`}>{countByStatus(s.key)}</div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</p>
            </button>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input type="text" placeholder="Cari nomor atau nama pemohon..." value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="outline-none flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium" />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 rounded-xl py-2 px-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
            <option value="">Semua Status</option>
            <option value="pending_assessment">Menunggu Asesmen</option>
            <option value="pending_manager">Menunggu Manager</option>
            <option value="pending_gudang">Menunggu Gudang</option>
            <option value="completed">Selesai</option>
            <option value="rejected">Ditolak</option>
          </select>
          {(search || filterStatus) && (
            <button onClick={() => { setSearch(""); setFilterStatus(""); setCurrentPage(1); }} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-all">
              <X size={15} />
            </button>
          )}
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto">{filtered.length} hasil</span>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {loading ? (
             <div className="p-8"><TableSkeleton columns={7} rows={5} /></div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="border-b border-slate-50 dark:border-slate-800">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <th className="px-8 py-5">#</th>
                  <th className="px-8 py-5">Nomor Pengajuan</th>
                  <th className="px-8 py-5">Pemohon</th>
                  <th className="px-8 py-5">Tanggal</th>
                  <th className="px-8 py-5">Urgensi</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {currentData.length === 0 ? (
                  <tr><td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <ClipboardList size={28} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada pengajuan ditemukan</p>
                    </div>
                  </td></tr>
                ) : currentData.map((item, idx) => {
                  const badge = STATUS_CONFIG[item.status] || { label: item.status, cls: "bg-slate-50 text-slate-600" };
                  const urgency = URGENCY_CONFIG[item.urgensi] || URGENCY_CONFIG.normal;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-5 text-[11px] font-bold text-slate-400">{indexFirst + idx + 1}</td>
                      <td className="px-8 py-5">
                        <span className="font-black text-blue-600 dark:text-blue-400 text-[11px] font-mono uppercase tracking-tight">{item.nomor_pengajuan}</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{item.nama}</td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {new Date(item.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${urgency}`}>{item.urgensi || "normal"}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/pengajuan/${item.id}`)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all" title="Detail">
                            <Eye size={14} />
                          </button>
                          {canProcess(item) && item.status !== "completed" && item.status !== "rejected" && (
                            <button onClick={() => navigate(`/pengajuan/${item.id}`)} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95">
                              <Zap size={12} /> Proses
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-8 py-6 border-t border-slate-50 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menampilkan {indexFirst + 1}–{Math.min(indexLast, filtered.length)} dari {filtered.length}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-all"><ChevronLeft size={16} /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"}`}>{i + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-all"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}