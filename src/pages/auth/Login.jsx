import { useState } from "react";
import { loginUser } from "../../services/authService";
import { logUserLogin } from "../../services/auditService";

export default function Login(){
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleLogin = async (e)=>{
    e.preventDefault();
    try{
      const res = await loginUser({ email, password });
      
      localStorage.setItem("token",res.data.token);
      localStorage.setItem("user",JSON.stringify(res.data.user));

      // ✅ LOG AKTIVITAS LOGIN
      try {
        await logUserLogin(res.data.user.id);
      } catch (logErr) {
        console.error("Gagal mencatat log login", logErr);
      }

      window.location.href="/";

}catch(err){

alert(err.response?.data?.message || "Login gagal");

}

};

return (
  <div className="flex items-center justify-center min-h-screen bg-app-bg dark:bg-slate-900 overflow-hidden relative selection:bg-sky-500 selection:text-white">
    {/* Animated Background Elements */}
    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-400/30 dark:bg-sky-500/20 rounded-full blur-[100px] pointer-events-none"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

    <div className="w-full max-w-md p-8 relative z-10">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-slate-100 dark:border-slate-800">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/40 mb-4 transform hover:scale-105 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="text-white w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 tracking-tight text-center">
            PDAM Inventory
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Sistem Manajemen Gudang</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Email / Akun</label>
            <input
              type="email"
              placeholder="Masukkan email anda..."
              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Kata Sandi</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400/70 tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-sm tracking-wide py-4 mt-4 rounded-2xl shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            Masuk ke Sistem
          </button>
        </form>

      </div>
      <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        &copy; {new Date().getFullYear()} PDAM Tirta Pakuan Bogor
      </p>
    </div>
  </div>
);
}