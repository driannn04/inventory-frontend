import { useState, useEffect } from "react";
import { X, ClipboardList, User, Calendar, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { getPendingOrders } from "../../services/barangService";
import { motion, AnimatePresence } from "framer-motion";

export default function TraceOrderModal({ open, setOpen, barangId, barangName }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && barangId) {
      loadPendingOrders();
    }
  }, [open, barangId]);

  const loadPendingOrders = async () => {
    setLoading(true);
    try {
      const res = await getPendingOrders(barangId);
      setData(res.data);
    } catch (err) {
      console.error("Gagal memuat antrean:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* OVERLAY */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      {/* MODAL CONTENT */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <ClipboardList size={24} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Antrean Pemesanan</h2>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 line-clamp-1">{barangName}</p>
            </div>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 rounded-2xl transition-all active:scale-90 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-10 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mencari Jejak Pesanan...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto border border-dashed border-slate-200 dark:border-slate-700">
                <Clock size={32} className="text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Tidak Ada Antrean</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stok saat ini sepenuhnya tersedia fisik di gudang</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                <p className="text-[10px] font-bold text-amber-900/70 dark:text-amber-400 leading-relaxed uppercase tracking-tight">
                  Stok barang ini sedang di-"booking" oleh <span className="font-black text-amber-600 underline">{data.length} pengajuan</span> tertunda. Stok fisik tidak akan berkurang sampai pengajuan tersebut diselesaikan oleh gudang.
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <tr>
                          <th className="px-6 py-4">Pemohon</th>
                          <th className="px-6 py-4 text-center">Jumlah</th>
                          <th className="px-6 py-4">Status & Waktu</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                       {data.map((order, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                      <User size={14} />
                                   </div>
                                   <div>
                                      <p className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{order.pemohon}</p>
                                      <p className="text-[9px] font-mono font-bold text-blue-500 uppercase">{order.nomor_pengajuan}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5 text-center">
                                <span className="text-lg font-black text-slate-700 dark:text-slate-200">{order.jumlah}</span>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Satuan</p>
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex flex-col gap-1.5">
                                   <span className={`inline-flex px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit
                                      ${order.status === 'pending_asisten_manager' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                        order.status === 'pending_manager' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                        'bg-sky-50 text-sky-600 border border-sky-100'}`}>
                                       {order.status === 'pending_asisten_manager' ? 'Menunggu Persetujuan Asmen' :
                                        order.status === 'pending_manager' ? 'Menunggu Persetujuan Manager' :
                                        order.status === 'pending_gudang' ? 'Menunggu Persetujuan Gudang' :
                                        order.status === 'completed' ? 'Pengajuan Selesai' :
                                        order.status === 'rejected' ? 'Pengajuan Ditolak' :
                                        order.status?.replace('pending_', 'Menunggu ')}
                                   </span>
                                   <div className="flex items-center gap-1.5 text-slate-400">
                                      <Calendar size={10} />
                                      <span className="text-[9px] font-bold">{new Date(order.tanggal_pengajuan).toLocaleDateString('id-ID')}</span>
                                   </div>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-10 py-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <button 
            onClick={() => setOpen(false)}
            className="w-full py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Mengerti, Tutup Layar <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
