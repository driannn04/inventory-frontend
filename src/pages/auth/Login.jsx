import { useState } from "react";
import { loginUser } from "../../services/authService";
import { logUserLogin } from "../../services/auditService";
import { User, Lock, Eye, EyeOff, Loader2, ArrowRightCircle } from "lucide-react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function Login() {
  const [nup, setNup] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      // ✅ LOGIN MENGGUNAKAN NUP
      const res = await loginUser({ nup, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ LOG AKTIVITAS LOGIN
      try {
        await logUserLogin(res.data.user.id);
      } catch (logErr) {
        console.error("Gagal mencatat log login", logErr);
      }

      await Swal.fire({
        icon: "success",
        title: "Akses Diterima",
        text: `Selamat bekerja, ${res.data.user.nama}`,
        timer: 1500,
        showConfirmButton: false,
        background: "rgba(255, 255, 255, 0.95)",
        backdrop: `rgba(15, 23, 42, 0.4)`,
        customClass: {
          title: "text-slate-800 font-black tracking-tight",
          popup: "rounded-[2.5rem] shadow-2xl border-none backdrop-blur-xl",
        }
      });

      window.location.href = "/";

    } catch (err) {
      setIsLoading(false);

      await Swal.fire({
        icon: "error",
        title: "Login Gagal",
        text: err.response?.data?.message || "NUP atau kata sandi yang Anda masukkan salah.",
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#2563eb",
        background: "rgba(255, 255, 255, 0.95)",
        backdrop: `rgba(15, 23, 42, 0.4)`,
        customClass: {
          title: "text-slate-800 font-black tracking-tight",
          popup: "rounded-[2.5rem] shadow-2xl border-none backdrop-blur-xl",
          confirmButton: "px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px]"
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden selection:bg-blue-600 selection:text-white">

      {/* 🚀 LEFT SIDE: VISUAL (DESKTOP ONLY) */}
      <div className="hidden lg:flex w-[55%] relative items-center justify-center overflow-hidden">
        {/* Full-cover warehouse photo */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/pdam_warehouse_new.png"
            alt="Gudang Tirta Pakuan"
            className="w-full h-full object-cover"
          />
          {/* Blue gradient overlay agar teks terbaca & warna cerah */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 via-blue-500/50 to-cyan-400/40" />
        </motion.div>

        {/* Branding Overlay - REVISED */}
        <div className="absolute top-12 left-12 z-20 flex flex-col items-start gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-sky-400 p-3 rounded-2xl shadow-xl border border-blue-500/30">
            <img src="/logo-premium.png" alt="Logo PERUMDA" className="w-12 h-12 object-contain" />
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-[2rem] shadow-2xl max-w-[280px]">
            <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight"> <br /> <span className="text-blue-300">SIPBAR</span></h3>
            <p className="text-[9px] font-bold text-blue-100 uppercase tracking-[0.2em] mt-3 leading-relaxed opacity-80">
              Sistem Informasi Pengajuan & Persetujuan Barang.
            </p>
          </div>
        </div>
      </div>

      {/* 🔐 RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-10 relative">

        {/* Mobile Background Elements */}
        <div className="lg:hidden absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-50 blur-[100px] rounded-full opacity-60" />
        </div>

        <div className="w-full max-w-[360px] relative z-10">
          {/* LOGO AREA */}
          <div className="flex flex-col items-center mb-10 lg:items-start">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-14 h-14 bg-gradient-to-br from-blue-600 to-sky-400 rounded-2xl p-2 mb-5 border border-blue-500/20 shadow-sm"
            >
              <img src="/logo-premium.png" alt="Logo PERUMDA" className="w-full h-full object-contain" />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Akses <span className="text-blue-600">Masuk</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase tracking-[0.2em] leading-relaxed">
                Silakan masuk untuk mengelola pengajuan & persetujuan barang (SIPBAR) PERUMDA Tirta Pakuan.
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="flex justify-between items-center px-1 mb-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NUP Pegawai</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan NUP"
                  className="w-full bg-slate-50 border-2 border-slate-100 pl-13 pr-6 py-3.5 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-800 placeholder-slate-300"
                  value={nup}
                  onChange={(e) => setNup(e.target.value)}
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1.5 block">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-100 pl-13 pr-14 py-3.5 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-600 transition-all outline-none text-slate-800 placeholder-slate-300 tracking-widest"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-[0.2em] py-5 mt-4 rounded-2xl shadow-2xl shadow-blue-600/30 active:scale-[0.97] transition-all duration-300 disabled:opacity-70 group flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Masuk"}
              {!isLoading && <ArrowRightCircle size={18} className="group-hover:translate-x-1 transition-transform" />}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 pt-6 border-t border-slate-50 text-center lg:text-left flex flex-col lg:flex-row lg:items-center gap-3"
          >
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Tirta Pakuan Bogor
            </p>
            <div className="hidden lg:block w-1 h-1 rounded-full bg-slate-200" />
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">
              Dibuat oleh Drian &amp; Aden
            </p>
          </motion.div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.02); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}