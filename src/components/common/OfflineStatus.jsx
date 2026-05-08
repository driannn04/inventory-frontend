import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, X } from "lucide-react";

export default function OfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnline(true);
      setTimeout(() => setShowOnline(false), 3000);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-[9999] md:left-auto md:right-10 md:w-96"
        >
          <div className="bg-rose-600 text-white p-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-rose-500">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
               <WifiOff size={24} className="animate-pulse" />
            </div>
            <div className="flex-1">
               <h4 className="text-xs font-black uppercase tracking-widest">Koneksi Terputus</h4>
               <p className="text-[10px] font-medium opacity-80 mt-0.5">Memeriksa koneksi internet Anda...</p>
            </div>
          </div>
        </motion.div>
      )}

      {showOnline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-[9999] md:left-auto md:right-10 md:w-96"
        >
          <div className="bg-emerald-600 text-white p-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-emerald-500">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
               <Wifi size={24} />
            </div>
            <div className="flex-1">
               <h4 className="text-xs font-black uppercase tracking-widest">Kembali Online</h4>
               <p className="text-[10px] font-medium opacity-80 mt-0.5">Koneksi berhasil dipulihkan!</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
