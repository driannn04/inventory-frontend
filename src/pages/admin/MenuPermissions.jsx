import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/common/PageHeader";
import { getRoles, updateRolePermissions } from "../../services/userService";
import { motion } from "framer-motion";
import { ShieldAlert, Save, Key, Info, HelpCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function MenuPermissions() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Daftar lengkap semua menu/fitur yang bisa dikontrol
  const availableMenus = [
    { key: "dashboard", name: "Dashboard", desc: "Melihat ringkasan statistik, tren mutasi, dan chart aktivitas." },
    { key: "barang", name: "Katalog Barang", desc: "Melihat dan mengelola daftar item inventaris (Tambah/Edit/Hapus)." },
    { key: "kategori", name: "Kategori Barang", desc: "Mengelola kategori barang master logistik." },
    { key: "stok-masuk", name: "Mutasi Stok Masuk", desc: "Melakukan input barang masuk (inbound logistik)." },
    { key: "stok-keluar", name: "Mutasi Stok Keluar", desc: "Melakukan rilis atau pengurangan barang secara manual." },
    { key: "buat-pengajuan", name: "Buat Pengajuan", desc: "Membuat pengajuan permintaan barang baru untuk operasional." },
    { key: "pengajuan-saya", name: "Pengajuan Saya", desc: "Melihat riwayat pengajuan barang yang dibuat oleh akun sendiri." },
    { key: "approval", name: "Validasi Pengajuan", desc: "Melakukan persetujuan (approval) pengajuan barang (Manager/Asmen/Gudang)." },
    { key: "list-pengajuan", name: "Daftar Semua Pengajuan", desc: "Memantau semua daftar pengajuan di dalam sistem." },
    { key: "scan", name: "Scanner QR", desc: "Menggunakan kamera web/hp untuk mendeteksi barang lewat QR Code." },
    { key: "laporan", name: "Laporan & Ekspor", desc: "Mengakses menu laporan mutasi dan mengunduh format Excel/PDF." },
    { key: "kelola-user", name: "Manajemen User", desc: "Kelola akun pengguna (tambah, edit, hapus, reset password)." },
    { key: "kelola-akses", name: "Hak Akses Menu", desc: "Halaman ini sendiri (mengatur hak akses role)." },
    { key: "activity-log", name: "Log Aktivitas", desc: "Melihat histori audit log audit sistem secara lengkap." },
    { key: "settings", name: "Pengaturan & Pemeliharaan", desc: "Mengakses fitur backup database dan pembersihan cache." }
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoles();
      setRoles(res.data);
      if (res.data.length > 0) {
        selectRoleData(res.data[0]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal mengambil data peran (role)" });
    } finally {
      setLoading(false);
    }
  };

  const selectRoleData = (role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || []);
  };

  const handleTogglePermission = (key) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(key)) {
        return prev.filter((p) => p !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedPermissions(availableMenus.map((m) => m.key));
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      await updateRolePermissions(selectedRole.id, selectedPermissions);
      
      // Update local state untuk list roles
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id ? { ...r, permissions: selectedPermissions } : r
        )
      );

      Swal.fire({
        icon: "success",
        title: "Pembaruan Berhasil!",
        text: `Hak akses untuk peran ${selectedRole.nama_role.toUpperCase()} telah diperbarui. Perubahan akan langsung aktif.`,
        timer: 3000,
        showConfirmButton: false,
        customClass: { popup: "rounded-[2.5rem]" }
      });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Gagal", text: "Terjadi kesalahan saat menyimpan hak akses." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <PageHeader
          icon={<ShieldAlert size={22} />}
          title="Manajemen Hak Akses"
          subtitle="Konfigurasi izin akses menu & navigasi berdasarkan peran pengguna"
        />

        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* KIRI: DAFTAR PERAN (ROLE) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 pl-1">Daftar Peran</h3>
                <div className="space-y-2">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectRoleData(r)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all text-left border ${
                        selectedRole?.id === r.id
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-500 dark:text-cyan-400"
                          : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Key size={14} className={selectedRole?.id === r.id ? "text-cyan-500" : "text-slate-400"} />
                        <span>{r.nama_role.replace("_", " ")}</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 border border-slate-200/40 dark:border-slate-700/50">
                        {r.permissions?.length || 0} Menu
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* TIPS BANNER */}
              <div className="bg-slate-800 rounded-[2rem] p-6 text-white relative overflow-hidden group">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-cyan-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Petunjuk Pengaturan</p>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed opacity-80">
                    Menu yang di-uncheck otomatis tidak akan muncul pada navigasi Sidebar maupun dapat diakses lewat URL routing oleh role terkait.
                  </p>
                </div>
              </div>
            </div>

            {/* KANAN: DAFTAR HAK AKSES */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                  <div>
                    <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">
                      Menu yang Dapat Diakses oleh: <span className="text-cyan-500">{selectedRole?.nama_role.toUpperCase().replace("_", " ")}</span>
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Centang menu untuk memberikan hak akses navigasi</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors"
                    >
                      Pilih Semua
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableMenus.map((menu) => {
                    const isChecked = selectedPermissions.includes(menu.key);
                    return (
                      <div
                        key={menu.key}
                        onClick={() => handleTogglePermission(menu.key)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-4 ${
                          isChecked
                            ? "bg-cyan-500/5 border-cyan-500/30 dark:bg-cyan-500/10"
                            : "bg-transparent border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handle lewat div click
                          className="mt-1 accent-cyan-500 h-4 w-4 rounded-lg pointer-events-none cursor-pointer"
                        />
                        <div className="space-y-1">
                          <p className={`text-xs font-black uppercase tracking-tight ${isChecked ? "text-cyan-500" : "text-slate-700 dark:text-slate-300"}`}>
                            {menu.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 leading-normal">
                            {menu.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                  <button
                    disabled={saving}
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
