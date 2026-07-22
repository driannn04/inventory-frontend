import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    PlusCircle,
    Clock,
    CheckCircle2,
    ClipboardList,
    AlertCircle,
    Boxes,
    ChevronRight,
    ListChecks,
    HelpCircle,
    ArrowRight,
    Search,
    User,
    Calendar,
    Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api, { UPLOAD_URL } from "../../../utils/api";
import { getUser } from "../../../utils/auth";
import StatCard from "../../../components/dashboard/StatCard";

export default function StaffDashboard() {
    const navigate = useNavigate();
    const user = getUser();
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStaffStats = async () => {
        try {
            const res = await api.get("/pengajuan/my-stats");
            setStats(res.data);

            const resList = await api.get("/pengajuan");
            setRecentRequests(resList.data.slice(0, 5));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStaffStats();
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") loadStaffStats();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const STATUS_UI = {
        pending_asisten_manager: { label: "Menunggu Persetujuan Asmen", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-100 dark:border-amber-900/30", dot: "bg-amber-500 shadow-amber-500/20", line: "bg-amber-400", step: 1 },
        pending_manager: { label: "Menunggu Persetujuan Manager", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-900/30", dot: "bg-blue-500 shadow-blue-500/20", line: "bg-blue-400", step: 2 },
        pending_gudang: { label: "Menunggu Persetujuan Gudang", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-900/30", dot: "bg-blue-500 shadow-blue-500/20", line: "bg-blue-400", step: 3 },
        completed: { label: "Pengajuan Selesai", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-900/30", dot: "bg-emerald-500 shadow-emerald-500/20", line: "bg-emerald-400", step: 4 },
        rejected: { label: "Pengajuan Ditolak", color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-100 dark:border-rose-900/30", dot: "bg-rose-500 shadow-rose-500/20", line: "bg-rose-400", step: 0 },
    };

    if (loading) return (
        <div className="pt-4 pb-12 space-y-8">
            <div className="flex justify-between items-center px-2">
                <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-[2rem] animate-pulse"></div>)}
            </div>
            <div className="grid grid-cols-1 gap-8">
                <div className="h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
        >


            {/* ── STATS SECTION ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Diajukan" value={stats.total} icon={<FileText />} color="blue" />
                <StatCard title="Proses" value={stats.pending} icon={<Clock />} color="amber" />
                <StatCard title="Selesai" value={stats.approved} icon={<CheckCircle2 />} color="green" />
                <StatCard title="Batal" value={stats.rejected} icon={<AlertCircle />} color="red" />
            </div>

            {/* ── MAIN CONTENT GRID ── */}
            <div className="grid grid-cols-1 gap-8 items-stretch">

                {/* TRACKING BERKAS AKTIF */}
                <div className="flex flex-col h-full">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><ClipboardList size={20} /></div>
                                <div>
                                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Pantau Berkas Terkini</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">Status langsung dari sistem</p>
                                </div>
                            </div>
                            <Link to="/list-pengajuan" className="group flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                                Lihat Semua <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {recentRequests.length > 0 ? (
                            <div className="space-y-4 flex-1">
                                {recentRequests.map((r, i) => {
                                    const ui = STATUS_UI[r.status] || { label: r.status, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-100", step: 0 };
                                    return (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 4 }}
                                            onClick={() => navigate(`/pengajuan/${r.id}`)}
                                            className={`p-6 border ${ui.border} ${ui.bg} rounded-[2rem] group cursor-pointer transition-all flex flex-col md:flex-row items-center gap-6`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${ui.color} font-mono bg-white dark:bg-sky-900/40 px-2.5 py-1 rounded-lg border ${ui.border}`}>
                                                        #{r.nomor_pengajuan}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-sky-400">{new Date(r.tanggal_pengajuan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                                </div>
                                                <h4 className="text-sm font-black text-sky-950 dark:text-white uppercase tracking-tight line-clamp-1">{r.catatan || "Tidak ada catatan"}</h4>
                                            </div>

                                             {/* Progress Status Visual */}
                                            <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                                {[
                                                    { id: 1, label: "Asmen" },
                                                    { id: 2, label: "Manager" },
                                                    { id: 3, label: "Gudang" },
                                                    { id: 4, label: "Selesai" }
                                                ].map((s, idx) => {
                                                    const isPassed = ui.step > s.id;
                                                    const isCurrent = ui.step === s.id && r.status !== "rejected";
                                                    const isDone = r.status === "completed" && s.id === 4;
                                                    const isHighlighted = isPassed || isCurrent || isDone;

                                                    // Label color matching status
                                                    let labelColor = "text-slate-400 dark:text-slate-600";
                                                    if (isDone) labelColor = "text-emerald-600 dark:text-emerald-400 font-extrabold";
                                                    else if (isCurrent) labelColor = `${ui.color} font-extrabold`;
                                                    else if (isPassed) labelColor = "text-blue-500 dark:text-blue-450";

                                                    return (
                                                        <div key={s.id} className="flex items-center">
                                                            <div className="flex flex-col items-center gap-1.5 min-w-[45px] md:min-w-[60px]">
                                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all duration-500
                                                                    ${isHighlighted ? `${ui.dot} text-white shadow-md` : "bg-white dark:bg-slate-800 text-slate-350 dark:text-slate-600 border border-slate-100 dark:border-slate-700"}
                                                                `}>
                                                                    {isPassed || isDone ? <CheckCircle2 size={12} /> : s.id}
                                                                </div>
                                                                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-wider ${labelColor}`}>
                                                                    {s.label}
                                                                </span>
                                                            </div>
                                                            {idx < 3 && (
                                                                <div className={`w-3 md:w-6 h-0.5 -mt-4 transition-colors duration-500 ${ui.step > s.id ? ui.line : "bg-slate-100 dark:bg-slate-800"}`}></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="p-2.5 bg-white dark:bg-sky-900/40 text-sky-300 group-hover:text-sky-600 group-hover:bg-sky-50 dark:group-hover:bg-sky-900/60 rounded-xl transition-all shadow-sm">
                                                <ChevronRight size={18} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4 opacity-40">
                                <div className="p-6 bg-sky-50 dark:bg-sky-900/20 rounded-full text-sky-200"><ClipboardList size={40} /></div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-sky-400">Belum ada pengajuan aktif</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* QUICK TOOLS (Kanan 4) */}

            </div>
        </motion.div>
    );
}
