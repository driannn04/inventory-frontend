import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getPengajuan } from "../../services/pengajuanService";
import { getRole, getUser } from "../../utils/auth";
import { 
  RefreshCw, ClipboardCheck, Search, ChevronLeft, ChevronRight, 
  Zap, ShieldCheck, User, Package, CheckCircle, XCircle, LayoutGrid
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { TableSkeleton } from "../../components/common/Skeleton";
import { useMemo } from "react";

export default function ApprovalPengajuan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const role = getRole();
  const user = useMemo(() => getUser(), []);
  const navigate = useNavigate();

  const URGENCY_CONFIG = {
    darurat: "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:border-rose-900/50",
    penting: "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50",
    normal:  "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-900/50",
  };

  const STATUS_CONFIG = {
    pending_asisten_manager: { label: "Menunggu Asmen", cls: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50" },
    pending_manager:    { label: "Menunggu Manager",  cls: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-900/50" },
    pending_gudang:     { label: "Menunggu Gudang",   cls: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-900/50" },
  };

  useEffect(() => { 
    loadData(); 
    const handleRefresh = () => loadData();
    window.addEventListener('notif_baru', handleRefresh);
    return () => window.removeEventListener('notif_baru', handleRefresh);
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPengajuan();
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
    const matchSearch = (item.nomor_pengajuan?.toLowerCase() || "").includes(search.toLowerCase()) ||
                        (item.nama?.toLowerCase() || "").includes(search.toLowerCase());
    const matchStatus = filterStatus ? item.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexLast  = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = filtered.slice(indexFirst, indexLast);

  const getAvailableStatuses = () => {
    const base = [{ key: "", label: "Semua", color: "from-slate-600 to-slate-500", icon: <LayoutGrid size={16} /> }];
    if (role === 'asisten_manager') return [...base, { label: "Menunggu Anda", key: "pending_asisten_manager", color: "from-blue-600 to-sky-500", icon: <ShieldCheck size={16} /> }];
    if (role === 'manager') return [...base, { label: "Menunggu Anda", key: "pending_manager", color: "from-blue-600 to-sky-500", icon: <User size={16} /> }];
    if (role === 'gudang') return [...base, { label: "Menunggu Anda", key: "pending_gudang", color: "from-blue-700 to-sky-600", icon: <Package size={16} /> }];
    
    return [
      ...base,
      { label: "Asisten Manager", key: "pending_asisten_manager", color: "from-amber-500 to-orange-500", icon: <ShieldCheck size={16} /> },
      { label: "Manager", key: "pending_manager", color: "from-blue-600 to-sky-500", icon: <User size={16} /> },
      { label: "Gudang", key: "pending_gudang", color: "from-indigo-600 to-purple-500", icon: <Package size={16} /> }
    ];
  };

  const activeStatuses = getAvailableStatuses();

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        <PageHeader
          icon={<ClipboardCheck size={22} />}
          title="Antrian Persetujuan"
          subtitle={`Terdapat ${data.length} pengajuan yang memerlukan tindakan Anda`}
          actions={
            <button onClick={loadData} disabled={loading} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-all">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          }
        />

        {/* MINIMALIST INTERACTIVE STAT CARDS — Approval Queue */}
        <div className={`grid gap-3 ${activeStatuses.length === 2 ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-4'}`}>
          {activeStatuses.map((s) => (
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
                    {s.key === "" ? data.length : data.filter(d => d.status === s.key).length}
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

        {/* SEARCH BAR — Minimalist */}
        <div className="relative">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" placeholder="Cari nomor pengajuan atau nama pemohon..." value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-medium dark:text-white shadow-sm"
          />
        </div>

        {/* TABLE AREA */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {loading ? (
             <div className="p-8"><TableSkeleton columns={7} rows={5} /></div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-50 dark:border-slate-800">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pemohon</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgensi</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                          <ClipboardCheck size={28} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          {data.length === 0 ? "Semua pengajuan sudah ditangani âœ…" : "Tidak ada antrian yang sesuai filter"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : currentData.map((item, idx) => {
                  const badge = STATUS_CONFIG[item.status] || { label: item.status, cls: "bg-slate-50 text-slate-600" };
                  const urgency = URGENCY_CONFIG[item.urgensi] || URGENCY_CONFIG.normal;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-5 text-[11px] font-bold text-slate-400">{indexFirst + idx + 1}</td>
                      <td className="px-8 py-5">
                        <span className="font-black text-blue-600 dark:text-blue-400 text-[11px] font-mono uppercase tracking-tight bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/30">
                          {item.nomor_pengajuan}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{item.nama}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border mt-1 inline-block ${
                          item.pengaju_role === 'manager' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          item.pengaju_role === 'asisten_manager' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {{ staff: 'Staff', admin: 'Admin', asisten_manager: 'Asmen', manager: 'Manager', gudang: 'Gudang' }[item.pengaju_role] || item.pengaju_role || 'Staff'}
                        </span>
                        {item.sub_dept_pengaju && (
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                            Unit: {item.sub_dept_pengaju}
                          </p>
                        )}
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {new Date(item.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${urgency}`}>{item.urgensi || "normal"}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center items-center">
                          <button onClick={() => navigate(`/pengajuan/${item.id}?mode=process`)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.05] active:scale-95 transition-all">
                            <Zap size={13} /> Proses
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}

          {/* DYNAMIC SLIDING WINDOW PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-8 py-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-800/10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Menampilkan {indexFirst + 1}â€“{Math.min(indexLast, filtered.length)} dari {filtered.length} Antrian
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft size={16} /></button>
                
                <div className="flex px-1 gap-1.5 items-center">
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
                          className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === p ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/25" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50"}`}
                        >
                          {p}
                        </button>
                      )
                    ));
                  })()}
                </div>

                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
