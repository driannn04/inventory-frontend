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
        pending_asisten_manager:   { label: "Menunggu Asisten Manager",   color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-100 dark:border-amber-900/30", dot: "bg-amber-500 shadow-amber-500/20", line: "bg-amber-400", step: 1 },
        pending_manager: { label: "Menunggu Manager", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-900/30", dot: "bg-blue-500 shadow-blue-500/20", line: "bg-blue-400", step: 2 },
        pending_gudang:  { label: "Menunggu Gudang",  color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-900/30", dot: "bg-blue-500 shadow-blue-500/20", line: "bg-blue-400", step: 3 },
        completed:       { label: "Selesai",          color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-900/30", dot: "bg-emerald-500 shadow-emerald-500/20", line: "bg-emerald-400", step: 4 },
        rejected:        { label: "Ditolak",          color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-100 dark:border-rose-900/30", dot: "bg-rose-500 shadow-rose-500/20", line: "bg-rose-400", step: 0 },
    };

    if (loading) return (
       <div className="pt-4 pb-12 space-y-8">
          <div className="flex justify-between items-center px-2">
             <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-[2rem] animate-pulse"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
             <div className="lg:col-span-4 h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
          </div>
       </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
        >
            {/* ── HEADER ── */}
            <div className="flex justify-between items-center px-2 flex-wrap gap-4">
                <h2 className="text-sm font-black text-sky-900/40 dark:text-sky-400/40 uppercase tracking-[0.2em]">
                    Staff Overview — Tracking Pengajuan
                </h2>
            </div>

            {/* ── GREETING BANNER (Match PDAM Theme) ── */}
            <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30 rounded-[2.5rem] p-6 shadow-sm shadow-blue-500/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-600 to-sky-400"></div>
                
                <div className="flex items-center gap-4 relative z-10 pl-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-400 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm md:text-base font-black text-sky-950 dark:text-white uppercase tracking-tight">Pusat Kendali Pengajuan Barang</h3>
                        <div className="flex items-center gap-3 mt-0.5">
                             <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none">Divisi Staff — PDAM Tirta Pakuan</p>
                             <span className="w-1 h-1 bg-blue-200 rounded-full"></span>
                             <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={10} /> {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                             </p>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/buat-pengajuan")}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 transition-all relative z-10 border border-blue-500/50"
                >
                    <PlusCircle size={16} />
                    Buat Pengajuan
                </motion.button>
            </div>

            {/* ── STATS SECTION ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Diajukan" value={stats.total} icon={<FileText />} color="blue" />
                <StatCard title="Proses" value={stats.pending} icon={<Clock />} color="amber" />
                <StatCard title="Selesai" value={stats.approved} icon={<CheckCircle2 />} color="green" />
                <StatCard title="Batal" value={stats.rejected} icon={<AlertCircle />} color="red" />
            </div>

            {/* ── MAIN CONTENT GRID (8:4 Balanced) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* TRACKING BERKAS AKTIF (Kiri 8) */}
                <div className="lg:col-span-8 flex flex-col h-full">
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
                                            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                                                {[1, 2, 3, 4].map(step => (
                                                    <div key={step} className="flex items-center">
                                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors duration-500
                                                            ${ui.step >= step ? `${ui.dot} text-white shadow-md` : "bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-700"}
                                                        `}>
                                                            {ui.step >= step ? <CheckCircle2 size={12} /> : step}
                                                        </div>
                                                        {step < 4 && <div className={`w-4 md:w-8 h-0.5 transition-colors duration-500 ${ui.step > step ? ui.line : "bg-slate-100 dark:bg-slate-800"}`}></div>}
                                                    </div>
                                                ))}
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
                <div className="lg:col-span-4 flex flex-col gap-8">
                    
                    {/* PANDUAN ALUR KERJA */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex-1">
                        <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <ListChecks size={14} /> Alur Persetujuan Berkas
                        </h3>
                        <div className="space-y-4">
                            {[
                                { step: "01", label: "Staff", desc: "Input barang & urgensi" },
                                { step: "02", label: "Asmen", desc: "Validasi & Verifikasi" },
                                { step: "03", label: "Manager", desc: "Persetujuan Akhir" },
                                { step: "04", label: "Gudang", desc: "Barang dikeluarkan" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-blue-500/30 font-mono">{item.step}</span>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase leading-none">{item.label}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{item.desc}</p>
                                    </div>
                                    {i < 3 && <ChevronRight size={10} className="ml-auto text-slate-200" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PUSAT BANTUAN */}
                    <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-lg shadow-blue-500/20 border border-blue-500/50">
                        <HelpCircle size={120} className="absolute -bottom-6 -right-6 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="relative z-10">
                            <h3 className="text-base font-black uppercase tracking-tight leading-dense">Bantuan <br/> Operasional?</h3>
                            <div className="mt-6 space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-sky-300 rounded-full mt-1.5 shrink-0"></div>
                                    <p className="text-[10px] font-bold text-blue-50 leading-relaxed uppercase tracking-wider">Pastikan kode barang sesuai katalog fisik PDAM.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-sky-300 rounded-full mt-1.5 shrink-0"></div>
                                    <p className="text-[10px] font-bold text-blue-50 leading-relaxed uppercase tracking-wider">Pantau status approval Asmen sebelum ke Gudang.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate("/bantuan")}
                                className="w-full mt-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all backdrop-blur-sm"
                            >
                                Baca Panduan SOP
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
