import React from "react";
import { motion } from "framer-motion";
import { RefreshCcw, AlertTriangle, LifeBuoy } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Crash Caught by Boundary:", error, errorInfo);
  }

  handleReset = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-[2rem] flex items-center justify-center text-rose-600">
                <AlertTriangle size={48} className="animate-bounce" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-xl shadow-lg">
                <LifeBuoy size={20} className="animate-spin-slow" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-3">
              Ops! Terjadi Kesalahan Sistem
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 leading-relaxed">
              Aplikasi mengalami kendala teknis yang tidak terduga. Jangan khawatir, data Anda biasanya tetap aman. Silakan coba muat ulang aplikasi.
            </p>

            <button
              onClick={this.handleReset}
              className="group relative flex items-center justify-center gap-3 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
            >
              <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              Muat Ulang Aplikasi
            </button>

            <p className="mt-8 text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">
              Internal System Error Handler • PERUMDA Tirta Pakuan
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
