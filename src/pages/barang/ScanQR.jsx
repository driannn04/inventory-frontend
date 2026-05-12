import { useEffect, useRef, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  CheckCircle,
  XCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCcw,
  Square,
  Play,
  History,
  Settings2,
  Zap,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Loader2
} from "lucide-react";
import { scanQR } from "../../services/barangService";
import { tambahStokMasuk, tambahStokKeluar } from "../../services/stokService";
import PageHeader from "../../components/common/PageHeader";

export default function ScanQR() {
  const scannerRef = useRef(null);
  const lastScanRef = useRef("");
  const beepRef = useRef(null);
  const isProcessingRef = useRef(false);
  const cooldownTimerRef = useRef(null);
  const scannerReadyRef = useRef(false);

  const [barang, setBarang] = useState(null);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const [status, setStatus] = useState("idle"); // idle | scanning | paused | processing
  const [modeAuto, setModeAuto] = useState(false);
  const [tipeAuto, setTipeAuto] = useState("masuk"); // masuk | keluar
  const [jumlah, setJumlah] = useState(1);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [autoProcessingMsg, setAutoProcessingMsg] = useState("");
  const itemsPerPage = 5;

  // Refs for logic sync
  const modeAutoRef = useRef(modeAuto);
  const tipeAutoRef = useRef(tipeAuto);
  const jumlahRef = useRef(jumlah);

  useEffect(() => { modeAutoRef.current = modeAuto; }, [modeAuto]);
  useEffect(() => { tipeAutoRef.current = tipeAuto; }, [tipeAuto]);
  useEffect(() => { jumlahRef.current = jumlah; }, [jumlah]);

  useEffect(() => {
    beepRef.current = new Audio("/beep.mp3");
    startScanner();
    return () => handleCleanup();
  }, []);

  const handleCleanup = async () => {
    scannerReadyRef.current = false;
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning()) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
    hardStopTracks();
  };

  const hardStopTracks = () => {
    try {
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        if (v.srcObject) {
          v.srcObject.getTracks().forEach(track => track.stop());
          v.srcObject = null;
        }
      });
    } catch (e) {}
  };

  const playBeep = () => {
    try {
      beepRef.current?.play().catch(() => {});
      document.body.classList.add("flash");
      setTimeout(() => document.body.classList.remove("flash"), 150);
    } catch(e) {}
  };

  const stopScanner = async () => {
    setStatus("paused");
    setIsCameraActive(false);
    scannerReadyRef.current = false;
    await handleCleanup();
  };

  const toggleCamera = () => {
    if (isCameraActive) stopScanner();
    else startScanner();
  };

  const startScanner = async () => {
    try {
      setStatus("scanning");
      setError(null);
      
      // 1. Cek apakah ada kamera
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setError("Perangkat kamera tidak ditemukan");
        return;
      }

      // 2. Matikan instance lama jika ada
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning()) await scannerRef.current.stop();
          await scannerRef.current.clear();
        } catch (e) { console.warn("Cleanup warning:", e); }
      }

      // 3. Tunggu sebentar agar hardware benar-benar lepas
      await new Promise(r => setTimeout(r, 800));

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;
      setIsCameraActive(true);
      scannerReadyRef.current = true;

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
      ];

      await scanner.start(
        { facingMode: "environment" },
        { 
          fps: 15, 
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minSize = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minSize * 0.75);
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
          formatsToSupport
        },
        async (decodedText) => {
          if (isProcessingRef.current || !scannerReadyRef.current) return;
          
          let kodeBarang = decodedText.trim();
          if (decodedText.startsWith("{")) {
            try { kodeBarang = JSON.parse(decodedText).kode_barang; } catch(e) { kodeBarang = decodedText; }
          }
          
          if (!kodeBarang || lastScanRef.current === kodeBarang) return;
          
          isProcessingRef.current = true;
          lastScanRef.current = kodeBarang;

          try {
            const res = await scanQR(kodeBarang);
            const dataBarang = res.data.data;
            playBeep();

            if (modeAutoRef.current) {
              setAutoProcessingMsg(`Processing: ${dataBarang.nama_barang}`);
              const qty = parseInt(jumlahRef.current) || 1;
              if (tipeAutoRef.current === "masuk") {
                await tambahStokMasuk({ barang_id: dataBarang.id, jumlah: qty, keterangan: "Auto Scan" });
              } else {
                await tambahStokKeluar({ barang_id: dataBarang.id, jumlah: qty, keterangan: "Auto Scan" });
              }

              setHistory(prev => [{ ...dataBarang, waktu: new Date().toLocaleTimeString(), aksi: tipeAutoRef.current === "masuk" ? "Masuk" : "Keluar", jumlah: qty }, ...prev]);
              
              setTimeout(() => { 
                isProcessingRef.current = false;
                setAutoProcessingMsg("");
                lastScanRef.current = ""; 
              }, 2000);
            } else {
              setBarang(dataBarang);
              setError(null);
              setTimeout(() => { 
                isProcessingRef.current = false; 
                lastScanRef.current = ""; 
              }, 1000);
            }
          } catch (err) {
            setError(err.response?.data?.message || "Barang tidak ditemukan");
            isProcessingRef.current = false;
            setTimeout(() => { lastScanRef.current = ""; }, 2000);
          }
        }
      );
    } catch (err) {
      console.error("Camera Access Error:", err);
      setError("Izin kamera ditolak atau sedang digunakan aplikasi lain");
      setStatus("idle");
      setIsCameraActive(false);
    }
  };

  const handleManualAction = async (type) => {
    if (!barang) return;
    try {
      setLoadingAction(true);
      const qty = parseInt(jumlah) || 1;
      if (type === "masuk") {
        await tambahStokMasuk({ barang_id: barang.id, jumlah: qty, keterangan: "Manual Scan" });
      } else {
        await tambahStokKeluar({ barang_id: barang.id, jumlah: qty, keterangan: "Manual Scan" });
      }
      playBeep();
      setHistory(prev => [{ ...barang, waktu: new Date().toLocaleTimeString(), aksi: type === "masuk" ? "Masuk" : "Keluar", jumlah: qty }, ...prev]);
      
      setBarang(null);
      setJumlah(1);
      lastScanRef.current = "";
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "Error"));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-20">
        <PageHeader
          icon={<Camera size={22} />}
          title="QR Scanner System"
          subtitle="Inventory Logistics & Tracking"
          badge={{ label: "Scanner State", value: isCameraActive ? "ACTIVE" : "OFF" }}
          actions={
            <div className="flex items-center gap-2">
               <button onClick={toggleCamera} className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-2 ${isCameraActive ? "bg-white border-red-100 text-red-500 shadow-sm" : "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"}`}>
                 {isCameraActive ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                 {isCameraActive ? "Stop" : "Start"} Scanner
               </button>
               <button onClick={() => { setBarang(null); setError(null); lastScanRef.current = ""; }} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                 <RotateCcw size={18} />
               </button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border-[6px] border-white dark:border-slate-800 aspect-video md:aspect-auto md:h-[450px] flex items-center justify-center">
              <div id="reader" className="w-full h-full object-cover" />
              
              <AnimatePresence>
                {status === "scanning" && !autoProcessingMsg && !barang && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-64 h-48 border-2 border-white/20 rounded-3xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-blue-500/5"></div>
                       <div className="scan-laser-modern"></div>
                       <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                       <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                       <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                       <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                    </div>
                    <p className="mt-6 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">Focus barcode in frame</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {autoProcessingMsg && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-20 bg-emerald-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={32} />
                    </div>
                    <h4 className="text-xl font-black uppercase">Success</h4>
                    <p className="text-sm font-medium opacity-90 mt-2">{autoProcessingMsg}</p>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full">
                       <Loader2 size={12} className="animate-spin" /> Next scan in 2s
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isCameraActive && (
                <div className="absolute inset-0 z-30 bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Camera size={40} className="text-white/20" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wider">Scanner Paused</h3>
                  <p className="text-slate-400 text-xs mt-2 mb-8">Activate camera to start tracking</p>
                  <button onClick={startScanner} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95">Enable Camera</button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <Settings2 size={16} className="text-blue-500" />
                   <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scanner Mode</h2>
                </div>
                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                   <button onClick={() => setModeAuto(false)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!modeAuto ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400"}`}>Manual</button>
                   <button onClick={() => setModeAuto(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${modeAuto ? "bg-blue-600 text-white shadow-lg" : "text-slate-400"}`}>Auto Scan</button>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Action</h2>
                 </div>
                 <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    <button onClick={() => setTipeAuto("masuk")} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${tipeAuto === "masuk" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400"}`}>Stok Masuk</button>
                    <button onClick={() => setTipeAuto("keluar")} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${tipeAuto === "keluar" ? "bg-red-500 text-white shadow-lg" : "text-slate-400"}`}>Stok Keluar</button>
                 </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {barang ? (
                <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border-2 border-blue-500/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Package size={80} /></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">Item Scanned</span>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-3 leading-tight">{barang.nama_barang}</h3>
                        <p className="text-xs font-mono text-slate-400 mt-1 uppercase">{barang.kode_barang}</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl border border-emerald-100 text-center">
                        <p className="text-[8px] font-black uppercase opacity-60">In Stock</p>
                        <p className="text-lg font-black leading-none mt-1">{barang.stok} <span className="text-[10px] uppercase">{barang.satuan}</span></p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl mb-8">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3 text-center">Adjustment Quantity</label>
                       <div className="flex items-center justify-between gap-4">
                          <button onClick={() => setJumlah(Math.max(1, jumlah - 1))} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"><Minus size={20} /></button>
                          <input type="number" value={jumlah} onChange={(e) => setJumlah(parseInt(e.target.value) || 1)} className="flex-1 bg-transparent border-none text-center text-3xl font-black text-slate-800 dark:text-white focus:ring-0" />
                          <button onClick={() => setJumlah(jumlah + 1)} className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"><Plus size={20} /></button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => handleManualAction("masuk")} disabled={loadingAction} className="group relative flex flex-col items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-5 rounded-[2rem] transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                        {loadingAction ? <Loader2 size={24} className="animate-spin" /> : <ArrowDownCircle size={24} />}
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">Tambah Stok</span>
                      </button>
                      <button onClick={() => handleManualAction("keluar")} disabled={loadingAction} className="group relative flex flex-col items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white p-5 rounded-[2rem] transition-all shadow-xl shadow-rose-600/20 active:scale-95">
                        {loadingAction ? <Loader2 size={24} className="animate-spin" /> : <ArrowUpCircle size={24} />}
                        <span className="text-[10px] font-black uppercase tracking-[0.1em]">Kurang Stok</span>
                      </button>
                    </div>

                    <button onClick={() => { setBarang(null); lastScanRef.current = ""; }} className="w-full mt-4 py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">Dismiss</button>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div key="error" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900/50 p-10 rounded-[2.5rem] text-center">
                  <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={32} className="text-rose-500" />
                  </div>
                  <h4 className="text-rose-900 dark:text-rose-400 font-black uppercase tracking-wider">Detection Failed</h4>
                  <p className="text-rose-700 dark:text-rose-500 text-sm mt-2">{error}</p>
                  <button onClick={() => { setError(null); lastScanRef.current = ""; }} className="mt-8 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95">Try Next Item</button>
                </motion.div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-16 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 text-center">
                  <div className="relative mb-6">
                    <Package size={48} className="opacity-10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Zap size={24} className="text-blue-500/20 animate-pulse" />
                    </div>
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-1">Waiting for Scan</h4>
                  <p className="text-[10px] opacity-60">Camera is active. Bring any QR code or barcode to the frame.</p>
                </div>
              )}
            </AnimatePresence>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
               <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History size={18} className="text-blue-500" />
                    <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 dark:text-white">Recent Activity</h2>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-tighter">{history.length} Entries</span>
               </div>
               <div className="p-4 space-y-2">
                  {history.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No session history</p>
                    </div>
                  ) : (
                    history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] flex justify-between items-center ${item.aksi === "Masuk" ? "bg-emerald-50/30 border-emerald-100/50" : "bg-rose-50/30 border-rose-100/50"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.aksi === "Masuk" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                            {item.aksi === "Masuk" ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                          </div>
                          <div>
                            <p className="font-black text-[11px] uppercase text-slate-800 dark:text-white leading-tight">{item.nama_barang}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.waktu} • {item.jumlah} {item.satuan}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${item.aksi === "Masuk" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>{item.aksi}</div>
                      </motion.div>
                    ))
                  )}

                  {history.length > itemsPerPage && (
                    <div className="flex items-center justify-between pt-4 mt-2 border-t dark:border-slate-800">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black ${currentPage === 1 ? "text-slate-300 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50 transition-colors"}`}><ChevronLeft size={14} /> PREV</button>
                      <span className="text-[9px] font-black text-slate-400 tracking-widest">{currentPage} / {Math.ceil(history.length / itemsPerPage)}</span>
                      <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(history.length / itemsPerPage), p + 1))} disabled={currentPage >= Math.ceil(history.length / itemsPerPage)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black ${currentPage >= Math.ceil(history.length / itemsPerPage) ? "text-slate-300 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50 transition-colors"}`}>NEXT <ChevronRight size={14} /></button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .scan-laser-modern { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(to right, transparent, #3b82f6, transparent); box-shadow: 0 0 10px #3b82f6; animation: scan-move 3s ease-in-out infinite; }
        @keyframes scan-move { 0%, 100% { top: 10%; } 50% { top: 90%; } }
        .flash { animation: flash-animation 0.15s ease-out; }
        @keyframes flash-animation { 0% { background-color: transparent; } 50% { background-color: rgba(255,255,255,0.2); } 100% { background-color: transparent; } }
      `}</style>
    </MainLayout>
  );
}