import { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { getUser } from "../../utils/auth";
import { io } from "socket.io-client";
import api from "../../utils/api";
import ToastNotif from "../ToastNotif";

import {
  Bell,
  X,
  CheckCheck,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Search,
  User,

  LogOut,
  ChevronDown,
  ClipboardCheck
} from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Topbar() {

  // âœ… FIX UTAMA: useMemo agar object user tidak dibuat ulang tiap render
  // Tanpa ini, [user] di useEffect selalu anggap "berubah" â†’ socket spam
  const user = useMemo(() => getUser(), []);
  const location = useLocation();

  const [notif, setNotif] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [expand, setExpand] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [orgName, setOrgName] = useState("PDAM Inv");
  const [showProfile, setShowProfile] = useState(false);
  const [notifFilter, setNotifFilter] = useState(null);

  const dropdownRef = useRef();
  const profileRef = useRef();
  const socketRef = useRef();
  const navigate = useNavigate();

  // Handle Dark Mode Toggle & Persistence
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  // Greeting Helper dibuang diganti Breadcrumbs

  // =============================
  // LOAD AWAL
  // =============================
  const loadNotif = async () => {
    try {
      if (!user) return;

      const res = await api.get(
        `/notifikasi/${user.id}`
      );

      setNotif(res.data);

    } catch (err) {
      console.log("Notif Error:", err.message);
    }
  };

  // âœ… FIX: ganti [user] â†’ [] agar tidak re-run tiap render
  useEffect(() => {
    loadNotif();

    setOrgName("PDAM Tirta Pakuan");
  }, []);

  // =============================
  // ðŸ”¥ REALTIME SOCKET
  // =============================
  // âœ… FIX: ganti [user] â†’ [] agar socket tidak disconnect/reconnect terus
  useEffect(() => {
    if (!user) return;

    if (socketRef.current) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("âœ… Socket connected");
      socket.emit("register", user.id);
    });

    socket.on("notif_baru", (data) => {
      console.log("🔔 [SOCKET] Menerima Notifikasi Baru:", data);

      // ⚡ SIARKAN SINYAL KE SELURUH KOMPONEN
      window.dispatchEvent(new CustomEvent('notif_baru', { detail: data }));
      window.dispatchEvent(new Event('refreshSidebarBadge'));

      const newNotif = {
        id: Date.now() + Math.random(),
        judul: data.judul,
        pesan: data.pesan,
        is_read: 0,
        created_at: new Date()
      };

      setNotif(prev => [newNotif, ...prev]);
      setToasts(prev => [newNotif, ...prev]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newNotif.id));
      }, 4000);
    });

    socket.on("refresh_data", () => {
      console.log("🔄 [SOCKET] Sinyal refresh data diterima (Silent)");
      // Hanya kirim sinyal refresh ke Sidebar/List tanpa pop-up
      window.dispatchEvent(new Event('notif_baru'));
      window.dispatchEvent(new Event('refreshSidebarBadge'));
    });

    return () => {
      socket.off("notif_baru");
      socket.disconnect();
      socketRef.current = null;
    };

  }, [user?.id]);

  // =============================
  // CLICK OUTSIDE
  // =============================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotif(false);
        setExpand(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =============================
  // ACTION
  // =============================
  const handleRead = async (id) => {
    await api.put(`/notifikasi/read/${id}`);

    setNotif(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
    );
  };

  const handleReadAll = async () => {
    await api.put(`/notifikasi/read-all/${user.id}`);

    setNotif(prev =>
      prev.map(n => ({ ...n, is_read: 1 }))
    );
  };

  const handleDelete = async (id) => {
    await api.delete(`/notifikasi/${id}`);

    setNotif(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notif.filter(n => n.is_read === 0).length;

  const handleLogout = () => {
    import("sweetalert2").then(({ default: Swal }) => {
      Swal.fire({
        title: "Konfirmasi Logout",
        text: "Anda akan keluar dari sesi ini.",
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
    <div className={`h-[72px] backdrop-blur-2xl border-b flex items-center justify-between px-6 relative z-40 shadow-sm transition-all duration-300 ${isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-white/40 border-blue-100/50 text-slate-800'}`}>

      {/* LEFT: BREADCRUMBS & SEARCH */}
      <div className="flex items-center gap-6">

        {/* Dynamic Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-sm font-semibold capitalize pointer-events-none">
          <span className="text-slate-400 dark:text-slate-500">{orgName}</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 tracking-wide">
            {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replace('-', ' ')}
          </span>
        </div>

        {/* Fake Search Global Trigger */}
        <button
          onClick={() => window.dispatchEvent(new Event('openCommandPalette'))}
          className="flex items-center gap-3 w-56 md:w-72 px-3.5 py-2 bg-white/50 hover:bg-white dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-blue-100 dark:border-slate-700/50 rounded-xl text-sm text-slate-400 transition-all shadow-sm group"
        >
          <Search size={14} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
          <span className="flex-1 text-left text-[13px] font-medium">Cari menu/data...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-500 dark:text-slate-400 font-mono shadow-sm">Ctrl+K</kbd>
        </button>

      </div>

      <div className="flex items-center gap-5 relative">

        {/* DARK MODE TOGGLE */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full transition-all duration-300 ${isDark
              ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          title={isDark ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
        >
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* DISTRACTION LINE */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* ðŸ”” NOTIF */}
        <div className="relative" ref={dropdownRef}>

          <div
            className={`cursor-pointer relative p-2 rounded-full transition-all duration-300 ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
            onClick={() => setShowNotif(!showNotif)}
          >
            <Bell size={20} className={`${unreadCount > 0 ? "text-sky-600" : ""}`} />

            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-black text-white bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          {/* 🔥 REALTIME TOAST CONTAINER (PORTAL) */}
          {createPortal(
            <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
              <AnimatePresence>
                {toasts.map(t => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    className="pointer-events-auto shadow-2xl"
                  >
                    <ToastNotif
                      data={t}
                      onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>,
            document.body
          )}

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`
                  fixed right-6 top-16 
                  ${expand ? "w-[420px] h-[80vh]" : "w-96"}
                  ${isDark ? "bg-slate-800 border-slate-700 shadow-sky-900/20" : "bg-white border-slate-200 shadow-xl"}
                  rounded-2xl border z-50 flex flex-col
                  transition-all duration-300 overflow-hidden
                `}
              >

                {/* HEADER */}
                <div className={`flex justify-between items-center p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Notifikasi
                    </h2>
                    {unreadCount > 0 && (
                      <span className="text-[9px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpand(!expand)}
                      className="text-slate-400 hover:text-sky-600 transition p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                      title={expand ? "Perkecil" : "Perbesar"}
                    >
                      {expand ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button
                      onClick={handleReadAll}
                      className="text-[10px] text-sky-600 font-black flex items-center gap-1 bg-sky-50 dark:bg-sky-900/30 px-2.5 py-1.5 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/50 transition uppercase tracking-wider"
                    >
                      <CheckCheck size={12} /> Baca Semua
                    </button>
                  </div>
                </div>

                {/* FILTER TABS */}
                <div className={`flex gap-1 px-4 py-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  {["Semua", "Belum Dibaca"].map(tab => {
                    const isActive = (tab === "Semua" && !notifFilter) || (tab === "Belum Dibaca" && notifFilter === "unread");
                    return (
                      <button
                        key={tab}
                        onClick={() => setNotifFilter(tab === "Belum Dibaca" ? "unread" : null)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${isActive
                            ? "bg-sky-100 dark:bg-sky-900/30 text-sky-600"
                            : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                          }`}
                      >
                        {tab}
                        {tab === "Belum Dibaca" && unreadCount > 0 && (
                          <span className="ml-1.5 text-[8px] bg-red-500 text-white px-1 py-0.5 rounded-full">{unreadCount}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto">
                  {(() => {
                    const filteredNotif = notifFilter === "unread" ? notif.filter(n => n.is_read === 0) : notif;
                    const displayNotif = expand ? filteredNotif : filteredNotif.slice(0, 6);

                    if (filteredNotif.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                          <Bell size={40} className="mb-3 text-slate-300" />
                          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {notifFilter === "unread" ? "Semua notifikasi sudah dibaca" : "Belum ada notifikasi baru"}
                          </p>
                        </div>
                      );
                    }

                    return displayNotif.map((n) => {
                      // Determine icon & color based on notification title/type
                      let typeIcon = "🔔";
                      let typeBg = "bg-slate-100 dark:bg-slate-700";
                      let typeColor = "text-slate-500";

                      const title = (n.judul || "").toLowerCase();
                      if (title.includes("masuk") || title.includes("📦")) {
                        typeIcon = "📦"; typeBg = "bg-emerald-50 dark:bg-emerald-900/30"; typeColor = "text-emerald-600";
                      } else if (title.includes("keluar") || title.includes("📤")) {
                        typeIcon = "📤"; typeBg = "bg-rose-50 dark:bg-rose-900/30"; typeColor = "text-rose-600";
                      } else if (title.includes("pengajuan")) {
                        typeIcon = "📋"; typeBg = "bg-blue-50 dark:bg-blue-900/30"; typeColor = "text-blue-600";
                      } else if (title.includes("minimum") || title.includes("⚠️")) {
                        typeIcon = "⚠️"; typeBg = "bg-amber-50 dark:bg-amber-900/30"; typeColor = "text-amber-600";
                      }

                      // Relative time
                      const now = new Date();
                      const date = new Date(n.created_at);
                      const diffMs = now - date;
                      const diffMin = Math.floor(diffMs / 60000);
                      const diffHour = Math.floor(diffMin / 60);
                      const diffDay = Math.floor(diffHour / 24);
                      let relTime = "";
                      if (diffMin < 1) relTime = "Baru saja";
                      else if (diffMin < 60) relTime = `${diffMin}m lalu`;
                      else if (diffHour < 24) relTime = `${diffHour}j lalu`;
                      else if (diffDay < 7) relTime = `${diffDay}h lalu`;
                      else relTime = date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

                      return (
                        <div
                          key={n.id}
                          className={`px-4 py-3.5 border-b text-sm flex gap-3 transition group
                          ${n.is_read === 0 ? (isDark ? "bg-slate-700/50" : "bg-sky-50/30") : ""}
                          ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-50 hover:bg-slate-50'}`}
                        >
                          {/* Type Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${typeBg}`}>
                            {typeIcon}
                          </div>

                          <div
                            className="flex-1 cursor-pointer min-w-0"
                            onClick={() => handleRead(n.id)}
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className={`font-bold text-[13px] truncate ${isDark ? 'text-white' : 'text-slate-800'} ${n.is_read === 0 ? '' : 'opacity-70'}`}>
                                {n.judul}
                              </p>
                              {n.is_read === 0 && (
                                <span className="w-2 h-2 bg-sky-500 rounded-full shrink-0"></span>
                              )}
                            </div>
                            <p className={`text-xs leading-relaxed truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {n.pesan}
                            </p>
                            <p className={`text-[10px] mt-1 font-bold ${n.is_read === 0 ? 'text-sky-500' : 'text-slate-400'}`}>
                              {relTime}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="text-slate-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition self-start opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    });
                  })()}
                </div>

                {notif.length > 0 && (
                  <button
                    onClick={() => {
                      setShowNotif(false);
                      setExpand(false);
                      navigate('/notifikasi');
                    }}
                    className={`text-center text-[11px] font-black text-sky-600 py-3 border-t transition uppercase tracking-widest
                    ${isDark ? 'border-slate-700 hover:bg-slate-700' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    Buka Pusat Notifikasi
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* DISTRACTION LINE */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* ðŸ‘¤ PROFILE DROPDOWN */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-cyan-200 dark:shadow-none transition-transform group-hover:scale-105">
              {user?.nama?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="hidden md:flex flex-col items-start pr-2">
              <span className="text-xs font-black text-slate-800 dark:text-white leading-none mb-1 uppercase tracking-tight">
                {user?.nama?.split(' ')[0] || "User"}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ admin: "Admin", staff: "Staff", gudang: "Gudang", manager: "Manager", asisten_manager: "Asisten Manager" }[user?.role] || user?.role}</span>
                <ChevronDown size={10} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-14 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Akun Anda</p>
                    {user?.nup && (
                      <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded leading-none uppercase tracking-tighter">
                        NUP: {user.nup}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-black text-slate-800 dark:text-white truncate">{user?.nama}</p>
                </div>
                <div className="p-2">
                  <Link
                    to="/profil"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 transition-all"
                  >
                    <User size={16} /> Profil Saya
                  </Link>

                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                  >
                    <LogOut size={16} /> Keluar Aplikasi
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
