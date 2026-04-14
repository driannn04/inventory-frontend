import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getUsers, createUser, updateUser, deleteUser, resetPassword, getRoles } from "../../services/userService";
import PageHeader from "../../components/common/PageHeader";
import {
  UserCog, Plus, Search, RefreshCw, Edit2, Trash2,
  Mail, Phone, Shield, Key, ChevronLeft, ChevronRight,
  Briefcase, Building2, X, Eye, EyeOff, AlertTriangle, Check
} from "lucide-react";

export default function UserManagement() {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetModal, setIsResetModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 8;

  const [form, setForm] = useState({
    nama: "", email: "", password: "", role_id: "",
    no_telp: "", jabatan: "", departemen: ""
  });

  useEffect(() => {
    loadData();
    loadRoles();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreate = () => {
    setEditingData(null);
    setForm({ nama: "", email: "", password: "", role_id: "", no_telp: "", jabatan: "", departemen: "" });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingData(item);
    setForm({
      nama: item.nama || "",
      email: item.email || "",
      password: "",
      role_id: roles.find(r => r.nama_role === item.role)?.id || "",
      no_telp: item.no_telp || "",
      jabatan: item.jabatan || "",
      departemen: item.departemen || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nama || !form.email || !form.role_id) {
      alert("Nama, email, dan role wajib diisi!");
      return;
    }
    if (!editingData && !form.password) {
      alert("Password wajib diisi untuk user baru!");
      return;
    }

    setSaving(true);
    try {
      if (editingData) {
        const { password, ...updateData } = form;
        await updateUser(editingData.id, updateData);
      } else {
        await createUser(form);
      }
      setIsModalOpen(false);
      setEditingData(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    import("sweetalert2").then(({ default: Swal }) => {
      Swal.fire({
        title: "Perhatian",
        text: `Yakin ingin menghapus user "${item.nama}"? Data akan dihapus permanen.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e11d48", 
        cancelButtonColor: "#94a3b8", 
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
        customClass: { popup: "rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl" }
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteUser(item.id);
            loadData();
          } catch (err) {
            alert(err.response?.data?.message || "Gagal menghapus user");
          }
        }
      });
    });
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }
    setSaving(true);
    try {
      await resetPassword(resetTarget.id, { new_password: newPassword });
      alert("Password berhasil direset!");
      setIsResetModal(false);
      setNewPassword("");
      setResetTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal reset password");
    } finally {
      setSaving(false);
    }
  };

  const filtered = data.filter(item => {
    const matchSearch =
      item.nama?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.jabatan?.toLowerCase().includes(search.toLowerCase()) ||
      item.departemen?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole ? item.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      staff: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      asesmen: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      manager: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      gudang: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
    return colors[role] || "bg-slate-100 text-slate-600";
  };

  if (loading && data.length === 0) {
    return (
      <MainLayout>
        <div className="p-6 animate-pulse space-y-6">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-1/4"></div>
          <div className="h-64 bg-slate-50 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        <PageHeader
          icon={<UserCog size={22} />}
          title="Kelola User"
          subtitle="User & Role Management"
          badge={{ label: "Total User", value: data.length }}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-700 transition-all active:scale-95"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
              >
                <Plus size={15} /> Tambah User
              </button>
            </div>
          }
        />

        {/* STAT MINI */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {roles.map((r, i) => {
            const count = data.filter(u => u.role === r.nama_role).length;
            const colors = [
              "from-blue-600 to-indigo-600",
              "from-emerald-600 to-teal-600",
              "from-amber-600 to-orange-600",
              "from-rose-600 to-pink-600",
              "from-violet-600 to-purple-600"
            ];
            const color = colors[i % colors.length];
            return (
              <div key={r.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.nama_role}</p>
                <p className={`text-2xl font-black mt-1.5 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* FILTER BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input type="text" placeholder="Cari nama, email, jabatan..." value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="outline-none flex-1 bg-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 font-medium" />
          </div>
          <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
            className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-200 rounded-xl py-2 px-4 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
            <option value="">Semua Role</option>
            {roles.map(r => (
              <option key={r.id} value={r.nama_role}>{r.nama_role}</option>
            ))}
          </select>
          {(search || filterRole) && (
            <button onClick={() => { setSearch(""); setFilterRole(""); setCurrentPage(1); }} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-all">
              <X size={15} />
            </button>
          )}
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto">{filtered.length} user</span>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="p-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Kontak</th>
                  <th className="p-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Jabatan & Dept</th>
                  <th className="p-5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="p-5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-24 text-center">
                      <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCog size={32} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-slate-500 font-medium">Belum ada data user</p>
                      <p className="text-slate-400 text-xs mt-1">Tambah user baru untuk memulai</p>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      {/* USER INFO */}
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            {item.nama?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.nama}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Bergabung {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* KONTAK */}
                      <td className="p-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Mail size={14} className="text-sky-400" />
                            <span className="text-xs font-medium truncate max-w-[180px]">{item.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Phone size={14} className="text-slate-400" />
                            <span className="text-xs">{item.no_telp || "-"}</span>
                          </div>
                        </div>
                      </td>

                      {/* JABATAN */}
                      <td className="p-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Briefcase size={14} className="text-slate-400" />
                            <span className="text-xs font-medium">{item.jabatan || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Building2 size={14} className="text-slate-400" />
                            <span className="text-xs">{item.departemen || "-"}</span>
                          </div>
                        </div>
                      </td>

                      {/* ROLE BADGE */}
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getRoleBadge(item.role)}`}>
                          <Shield size={12} />
                          {item.role}
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="p-5">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-all shadow-sm"
                            title="Edit User"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => { setResetTarget(item); setNewPassword(""); setIsResetModal(true); }}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-all shadow-sm"
                            title="Reset Password"
                          >
                            <Key size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 transition-all shadow-sm"
                            title="Hapus User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Hal {currentPage} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl transition-all font-bold text-xs shadow-sm ${currentPage === i + 1
                      ? "bg-sky-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL TAMBAH/EDIT USER ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30">
                  <UserCog size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
                    {editingData ? "Edit User" : "Tambah User Baru"}
                  </h2>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                    {editingData ? "Perbarui informasi akun" : "Hak akses sistem inventory"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">
              {/* Nama */}
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@pdam.co.id"
                  className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition"
                />
              </div>

              {/* Password (hanya saat tambah) */}
              {!editingData && (
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-5 pr-12 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                {/* Role */}
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Role Utama *</label>
                  <select
                    value={form.role_id}
                    onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                    className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition appearance-none"
                  >
                    <option value="">-- Pilih Role --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.nama_role.charAt(0).toUpperCase() + r.nama_role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {/* No Telp */}
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">No. Telepon</label>
                  <input
                    type="text"
                    value={form.no_telp}
                    onChange={(e) => setForm({ ...form, no_telp: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>

              {/* Jabatan & Departemen */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Jabatan Posisi</label>
                  <input
                    type="text"
                    value={form.jabatan}
                    onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                    placeholder="Staf Gudang"
                    className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block pl-1">Divisi / Dept</label>
                  <input
                    type="text"
                    value={form.departemen}
                    onChange={(e) => setForm({ ...form, departemen: e.target.value })}
                    placeholder="Logistik"
                    className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm dark:text-white outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex justify-end gap-3 rounded-b-[2rem]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500 shadow-lg shadow-sky-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                {editingData ? "Simpan Perubahan" : "Registrasi User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL RESET PASSWORD ===== */}
      {isResetModal && resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setIsResetModal(false); setResetTarget(null); }}></div>
          <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">

            <div className="flex flex-col items-center justify-center p-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/30">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                <AlertTriangle size={30} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Reset Sandi</h2>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Akun: {resetTarget.nama}</p>
            </div>

            <div className="p-8">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 block text-center">Sandi Baru</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center text-xl font-black tracking-[0.25em] dark:text-white outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400 text-center mt-4 tracking-widest">Hanya berikan sandi baru ini kepada pemilik akun.</p>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-3">
              <button
                onClick={handleResetPassword}
                disabled={saving}
                className="w-full py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:to-orange-500 shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {saving ? <RefreshCw size={18} className="animate-spin" /> : <Key size={18} />}
                Konfirmasi Reset
              </button>
              <button
                onClick={() => { setIsResetModal(false); setResetTarget(null); }}
                className="w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
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
