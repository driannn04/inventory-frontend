import { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { 
    Boxes, 
    ArrowDownLeft, 
    ArrowUpRight, 
    AlertTriangle, 
    ListChecks,
    Globe,
    Database,
    Package,
    ArrowDownCircle,
    ArrowUpCircle,
    BarChart3,
    ScanLine,
    ArrowUpRight as ArrowUpRightLink
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import api, { UPLOAD_URL } from "../../../utils/api";
import StatCard from "../../../components/dashboard/StatCard";

export default function GudangDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [chartRange, setChartRange] = useState("year");

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            if (document.visibilityState === "visible") loadData();
        }, 30000);
        return () => clearInterval(interval);
    }, [chartRange]);

    const loadData = async () => {
        try {
            const res = await api.get(`/dashboard?chartRange=${chartRange}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
       <div className="pt-4 pb-12 space-y-8">
          <div className="flex justify-between items-center px-2">
             <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
             <div className="flex gap-6">
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => <div key={i} className="h-[120px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-8 h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
             <div className="lg:col-span-4 h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
          </div>
       </div>
    );

    if (!data) return null;

    const { 
        summary, 
        stok_rendah, 
        mutasi_terbaru, 
        status_pengajuan,
        barang_masuk_bulanan,
        barang_keluar_bulanan
    } = data;

    // Hitung antrian rilis gudang
    const pendingGudang = status_pengajuan?.find(s => s.status === 'pending_gudang')?.total || 0;

    // Rakit data grafik Trend Mutasi
    const trendData = (() => {
        if (!barang_masuk_bulanan || !barang_keluar_bulanan) return [];

        if (chartRange === '7d' || chartRange === '30d') {
            return barang_masuk_bulanan.map(m => {
                const k = barang_keluar_bulanan.find(x => x.label === m.label);
                return {
                    bulan: new Date(m.label).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
                    masuk: Number(m.total),
                    keluar: k ? Number(k.total) : 0
                };
            });
        }

        const namaBulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
        return namaBulan.map((nama, index) => {
            const bulanIndex = index + 1;
            const dataMasuk = barang_masuk_bulanan.find(m => m.label === bulanIndex);
            const dataKeluar = barang_keluar_bulanan.find(k => k.label === bulanIndex);
            return {
                bulan: nama,
                masuk: dataMasuk ? Number(dataMasuk.total) : 0,
                keluar: dataKeluar ? Number(dataKeluar.total) : 0
            };
        });
    })();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
        >
            {/* Header */}
            <div className="flex justify-between items-center px-2 flex-wrap gap-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Sistem Overview Gudang</h2>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Stok Tersedia" value={summary?.total_stok || 0} icon={<Boxes />} color="blue" />
                <StatCard title="Stok Menipis" value={summary?.stok_kritis || 0} icon={<AlertTriangle />} color="red" />
                <StatCard title="Antrean Rilis" value={pendingGudang} icon={<ListChecks />} color="blue" />
                <StatCard title="Total Item" value={summary?.total_barang || 0} icon={<Package />} color="green" />
            </div>

            {/* ROW 1: CHART (Kiri) & QUICK ACTIONS (Kanan) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* DATA VISUALIZATION: GRAFIK MUTASI */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><BarChart3 size={18} /></div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Tren Mutasi Logistik</h3>
                        </div>
                        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                            {["7d", "30d", "6m", "year"].map((t) => (
                                <button key={t} onClick={() => setChartRange(t)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${chartRange === t ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400"}`}>
                                    {t.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[300px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <defs>
                                   <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                   </linearGradient>
                                   <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                       <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', shadow: 'none', fontSize: '11px', fontWeight: 'bold' }} />
                                <Area type="monotone" name="Inbound (Masuk)" dataKey="masuk" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMasuk)" />
                                <Area type="monotone" name="Outbound (Keluar)" dataKey="keluar" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorKeluar)" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* QUICK ACTIONS CELL */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                    <div>
                        <div className="flex items-center justify-between mb-8 px-2">
                            <div>
                                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Aksi Pro</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">Pintasan Gudang</p>
                            </div>
                        </div>

                        {/* 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.button
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => navigate("/scan")}
                                className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left group gap-2"
                            >
                                <div className="p-3 w-max rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-100 dark:shadow-none mb-1 transform transition-transform group-hover:rotate-12 flex items-center justify-center">
                                    <ScanLine size={20} />
                                </div>
                                <div className="mt-1">
                                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">Scan Barang</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Barcode / QR</p>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => navigate("/approval")}
                                className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left group gap-2"
                            >
                                <div className="p-3 w-max rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none mb-1 transform transition-transform group-hover:rotate-12 relative flex items-center justify-center">
                                    <ListChecks size={20} />
                                    {pendingGudang > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>}
                                </div>
                                <div className="mt-1">
                                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">Persetujuan</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Rilis Stok</p>
                                </div>
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => navigate("/stok-masuk")}
                                className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left group gap-2"
                            >
                                <div className="p-3 w-max rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-none mb-1 transform transition-transform group-hover:rotate-12 flex items-center justify-center">
                                    <ArrowDownCircle size={20} />
                                </div>
                                <div className="mt-1">
                                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">Stok Masuk</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Inbound Data</p>
                                </div>
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => navigate("/stok-keluar")}
                                className="flex flex-col items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left group gap-2"
                            >
                                <div className="p-3 w-max rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-100 dark:shadow-none mb-1 transform transition-transform group-hover:rotate-12 flex items-center justify-center">
                                    <ArrowUpCircle size={20} />
                                </div>
                                <div className="mt-1">
                                    <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">Stok Keluar</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">Keluar Manual</p>
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: MUTASI (KIRI 8) & STOK KRITIS (KANAN 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* MUTASI TERBARU (KIRI) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-lg shadow-sky-100 dark:shadow-none">
                                <ArrowDownLeft size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Record Mutasi Logistik</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stok Masuk & Keluar Terkini</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[300px] max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-20">
                                <tr>
                                    <th className="pb-6">Detail Barang</th>
                                    <th className="pb-6">Jenis</th>
                                    <th className="pb-6">Jumlah</th>
                                    <th className="pb-6 text-right">Waktu Record</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {mutasi_terbaru?.map((m, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-50 dark:border-slate-800 flex-shrink-0">
                                                {m.foto ? (
                                                    <img src={`${UPLOAD_URL}/${m.foto}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="text-slate-300" size={18} />
                                                )}
                                            </div>
                                            <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-2">{m.nama_barang}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${m.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                {m.jenis}
                                            </span>
                                        </td>
                                        <td className="py-4 text-[11px] font-black text-slate-800 dark:text-white whitespace-nowrap">{m.jumlah} PCS</td>
                                        <td className="py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black text-slate-800 dark:text-white">{new Date(m.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                                                <span className="text-[9px] font-bold text-slate-400">{new Date(m.tanggal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!mutasi_terbaru?.length && (
                                    <tr><td colSpan={4} className="py-20 text-center text-xs text-slate-400 font-bold uppercase tracking-widest italic opacity-50">Belum ada mutasi</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CRITICAL STOCK TABLE (KANAN) */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-rose-50/20">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={18} className="text-rose-500" />
                            <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Peringatan Stok Menipis</h3>
                        </div>
                    </div>
                    
                    <div className="p-4 flex-1 overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 uppercase tracking-widest rounded-lg">
                                <tr>
                                    <th className="px-4 py-4 rounded-l-lg">Barang</th>
                                    <th className="px-4 py-4 rounded-r-lg text-right">Fisik</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {stok_rendah?.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-5">
                                            <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight line-clamp-2 max-w-[120px]">{item.nama_barang}</div>
                                            <div className="text-[8px] font-bold text-slate-400 uppercase mt-1">Min: {item.stok_minimum}</div>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/40 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-900/30">
                                                {item.stok}
                                                <ArrowUpRightLink size={10}/>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!stok_rendah?.length && (
                                    <tr><td colSpan={2} className="py-20 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-50">Stok aman</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
