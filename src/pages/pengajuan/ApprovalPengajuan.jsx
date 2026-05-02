import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getPengajuan } from "../../services/pengajuanService";
import { getRole } from "../../utils/auth";
import { RefreshCw, ClipboardCheck, Search, ChevronLeft, ChevronRight, Zap, X, ShieldCheck, User, Package, CheckCircle, XCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

export default function ApprovalPengajuan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const role = getRole();

  const URGENCY_CONFIG = {
    darurat: "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-900/50",
    penting: "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50",
    normal:  "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-900/50",
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPengajuan();
      // Filter agar hanya menampilkan berkas yang MENJADI TANGGUNG JAWAB role saat ini
      const queue = res.data.filter(i => {
        if (role === 'asisten_manager') return i.status === 'pending_asisten_manager';
        if (role === 'manager') return i.status === 'pending_manager';
        if (role === 'gudang') return i.status === 'pending_gudang';
        if (role === 'admin') return i.status !== 'completed' && i.status !== 'rejected';
        return false;
      });
      setData(queue);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const filtered = data.filter(item => {
    const matchSearch = item.nomor_pengajuan?.toLowerCase().includes(search.toLowerCase()) ||
                        item.nama?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexLast  = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = filtered.slice(indexFirst, indexLast);

  const STATUS_CONFIG = {
    pending_asisten_manager: { label: "Menunggu Asisten Manager", cls: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50" },
    pending_manager:    { label: "Menunggu Manager",  cls: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-900/50" },
    pending_gudang:     { label: "Menunggu Gudang",   cls: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-900/50" },
  };

  const getAvailableStatuses = () => {
    if (role === 'asisten_manager') return [{ label: "Menunggu Anda", key: "pending_asisten_manager", color: "from-blue-600 to-sky-500", icon: <ShieldCheck size={20} /> }];
    if (role === 'manager') return [{ label: "Menunggu Anda", key: "pending_manager", color: "from-blue-600 to-sky-500", icon: <User size={20} /> }];
    if (role === 'gudang') return [{ label: "Menunggu Anda", key: "pending_gudang", color: "from-blue-700 to-sky-600", icon: <Package size={20} /> }];
    return [
      { label: "Asisten Manager", key: "pending_asisten_manager", color: "from-blue-600 to-sky-500", icon: <ShieldCheck size={20} /> },
      { label: "Manager", key: "pending_manager", color: "from-blue-500 to-sky-400", icon: <User size={20} /> },
      { label: "Gudang", key: "pending_gudang", color: "from-blue-700 to-sky-600", icon: <Package size={20} /> }
    ];
  };

  const activeStatuses = getAvailableStatuses();

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        <PageHeader
          icon={<ClipboardCheck size={22} />}
          title="Antrian Persetujuan"
          subtitle={`Role: ${role} • ${data.length} pengajuan menunggu`}
          badge={{ label: "Total Antrian", value: data.length }}
          actions={
            <button onClick={loadData} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 transition-all active:scale-95">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          }
        />

        {/* STAT CARDS */}
        <div className={`grid gap-5 ${activeStatuses.length === 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : activeStatuses.length === 2 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
          {activeStatuses.map((s) => (
            <button 
              key={s.key} 
              onClick={() => setFilterStatus(filterStatus === s.key ? "" : s.key)}
              className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all hover:scale-[1.03] active:scale-95 text-left overflow-hidden ${filterStatus === s.key ? `border-blue-500 ring-4 ring-blue-500/10 shadow-xl shadow-blue-500/10` : "border-slate-100 dark:border-slate-800 hover:shadow-lg"}`}
            >
              <div className={`absolute -right-2 -top-2 w-16 h-16 bg-gradient-to-br ${s.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20`}>
                {s.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {data.filter(d => d.status === s.key).length}
                </span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</p>
              </div>
            </button>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input type="text" placeholder="Cari nomor pengajuan atau pemohon..." value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="outline-none flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium" />
          </div>
          {activeStatuses.length > 1 && (
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 rounded-xl py-2 px-4 text-[11px] font-black uppercase tracking-widest outline-none transition-all">
              <option value="">Semua Status</option>
              {activeStatuses.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          )}
          {(search || filterStatus) && (
            <button onClick={() => { setSearch(""); setFilterStatus(""); setCurrentPage(1); }} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-all">
              <X size={15} />
            </button>
          )}
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto">{filtered.length} antrian</span>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
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
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-8 py-5"><div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl" /></td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <ClipboardCheck size={28} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Semua pengajuan sudah ditangani 🎉</p>
                    </div>
                  </td></tr>
                ) : currentData.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada data sesuai pencarian</p>
                  </td></tr>
                ) : currentData.map((item, index) => {
                  const badge = STATUS_CONFIG[item.status] || { label: item.status, cls: "bg-slate-50 text-slate-500" };
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5 text-[11px] font-bold text-slate-400">{indexFirst + index + 1}</td>
                      <td className="px-8 py-5"><span className="font-black text-blue-600 dark:text-blue-400 text-[11px] font-mono uppercase tracking-tight">{item.nomor_pengajuan}</span></td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{item.nama}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border inline-block mt-1 ${
                          item.pengaju_role === 'manager' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50' :
                          item.pengaju_role === 'asisten_manager' ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:border-sky-900/50' :
                          'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}>
                          {{ staff: 'Staff', admin: 'Admin', asisten_manager: 'Asmen', manager: 'Manager', gudang: 'Gudang' }[item.pengaju_role] || item.pengaju_role || 'Staff'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500">
                        {new Date(item.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${URGENCY_CONFIG[item.urgensi] || URGENCY_CONFIG.normal}`}>{item.urgensi || "normal"}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-8 py-5">
                        <Link to={`/pengajuan/${item.id}?mode=process`}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95">
                          <Zap size={12} /> Proses
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center px-8 py-6 border-t border-slate-50 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {indexFirst + 1}-{Math.min(indexLast, filtered.length)} dari {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-100 transition-all"><ChevronLeft size={16} /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"}`}>{i + 1}</button>
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
