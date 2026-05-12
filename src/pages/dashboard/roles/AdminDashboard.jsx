import { useEffect, useState } from "react";
import api, { UPLOAD_URL } from "../../../utils/api";
import QuickAction from "../../../components/dashboard/QuickAction";
import StatCard from "../../../components/dashboard/StatCard";
import { TableSkeleton } from "../../../components/common/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
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
   ArrowRightLeft,
   X
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

const PIE_COLORS = ["#06b6d4", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   // Tiga filter mandiri untuk setiap bagian
   const [chartRange, setChartRange] = useState("year");
   const [pieRange, setPieRange] = useState("year");
   const [topRange, setTopRange] = useState("year");

   const [selectedBarang, setSelectedBarang] = useState(null);
   const [showDetail, setShowDetail] = useState(false);

   useEffect(() => {
      loadData();
      const interval = setInterval(() => {
         if (document.visibilityState === "visible") loadData();
      }, 30000);
      return () => clearInterval(interval);
   }, [chartRange, pieRange, topRange]); // Reload jika salah satu filter berubah

   const loadData = async () => {
      try {
         const res = await api.get(`/dashboard?chartRange=${chartRange}&pieRange=${pieRange}&topRange=${topRange}`);
         setData(res.data);
      } catch (err) {
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   // Fungsi untuk membuka detail
   const openDetail = (item) => {
      setSelectedBarang(item);
      setShowDetail(true);
   };

   if (loading) return (
      // ... skeleton loading ...
      <div className="pt-4 pb-12 space-y-8">
         <div className="flex justify-between items-center px-2">
            <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-[120px] bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>)}
         </div>
      </div>
   );

   if (!data) return null;

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
      if (chartRange === '7d' || chartRange === '30d') {
         // Jika harian, pakai label tanggal langsung dari backend
         return barang_masuk_bulanan.map(m => {
            const k = barang_keluar_bulanan.find(x => x.label === m.label);
            return {
               bulan: new Date(m.label).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
               masuk: Number(m.total),
               keluar: k ? Number(k.total) : 0
            };
         });
      }

      // Jika bulanan (6m atau year), pakai nama bulan
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

   const pieData = status_pengajuan.map(s => ({ name: s.status, value: s.total }));

   return (
      <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="space-y-8 pb-12"
      >
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

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Item Katalog" value={summary?.total_barang || 0} icon={<Package />} color="blue" />
            <StatCard title="Stok Tersedia" value={summary?.total_stok || 0} icon={<Boxes />} color="blue" />
            <StatCard title="Stok Menipis" value={summary?.stok_kritis || 0} icon={<TrendingDown />} color="red" />
            <StatCard title="Approval Pending" value={summary?.pengajuan_pending || 0} icon={<Activity />} color="amber" />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><BarChart3 size={18} /></div>
                     <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Tren Mutasi Barang</h3>
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
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
                        <Area type="monotone" dataKey="masuk" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMasuk)" />
                        <Area type="monotone" dataKey="keluar" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorKeluar)" strokeDasharray="5 5" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
               <div className="flex justify-between items-center mb-6 w-full">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Alur Pengajuan</h3>
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-100 dark:border-slate-700">
                     {["7d", "30d", "year"].map((t) => (
                        <button key={t} onClick={() => setPieRange(t)}
                           className={`px-2 py-1 rounded-md text-[8px] font-black transition-all ${pieRange === t ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400"}`}>
                           {t.toUpperCase()}
                        </button>
                     ))}
                  </div>
               </div>
               <div className="h-[220px] w-full relative min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* 1. TOP MUTASI */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-[500px]">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-[1rem] shadow-sm">
                        <TrendingDown size={18} />
                     </div>
                     <div>
                        <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">Top Mutasi</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Barang paling sering keluar</p>
                     </div>
                  </div>
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                     {["7d", "30d", "year"].map((t) => (
                        <button key={t} onClick={() => setTopRange(t)}
                           className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${topRange === t ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}>
                           {t.toUpperCase()}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {top_barang_keluar?.length > 0 ? (
                     top_barang_keluar.map((item, index) => {
                        const maxVal = top_barang_keluar[0].total_keluar;
                        const percentage = (item.total_keluar / maxVal) * 100;
                        const rankColors = [
                           "from-amber-400 to-orange-500 shadow-amber-500/20",
                           "from-slate-300 to-slate-400 shadow-slate-400/20",
                           "from-amber-600 to-amber-700 shadow-amber-700/20",
                        ];

                        return (
                           <div key={index} className="group relative cursor-pointer" onClick={() => openDetail(item)}>
                              <div className="flex items-center justify-between mb-2">
                                 <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-lg 
                                       ${index < 3 ? `bg-gradient-to-br ${rankColors[index]}` : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                       {index + 1}
                                    </div>
                                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">
                                       {item.nama_barang}
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-1.5 ml-2">
                                    <span className="text-[12px] font-black text-slate-800 dark:text-white">{item.total_keluar}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">Unit</span>
                                 </div>
                              </div>
                              <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full bg-gradient-to-r ${index < 3 ? rankColors[index].split(' shadow-')[0] : "from-blue-500 to-sky-400"}`}
                                 />
                              </div>
                           </div>
                        );
                     })
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                        <TrendingDown size={32} className="text-slate-300 mb-3" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum ada data mutasi</p>
                     </div>
                  )}
               </div>
            </div>

            {/* 2. KATALOG TERBARU */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-[500px]">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-[1rem] shadow-sm">
                     <Plus size={18} />
                  </div>
                  <div>
                     <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest leading-none">Katalog Terbaru</h3>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Inventaris terbaru</p>
                  </div>
               </div>
               <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {barang_terbaru?.length > 0 ? (
                     barang_terbaru.map((item, i) => (
                        <div key={i} onClick={() => openDetail(item)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50 cursor-pointer">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200/50 dark:border-slate-700 shrink-0">
                              {item.foto ? (
                                 <img src={`${UPLOAD_URL}/${item.foto}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                 <Package className="text-slate-300" size={16} />
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase truncate leading-tight tracking-tight">
                                 {item.nama_barang}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.kode_barang}</span>
                                 <span className="text-[8px] font-black text-emerald-500 uppercase">{item.stok} {item.satuan}</span>
                              </div>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                        <Package size={32} className="text-slate-300 mb-3" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kosong</p>
                     </div>
                  )}
               </div>
            </div>

            {/* 3. AKSI CEPAT */}
            <div className="h-[500px]">
               <QuickAction />
            </div>
         </div>

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
                                    <button 
                                       onClick={() => navigate(`/stok-masuk?barang_id=${item.id}`)}
                                       className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline flex items-center gap-1 justify-end ml-auto"
                                    >
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
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><History size={18} /></div>
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

         <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none">
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
                                    <img src={`${UPLOAD_URL}/${m.foto}`} className="w-full h-full object-cover" />
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

         {/* MODAL PREVIEW DETAIL BARANG */}
         <AnimatePresence>
            {showDetail && selectedBarang && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" 
                     onClick={() => setShowDetail(false)}
                  />
                  <motion.div 
                     initial={{ scale: 0.9, opacity: 0, y: 20 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.9, opacity: 0, y: 20 }}
                     className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 dark:border-slate-800"
                  >
                     {/* Foto Header */}
                     <div className="h-64 bg-slate-100 dark:bg-slate-800 relative overflow-hidden group">
                        {selectedBarang.foto ? (
                           <img src={`${UPLOAD_URL}/${selectedBarang.foto}`} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                              <Package size={64} />
                              <p className="text-[10px] font-black uppercase mt-4 tracking-widest">Tidak ada foto</p>
                           </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-8 right-8">
                           <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block">
                              {selectedBarang.kategori || "Tanpa Kategori"}
                           </span>
                           <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                              {selectedBarang.nama_barang}
                           </h3>
                        </div>
                        <button onClick={() => setShowDetail(false)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl transition-all">
                           <X size={20} />
                        </button>
                     </div>

                     {/* Info Content */}
                     <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kode Barang</p>
                              <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedBarang.kode_barang}</p>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lokasi Rak</p>
                              <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedBarang.lokasi_rak || "Belum Diatur"}</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] border border-blue-100/50 dark:border-blue-800">
                           <div>
                              <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest mb-1">Stok Real-Time</p>
                              <h4 className="text-3xl font-black text-blue-600 leading-none">{selectedBarang.stok} <span className="text-sm uppercase">{selectedBarang.satuan}</span></h4>
                           </div>
                           <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedBarang.stok <= 5 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                              {selectedBarang.stok <= 5 ? 'Stok Kritis' : 'Stok Aman'}
                           </div>
                        </div>

                        <button 
                           onClick={() => {
                              setShowDetail(false);
                              navigate('/barang');
                           }}
                           className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                           Buka Di Katalog Lengkap
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </motion.div>
   );
}
