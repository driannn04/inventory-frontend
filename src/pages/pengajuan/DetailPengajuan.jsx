import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import {
  getPengajuanById,
  approvePengajuan,
  rejectPengajuan,
  getApprovalHistory
} from "../../services/pengajuanService";
import { getRole, getUserId } from "../../utils/auth";
import { CheckCircle, XCircle, ArrowLeft, Package, Clock, ShieldCheck, X, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import ImagePreview from "../../components/common/ImagePreview";

export default function DetailPengajuan() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [history, setHistory] = useState([]);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const role = getRole();
  const user_id = getUserId();

  useEffect(() => {
    loadAll();
  }, []);

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

  // ✅ Cek apakah role ini bisa approve sesuai status saat ini
  const canApprove =
    role === "admin" ||
    (role === "asesmen" && currentStatus === "pending_assessment") ||
    (role === "manager"   && currentStatus === "pending_manager") ||
    (role === "gudang"    && currentStatus === "pending_gudang");

  const isDone = currentStatus === "completed" || currentStatus === "rejected";

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await approvePengajuan({
        pengajuan_id: id,
        role: role === "admin"
          ? (currentStatus === "pending_assessment" ? "asesmen"
          : currentStatus === "pending_manager"    ? "manager"
          : "gudang")
          : role,
        user_id
      });
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "success", title: "Disetujui!", text: "Pengajuan berhasil disetujui", timer: 2000, showConfirmButton: false }));
      loadAll();
      setShowReject(false);
    } catch (err) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal menyetujui pengajuan" }));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!catatan.trim()) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Perhatian", text: "Catatan alasan penolakan wajib diisi!" }));
      return;
    }
    setProcessing(true);
    try {
      await rejectPengajuan({ pengajuan_id: id, role, user_id, catatan });
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "info", title: "Ditolak", text: "Pengajuan berhasil ditolak", timer: 2000, showConfirmButton: false }));
      loadAll();
      setShowReject(false);
      setCatatan("");
    } catch (err) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal reject" }));
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Timeline steps
  const steps = [
    { key: "asesmen", label: "Asesmen",  done: ["pending_manager","pending_gudang","completed","rejected"].includes(currentStatus) },
    { key: "manager",   label: "Manager",  done: ["pending_gudang","completed","rejected"].includes(currentStatus) && currentStatus !== "pending_manager" },
    { key: "gudang",    label: "Gudang",   done: currentStatus === "completed" },
  ];

  const hasInsufficientStock = data.some(item => item.stok_tersedia < item.jumlah);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 w-1/3 rounded"></div>
          <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]"></div>
          <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem]"></div>
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
          subtitle={`${nomorPengajuan} • Role Anda: ${role}`}
          actions={
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
              <ArrowLeft size={15} /> Kembali
            </button>
          }
        />

        {/* STATUS & TIMELINE AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-8 rounded-[2.5rem] border shadow-sm flex flex-col justify-between transition-colors duration-300
            ${currentStatus === "completed" ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900/30" :
              currentStatus === "rejected"  ? "border-rose-200 bg-rose-50 dark:bg-rose-900/10 dark:border-rose-900/30" :
              "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30"}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
                currentStatus === "completed" ? "text-emerald-600 dark:text-emerald-400" :
                currentStatus === "rejected"  ? "text-rose-500 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
              }`}>Status Saat Ini</p>
              <div className="flex items-center gap-3">
                <p className={`font-black text-2xl uppercase tracking-tighter ${
                  currentStatus === "completed" ? "text-emerald-700 dark:text-emerald-300" :
                  currentStatus === "rejected"  ? "text-rose-700 dark:text-rose-300" : "text-amber-700 dark:text-amber-300"
                }`}>
                  {currentStatus?.replaceAll("_", " ")}
                </p>
                {/* URGENSI BADGE */}
                <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm
                  ${data[0]?.urgensi === 'darurat' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/25' : 
                    data[0]?.urgensi === 'penting' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25' : 
                    'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-500/25'}`}>
                  {data[0]?.urgensi || 'normal'}
                </span>
              </div>
              {catatan_pengajuan && (
                <p className={`text-xs font-bold mt-4 px-4 py-3 rounded-2xl ${
                  currentStatus === "rejected" ? "bg-rose-100/50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400" : "bg-slate-100/50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400"
                }`}>Catatan: {catatan_pengajuan}</p>
              )}
            </div>
            <div className={`self-end text-5xl opacity-40 mt-6 ${
              currentStatus === "completed" ? "text-emerald-500" :
              currentStatus === "rejected"  ? "text-rose-500" : "text-amber-500"
            }`}>
              {currentStatus === "completed" ? <CheckCircle size={48} /> :
               currentStatus === "rejected"  ? <XCircle size={48} /> : <Clock size={48} />}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 transition flex flex-col justify-center">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Peta Persetujuan</h2>
            <div className="flex items-start justify-between relative px-4">
              <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-slate-100 dark:bg-slate-800 z-0 rounded-full"></div>
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-lg transition-all
                    ${step.done ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30" : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-none"}`}>
                    {step.done ? <CheckCircle size={18} /> : i + 1}
                  </div>
                  <p className={`mt-3 text-[10px] font-black uppercase tracking-widest ${step.done ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABEL BARANG */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition">
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Package size={18} /></div>
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Barang Yang Diajukan</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{data.length} item didaftarkan</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="border-b border-slate-50 dark:border-slate-800">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4">#</th>
                  <th className="px-8 py-4">Barang</th>
                  <th className="px-8 py-4 text-center">Satuan</th>
                  <th className="px-8 py-4 text-center">Stok Fisik</th>
                  <th className="px-8 py-4 text-center">Tersedia</th>
                  <th className="px-8 py-4 text-center text-blue-600">Diminta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-4 text-[11px] font-bold text-slate-400">{index + 1}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <ImagePreview
                          src={item.foto ? `http://localhost:5000/uploads/${item.foto}` : "/no-image.png"}
                          alt={item.nama_barang}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{item.nama_barang}</p>
                          {item.lokasi_rak && <p className="text-[9px] font-bold text-slate-400 mt-0.5">Rak: {item.lokasi_rak}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center text-xs font-bold text-slate-500">{item.satuan}</td>
                    <td className="px-8 py-4 text-center">
                      <span className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-xl text-[11px] font-black">
                        {item.stok}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black border ${item.stok_tersedia < item.jumlah ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30'}`}>
                        {item.stok_tersedia}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 px-3 py-1.5 rounded-xl text-[11px] font-black">
                        {item.jumlah}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HISTORI APPROVAL */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 transition">
               <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl"><ShieldCheck size={18} /></div>
                <div>
                  <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Riwayat Persetujuan</h2>
                </div>
              </div>
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border
                    ${h.status === "approved" ? "border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10"}`}>
                    <div className={`mt-0.5 p-2 rounded-xl ${h.status === "approved" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-100 text-rose-600 dark:bg-rose-900/30"}`}>
                      {h.status === "approved" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        {h.nama} <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 bg-slate-200/50 dark:bg-slate-800 px-2 py-1 rounded-lg">{h.role}</span>
                      </p>
                      {h.catatan && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">{h.catatan}</p>}
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">
                        {new Date(h.tanggal).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AKSI APPROVE / REJECT */}
          {canApprove && !isDone && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 transition flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><CheckCircle size={18} /></div>
                <div>
                  <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Tindakan Persetujuan</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Silakan proses pengajuan ini</p>
                </div>
              </div>

              {hasInsufficientStock && !showReject && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-start gap-3">
                  <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest">Peringatan: Stok Tidak Mencukupi</p>
                    <p className="text-[10px] font-bold text-rose-600/80 dark:text-rose-400/80 mt-1 uppercase tracking-wider">
                      Salah satu atau beberapa item yang diajukan melebihi ketersediaan stok fisik dikurangi antrean saat ini. Sangat disarankan untuk menolak pengajuan ini atau menyesuaikan stok sebelum disetujui.
                    </p>
                  </div>
                </div>
              )}

              {showReject ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Alasan Penolakan <span className="text-rose-500">*</span></label>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl p-4 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none text-sm transition-all resize-none shadow-sm font-bold"
                      rows="3"
                      placeholder="Masukkan alasan penolakan..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      disabled={processing}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 text-white px-6 py-3.5 rounded-2xl hover:shadow-lg hover:shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-50 font-black text-xs uppercase tracking-widest disabled:scale-100"
                    >
                      <XCircle size={15} />
                      {processing ? "Memproses..." : "Konfirmasi Tolak"}
                    </button>
                    <button
                      onClick={() => { setShowReject(false); setCatatan(""); }}
                      className="px-6 py-3.5 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 uppercase tracking-widest transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50 font-black text-xs uppercase tracking-widest disabled:scale-100"
                  >
                    <CheckCircle size={18} />
                    {processing ? "Memproses..." : "Setujui Pengajuan"}
                  </button>
                  <button
                    onClick={() => setShowReject(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
                  >
                    <X size={16} /> Tolak
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
}