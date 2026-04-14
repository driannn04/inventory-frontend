import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getDashboard } from "../../services/dashboardService";
import QuickAction from "../../components/dashboard/QuickAction";
import StatCard from "../../components/dashboard/StatCard";
import { TableSkeleton } from "../../components/common/Skeleton";
import { motion } from "framer-motion";
import {
   Package,
   Boxes,
   TrendingDown,
   History,
   Activity,
   ArrowUpRight,
   Database,
   Globe,
   BarChart3,
   AlertTriangle,
   TrendingUp,
   Plus,
   ArrowRightLeft
} from "lucide-react";
import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   PieChart as RePieChart,
   Pie,
   Cell,
   BarChart,
   Bar
} from "recharts";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#0ea5e9"];

export default function Dashboard() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadData();
      const interval = setInterval(() => {
         if (document.visibilityState === "visible") loadData();
      }, 30000);
      return () => clearInterval(interval);
   }, []);

   const loadData = async () => {
      try {
         const res = await getDashboard();
         setData(res.data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   if (loading) return (
      <MainLayout>
         <div className="pt-4 pb-12 space-y-8">
            {/* SYSTEM STATUS SKELETON */}
            <div className="flex justify-between items-center px-2">
               <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
               <div className="flex gap-6">
                  <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
               </div>
            </div>

            {/* STAT CARDS SKELETON */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[...Array(4)].map((_, i) => <div key={i} className="h-[120px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>)}
            </div>

            {/* ROW 1 SKELETON */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
               <div className="lg:col-span-4 h-[400px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
            </div>

            {/* ROW 2 SKELETON */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8 h-[350px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
               <div className="lg:col-span-4 h-[350px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
            </div>

            {/* ROW 3 SKELETON (TABLE) */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
               <div className="h-8 w-64 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8 animate-pulse"></div>
               <TableSkeleton columns={5} rows={4} />
            </div>
         </div>
      </MainLayout>
   );

   const {
      summary,
      barang_masuk_bulanan,
      barang_keluar_bulanan,
      top_barang_keluar,
      aktivitas_terbaru,
      status_pengajuan,
      stok_rendah,
      barang_terbaru,
      mutasi_terbaru
   } = data;

   const trendData = (() => {
      let base = barang_masuk_bulanan.map(m => {
         const k = barang_keluar_bulanan.find(x => x.bulan === m.bulan);
         return {
            bulanInt: m.bulan,
            bulan: `Bln ${m.bulan}`,
            masuk: Number(m.total),
            keluar: k ? Number(k.total) : 0
         };
      });
      return base.sort((a, b) => a.bulanInt - b.bulanInt);
   })();

   const pieData = status_pengajuan.map(s => ({ name: s.status, value: s.total }));

   return (
      <MainLayout>
         <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-12"
         >
            {/* --- SYSTEM STATUS (TOP ROW) --- */}
            <div className="flex justify-between items-center px-2">
               <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Sistem Overview</h2>
               <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Globe size={12} /> Server: Aktif</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Database size={12} /> DB: Connected</span>
                  </div>
               </div>
            </div>

            {/* --- STAT CARDS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard title="Item Katalog" value={summary?.total_barang || 0} icon={<Package />} color="blue" />
               <StatCard title="Stok Tersedia" value={summary?.total_stok || 0} icon={<Boxes />} color="indigo" />
               <StatCard title="Unit Kritis" value={summary?.stok_kritis || 0} icon={<TrendingDown />} color="red" />
               <StatCard title="Approval Pending" value={summary?.pengajuan_pending || 0} icon={<Activity />} color="amber" />
            </div>

            {/* --- ROW 1: ANALYTICS SYMMETRY --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
               <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-8">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><BarChart3 size={18} /></div>
                        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Tren Mutasi Barang</h3>
                     </div>
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                           <defs>
                              <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                           <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                           <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', shadow: 'none', fontSize: '11px', fontWeight: 'bold' }} />
                           <Area type="monotone" dataKey="masuk" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                           <Area type="monotone" dataKey="keluar" stroke="#818cf8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
               <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 w-full text-center">Alur Pengajuan</h3>
                  <div className="h-[220px] w-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                           <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value">
                              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />)}
                           </Pie>
                           <Tooltip />
                        </RePieChart>
                     </ResponsiveContainer>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tighter">{summary?.pengajuan_pending || 0}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 opacity-50">Antrian</p>
                     </div>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-2 w-full">
                     {pieData.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-transparent">
                           <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight truncate">{item.name}</span>
                           </div>
                           <span className="text-[10px] font-black text-slate-800 dark:text-white ml-2">{item.value}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* --- ROW 2: ACTIONS & RECORDS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
               <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl"><TrendingDown size={16} /></div>
                        <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Top Mutasi Keluar</h3>
                     </div>
                     <div className="h-[230px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={top_barang_keluar} layout="vertical" margin={{ left: -20, right: 20 }}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="nama_barang" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} width={100} />
                              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '20px', border: 'none' }} />
                              <Bar dataKey="total_keluar" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={12} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><Plus size={16} /></div>
                        <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Katalog Terbaru</h3>
                     </div>
                     <div className="space-y-4 flex-1">
                        {barang_terbaru?.map((item, i) => (
                           <div key={i} className="flex items-center justify-between group">
                              <div className="flex flex-col gap-0.5 min-w-0">
                                 <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase truncate tracking-tight">{item.nama_barang}</span>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.kode_barang}</span>
                              </div>
                              <span className="text-[9px] font-black text-slate-400 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-md group-hover:bg-slate-50 transition-colors uppercase">{item.satuan}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-4 h-full">
                  <QuickAction />
               </div>
            </div>

            {/* --- ROW 3: CRITICAL NOTIFS & ACTIVITY --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
               <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                  <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/20">
                     <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className="text-rose-500" />
                        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em]">Peringatan Persediaan</h3>
                     </div>
                  </div>
                  <div className="p-2 flex-1 flex flex-col">
                     <div className="flex-1">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <tr>
                                 <th className="px-8 py-5">Barang</th>
                                 <th className="px-8 py-5">Status</th>
                                 <th className="px-8 py-5 text-right">Aksi</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                              {stok_rendah?.map((item, i) => (
                                 <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-default">
                                    <td className="px-8 py-5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{item.nama_barang}</td>
                                    <td className="px-8 py-5">
                                       <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/40 px-3 py-1 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                          Sisa {item.stok}
                                       </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                       <button className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline flex items-center gap-1 justify-end ml-auto">
                                          Restock <ArrowUpRight size={12} />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                              {!stok_rendah?.length && (
                                 <tr><td colSpan={3} className="py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Semua stok aman saat ini</td></tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><History size={18} /></div>
                     <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Aktivitas</h3>
                  </div>
                  <div className="space-y-6 relative ml-1">
                     <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-100 dark:bg-slate-800"></div>
                     {aktivitas_terbaru?.slice(0, 7).map((a, i) => (
                        <div key={i} className="flex gap-4 relative group">
                           <div className={`w-8 h-8 rounded-xl border-4 border-white dark:border-slate-900 shadow-sm flex items-center justify-center text-[10px] font-black text-white shrink-0 z-10 transition-transform group-hover:scale-110
                           ${a.aksi.includes('Tambah') ? 'bg-emerald-500' : a.aksi.includes('Edit') ? 'bg-blue-500' : 'bg-slate-400'}`}>
                              {a.aksi[0]}
                           </div>
                           <div className="min-w-0 pt-0.5">
                              <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-tight line-clamp-2 tracking-tight">{a.deskripsi}</p>
                              <div className="flex items-center gap-2 mt-1 opacity-50">
                                 <span className="text-[9px] font-bold text-slate-500 uppercase">{a.nama_user}</span>
                                 <span className="text-[8px] font-bold text-slate-400">• {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* --- ROW 4: LANDSCAPE RECORD (MUTASI TERBARU) --- */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none">
                        <ArrowRightLeft size={20} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Aktivitas Stok Terakhir</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Record Real-Time dari Sistem</p>
                     </div>
                  </div>
               </div>

               <div className="overflow-x-auto max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  <table className="w-full text-left min-w-[800px]">
                     <thead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-20">
                        <tr>
                           <th className="pb-6">Detail Barang</th>
                           <th className="pb-6">Jenis</th>
                           <th className="pb-6">Jumlah</th>
                           <th className="pb-6">Keterangan</th>
                           <th className="pb-6 text-right">Waktu Transaksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {mutasi_terbaru?.map((m, i) => (
                           <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-4 flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-50 dark:border-slate-800">
                                    {m.foto ? (
                                       <img src={`http://localhost:5000/uploads/${m.foto}`} className="w-full h-full object-cover" />
                                    ) : (
                                       <Package className="text-slate-300" size={18} />
                                    )}
                                 </div>
                                 <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{m.nama_barang}</span>
                              </td>
                              <td className="py-4">
                                 <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${m.jenis === 'masuk' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {m.jenis}
                                 </span>
                              </td>
                              <td className="py-4 text-xs font-black text-slate-800 dark:text-white">{m.jumlah} Unit</td>
                              <td className="py-4 text-[10px] font-bold text-slate-500 uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity max-w-[200px] truncate">{m.keterangan || "-"}</td>
                              <td className="py-4 text-right">
                                 <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-800 dark:text-white">{new Date(m.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{new Date(m.tanggal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {!mutasi_terbaru?.length && (
                           <tr><td colSpan={5} className="py-20 text-center text-xs text-slate-400 font-bold uppercase tracking-widest italic opacity-50">Belum ada record mutasi barang</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

         </motion.div>
      </MainLayout>
   );
}