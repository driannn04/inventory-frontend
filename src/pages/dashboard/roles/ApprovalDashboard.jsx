import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    ClipboardCheck, 
    Clock, 
    History, 
    ArrowRight,
    Users,
    Activity,
    CheckCircle,
    XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../../utils/api";
import StatCard from "../../../components/dashboard/StatCard";

export default function ApprovalDashboard() {
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadApprovalStats = async () => {
        try {
            // We'll use the existing pengajuan endpoint for manager/asesmen
            const res = await api.get("/pengajuan");
            const all = res.data;
            setStats({
                pending: all.filter(p => p.status === 'Pending').length,
                approved: all.filter(p => p.status === 'Disetujui').length,
                rejected: all.filter(p => p.status === 'Ditolak').length
            });
            setRecentLogs(all.slice(0, 5));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApprovalStats();
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") loadApprovalStats();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-400 font-bold animate-pulse">Menghubungkan ke Pusat Validasi...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
        >
            <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Dashboard Validasi</h2>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Pusat Persetujuan & Monitoring Pengajuan</p>
            </div>

            {/* ACTION CARD */}
            <div className={`p-8 rounded-[2.5rem] border transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${
                stats.pending > 0 
                ? "bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/50 shadow-lg shadow-amber-500/5" 
                : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-sm"
            }`}>
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className={`p-5 rounded-3xl ${stats.pending > 0 ? "bg-amber-500 text-white animate-bounce" : "bg-slate-100 text-slate-400"}`}>
                        <ClipboardCheck size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                            {stats.pending > 0 ? `Terdapat ${stats.pending} Antrian Baru` : "Belum Ada Antrian Baru"}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">
                            {stats.pending > 0 ? "Beberapa pengajuan unit memerlukan validasi segera dari Anda." : "Semua pengajuan telah diproses."}
                        </p>
                    </div>
                </div>
                <Link 
                    to="/approval"
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                        stats.pending > 0 
                        ? "bg-amber-500 text-white shadow-amber-500/25 hover:bg-amber-600" 
                        : "bg-slate-900 text-white hover:bg-black"
                    }`}
                >
                    Lihat Antrian <ArrowRight size={16} />
                </Link>
            </div>

            {/* MINI STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard title="Sedang Pending" value={stats.pending} icon={<Clock />} color="amber" />
                <StatCard title="Selesai Divalidasi" value={stats.approved + stats.rejected} icon={<CheckCircle />} color="blue" />
                <StatCard title="Total Masuk" value={stats.pending + stats.approved + stats.rejected} icon={<Activity />} color="green" />
            </div>

            {/* RECENT FEED */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-8">
                     <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl"><History size={18} /></div>
                     <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Aktivitas Pengajuan Terakhir</h3>
                </div>
                <div className="space-y-4">
                    {recentLogs.map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                                    <Users size={16} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{r.nama || "Nama Pengaju"}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{r.kegiatan || "Tanpa Judul"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-slate-800 dark:text-white leading-none">{new Date(r.created_at).toLocaleDateString()}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Diajukan</p>
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    r.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                    r.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-rose-100 text-rose-600'
                                }`}>
                                    {r.status === 'Pending' ? <Clock size={14}/> : r.status === 'Disetujui' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
