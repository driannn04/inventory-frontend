import { useState, useEffect } from "react";
import axios from "axios";
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
  Settings
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getRole, getUser } from "../../utils/auth";

export default function Sidebar() {
  const [openStok, setOpenStok] = useState(false);
  const [openPengajuan, setOpenPengajuan] = useState(false);
  const [orgName, setOrgName] = useState("PDAM Inv");

  const role = getRole();
  const user = getUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpenStok(false);
    setOpenPengajuan(false);

    // Load All Settings
      axios.get("http://localhost:5000/api/settings", {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => {
          if (res.data && res.data.org_name) {
            const name = res.data.org_name.length > 15 ? res.data.org_name.split(' ')[0] : res.data.org_name;
            setOrgName(name);
          }
        }).catch(() => {});
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  // Modern pill-shaped active state
  const menuClass = (path) => `
    flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-300 text-sm font-medium
    ${isActive(path)
      ? "bg-sky-600 text-white shadow-md shadow-sky-200/50 dark:shadow-sky-900/50"
      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400"}
  `;

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
    <div className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col fixed shadow-sm transition-colors duration-300">
      
      {/* HEADER / LOGO */}
      <div className="pt-2 pb-6 px-4 flex items-center justify-center border-b border-transparent">
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
        <div className="hidden items-center gap-2" style={{display: 'none'}}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md">
            <ArrowDownUp size={16} className="text-white font-bold" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-700 to-indigo-600 tracking-tight">
            {orgName.includes(' ') ? (
              <>
                {orgName.split(' ')[0]} <span className="text-slate-800 dark:text-white">{orgName.split(' ').slice(1).join(' ')}</span>
              </>
            ) : orgName}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar pb-24">
        
        <Link to="/" className={menuClass("/")}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        {/* --- DATA MASTER --- */}
        {(role === "admin" || role === "gudang") && (
          <>
            <div className="pt-5 pb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Data Master</p>
            </div>
            
            <Link to="/barang" className={menuClass("/barang")}>
              <Boxes size={18} />
              Katalog Barang
            </Link>
            
            {role === "admin" && (
              <Link to="/kategori" className={menuClass("/kategori")}>
                <Tags size={18} />
                Kategori Barang
              </Link>
            )}

            {role === "admin" && (
              <Link to="/supplier" className={menuClass("/supplier")}>
                <Users size={18} />
                Data Supplier
              </Link>
            )}
          </>
        )}

        {/* --- TRANSAKSI & PENGAJUAN --- */}
        <div className="pt-5 pb-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Transaksi</p>
        </div>

        {(role === "staff" || role === "admin") && (
          <div>
            <button
              onClick={() => setOpenPengajuan(!openPengajuan)}
              className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300
                ${openPengajuan ? "bg-slate-50 dark:bg-slate-800 text-sky-700 dark:text-sky-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400"}
              `}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} />
                Pengajuan Barang
              </div>
              <ChevronRight size={16} className={`transition-transform duration-300 ${openPengajuan ? "rotate-90" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${openPengajuan ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
              <div className="ml-5 p-2 space-y-1 border-l-2 border-slate-100 dark:border-slate-800">
                <Link to="/buat-pengajuan" className={menuClass("/buat-pengajuan").replace('px-4', 'px-3')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span> Buat Baru
                </Link>
                <Link to="/list-pengajuan" className={menuClass("/list-pengajuan").replace('px-4', 'px-3')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span> Riwayat Saya
                </Link>
              </div>
            </div>
          </div>
        )}

        {(role === "asesmen" || role === "manager" || role === "gudang" || role === "admin") && (
          <Link to="/approval" className={menuClass("/approval")}>
            <ClipboardCheck size={18} />
            Persetujuan Validasi
          </Link>
        )}

        {(role === "gudang" || role === "admin") && (
          <div>
            <button
              onClick={() => setOpenStok(!openStok)}
              className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300
                ${openStok ? "bg-slate-50 dark:bg-slate-800 text-sky-700 dark:text-sky-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400"}
              `}
            >
              <div className="flex items-center gap-3">
                <ArrowDownUp size={18} />
                Mutasi Stok
              </div>
              <ChevronRight size={16} className={`transition-transform duration-300 ${openStok ? "rotate-90" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${openStok ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
               <div className="ml-5 p-2 space-y-1 border-l-2 border-slate-100 dark:border-slate-800">
                <Link to="/stok-masuk" className={menuClass("/stok-masuk").replace('px-4', 'px-3')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span> Inbound (Masuk)
                </Link>
                <Link to="/stok-keluar" className={menuClass("/stok-keluar").replace('px-4', 'px-3')}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span> Outbound (Keluar)
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* --- OPERASIONAL & AUDIT --- */}
        {(role === "admin" || role === "gudang") && (
          <>
            <div className="pt-5 pb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Operasional</p>
            </div>
            
            <Link to="/stok-opname" className={menuClass("/stok-opname")}>
              <ClipboardList size={18} />
              Stock Opname
            </Link>

            <Link to="/scan" className={menuClass("/scan")}>
              <QrCode size={18} />
              Scanner QR Code
            </Link>
          </>
        )}

        {/* --- LAPORAN & SISTEM --- */}
        {(role === "admin" || role === "gudang") && (
          <>
            <div className="pt-5 pb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Sistem & Report</p>
            </div>

            <Link to="/laporan" className={menuClass("/laporan")}>
              <BarChart3 size={18} />
              Laporan & Analitik
            </Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/activity-log" className={menuClass("/activity-log")}>
              <History size={18} />
              Riwayat Sistem
            </Link>

            <Link to="/kelola-user" className={menuClass("/kelola-user")}>
              <UserCog size={18} />
              Manajemen Akses
            </Link>

          </>
        )}

      </nav>
      
      {/* Sidebar Footer space if needed */}
      <div className="p-4 mt-auto">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center opacity-50">
          PDAM Tirta Pakuan &copy; 2026
        </p>
      </div>

      {/* Global CSS injected for custom elegant scrollbar hiding if needed */}
      <style dangerouslySetInnerHTML={{__html: `
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