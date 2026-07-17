import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  LayoutDashboard,
  Boxes,
  FileText,
  ArrowDownUp,
  Users,
  ClipboardCheck,
  QrCode,
  ClipboardList,
  History,
  UserCog,
  Tags,
  BarChart3,
  UserCircle,
  LogOut,
  ChevronRight,
  PackageSearch,
  Settings,
  User,
  CircleHelp,
  PlusCircle,
  X
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getRole, getUser, getPermissions } from "../../utils/auth";
import { useMemo } from "react";

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const [openStok, setOpenStok] = useState(
    location.pathname === "/stok-masuk" || location.pathname === "/stok-keluar"
  );
  const [openPengajuan, setOpenPengajuan] = useState(false);
  const [orgName, setOrgName] = useState("PDAM Inv");
  const [pendingCount, setPendingCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState([]);

  const role = getRole();
  const user = useMemo(() => getUser(), []);
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState(getPermissions());

  const hasPermission = (menuKey) => {
    if (!permissions || permissions.length === 0) {
      const defaults = {
        admin: ["dashboard", "barang", "kategori", "stok-masuk", "stok-keluar", "approval", "list-pengajuan", "scan", "laporan", "buat-pengajuan", "pengajuan-saya", "kelola-user", "activity-log", "settings", "kelola-akses"],
        staff: ["dashboard", "buat-pengajuan", "pengajuan-saya"],
        asisten_manager: ["dashboard", "approval", "list-pengajuan", "buat-pengajuan", "pengajuan-saya", "laporan"],
        manager: ["dashboard", "approval", "list-pengajuan", "barang", "laporan", "buat-pengajuan", "pengajuan-saya"],
        gudang: ["dashboard", "barang", "kategori", "stok-masuk", "stok-keluar", "approval", "list-pengajuan", "scan", "laporan"]
      };
      return defaults[role]?.includes(menuKey) || false;
    }
    return permissions.includes(menuKey) || (role === "admin" && menuKey === "kelola-akses");
  };

  useEffect(() => {
    // Scroll active sidebar item into view
    const timer = setTimeout(() => {
      const activeEl = document.querySelector(".active-sidebar-item");
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "instant", block: "nearest" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    setOrgName("PDAM Tirta Pakuan");

    // Load Pending Counts for Badge
    const fetchCounts = async () => {
      try {
        const [pengajuanRes, dashboardRes, notifRes] = await Promise.all([
          api.get("/pengajuan"),
          api.get("/dashboard"),
          api.get(`/notifikasi/${user?.id}`)
        ]);

        const all = pengajuanRes.data;
        const dashboard = dashboardRes.data;
        const unreads = notifRes.data.filter(n => n.is_read === 0);
        setUnreadNotifs(unreads);

        // 1. Pending Approvals (Tugas yang perlu divalidasi)
        let pCount = 0;
        if (role === 'asisten_manager') pCount = all.filter(p => p.status === 'pending_asisten_manager').length;
        else if (role === 'manager') pCount = all.filter(p => p.status === 'pending_manager').length;
        else if (role === 'gudang') pCount = all.filter(p => p.status === 'pending_gudang').length;
        else if (role === 'admin') pCount = all.filter(p => p.status.includes('pending')).length;
        setPendingCount(pCount);

        // 2. Low Stock Items (Semua Role kecuali Staff)
        if (role !== 'staff') {
          setLowStockCount(dashboard.summary?.stok_kritis || 0);
        }

      } catch (err) {
        console.error("Gagal fetch sidebar counts", err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000); // refresh fallback every 1 min

    // Listen to global refresh signal (from Topbar Socket)
    const handleRefresh = () => {
      console.log("🔄 [Sidebar] Refreshing counts via global signal...");
      fetchCounts();
    };

    const handlePermissionsRefresh = () => {
      setPermissions(getPermissions());
    };

    window.addEventListener('refreshSidebarBadge', handleRefresh);
    window.addEventListener('notif_baru', handleRefresh); // Juga dengarkan sinyal notif baru
    window.addEventListener('refreshPermissions', handlePermissionsRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshSidebarBadge', handleRefresh);
      window.removeEventListener('notif_baru', handleRefresh);
      window.removeEventListener('refreshPermissions', handlePermissionsRefresh);
    };
  }, [role, user?.id]); // Hapus location.pathname agar tidak terus-terusan reset!

  const isActive = (path) => location.pathname === path;

  // Modern pill-shaped active state
  const menuClass = (path) => `
    flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 text-sm font-semibold relative overflow-hidden group
    ${isActive(path)
      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 active-sidebar-item"
      : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-100"}
  `;

  const Badge = ({ count, color = "rose" }) => {
    if (!count || count <= 0) return null;
    const colors = {
      rose: "bg-rose-500 shadow-rose-500/30",
      blue: "bg-cyan-500 shadow-cyan-500/30",
    };
    return (
      <span className={`ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[9px] font-black text-white shadow-lg animate-pulse ${colors[color]}`}>
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const handleLogout = () => {
    import("sweetalert2").then(({ default: Swal }) => {
      Swal.fire({
        title: "Yakin ingin keluar?",
        text: "Sesi Anda akan berakhir.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e11d48",
        cancelButtonColor: "#94a3b8",
        confirmButtonText: "Ya, Keluar",
        cancelButtonText: "Batal",
        customClass: { popup: "rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl" }
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/login");
        }
      });
    });
  };

  return (
    <div className="w-64 h-screen bg-slate-800 border-r border-slate-700 flex flex-col fixed shadow-sm transition-colors duration-300 z-50">

      {/* HEADER / LOGO */}
      <div className="pt-2 pb-6 px-4 flex items-center justify-between border-b border-transparent">
        <div className="flex justify-center flex-1">
          <img
            src="/logo-premium.png"
            alt="PDAM Tirta Pakuan"
            className="h-32 w-auto object-contain transition-transform hover:scale-105 duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback if image not found */}
          <div className="hidden items-center gap-2" style={{ display: 'none' }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
              <ArrowDownUp size={16} className="text-white font-bold" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-700 to-blue-600 tracking-tight">
              {orgName.includes(' ') ? (
                <>
                  {orgName.split(' ')[0]} <span className="text-slate-800 dark:text-white">{orgName.split(' ').slice(1).join(' ')}</span>
                </>
              ) : orgName}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl lg:hidden transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar pb-32">

        {hasPermission("dashboard") && (
          <Link to="/" className={menuClass("/")}>
            <LayoutDashboard size={18} className={isActive("/") ? "text-cyan-400" : ""} />
            Dashboard
            {isActive("/") && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(6,182,212,0.4)]" />}
          </Link>
        )}

        {/* Master Section header */}
        {(hasPermission("barang") || hasPermission("kategori")) && (
          <div className="pt-6 pb-2 px-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-700/50"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master</p>
            <div className="h-px flex-1 bg-slate-700/50"></div>
          </div>
        )}

        {hasPermission("barang") && (
          <Link to="/barang" className={menuClass("/barang")}>
            <Boxes size={18} /> Katalog Barang
            <Badge count={lowStockCount} color="blue" />
          </Link>
        )}

        {hasPermission("kategori") && (
          <Link to="/kategori" className={menuClass("/kategori")}>
            <Tags size={18} /> Kategori
          </Link>
        )}

        {/* Transaksi Section header */}
        {(hasPermission("stok-masuk") || hasPermission("stok-keluar") || hasPermission("approval") || hasPermission("list-pengajuan") || hasPermission("buat-pengajuan") || hasPermission("pengajuan-saya")) && (
          <div className="pt-6 pb-2 px-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-700/50"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaksi</p>
            <div className="h-px flex-1 bg-slate-700/50"></div>
          </div>
        )}

        {(hasPermission("stok-masuk") || hasPermission("stok-keluar")) && (
          <div className="space-y-1">
            <button
              onClick={() => setOpenStok(!openStok)}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300
                ${openStok ? "bg-slate-700/50 text-cyan-400" : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-100"}
              `}
            >
              <div className="flex items-center gap-3">
                <ArrowDownUp size={18} /> Mutasi Stok
              </div>
              <ChevronRight size={14} className={`transition-transform duration-300 ${openStok ? "rotate-90 text-cyan-400" : "opacity-30"}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${openStok ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
              <div className="ml-7 space-y-1 border-l border-slate-700">
                {hasPermission("stok-masuk") && (
                  <Link to="/stok-masuk" className={`flex items-center gap-3 py-2 px-4 text-[12px] font-bold transition-colors ${isActive("/stok-masuk") ? "text-cyan-400 active-sidebar-item" : "text-slate-500 hover:text-slate-300"}`}>
                    Stok Masuk
                  </Link>
                )}
                {hasPermission("stok-keluar") && (
                  <Link to="/stok-keluar" className={`flex items-center gap-3 py-2 px-4 text-[12px] font-bold transition-colors ${isActive("/stok-keluar") ? "text-cyan-400 active-sidebar-item" : "text-slate-500 hover:text-slate-300"}`}>
                    Stok Keluar
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {hasPermission("buat-pengajuan") && (
          <Link to="/buat-pengajuan" className={menuClass("/buat-pengajuan")}>
            <PlusCircle size={18} className={isActive("/buat-pengajuan") ? "text-cyan-400" : ""} />
            Buat Pengajuan
          </Link>
        )}

        {hasPermission("pengajuan-saya") && (
          <Link to="/pengajuan-saya" className={menuClass("/pengajuan-saya")}>
            <History size={18} className={isActive("/pengajuan-saya") ? "text-cyan-400" : ""} />
            Pengajuan Saya
          </Link>
        )}

        {hasPermission("approval") && (
          <Link to="/approval" className={menuClass("/approval")}>
            <ClipboardCheck size={18} /> Validasi Pengajuan
            <Badge count={pendingCount} />
          </Link>
        )}

        {hasPermission("list-pengajuan") && (
          <Link to="/list-pengajuan" className={menuClass("/list-pengajuan")}>
            <FileText size={18} /> Semua Pengajuan
          </Link>
        )}

        {/* Sistem Section header */}
        {(hasPermission("scan") || hasPermission("laporan") || hasPermission("kelola-user") || hasPermission("activity-log") || hasPermission("settings") || hasPermission("kelola-akses")) && (
          <div className="pt-6 pb-2 px-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-700/50"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistem</p>
            <div className="h-px flex-1 bg-slate-700/50"></div>
          </div>
        )}

        {hasPermission("scan") && (
          <Link to="/scan" className={menuClass("/scan")}>
            <QrCode size={18} /> Scanner QR
          </Link>
        )}

        {hasPermission("laporan") && (
          <Link to="/laporan" className={menuClass("/laporan")}>
            <BarChart3 size={18} /> Laporan
          </Link>
        )}

        {hasPermission("kelola-user") && (
          <Link to="/kelola-user" className={menuClass("/kelola-user")}>
            <UserCog size={18} /> Manajemen User
          </Link>
        )}

        {hasPermission("kelola-akses") && (
          <Link to="/kelola-akses" className={menuClass("/kelola-akses")}>
            <UserCircle size={18} /> Atur Hak Akses
          </Link>
        )}

        {hasPermission("activity-log") && (
          <Link to="/activity-log" className={menuClass("/activity-log")}>
            <History size={18} /> Log Aktivitas
          </Link>
        )}

        {hasPermission("settings") && (
          <Link to="/settings" className={menuClass("/settings")}>
            <Settings size={18} /> Pengaturan
          </Link>
        )}

        {/* COMMON MENU (ALL ROLES) */}
        {/* FOOTER SPACE */}
        <div className="py-10"></div>

      </nav>

      {/* SIDEBAR FOOTER */}
      <div className="p-6 mt-auto">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] text-center opacity-40">
          PDAM Tirta Pakuan &copy; 2026
        </p>
        <p className="text-[10px] font-black text-slate-400  uppercase tracking-[0.1em] text-center opacity-40">By Drian</p>
      </div>

      {/* Global CSS injected for custom elegant scrollbar hiding if needed */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
        }
      `}} />

    </div>
  );
}
