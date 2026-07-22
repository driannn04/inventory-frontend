import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    ClipboardCheck, 
    Clock, 
    History, 
    ArrowRight,
    Users,
    Briefcase,
    CheckCircle,
    XCircle,
    Calendar,
    Zap,
    Activity,
    BarChart3
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import StatCard from "../../../components/dashboard/StatCard";

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadManagerData = async () => {
        try {
            const res = await api.get("/pengajuan");
            const all = res.data;
            
            // Manager fokus pada status 'pending_manager'
            setStats({
                pending: all.filter(p => p.status === 'pending_manager').length,
                approved: all.filter(p => p.status === 'completed' || p.status === 'pending_gudang').length,
                rejected: all.filter(p => p.status === 'rejected').length,
                total: all.length
            });
            setRecentLogs(all.slice(0, 5));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadManagerData();
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") loadManagerData();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
       <div className="pt-4 pb-12 space-y-8">
          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse px-2"></div>
          <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>)}
          </div>
          <div className="h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
       </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
        >


            {/* ── STATS SECTION (4 Columns) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Menunggu Manager" value={stats.pending} icon={<Clock />} color="blue" />
                <StatCard title="Telah Disetujui" value={stats.approved} icon={<CheckCircle />} color="green" />
                <StatCard title="Ditolak" value={stats.rejected} icon={<XCircle />} color="red" />
                <StatCard title="Total Masuk" value={stats.total} icon={<BarChart3 />} color="blue" />
            </div>

            {/* ── RECENT FEED ── */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><History size={22} /></div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Arsip Aktivitas Persetujuan</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoring seluruh permohonan aktif</p>
                        </div>
                    </div>
                    <Link to="/semua-pengajuan" className="group flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                        Lihat Semua Riwayat <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {recentLogs.length > 0 ? recentLogs.map((r, i) => (
                        <div key={i} onClick={() => navigate(`/pengajuan/${r.id}`)}
                            className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-50 dark:border-slate-800 group hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer hover:shadow-sm"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{r.nama || "Nama Pengaju"}</p>
                                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">#{r.nomor_pengajuan}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 line-clamp-1">{r.catatan || "Permohonan Barang Logistik"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-slate-800 dark:text-white leading-none">{new Date(r.tanggal_pengajuan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Diajukan</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border ${
                                        r.status === 'pending_asisten_manager' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30' :
                                        r.status === 'pending_manager' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30' :
                                        r.status === 'pending_gudang' ? 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:border-sky-900/30' :
                                        r.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30' :
                                        'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30'
                                    }`}>
                                        {r.status === 'pending_asisten_manager' ? 'Menunggu Asmen' :
                                         r.status === 'pending_manager' ? 'Menunggu Manager' :
                                         r.status === 'pending_gudang' ? 'Menunggu Gudang' :
                                         r.status === 'completed' ? 'Selesai' :
                                         r.status === 'rejected' ? 'Ditolak' : r.status}
                                    </span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border ${
                                        r.status.includes('pending') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        r.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                        {r.status.includes('pending') ? <Clock size={16}/> : r.status === 'completed' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center opacity-40">
                            <ClipboardCheck size={48} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Belum ada aktivitas persetujuan</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
