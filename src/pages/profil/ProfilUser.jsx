import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../../services/userService";
import {
  User, Mail, Phone, Briefcase, Building2, Shield, Calendar,
  Edit3, Save, X, Key, Eye, EyeOff, RefreshCw, Check, AlertTriangle
} from "lucide-react";

export default function ProfilUser() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [form, setForm] = useState({ nama: "", no_telp: "", jabatan: "", departemen: "" });
  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "", confirm_password: "" });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getMyProfile();
      setProfile(res.data);
      setForm({
        nama: res.data.nama || "",
        no_telp: res.data.no_telp || "",
        jabatan: res.data.jabatan || "",
        departemen: res.data.departemen || ""
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!form.nama) {
      alert("Nama tidak boleh kosong!");
      return;
    }
    setSaving(true);
    try {
      await updateMyProfile(form);
      alert("Profil berhasil diupdate!");
      setEditing(false);
      loadProfile();

      // Update localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        user.nama = form.nama;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal update profil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.old_password || !pwForm.new_password) {
      alert("Semua field wajib diisi!");
      return;
    }
    if (pwForm.new_password.length < 6) {
      alert("Password baru minimal 6 karakter!");
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }
    setSaving(true);
    try {
      await changeMyPassword({
        old_password: pwForm.old_password,
        new_password: pwForm.new_password
      });
      alert("Password berhasil diubah! Silakan login ulang.");
      setShowPwModal(false);
      setPwForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengubah password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 animate-pulse space-y-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="p-12 text-center text-slate-500">Gagal memuat profil.</div>
      </MainLayout>
    );
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "from-red-500 to-rose-600",
      staff: "from-blue-500 to-indigo-600",
      asesmen: "from-amber-500 to-orange-600",
      manager: "from-purple-500 to-violet-600",
      gudang: "from-emerald-500 to-teal-600",
    };
    return colors[role] || "from-slate-500 to-slate-600";
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* NEW LUXURY PROFILE HEADER */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center shadow-inner border border-white dark:border-slate-800">
                <span className="text-4xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {profile.nama?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
                <Shield size={16} className="text-emerald-500" />
              </div>
            </div>

            <div className="text-center md:text-left flex-1 space-y-2">
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{profile.nama}</h1>
              <p className="text-sm font-bold text-slate-400">{profile.email}</p>
              
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${getRoleBadgeColor(profile.role)} text-white shadow-sm`}>
                  {profile.role}
                </span>
                {profile.departemen && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700">
                    <Building2 size={12} />
                    {profile.departemen}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 hover:dark:bg-slate-700 px-6 py-3.5 rounded-2xl transition-all border border-slate-100 dark:border-slate-700 text-xs font-black text-slate-500 uppercase tracking-widest active:scale-95"
              >
                <Edit3 size={15} /> Edit Profil
              </button>
              <button
                onClick={() => setShowPwModal(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 px-6 py-3.5 rounded-2xl transition-all text-white text-xs font-black uppercase tracking-widest active:scale-95"
              >
                <Key size={15} /> Ubah Sandi
              </button>
            </div>
          </div>
        </div>

        {/* INFO DETAIL */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800">
            <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Informasi Pribadi</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Data profil akun Anda</p>
          </div>

          <div className="p-8 space-y-6">
            {/* Nama */}
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</p>
                {editing ? (
                  <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full mt-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 font-bold outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm" />
                ) : (
                  <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mt-1">{profile.nama}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mt-1">{profile.email}</p>
                <p className="text-[9px] text-slate-400 mt-2 uppercase tracking-widest font-black inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">Email dikelola oleh sistem admin</p>
              </div>
            </div>

            {/* No Telp */}
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Phone size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No. Telepon</p>
                {editing ? (
                  <input type="text" value={form.no_telp} onChange={(e) => setForm({ ...form, no_telp: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full mt-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 font-bold outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all shadow-sm" />
                ) : (
                  <p className="text-sm font-black text-slate-800 dark:text-white mt-1 font-mono tracking-widest">{profile.no_telp || "-"}</p>
                )}
              </div>
            </div>

            {/* Jabatan */}
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Briefcase size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jabatan</p>
                {editing ? (
                  <input type="text" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    placeholder="Staf IT"
                    className="w-full mt-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 font-bold outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-500 transition-all shadow-sm" />
                ) : (
                  <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mt-1">{profile.jabatan || "-"}</p>
                )}
              </div>
            </div>

            {/* Departemen */}
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                <Building2 size={20} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departemen</p>
                {editing ? (
                  <input type="text" value={form.departemen} onChange={(e) => setForm({ ...form, departemen: e.target.value })}
                    placeholder="Divisi TI"
                    className="w-full mt-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 font-bold outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 transition-all shadow-sm" />
                ) : (
                  <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mt-1">{profile.departemen || "-"}</p>
                )}
              </div>
            </div>

            {/* Terdaftar */}
            <div className="flex items-start gap-5 py-4 mt-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-6">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tanggal Registrasi Sistem</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest mt-1">
                  {new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {editing && (
            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end gap-3">
              <button
                onClick={() => { setEditing(false); setForm({ nama: profile.nama, no_telp: profile.no_telp || "", jabatan: profile.jabatan || "", departemen: profile.departemen || "" }); }}
                className="px-6 py-3.5 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 uppercase tracking-widest transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 text-white uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 disabled:scale-100"
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Profil
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL GANTI PASSWORD ===== */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setShowPwModal(false); setPwForm({ old_password: "", new_password: "", confirm_password: "" }); }}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800">

            <div className="flex flex-col items-center justify-center p-8 border-b border-slate-50 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <Key size={30} />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-widest uppercase">Ubah Sandi</h2>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Keamanan akun</p>
            </div>

            <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-800/10">
              {/* Password Lama */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Sandi Lama</label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    value={pwForm.old_password}
                    onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                    className="w-full pl-5 pr-12 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm tracking-[0.2em]"
                  />
                  <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition">
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Sandi Baru</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                    placeholder="Min. 6 karakter"
                    className="w-full pl-5 pr-12 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm tracking-[0.2em] placeholder:tracking-normal"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">Konfirmasi Sandi Baru</label>
                <input
                  type="password"
                  value={pwForm.confirm_password}
                  onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm tracking-[0.2em]"
                />
                {pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                  <p className="text-[10px] uppercase font-black text-rose-500 mt-2 flex items-center gap-1.5 tracking-widest pl-1">
                    <AlertTriangle size={12} /> Sandi tidak cocok
                  </p>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-3">
              <button
                onClick={handleChangePassword}
                disabled={saving || (pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password)}
                className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 text-white transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 disabled:scale-100"
              >
                {saving ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
                Simpan Sandi
              </button>
              <button
                onClick={() => { setShowPwModal(false); setPwForm({ old_password: "", new_password: "", confirm_password: "" }); }}
                className="w-full py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
