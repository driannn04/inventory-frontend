import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    ClipboardCheck,
    Clock,
    History,
    ArrowRight,
    Users,
    ShieldCheck,
    CheckCircle,
    XCircle,
    Calendar,
    Zap,
    Activity,
    AlertTriangle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getPengajuan } from "../../../services/pengajuanService";
import { getDashboard } from "../../../services/dashboardService";
import StatCard from "../../../components/dashboard/StatCard";

export default function AsistenManagerDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pieRange, setPieRange] = useState("year"); // Filter waktu untuk status sistem

    const loadData = async () => {
        try {
            const [all, dashboardRes] = await Promise.all([
                getPengajuan(),
                getDashboard({ pieRange })
            ]);

            setDashboardData(dashboardRes.data);

            // Filter khusus status yang relevan bagi Asisten Manager (pending_asisten_manager)
            setStats({
                pending: all.data.filter(p => p.status === 'pending_asisten_manager').length,
                approved: all.data.filter(p => p.status !== 'pending_asisten_manager' && p.status !== 'rejected').length,
                rejected: all.data.filter(p => p.status === 'rejected').length
            });
            setRecentLogs(all.data.slice(0, 5));
        } catch (err) {
            console.error("Dashboard Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") loadData();
        }, 30000);
        return () => clearInterval(interval);
    }, [pieRange]);

    if (loading) return (
        <div className="pt-4 pb-12 space-y-8">
            <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse px-2"></div>
            <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>)}
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



            {/* ── STATS SECTION ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard title="Menunggu Asisten Manager" value={stats.pending} icon={<Clock />} color="blue" />
                <StatCard title="Telah Divalidasi" value={stats.approved} icon={<CheckCircle />} color="green" />
                <StatCard title="Total Berkas" value={stats.pending + stats.approved + stats.rejected} icon={<Activity />} color="blue" />
            </div>

            {/* ── GRID LAYOUT ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ── DISTRIBUSI STATUS PENGAJUAN ── */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl"><Activity size={22} /></div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Status Pengajuan</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">

                                    <span className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200">
                                        {["7d", "30d", "year"].map(t => (
                                            <button key={t} onClick={() => setPieRange(t)}
                                                className={`px-1.5 py-0.5 rounded text-[7px] font-black ${pieRange === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>
                                                {t.toUpperCase()}
                                            </button>
                                        ))}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <Link to="/semua-pengajuan" className="group p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </Link>
                    </div>

                    <div className="space-y-3 flex-1">
                        {[
                            { id: 'pending_asisten_manager', label: 'Validasi Asisten Manager', icon: <ShieldCheck size={18} />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-100' },
                            { id: 'pending_manager', label: 'Validasi Manager', icon: <Users size={18} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-100' },
                            { id: 'pending_gudang', label: 'Proses Gudang', icon: <History size={18} />, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100' },
                            { id: 'completed', label: 'Selesai', icon: <CheckCircle size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100' }
                        ].map((status, idx) => {
                            const count = dashboardData?.status_pengajuan?.find(s => s.status === status.id)?.total || 0;
                            return (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${status.bg} ${status.color}`}>
                                            {status.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{status.label}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-slate-600 dark:text-slate-300">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── RECENT FEED ── */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><History size={22} /></div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Log Persetujuan</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aktivitas Real-time</p>
                            </div>
                        </div>
                        <Link to="/semua-pengajuan" className="group p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </Link>
                    </div>

                    <div className="space-y-4 flex-1">
                        {recentLogs.length > 0 ? recentLogs.map((r, i) => (
                            <div key={i} onClick={() => navigate(`/pengajuan/${r.id}`)}
                                className="flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/30 border border-slate-50 dark:border-slate-800 group hover:border-blue-200 dark:hover:border-blue-900/50 transition-all cursor-pointer hover:shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{r.nama || "Nama Pengaju"}</p>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">#{r.nomor_pengajuan}</p>
                                    </div>
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
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border ${r.status.includes('pending') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        r.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                        {r.status.includes('pending') ? <Clock size={14} /> : r.status === 'completed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-20 h-full">
                                <ClipboardCheck size={40} className="mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Kosong</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
