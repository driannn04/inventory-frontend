import { useState, useEffect } from "react";
import { loginUser, checkNup } from "../../services/authService";
import { logUserLogin } from "../../services/auditService";
import { User, Lock, Eye, EyeOff, Loader2, ArrowRightCircle, CheckCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [nup, setNup] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isVerifyingNup, setIsVerifyingNup] = useState(false);

  // ✅ Real-time NUP Verification
  useEffect(() => {
    if (nup.length >= 2) {
      const timeoutId = setTimeout(async () => {
        setIsVerifyingNup(true);
        try {
          const res = await checkNup(nup);
          setUserData(res.data);
        } catch (err) {
          setUserData(null);
        } finally {
          setIsVerifyingNup(false);
        }
      }, 600);
      return () => clearTimeout(timeoutId);
    } else {
      setUserData(null);
    }
  }, [nup]);

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
    <div className="flex items-center justify-center min-h-screen bg-slate-950 overflow-hidden relative selection:bg-cyan-500 selection:text-white">
      
      {/* 🌊 AQUA PREMIUM BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[70%] h-[70%] bg-gradient-to-br from-cyan-600/20 via-blue-900/10 to-transparent blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[80%] h-[80%] bg-gradient-to-tr from-blue-900/30 via-cyan-900/10 to-transparent blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
        
        {/* Animated Floating Water Drops / Orbs */}
        <div className="absolute top-[20%] right-[10%] w-40 h-40 bg-cyan-500/10 backdrop-blur-3xl rounded-full border border-cyan-500/20 animate-bounce" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[10%] left-[5%] w-32 h-32 bg-blue-500/10 backdrop-blur-3xl rounded-full border border-blue-500/20 animate-pulse" style={{ animationDuration: '7s' }} />

        {/* Dynamic Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: `radial-gradient(#06b6d4 1.5px, transparent 1.5px)`, backgroundSize: '40px 40px' }} 
        />
      </div>

      <div className="w-full max-w-[420px] p-4 relative z-10">
        {/* 🏆 FROSTED AQUA GLASS CARD */}
        <div className="bg-slate-900/40 backdrop-blur-[40px] rounded-[3.5rem] p-10 shadow-[0_40px_100px_-15px_rgba(6,182,212,0.15)] border border-white/10 relative group overflow-hidden">
          
          {/* Inner Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />

          {/* LOGO SECTION */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <div className="absolute inset-[-20px] bg-cyan-500 blur-3xl opacity-20 animate-pulse" />
              <div className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-2 shadow-2xl shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-700">
                <img 
                  src="/logo-premium.png" 
                  alt="Logo PDAM" 
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                />
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-white leading-none uppercase">
                Sistem <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Inventory</span>
              </h2>
              <p className="text-[9px] font-black text-cyan-400/80 uppercase tracking-[0.5em]">
                PDAM Tirta Pakuan Bogor
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Akses Akun (NUP)</label>
                {isVerifyingNup && <Loader2 size={10} className="animate-spin text-blue-500" />}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-cyan-500/40 group-focus-within:text-cyan-400 transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Masukkan NUP Anda"
                  className={`w-full bg-white/5 border ${userData ? 'border-emerald-400/50 ring-4 ring-emerald-500/5' : 'border-white/10'} pl-13 pr-6 py-4 rounded-2xl text-xs focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-400 transition-all outline-none text-white font-bold placeholder-slate-500/50`}
                  value={nup}
                  onChange={(e) => setNup(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* ✅ User Identity Card (Name + Role) */}
            <AnimatePresence mode="wait">
              {userData && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="mx-2 px-5 py-4 bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-emerald-500/30 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-emerald-500/5 group/card relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 font-black text-lg">
                    {userData.nama?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <p className="text-[14px] font-black text-slate-800 leading-none truncate">{userData.nama}</p>
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                       <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-[9px] font-black text-emerald-700 uppercase tracking-widest border border-emerald-200">
                         {userData.role?.replace('_', ' ')}
                       </span>
                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Akses Aktif</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-4">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-cyan-500/40 group-focus-within:text-cyan-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 pl-13 pr-14 py-4 rounded-2xl text-xs focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 transition-all outline-none text-white font-bold placeholder-slate-500/50 tracking-widest"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-500 hover:text-cyan-400 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-[0.3em] py-5 mt-4 rounded-2xl shadow-[0_20px_40px_-10px_rgba(6,182,212,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(6,182,212,0.6)] active:scale-[0.98] transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite]" />
              <span className="relative flex items-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white/80" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk Sekarang
                    <ArrowRightCircle size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-blue-500/10 flex justify-center">
             <div className="flex items-center gap-4 text-[8px] font-black text-blue-400 uppercase tracking-widest opacity-60">
                <span>V3.2 PRO</span>
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                <span>AKSES TERPROTEKSI</span>
             </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-40">
          &copy; {new Date().getFullYear()} PDAM Tirta Pakuan Bogor
        </p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shine {
          100% { left: 125%; }
        }
      `}} />
    </div>
  );
}