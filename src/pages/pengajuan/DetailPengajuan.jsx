import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import {
  getPengajuanById,
  approvePengajuan,
  rejectPengajuan,
  getApprovalHistory,
  deletePengajuan
} from "../../services/pengajuanService";

import { CheckCircle, XCircle, ArrowLeft, Package, Clock, ShieldCheck, X, AlertTriangle, User, History, Send, Trash2, Pencil, Calendar, ArrowRightCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import ImagePreview from "../../components/common/ImagePreview";
import { motion } from "framer-motion";
import { UPLOAD_URL } from "../../utils/api";
import Swal from "sweetalert2";
import { getRole, getUserId, getUser } from "../../utils/auth";
import { useMemo } from "react";

export default function DetailPengajuan() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isProcessMode = searchParams.get("mode") === "process";

  const [data, setData] = useState([]);
  const [history, setHistory] = useState([]);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const role = getRole();
  const user = useMemo(() => getUser(), []);
  const user_id = user?.id;
  useEffect(() => {
    loadAll();

    // 🔥 REALTIME DETAIL UPDATE (Listen to Topbar broadcast)
    const handleRefresh = () => {
        console.log("🔄 [Detail Pengajuan] Sinyal update diterima, me-refresh status...");
        loadAll();
    };

    window.addEventListener('notif_baru', handleRefresh);
    return () => window.removeEventListener('notif_baru', handleRefresh);
  }, [user?.id, id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [detailRes, historyRes] = await Promise.all([
        getPengajuanById(id),
        getApprovalHistory(id)
      ]);
      setData(detailRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = data[0]?.status;
  const nomorPengajuan = data[0]?.nomor_pengajuan;
  const catatan_pengajuan = data[0]?.catatan;
  const tgl_pengajuan = data[0]?.tanggal_pengajuan;
  const nama_pengaju = data[0]?.nama;
  const owner_id = data[0]?.user_id;

  const isOwner = Number(user_id) === Number(owner_id);
  const isPending = currentStatus === "pending_asisten_manager";

  const canApprove =
    isProcessMode && (
      role === "admin" ||
      (role === "asisten_manager" && currentStatus === "pending_asisten_manager") ||
      (role === "manager"   && currentStatus === "pending_manager") ||
      (role === "gudang"    && currentStatus === "pending_gudang")
    );

  const isDone = currentStatus === "completed" || currentStatus === "rejected";

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const res = await approvePengajuan({
        pengajuan_id: id,
        role: role === "admin"
          ? (currentStatus === "pending_asisten_manager" ? "asisten_manager"
          : currentStatus === "pending_manager"    ? "manager"
          : "gudang")
          : role,
        user_id
      });
      Swal.fire({ icon: "success", title: "Berhasil!", text: res.data.message || "Pengajuan berhasil disetujui", timer: 2500, showConfirmButton: false });
      loadAll();
      setShowReject(false);
      // Trigger update badge di Sidebar secara otomatis
      window.dispatchEvent(new Event('refreshSidebarBadge'));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal menyetujui pengajuan" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!catatan.trim()) {
      Swal.fire({ icon: "warning", title: "Perhatian", text: "Catatan alasan penolakan wajib diisi!" });
      return;
    }
    setProcessing(true);
    try {
      await rejectPengajuan({ pengajuan_id: id, role, user_id, catatan });
      Swal.fire({ icon: "info", title: "Ditolak", text: "Pengajuan berhasil ditolak", timer: 2000, showConfirmButton: false });
      loadAll();
      setShowReject(false);
      setCatatan("");
      // Trigger update badge di Sidebar secara otomatis
      window.dispatchEvent(new Event('refreshSidebarBadge'));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal reject" });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Batalkan Pengajuan?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Batalkan!",
      cancelButtonText: "Kembali"
    });

    if (result.isConfirmed) {
      setProcessing(true);
      try {
        await deletePengajuan(id);
        Swal.fire({ icon: "success", title: "Dibatalkan", text: "Pengajuan berhasil dibatalkan", timer: 2000, showConfirmButton: false });
        // Trigger update badge di Sidebar secara otomatis
        window.dispatchEvent(new Event('refreshSidebarBadge'));
        if (role === "staff") navigate("/pengajuan-saya");
        else navigate("/list-pengajuan");
      } catch (err) {
        Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal membatalkan pengajuan" });
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleEdit = () => {
    navigate("/buat-pengajuan", { 
      state: { 
        editMode: true, 
        editId: id,
        existingData: data 
      } 
    });
  };

  const getApprovalDate = (roleKey) => {
    // Cari log history dengan role terkait dan action 'approved'
    const log = history.find(h => {
        // history nyimpan info user di log.user. Kita bisa cek apakah log action sesuai role.
        // Atau kita bisa pakai waktu terbaru jika step tsb sudah done (tapi history lebih akurat jika role disimpan).
        // Karena API history mungkin hanya punya user dan action, kita asumsikan urutan waktu untuk tiap step.
        return true; 
    });
  };

  // ✅ FIX: Backend menyimpan aksi di field "status" (bukan "action")
  //         dan nama user di field "nama" (bukan "user")
  //         Field yang tersedia dari API: role, status, nama, catatan, tanggal
  const getStepStatus = (roleKeys) => {
    const keys = Array.isArray(roleKeys) ? roleKeys : [roleKeys];
    const log = history.find(h => keys.includes(h.role));
    if (!log) return { done: false, rejected: false, date: null };
    return {
      done: log.status === 'approved',
      rejected: log.status === 'rejected',
      date: log.tanggal
    };
  };

  // Deteksi siapa yang menolak berdasarkan history
  const rejectedByRole = currentStatus === "rejected" 
    ? history.find(h => h.status === 'rejected')?.role || null
    : null;

  const isPastAsistenManager = ["pending_manager", "pending_gudang", "completed"].includes(currentStatus);
  const isPastManager = ["pending_gudang", "completed"].includes(currentStatus);

  const asistenManagerLog = getStepStatus(["asisten_manager", "asesmen"]);
  const managerLog = getStepStatus("manager");

  const pengajuRole = data[0]?.pengaju_role;

  const steps = (() => {
    const baseStep = { key: "pengajuan", label: "Pengajuan Barang", done: true, date: tgl_pengajuan };

    // Manager mengajukan → langsung ke Gudang (2 step)
    if (pengajuRole === "manager") {
      return [
        baseStep,
        { key: "gudang", label: "Gudang", done: currentStatus === "completed", rejected: rejectedByRole === "gudang" },
      ];
    }

    // Asisten Manager mengajukan → skip Asmen, langsung ke Manager (3 step)
    if (pengajuRole === "asisten_manager") {
      return [
        baseStep,
        { key: "manager", label: "Manager", done: isPastManager || managerLog.done, rejected: managerLog.rejected, date: managerLog.date },
        { key: "gudang", label: "Gudang", done: currentStatus === "completed", rejected: rejectedByRole === "gudang" },
      ];
    }

    // Staff / Admin / default → 4 step penuh
    return [
      baseStep,
      { key: "asisten_manager", label: "Asisten Manager", done: isPastAsistenManager || asistenManagerLog.done, rejected: asistenManagerLog.rejected, date: asistenManagerLog.date },
      { key: "manager", label: "Manager", done: isPastManager || managerLog.done, rejected: managerLog.rejected, date: managerLog.date },
      { key: "gudang", label: "Gudang", done: currentStatus === "completed", rejected: rejectedByRole === "gudang" },
    ];
  })();

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Berkas Pengajuan...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-12">

        <PageHeader
          icon={<Package size={22} />}
          title="Detail Pengajuan"
          subtitle={`Informasi berkas ${nomorPengajuan}`}
          actions={
            <button 
              onClick={() => {
                if (role === "staff") navigate("/pengajuan-saya");
                else navigate("/list-pengajuan");
              }}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-800 transition-all active:scale-95 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-8 space-y-6">
                
                <div className={`p-10 rounded-[3rem] border-2 shadow-xl relative overflow-hidden transition-all duration-500
                    ${currentStatus === "completed" ? "border-emerald-100 bg-white dark:bg-slate-900" :
                    currentStatus === "rejected"  ? "border-rose-100 bg-white dark:bg-slate-900" :
                    "border-blue-100 bg-white dark:bg-slate-900"}`}>
                    
                    <div className={`absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.07] rotate-12 transition-transform duration-700
                        ${currentStatus === "completed" ? "text-emerald-500" : currentStatus === "rejected" ? "text-rose-500" : "text-blue-600"}`}>
                        {currentStatus === "completed" ? <CheckCircle size={200} /> :
                         currentStatus === "rejected"  ? <XCircle size={200} /> : <Clock size={200} />}
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg border border-slate-200/50 dark:border-slate-700/50">Nomor Berkas</span>
                                <span className="text-[11px] font-mono font-black text-slate-800 dark:text-blue-400">{nomorPengajuan}</span>
                            </div>
                            <h2 className={`text-5xl font-black uppercase tracking-tighter leading-none ${
                                currentStatus === "completed" ? "text-emerald-600 dark:text-emerald-400" :
                                currentStatus === "rejected"  ? "text-rose-600 dark:text-rose-400" : "text-blue-700 dark:text-blue-500"
                            }`}>
                                {currentStatus === "completed" ? "SELESAI" : 
                                 currentStatus === "rejected" ? "DITOLAK" : 
                                 currentStatus?.startsWith("pending") ? "MENUNGGU" : 
                                 currentStatus?.replaceAll("_", " ")}
                            </h2>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{new Date(tgl_pengajuan).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                            <div className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.1em] shadow-2xl transition-all scale-105 active:scale-100
                                ${data[0]?.urgensi === 'darurat' ? 'bg-rose-600 text-white shadow-rose-500/40' : 
                                  data[0]?.urgensi === 'penting' ? 'bg-amber-500 text-white shadow-amber-500/40' : 
                                  'bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-blue-500/40'}`}>
                                {data[0]?.urgensi === 'darurat' ? 'URGENSI DARURAT' : 
                                 data[0]?.urgensi === 'penting' ? 'URGENSI PENTING' : 'URGENSI NORMAL'}
                            </div>
                        </div>
                    </div>

                    {catatan_pengajuan && (
                        <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner group transition-colors hover:border-blue-200">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 group-hover:text-blue-500 transition-colors"><Send size={12}/> Alasan Pengajuan & Keperluan</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic pr-4">"{catatan_pengajuan}"</p>
                        </div>
                    )}
                </div>

                {/* APPROVAL ACTIONS */}
                {canApprove && !isDone && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border-2 border-blue-500 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"><ShieldCheck size={20} /></div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Validasi Persetujuan Anda</h2>
                        </div>
                        
                        {showReject ? (
                            <div className="space-y-4 animate-in">
                                <textarea 
                                    className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-rose-100 dark:border-rose-900/30 rounded-3xl outline-none focus:border-rose-500 transition-all text-sm font-medium"
                                    placeholder="Tuliskan alasan penolakan berkas ini..."
                                    rows={3}
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                />
                                <div className="flex gap-3">
                                    <button onClick={() => setShowReject(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest">Batal</button>
                                    <button onClick={handleReject} disabled={processing} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all">Konfirmasi Tolak</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-4">
                                <button 
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="flex-1 flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {processing ? <Clock className="animate-spin" size={18}/> : <CheckCircle size={18} />}
                                    {currentStatus === "pending_asisten_manager" ? "Verifikasi & Teruskan ke Manajer" :
                                     currentStatus === "pending_manager" ? "Verifikasi & Teruskan ke Gudang" :
                                     currentStatus === "pending_gudang" ? "Validasi Gudang & Selesaikan" :
                                     "Setujui Berkas Sekarang"}
                                </button>
                                <button 
                                    onClick={() => setShowReject(true)}
                                    disabled={processing}
                                    className="md:w-48 flex items-center justify-center gap-3 py-5 bg-slate-50 dark:bg-slate-800 text-rose-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-rose-50 transition-all"
                                >
                                    <XCircle size={18} /> Tolak
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ✅ OPSI KHUSUS PEMILIK (Staff/Owner) — Muncul jika masih pending */}
                {isOwner && (
                    currentStatus === "pending_asisten_manager" ||
                    (role === "asisten_manager" && currentStatus === "pending_manager") ||
                    (role === "manager" && currentStatus === "pending_gudang")
                ) && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl"><AlertTriangle size={24} /></div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Kelola Pengajuan Anda</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Anda masih bisa mengubah atau membatalkan berkas ini</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleEdit}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-sky-100 dark:border-sky-900/30 hover:bg-sky-100 transition-all active:scale-95"
                            >
                                <Pencil size={16} /> Ubah
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={processing}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 transition-all active:scale-95"
                            >
                                <Trash2 size={16} /> Batalkan
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ITEMS TABLE */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Package size={20} /></div>
                            <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Rincian Barang Permohonan</h2>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.length} Barang</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Nama Barang</th>
                                    <th className="px-8 py-4 text-center">Unit</th>
                                    <th className="px-8 py-4 text-center">Status Stok</th>
                                    <th className="px-8 py-4 text-right pr-12">Jumlah Diminta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {data.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <ImagePreview
                                                    src={item.foto ? `${UPLOAD_URL}/${item.foto}` : "/no-image.png"}
                                                    alt={item.nama_barang}
                                                    size="sm"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight truncate mb-0.5">{item.nama_barang}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">{item.kode_barang} {item.lokasi_rak ? `- Rak ${item.lokasi_rak}` : ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase">{item.satuan}</td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 border border-slate-100 dark:border-slate-700">
                                                Tersedia: {item.stok_tersedia}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right pr-12">
                                            <span className="text-lg font-black text-blue-600">{item.jumlah}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Informasi Pemohon</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">{nama_pengaju}</p>
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">Peran: {
                                (() => {
                                    const r = data[0]?.pengaju_role;
                                    if (!r) return 'Staff';
                                    const map = { staff: 'Staff', admin: 'Admin', asisten_manager: 'Asisten Manager', manager: 'Manager', gudang: 'Gudang' };
                                    return map[r] || r;
                                })()
                            }</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Peta Persetujuan Digital</h3>
                    <div className="space-y-10 relative">
                        <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-100 dark:bg-slate-800 h-[calc(100%-24px)] border-dashed"></div>
                        
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-8 relative z-10 group">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black shadow-xl transition-all duration-500
                                    ${step.rejected ? `bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20 scale-110` :
                                      step.done ? `bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/20 scale-110` : 
                                      currentStatus === `pending_${step.key}` ? `bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-amber-500/20 scale-110 animate-pulse` :
                                      "bg-white dark:bg-slate-800 text-slate-300 border border-slate-100 dark:border-slate-700 shadow-none grayscale opacity-40"}`}>
                                    {step.rejected ? <XCircle size={22} strokeWidth={2.5} /> : step.done ? <CheckCircle size={22} strokeWidth={2.5} /> : step.key === "pengajuan" ? <Send size={20}/> : <ShieldCheck size={20} />}
                                </div>
                                <div className="flex flex-col">
                                    <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${
                                        step.rejected ? "text-rose-600 dark:text-rose-400" :
                                        step.done ? "text-emerald-600 dark:text-emerald-400" : 
                                        currentStatus === `pending_${step.key}` ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
                                    }`}>
                                        {step.label}
                                    </p>
                                    {step.rejected ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-500">
                                                Ditolak oleh {step.label} ✗
                                            </p>
                                        </div>
                                    ) : step.done ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500">
                                                {step.key === "pengajuan" ? `Diajukan: ${new Date(step.date).toLocaleString('id-ID', {day: '2-digit', month: 'short', hour:'2-digit', minute:'2-digit'})}` : "Disetujui ✓"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${currentStatus === `pending_${step.key}` ? "bg-amber-500 animate-ping" : currentStatus === "rejected" ? "bg-rose-200" : "bg-slate-200"}`} />
                                            <p className={`text-[10px] font-bold ${currentStatus === `pending_${step.key}` ? "text-amber-600" : currentStatus === "rejected" ? "text-rose-300 dark:text-rose-800" : "text-slate-300"}`}>
                                                {currentStatus === `pending_${step.key}` 
                                                    ? `Menunggu Persetujuan ${step.label}` 
                                                    : currentStatus === "rejected" ? "Proses Terhenti" : "Menunggu Antrean"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <History size={16} className="text-slate-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riwayat Persetujuan Digital</h3>
                    </div>
                    <div className="space-y-6">
                        {history.length === 0 ? (
                            <p className="text-[10px] font-bold text-slate-300 italic uppercase">Belum ada aktivitas persetujuan</p>
                        ) : history.map((log, i) => (
                            <div key={i} className={`flex flex-col gap-1 pl-4 border-l-2 ${log.status === 'approved' ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{log.nama}</p>
                                    <span className="text-[8px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                        {{ asisten_manager: "Asisten Manager", asesmen: "Asisten Manager", manager: "Manager", gudang: "Gudang" }[log.role] || log.role}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${log.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        {log.status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(log.tanggal).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                                </div>
                                {log.catatan && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic leading-tight">"{log.catatan}"</p>}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </MainLayout>
  );
}
