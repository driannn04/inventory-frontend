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
  User,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { scanQR } from "../../services/barangService";
import { tambahStokMasuk, tambahStokKeluar } from "../../services/stokService";

import PageHeader from "../../components/common/PageHeader";

export default function ScanQR() {
  const scannerRef = useRef(null);
  const lastScanRef = useRef("");
  const beepRef = useRef(null);
  const isProcessingRef = useRef(false);

  const [barang, setBarang] = useState(null);

  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const [status, setStatus] = useState("idle"); // idle | scanning | paused
  const [modeCepat, setModeCepat] = useState(false);
  const [tipeModeCepat, setTipeModeCepat] = useState("masuk"); // masuk | keluar
  const [jumlah, setJumlah] = useState(1);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const modeCepatRef = useRef(modeCepat);
  const tipeModeCepatRef = useRef(tipeModeCepat);
  const jumlahRef = useRef(jumlah);

  useEffect(() => { modeCepatRef.current = modeCepat; }, [modeCepat]);
  useEffect(() => { tipeModeCepatRef.current = tipeModeCepat; }, [tipeModeCepat]);
  useEffect(() => { jumlahRef.current = jumlah; }, [jumlah]);


  useEffect(() => {
    beepRef.current = new Audio("/beep.mp3");
    startScanner();
    return () => {
        // Cleanup aman saat pindah halaman
        handleCleanup();
    };
  }, []);

  const handleCleanup = async () => {
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
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning()) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {}
    hardStopTracks();
  };

  const toggleCamera = () => {
    if (isCameraActive) stopScanner();
    else {
        setIsCameraActive(true);
        setTimeout(() => startScanner(), 100);
    }
  };

  const handleScanUlang = async () => {
    setBarang(null);
    setError(null);
    await startScanner();
  };

  const startScanner = async () => {
    try {
      if (scannerRef.current) {
        await handleCleanup();
      }

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;
      setStatus("scanning");
      setIsCameraActive(true);
      setError(null);
      isProcessingRef.current = false;

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.ITF,
      ];

      await scanner.start(
        { facingMode: "environment" },
        { 
          fps: 15, 
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.max(150, Math.floor(minEdge * 0.7));
            return { width: qrboxSize, height: Math.max(100, Math.floor(qrboxSize * 0.6)) };
          },
          aspectRatio: 1.0,
          formatsToSupport: formatsToSupport
        },
        async (decodedText) => {
          if (isProcessingRef.current) return;

          let kodeBarang = decodedText.trim();
          if (decodedText.startsWith("{")) {
            try { kodeBarang = JSON.parse(decodedText).kode_barang; } catch(e) { kodeBarang = decodedText; }
          }
          if (!kodeBarang) return;

          // JANGAN SCAN ULANG BARANG YANG SAMA TERLALU CEPAT
          if (lastScanRef.current === kodeBarang) return;
          
          isProcessingRef.current = true;
          lastScanRef.current = kodeBarang;

          try {
            const res = await scanQR(kodeBarang);
            const dataBarang = res.data.data;
            playBeep();

            if (modeCepatRef.current) {
                const qty = parseInt(jumlahRef.current) || 1;
                if (tipeModeCepatRef.current === "masuk") {
                    await tambahStokMasuk({ barang_id: dataBarang.id, jumlah: qty, keterangan: "Auto Scan" });
                } else {
                    await tambahStokKeluar({ barang_id: dataBarang.id, jumlah: qty, keterangan: "Auto Scan" });
                }

                setHistory(prev => [{ ...dataBarang, waktu: new Date().toLocaleTimeString(), aksi: tipeModeCepatRef.current === "masuk" ? "Masuk" : "Keluar", jumlah: qty }, ...prev]);
                
                // Jeda 3 detik agar user bisa menjauhkan barcode dari kamera
                setTimeout(() => { 
                    isProcessingRef.current = false;
                    lastScanRef.current = ""; 
                }, 3000);
            } else {
              setBarang(dataBarang);
              await stopScanner();
              isProcessingRef.current = false;
            }
          } catch (err) {
            setError(err.response?.data?.message || "Barang tidak ditemukan");
            isProcessingRef.current = false;
            setTimeout(() => { lastScanRef.current = ""; }, 2000);
          }
        }
      );
    } catch (err) {
      setError("Gagal mengakses kamera");
      setStatus("idle");
    }
  };

  const handleManualAction = async (type) => {
    if (!barang) return;
    try {
      setLoadingAction(true);
      const qty = parseInt(jumlah) || 1;
      if (type === "masuk") {
        await tambahStokMasuk({ barang_id: barang.id, jumlah: qty, keterangan: "Scan QR Manual" });
      } else {
        await tambahStokKeluar({ barang_id: barang.id, jumlah: qty, keterangan: "Scan QR Manual" });
      }
      playBeep();
      setHistory(prev => [{ ...barang, waktu: new Date().toLocaleTimeString(), aksi: type === "masuk" ? "Masuk" : "Keluar", jumlah: qty }, ...prev]);
      setBarang(null);
      lastScanRef.current = ""; 
      await startScanner();
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "Error"));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        <PageHeader
          icon={<Camera size={22} />}
          title="Scanner QR"
          subtitle="Inventory Logistics"
          badge={{ label: "Status Kamera", value: isCameraActive ? "Aktif" : "Mati" }}
          actions={
            <div className="flex items-center gap-2">
               <button onClick={toggleCamera} className={`px-5 py-3 rounded-2xl transition flex items-center gap-2 text-xs font-black uppercase tracking-widest border-2 active:scale-95 ${isCameraActive ? "bg-white border-red-200 text-red-600" : "bg-emerald-500 text-white border-transparent"}`}>
                 {isCameraActive ? <Square size={15} /> : <Play size={15} />}
                 {isCameraActive ? "Off" : "On"} Camera
               </button>
               <button onClick={() => { setBarang(null); setError(null); startScanner(); }} className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-black uppercase text-slate-500 active:scale-95">
                 <RotateCcw size={15} /> Reset
               </button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b dark:border-slate-800">
                <Settings2 size={18} className="text-blue-500" />
                <h2 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Konfigurasi Scan</h2>
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${modeCepat ? "border-amber-400 bg-amber-50" : "bg-slate-50 border-slate-100"}`}>
                  <div className="flex items-center gap-3">
                    <Zap size={20} className={modeCepat ? "text-amber-500" : "text-slate-300"} />
                    <div><p className="font-bold text-sm text-slate-800">Mode Cepat (Auto)</p></div>
                  </div>
                  <button onClick={() => setModeCepat(!modeCepat)} className={`w-12 h-6 rounded-full relative transition-colors ${modeCepat ? "bg-amber-500" : "bg-slate-300"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${modeCepat ? "right-1" : "left-1"}`}></div>
                  </button>
                </div>
              </div>
              {modeCepat && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-100 space-y-3">
                    <label className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Jumlah Per Scan</label>
                    <div className="flex gap-2">
                      <input type="number" min="1" value={jumlah} onChange={(e) => setJumlah(parseInt(e.target.value) || 1)} className="w-20 bg-white border border-blue-200 px-3 py-2 rounded-xl text-sm font-black text-blue-600 outline-none" />
                      <div className="flex gap-1 flex-1">
                        {[1, 5, 10, 50].map(val => ( <button key={val} onClick={() => setJumlah(val)} className={`flex-1 py-2 rounded-xl text-[10px] font-black ${jumlah === val ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-100"}`}>+{val}</button> ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setTipeModeCepat("masuk")} className={`flex-1 py-3 rounded-2xl text-xs font-bold border-2 ${tipeModeCepat === "masuk" ? "bg-green-600 border-green-600 text-white" : "text-slate-400 border-slate-100"}`}>TAMBAH (+)</button>
                    <button onClick={() => setTipeModeCepat("keluar")} className={`flex-1 py-3 rounded-2xl text-xs font-bold border-2 ${tipeModeCepat === "keluar" ? "bg-red-600 border-red-600 text-white" : "text-slate-400 border-slate-100"}`}>KURANG (-)</button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl border-4 border-white dark:border-slate-800 flex items-center justify-center min-h-[320px]">
              <div id="reader" className="w-full" />
              <AnimatePresence>
                {status === "scanning" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-[40px] border-black/40"></div>
                    <div className="absolute inset-[40px] border-2 border-white/30 rounded-3xl">
                       <div className="scan-laser-modern"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!isCameraActive && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
                  <Square size={32} className="text-white/40 mb-4" />
                  <p className="font-bold">Kamera Off</p>
                  <button onClick={startScanner} className="mt-4 bg-blue-600 px-6 py-2 rounded-xl text-sm font-bold">Mulai Scan</button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {barang ? (
                <motion.div key="result" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-t-4 border-blue-500 text-center">
                  <Package size={48} className="mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-black">{barang.nama_barang}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">{barang.kode_barang}</p>
                  <div className="mt-4 inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[11px] font-black uppercase tracking-wider">Stok: {barang.stok} {barang.satuan}</div>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setJumlah(Math.max(1, jumlah - 1))} className="w-10 h-10 rounded-xl bg-slate-100 font-bold">-</button>
                      <input type="number" value={jumlah} onChange={(e) => setJumlah(parseInt(e.target.value) || 1)} className="w-24 bg-slate-50 border-2 border-blue-100 py-3 rounded-2xl text-center font-black text-blue-600 text-xl" />
                      <button onClick={() => setJumlah(jumlah + 1)} className="w-10 h-10 rounded-xl bg-slate-100 font-bold">+</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={() => handleManualAction("masuk")} disabled={loadingAction} className="bg-green-600 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center gap-1"><ArrowDownCircle size={22} /><span className="text-[10px] font-black uppercase">Masuk</span></button>
                    <button onClick={() => handleManualAction("keluar")} disabled={loadingAction} className="bg-red-600 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center gap-1"><ArrowUpCircle size={22} /><span className="text-[10px] font-black uppercase">Keluar</span></button>
                  </div>
                  <button onClick={handleScanUlang} className="mt-3 w-full py-2 text-slate-400 text-[10px] font-bold flex items-center justify-center gap-2 underline">Batal & Scan Ulang</button>
                </motion.div>
              ) : error ? (
                <motion.div key="error" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] text-center">
                  <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                  <p className="text-red-700 font-bold">{error}</p>
                  <button onClick={handleScanUlang} className="mt-4 text-xs font-bold text-red-600 underline">Coba Lagi</button>
                </motion.div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <Camera size={32} className="opacity-20 mb-2" />
                  <p className="text-sm font-medium">Menunggu data scan...</p>
                </div>
              )}
            </AnimatePresence>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
               <div className="p-6 border-b flex items-center gap-3">
                  <History size={18} className="text-blue-500" />
                  <h2 className="font-black text-xs uppercase tracking-widest">Riwayat Sesi Ini</h2>
               </div>
               <div className="p-6 space-y-3">
                  {history.length === 0 ? <p className="text-center py-6 text-slate-300 text-[10px] font-bold uppercase">Belum ada data</p> : history.slice(0, 5).map((item, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex justify-between items-center ${item.aksi === "Masuk" ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"}`}>
                        <div>
                          <p className="font-black text-xs uppercase">{item.nama_barang}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-0.5">{item.waktu} • {item.jumlah} {item.satuan}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${item.aksi === "Masuk" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{item.aksi}</div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .scan-laser-modern { position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(to right, transparent, #3b82f6, transparent); box-shadow: 0 0 15px #3b82f6; animation: scan-move 2.5s ease-in-out infinite; }
        @keyframes scan-move { 0%, 100% { top: 0%; } 50% { top: 100%; } }
        .flash { animation: flash-animation 0.15s ease-out; }
        @keyframes flash-animation { 0% { background-color: rgba(255,255,255,0); } 50% { background-color: rgba(255,255,255,0.4); } 100% { background-color: rgba(255,255,255,0); } }
      `}</style>
    </MainLayout>
  );
}