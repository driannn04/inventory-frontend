import { useState, useEffect, useRef } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getSettings, updateSettings } from "../../services/settingsService";
import api from "../../utils/api";
import PageHeader from "../../components/common/PageHeader";

import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Settings as SettingsIcon,
  ShieldCheck,
  Palette,
  Save,
  Database,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  RefreshCw,
  Bell,
  Trash2,
  FileCode,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import Swal from "sweetalert2";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("org");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null); // 'app_logo' or 'app_logo_report'

  const fileInputRef = useRef();
  const fileReportInputRef = useRef();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getSettings();
      setSettings(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal memuat pengaturan sistem" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(settings);
      Swal.fire({
        icon: "success",
        title: "Tersimpan",
        text: "Pengaturan sistem berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800" }
      });
      // Delay sedikit agar user merasa ada proses
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal menyimpan perubahan" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    setUploading(type);
    try {
      const res = await api.post(`/settings/upload/${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSettings(prev => ({ ...prev, [type]: res.data.url }));
      
      Swal.fire({
        icon: "success",
        title: "Logo Terupload",
        text: "Berhasil memperbarui logo identitas",
        timer: 1500,
        showConfirmButton: false
      });

      // Reload untuk sinkronisasi Sidebar & Topbar
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal Upload", text: err.response?.data?.message || "File terlalu besar atau format salah" });
    } finally {
      setUploading(null);
    }
  };

  const handleBackup = async () => {
    try {
      Swal.fire({
        title: "Menyiapkan Backup...",
        text: "Sistem sedang mengumpulkan data database",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const token = localStorage.getItem("token");
      window.location.href = `${api.defaults.baseURL}/settings/backup?token=${token}`;
      
      setTimeout(() => {
        Swal.close();
        Swal.fire({
          icon: "success",
          title: "Selesai",
          text: "File database (.sql) berhasil diunduh",
          timer: 2000,
          showConfirmButton: false
        });
      }, 2000);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan saat membuat backup" });
    }
  };

  const handleClearCache = async () => {
    try {
      const result = await Swal.fire({
        title: "Bersihkan Cache?",
        text: "Ini akan menyegarkan sistem dan memori library gambar.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e11d48",
        confirmButtonText: "Ya, Bersihkan",
        cancelButtonText: "Batal",
        customClass: { popup: "rounded-[2.5rem]" }
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Membersihkan...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        await api.post("/settings/clear-cache");

        Swal.fire({
          icon: "success",
          title: "Selesai",
          text: "Cache sistem berhasil dibersihkan",
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal membersihkan cache sistem" });
    }
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const tabs = [
    { id: "org", label: "Identitas PDAM", icon: Building2 },
    { id: "security", label: "Sistem & Keamanan", icon: ShieldCheck },
  ];

  if (loading) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="animate-spin text-sky-600" size={40} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menyiapkan Pengaturan...</p>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">

        <PageHeader
          icon={<SettingsIcon size={22} />}
          title="Pengaturan Master"
          subtitle="Konfigurasi inti aplikasi inventori"
          actions={
            <button onClick={handleUpdate} disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:scale-100">
              {saving ? <RefreshCw className="animate-spin" size={15} /> : <Save size={15} />}
              Simpan Perubahan
            </button>
          }
        />

        {/* TAB NAVIGATION */}
        <div className="flex flex-wrap gap-2 p-2 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-sky-600 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-600"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <form className="space-y-10" onSubmit={handleUpdate}>
                
                {/* 1. IDENTITAS PDAM */}
                {activeTab === "org" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50 dark:border-slate-800">
                        <Building2 size={24} className="text-sky-500" />
                        <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800 dark:text-white">Informasi Dasar</h2>
                      </div>
                      <div className="space-y-6">
                        <InputGroup label="Nama PDAM / Instansi" icon={Building2} value={settings.org_name} onChange={(v) => handleChange("org_name", v)} />
                        <InputGroup label="Nomor Telepon Kantor" icon={Phone} value={settings.org_phone} onChange={(v) => handleChange("org_phone", v)} />
                        <InputGroup label="Email Resmi" icon={Mail} value={settings.org_email} onChange={(v) => handleChange("org_email", v)} />
                        <InputGroup label="Kode Unit (Prefix)" icon={FileCode} value={settings.org_unit_code} onChange={(v) => handleChange("org_unit_code", v)} />
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50 dark:border-slate-800">
                        <MapPin size={24} className="text-sky-500" />
                        <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800 dark:text-white">Lokasi Kantor</h2>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Alamat Lengkap Kantor</label>
                        <textarea
                          value={settings.org_address}
                          onChange={(e) => handleChange("org_address", e.target.value)}
                          className="w-full h-44 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 text-sm dark:text-white outline-none focus:ring-4 focus:ring-sky-500/10 transition-all font-bold placeholder:opacity-30"
                          placeholder="Masukkan alamat lengkap PDAM Tirta Pakuan..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SISTEM & KEAMANAN */}
                {activeTab === "security" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50 dark:border-slate-800">
                        <Clock size={24} className="text-emerald-500" />
                        <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800 dark:text-white">Format & Standar</h2>
                      </div>
                      <div className="space-y-6">
                        <InputGroup label="Format Tanggal Laporan" icon={Clock} value={settings.date_format} onChange={(v) => handleChange("date_format", v)} />
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50 dark:border-slate-800">
                        <ShieldCheck size={24} className="text-emerald-500" />
                        <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800 dark:text-white">Keamanan Sistem</h2>
                      </div>
                      <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-700">
                         <div className="flex items-center gap-3 text-emerald-600">
                            <CheckCircle2 size={20} />
                            <div>
                               <p className="text-sm font-black uppercase">Mode Internal Aktif</p>
                               <p className="text-[10px] font-bold opacity-70">Hanya Admin yang dapat mendaftarkan akun baru.</p>
                            </div>
                         </div>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-50 dark:border-slate-800">
                        <Database size={24} className="text-emerald-500" />
                        <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800 dark:text-white">Pemeliharaan Data</h2>
                      </div>
                      <div className="space-y-4">
                        <button
                          type="button"
                          onClick={handleBackup}
                          className="w-full flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-[2rem] text-blue-600 border-2 border-blue-100 dark:border-blue-900/30 transition-all font-black group"
                        >
                          <div className="flex items-center gap-4">
                            <Database size={20} className="group-hover:scale-110 transition-transform" />
                            <div className="text-left">
                              <span className="text-xs uppercase tracking-widest block">Backup Database</span>
                              <span className="text-[9px] text-blue-400 font-bold uppercase">Unduh file .SQL</span>
                            </div>
                          </div>
                          <RefreshCw size={18} />
                        </button>
                        
                        <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] border-2 border-rose-100 dark:border-rose-900/30 space-y-4">
                           <div className="flex items-center gap-3 text-rose-600">
                             <Trash2 size={20} />
                             <span className="text-xs font-black uppercase tracking-widest">Danger Zone</span>
                           </div>
                           <button
                             type="button"
                             onClick={handleClearCache}
                             className="w-full h-12 bg-white dark:bg-slate-800 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 dark:border-rose-800"
                           >
                              Bersihkan Cache Sistem
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </MainLayout>
  );
}

function InputGroup({ label, icon: Icon, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 shadow-sm block">{label}</label>
      <div className="relative">
        <Icon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[1.5rem] text-sm dark:text-white outline-none focus:ring-4 focus:ring-sky-500/10 transition-all font-bold"
          placeholder={`Input ${label.toLowerCase()}...`}
        />
      </div>
    </div>
  );
}
