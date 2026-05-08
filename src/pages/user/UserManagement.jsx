import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { 
  getUsers, createUser, updateUser, deleteUser, resetPassword, 
  getRoles, getNextNup, getJabatans, getDepartments, getSubDepartments 
} from "../../services/userService";
import PageHeader from "../../components/common/PageHeader";
import {
  UserCog, Plus, Search, RefreshCw, Edit2, Trash2,
  Mail, Phone, Shield, Key, ChevronLeft, ChevronRight,
  Briefcase, Building2, X, Eye, EyeOff, AlertTriangle, Check, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserManagement() {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [jabatans, setJabatans] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
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
    nup: "", nama: "", email: "", password: "", role_id: "",
    no_telp: "", jabatan_id: "", id_dept: "", id_subdept: ""
  });

  useEffect(() => {
    loadData();
    loadMasterData();
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

  const loadMasterData = async () => {
    try {
      const [roleRes, jabRes, deptRes] = await Promise.all([
        getRoles(),
        getJabatans(),
        getDepartments()
      ]);
      setRoles(roleRes.data);
      setJabatans(jabRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error("Gagal memuat data master", err);
    }
  };

  const handleDeptChange = async (deptId) => {
    setForm(prev => ({ ...prev, id_dept: deptId, id_subdept: "" }));
    if (deptId) {
      try {
        const res = await getSubDepartments(deptId);
        setSubDepartments(res.data);
      } catch (err) {
        console.error("Gagal memuat sub-departemen", err);
      }
    } else {
      setSubDepartments([]);
    }
  };

  const openCreate = async () => {
    setEditingData(null);
    setForm({ 
      nup: "OTOMATIS", nama: "", email: "", password: "", role_id: "", 
      no_telp: "", jabatan_id: "", id_dept: "", id_subdept: "" 
    });
    setSubDepartments([]);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEdit = async (item) => {
    setEditingData(item);
    
    // Jika ada departemen, ambil sub-departemennya dulu
    if (item.id_dept) {
      try {
        const res = await getSubDepartments(item.id_dept);
        setSubDepartments(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSubDepartments([]);
    }

    setForm({
      nup: item.nup || "",
      nama: item.nama || "",
      email: item.email || "",
      password: "",
      role_id: item.role_id || "",
      no_telp: item.no_telp || "",
      jabatan_id: item.jabatan_id || "",
      id_dept: item.id_dept || "",
      id_subdept: item.id_subdept || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nama || !form.role_id || !form.id_dept || !form.id_subdept) {
      alert("Nama, Role, Departemen, dan Sub-Departemen wajib diisi!");
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
        import("sweetalert2").then(({ default: Swal }) => {
          Swal.fire({
            title: "Berhasil!",
            text: "Data user telah diperbarui.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            customClass: { popup: "rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl" }
          });
        });
      } else {
        const res = await createUser(form);
        import("sweetalert2").then(({ default: Swal }) => {
          Swal.fire({
            title: "User Ditambahkan!",
            html: `User baru berhasil dibuat dengan NUP: <b class="text-blue-600">${res.data.nup}</b>`,
            icon: "success",
            confirmButtonText: "Mantap",
            confirmButtonColor: "#2563eb",
            customClass: { popup: "rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl" }
          });
        });
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
      import("sweetalert2").then(({ default: Swal }) => {
        Swal.fire({
          title: "Password Berhasil!",
          text: "Kata sandi user telah diperbarui.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: "rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl" }
        });
      });
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
      item.nup?.toLowerCase().includes(search.toLowerCase()) ||
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
      asisten_manager: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
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
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
              >
                <Plus size={15} /> Tambah User
              </button>
            </div>
          }
        />

        {/* STAT MINI */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {roles.map((r, i) => {
            const count = data.filter(u => u.role === r.nama_role).length;
            const configs = {
              admin: { color: "from-rose-600 to-pink-600", icon: <Shield size={18} />, label: "Admin" },
              staff: { color: "from-blue-600 to-sky-500", icon: <Briefcase size={18} />, label: "Staff" },
              gudang: { color: "from-emerald-600 to-teal-600", icon: <Building2 size={18} />, label: "Gudang" },
              manager: { color: "from-amber-600 to-orange-600", icon: <UserCog size={18} />, label: "Manager" },
              asisten_manager: { color: "from-violet-600 to-purple-600", icon: <UserCog size={18} />, label: "Asisten Manager" }
            };
            const config = configs[r.nama_role] || { color: "from-slate-600 to-slate-500", icon: <UserCog size={18} />, label: r.nama_role };
            
            return (
              <div key={r.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} text-white flex items-center justify-center mb-4 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                  {config.icon}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{config.label}</p>
                <p className={`text-2xl font-black mt-1 bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Cari NUP, nama, email, jabatan..." value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-medium dark:text-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
             <div className="pl-3 pr-1 text-slate-400 border-r border-slate-100 dark:border-slate-800 mr-1">
               <Shield size={14} />
             </div>
             <select 
               value={filterRole} 
               onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
               className="bg-transparent dark:text-slate-200 py-2 pr-8 pl-1 text-[11px] font-black uppercase tracking-widest outline-none transition-all cursor-pointer"
             >
               <option value="">Semua Role</option>
               {roles.map(r => (
                 <option key={r.id} value={r.nama_role}>
                   {{ admin: "Admin", staff: "Staff", gudang: "Gudang", manager: "Manager", asisten_manager: "Asisten Manager" }[r.nama_role] || r.nama_role}
                 </option>
               ))}
             </select>
          </div>
          {(search || filterRole) && (
            <button 
              onClick={() => { setSearch(""); setFilterRole(""); setCurrentPage(1); }} 
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 transition-all shadow-sm shrink-0"
            >
              <X size={18} />
            </button>
          )}
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
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            {item.nama?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.nama}</p>
                            <div className="flex flex-col mt-1 gap-0.5">
                              <span className="inline-flex w-fit items-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-[10px] font-black text-blue-600 dark:text-blue-400 tracking-widest uppercase border border-blue-100 dark:border-blue-800/30">
                                NUP: {item.nup || "BELUM DISET"}
                              </span>
                              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                Bergabung {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
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
                      <td className="p-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Briefcase size={14} className="text-slate-400" />
                            <span className="text-xs font-medium">{item.jabatan || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Building2 size={14} className="text-slate-400" />
                            <span className="text-xs">{item.departemen || "-"} {item.sub_departemen ? `> ${item.sub_departemen}` : ""}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getRoleBadge(item.role)}`}>
                          <Shield size={12} />
                          {{ admin: "Admin", staff: "Staff", gudang: "Gudang", manager: "Manager", asisten_manager: "Asisten Manager" }[item.role] || item.role}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-1.5">
                          <button onClick={() => openEdit(item)} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => { setResetTarget(item); setNewPassword(""); setIsResetModal(true); }} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all shadow-sm">
                            <Key size={15} />
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-red-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">
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
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex px-1 gap-1.5 items-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-10 h-10 rounded-xl font-bold text-xs shadow-sm ${currentPage === p
                        ? "bg-gradient-to-br from-blue-600 to-sky-500 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 transition shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL TAMBAH/EDIT USER ===== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg flex flex-col my-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserCog size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                      {editingData ? "Edit User" : "Tambah User Baru"}
                    </h2>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                      Informasi Akun & Hak Akses
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 sm:p-8 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">NUP (Otomatis)</label>
                    <input
                      type="text" value={form.nup} readOnly
                      className="w-full px-5 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none text-slate-500 font-bold cursor-not-allowed"
                      placeholder="Dibuat oleh sistem"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Nama Lengkap *</label>
                    <input
                      type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                      placeholder="Nama lengkap"
                      className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-sky-500/10 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Email *</label>
                    <input
                      type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@pdam.co.id"
                      className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-sky-500/10 transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">No. Telp</label>
                    <input
                      type="text" value={form.no_telp} onChange={(e) => setForm({ ...form, no_telp: e.target.value })}
                      placeholder="08xxxx"
                      className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-sky-500/10 transition"
                    />
                  </div>
                </div>

                {!editingData && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-sky-500/10 transition"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Role User *</label>
                      <div className="relative">
                        <Shield size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-sky-500/10 transition appearance-none"
                        >
                          <option value="">Pilih Role</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>
                              {{ admin: "Admin", staff: "Staff", gudang: "Gudang", manager: "Manager", asisten_manager: "Asisten Manager" }[r.nama_role] || r.nama_role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Jabatan *</label>
                      <div className="relative">
                        <Briefcase size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={form.jabatan_id} onChange={(e) => setForm({ ...form, jabatan_id: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-sky-500/10 transition appearance-none"
                        >
                          <option value="">Pilih Jabatan</option>
                          {jabatans.map(j => (
                            <option key={j.id} value={j.id}>{j.nama_jabatan}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Departemen</label>
                      <div className="relative">
                        <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          value={form.id_dept} 
                          onChange={(e) => handleDeptChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-sky-500/10 transition appearance-none"
                        >
                          <option value="">Pilih Departemen</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.nama_dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Sub-Departemen</label>
                      <div className="relative">
                        <Layers size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                          disabled={!form.id_dept}
                          value={form.id_subdept} 
                          onChange={(e) => setForm({ ...form, id_subdept: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-sky-500/10 transition appearance-none disabled:opacity-50"
                        >
                          <option value="">Pilih Sub-Dept</option>
                          {subDepartments.map(sd => (
                            <option key={sd.id} value={sd.id}>{sd.nama_sub}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex justify-end gap-3 rounded-b-[2rem]">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition">Batal</button>
                <button
                  onClick={handleSave} disabled={saving}
                  className="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                  {editingData ? "Simpan Perubahan" : "Tambah User"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL RESET PASSWORD - Tetap seperti sebelumnya tapi dengan AnimatePresence */}
      <AnimatePresence>
        {isResetModal && resetTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsResetModal(false)}></motion.div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                  <Key size={30} />
                </div>
                <h3 className="text-xl font-black dark:text-white">Reset Password</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">{resetTarget.nama}</p>
                
                <div className="w-full mt-6 space-y-4">
                  <input
                    type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Sandi baru (min 6 karakter)"
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-amber-500/10 transition"
                  />
                  <button
                    onClick={handleResetPassword} disabled={saving}
                    className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    {saving ? "Memproses..." : "Update Password"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
