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

  // 🔥 REFS UNTUK MENGATASI STALE CLOSURE PADA SCANNER
  const modeCepatRef = useRef(modeCepat);
  const tipeModeCepatRef = useRef(tipeModeCepat);
  const jumlahRef = useRef(jumlah);

  useEffect(() => { modeCepatRef.current = modeCepat; }, [modeCepat]);
  useEffect(() => { tipeModeCepatRef.current = tipeModeCepat; }, [tipeModeCepat]);
  useEffect(() => { jumlahRef.current = jumlah; }, [jumlah]);


  // =============================
  // INIT & SOUND
  // =============================
  useEffect(() => {
    beepRef.current = new Audio("/beep.mp3");

    startScanner();
    return () => stopScanner();
  }, []);



  const playBeep = () => {
    beepRef.current?.play().catch(() => {});
    document.body.classList.add("flash");
    setTimeout(() => document.body.classList.remove("flash"), 150);
  };

  // =============================
  // SCANNER CORE
  // =============================
  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        // Stop logic
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop().catch(() => {});
        }
        await scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      
      // PAKSA MATIKAN TRACK KAMERA (Hard Stop Hardware)
      const videoElements = document.getElementsByTagName('video');
      for (let i = 0; i < videoElements.length; i++) {
        const stream = videoElements[i].srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          videoElements[i].srcObject = null;
        }
      }

      setStatus("paused");
      setIsCameraActive(false);
    } catch (err) {
      if (!err?.toString().includes("is not running")) {
        console.error("STOP ERROR", err);
      }
    }
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopScanner();
    } else {
      setIsCameraActive(true);
      setBarang(null);
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
        await stopScanner();
        await new Promise(res => setTimeout(res, 300));
      }

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;
      setStatus("scanning");
      setIsCameraActive(true);
      setError(null);

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
            // Kotak responsif: 80% lebar, 60% tinggi
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return {
              width: qrboxSize,
              height: Math.floor(qrboxSize * 0.6) // Agak lebar untuk barcode
            };
          },
          aspectRatio: 1.0,
          formatsToSupport: formatsToSupport
        },
        async (decodedText) => {
          try {
            let kodeBarang = "";
            if (decodedText.startsWith("{")) {
              const parsed = JSON.parse(decodedText);
              kodeBarang = parsed.kode_barang;
            } else {
              kodeBarang = decodedText;
            }

            if (!kodeBarang) return;
            kodeBarang = kodeBarang.trim();

            if (lastScanRef.current === kodeBarang) return;
            lastScanRef.current = kodeBarang;
            setTimeout(() => { lastScanRef.current = ""; }, 2000);

            const res = await scanQR(kodeBarang);
            const dataBarang = res.data.data;
            playBeep();

            if (modeCepatRef.current) {
              try {
                if (tipeModeCepatRef.current === "masuk") {
                  await tambahStokMasuk({
                    barang_id: dataBarang.id,
                    jumlah: parseInt(jumlahRef.current) || 1,
                    keterangan: "Scan Auto (Mode Cepat)"
                  });
                } else {
                  await tambahStokKeluar({
                    barang_id: dataBarang.id,
                    jumlah: parseInt(jumlahRef.current) || 1,
                    keterangan: "Scan Auto (Mode Cepat)"
                  });
                }

                setHistory(prev => [
                  { 
                    ...dataBarang, 
                    waktu: new Date().toLocaleTimeString(),
                    aksi: tipeModeCepatRef.current === "masuk" ? "Masuk" : "Keluar",
                    jumlah: jumlahRef.current
                  },
                  ...prev
                ]);
              } catch (err) {
                const msg = err.response?.data?.message || "Gagal memproses stok";
                setError(`[GAGAL] ${dataBarang.nama_barang}: ${msg}`);
                playBeep(); // Bunyi bip sebagai tanda gagal
                await stopScanner(); // Berhenti agar user bisa baca error
              }
            } else {
              setBarang(dataBarang);
              await stopScanner();
            }
          } catch (err) {
            setError(err.response?.data?.message || "QR tidak terdaftar di sistem");
          }
        }
      );
    } catch (err) {
      setError("Izin kamera ditolak atau perangkat tidak mendukung");
      setStatus("idle");
    }
  };

  const handleMasuk = async () => {
    if (!barang) return;
    try {
      setLoadingAction(true);
      const qty = parseInt(jumlah) || 1;
      await tambahStokMasuk({
        barang_id: barang.id,
        jumlah: qty,
        keterangan: "Scan QR Manual"
      });
      playBeep();
      setHistory(prev => [
        { 
          ...barang, 
          waktu: new Date().toLocaleTimeString(), 
          aksi: "Masuk",
          jumlah: qty
        },
        ...prev
      ]);
      setBarang(null);
      await startScanner();
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "Terjadi kesalahan sistem"));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleKeluar = async () => {
    if (!barang) return;
    try {
      setLoadingAction(true);
      const qty = parseInt(jumlah) || 1;
      await tambahStokKeluar({ 
        barang_id: barang.id, 
        jumlah: qty, 
        keterangan: "Scan QR Manual" 
      });
      playBeep();
      setHistory(prev => [
        { ...barang, waktu: new Date().toLocaleTimeString(), aksi: "Keluar", jumlah: qty },
        ...prev
      ]);
      setBarang(null);
      await startScanner();
    } catch (err) {
      alert("Gagal: " + (err.response?.data?.message || "Stok mungkin tidak mencukupi"));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        {/* HEADER AREA */}
        <PageHeader
          icon={<Camera size={22} />}
          title="Scanner QR"
          subtitle="Inventory Logistics"
          badge={{ label: "Status Kamera", value: isCameraActive ? "Aktif" : "Mati" }}
          actions={
            <div className="flex items-center gap-2">
               <button 
                  onClick={toggleCamera}
                  className={`px-5 py-3 rounded-2xl transition flex items-center gap-2 text-xs font-black uppercase tracking-widest border-2 active:scale-95 ${isCameraActive ? "bg-white dark:bg-slate-800 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent hover:shadow-lg hover:shadow-emerald-500/25"}`}
               >
                 {isCameraActive ? <Square size={15} /> : <Play size={15} />}
                 {isCameraActive ? "Off" : "On"} Camera
               </button>
               <button 
                  onClick={() => { setBarang(null); startScanner(); }}
                  disabled={!isCameraActive}
                  className="px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 transition flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50 text-slate-500 active:scale-95"
               >
                 <RotateCcw size={15} /> Reset
               </button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SCANNER & CONFIG */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CONFIG CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b dark:border-slate-800">
                <Settings2 size={18} className="text-blue-500" />
                <h2 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Konfigurasi Scan</h2>
              </div>



              {/* MODE TOGGLE */}
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${modeCepat ? "border-amber-400 bg-amber-50 dark:bg-amber-900/10" : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${modeCepat ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-500"}`}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Mode Cepat (Auto)</p>
                      <p className="text-[10px] text-slate-400">Scan & Simpan otomatis ke database</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setModeCepat(!modeCepat)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${modeCepat ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${modeCepat ? "right-1" : "left-1"}`}></div>
                  </button>
                </div>
              </div>

              {modeCepat && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-2"
                >
                  {/* QUANTITY CONFIG (Hanya muncul jika Mode Cepat Aktif) */}
                  <div className="p-5 rounded-2xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">Jumlah Per Scan (Auto)</label>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Zap size={10} /> Mode Cepat
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        min="1"
                        max="10000"
                        value={jumlah}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val > 10000) setJumlah(10000);
                          else if (val < 1) setJumlah(1);
                          else setJumlah(val || 1);
                        }}
                        onKeyDown={(e) => ["e", "E", "-", "+"].includes(e.key) && e.preventDefault()}
                        className="w-20 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-xl text-sm font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <div className="flex gap-1 flex-1">
                        {[1, 5, 10, 50].map(val => (
                          <button 
                            key={val}
                            onClick={() => setJumlah(val)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${jumlah === val ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700"}`}
                          >
                            +{val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* TIPE MODE (MASUK/KELUAR) */}
                  <div className="flex gap-2">
                    <button onClick={() => setTipeModeCepat("masuk")} className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${tipeModeCepat === "masuk" ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-200" : "border-slate-100 dark:border-slate-800 text-slate-400"}`}>
                      TAMBAH (+)
                    </button>
                    <button onClick={() => setTipeModeCepat("keluar")} className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all border-2 ${tipeModeCepat === "keluar" ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-200" : "border-slate-100 dark:border-slate-800 text-slate-400"}`}>
                      KURANG (-)
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* SCANNER WINDOW */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-xl group border-4 border-white dark:border-slate-800 flex items-center justify-center min-h-[320px]">
              <div id="reader" className="w-full" />
              
              <AnimatePresence>
                {status === "scanning" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-[40px] border-black/40"></div>
                    <div className="absolute inset-[40px] border-2 border-white/30 rounded-3xl">
                       <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-xl"></div>
                       <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-xl"></div>
                       <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-xl"></div>
                       <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-xl"></div>
                       <div className="scan-laser-modern"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {status === "paused" && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4">
                    <Square size={32} className="text-white/40" />
                  </div>
                  <p className="font-bold">Kamera Berhenti</p>
                  <button onClick={startScanner} className="mt-4 bg-blue-600 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    <Play size={16}/> Lanjutkan Scan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RESULTS & HISTORY */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* RESULT CARD */}
            <AnimatePresence mode="wait">
              {barang ? (
                <motion.div 
                  key="result"
                  initial={{ x: 30, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  exit={{ x: -20, opacity: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border-t-4 border-blue-500 text-center"
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                    <Package size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white capitalize">{barang.nama_barang}</h3>
                  <p className="font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{barang.kode_barang}</p>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Stok: {barang.stok} {barang.satuan || 'Pcs'}
                      </span>
                    </div>
                  </div>
                  
                  {/* QUANTITY INPUT FOR MANUAL MODE */}
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesuaikan Quantity</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setJumlah(Math.max(1, jumlah - 1))}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xl active:scale-90 transition-transform"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        min="1"
                        max="10000"
                        value={jumlah}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val > 10000) setJumlah(10000);
                          else if (val < 1) setJumlah(1);
                          else setJumlah(val || 1);
                        }}
                        onKeyDown={(e) => ["e", "E", "-", "+"].includes(e.key) && e.preventDefault()}
                        className="w-24 bg-slate-50 dark:bg-slate-800 border-2 border-blue-100 dark:border-blue-900/30 px-4 py-3 rounded-2xl text-center font-black text-blue-600 text-xl outline-none"
                      />
                      <button 
                        onClick={() => setJumlah(jumlah + 1)}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xl active:scale-90 transition-transform"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button 
                      onClick={handleMasuk} 
                      disabled={loadingAction}
                      className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-2xl shadow-lg shadow-green-500/20 transition-all active:scale-95 flex flex-col items-center gap-1"
                    >
                      <ArrowDownCircle size={22} />
                      <span className="text-[10px] font-black">KONFIRMASI MASUK</span>
                    </button>
                    <button 
                      onClick={handleKeluar}
                      disabled={loadingAction}
                      className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-95 flex flex-col items-center gap-1"
                    >
                      <ArrowUpCircle size={22} />
                      <span className="text-[10px] font-black">KONFIRMASI KELUAR</span>
                    </button>
                  </div>
                  <button onClick={handleScanUlang} className="mt-3 w-full py-2 text-slate-400 text-[10px] font-bold flex items-center justify-center gap-2 hover:text-blue-600 transition-colors">
                    <RotateCcw size={12} /> Batal & Scan Ulang
                  </button>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/30 p-8 rounded-[2.5rem] text-center"
                >
                  <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                  <p className="text-red-700 dark:text-red-400 font-bold">{error}</p>
                  <button onClick={handleScanUlang} className="mt-4 text-xs font-bold text-red-600 border-b border-red-600">Terjangkau & Coba Lagi</button>
                </motion.div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-100 dark:border-slate-800 flex items-center justify-center">
                       <Camera size={32} className="opacity-40" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-sm font-medium">Menunggu data scan...</p>
                </div>
              )}
            </AnimatePresence>

            {/* HISTORY CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col transition-all">
               <div className="p-6 lg:px-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      <History size={18} />
                    </div>
                    <div>
                      <h2 className="font-black text-xs uppercase tracking-widest text-slate-800 dark:text-white">Aktivitas Scan</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{history.length} sesi ini</p>
                    </div>
                  </div>
               </div>
               
               <div className="p-4 lg:p-6 space-y-3">
                  {history.length === 0 ? (
                    <div className="py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed text-center flex flex-col items-center justify-center">
                      <History size={32} className="text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Belum ada aktivitas scan</p>
                    </div>
                  ) : (
                    history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, i) => (
                      <motion.div 
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        key={item.waktu + i} 
                        className={`p-5 rounded-2xl border-2 flex justify-between items-center transition-all ${item.aksi === "Masuk" ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30" : "bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30"}`}
                      >
                        <div>
                          <p className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">{item.nama_barang}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                             <span className="text-[10px] text-slate-500 font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700">{item.waktu}</span>
                             <span className="text-[10px] text-blue-600 font-black bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800/50">QTY: {item.jumlah}</span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Sisa: {item.aksi === "Masuk" ? (item.stok + parseInt(item.jumlah)) : (item.stok - parseInt(item.jumlah))} {item.satuan}</span>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${item.aksi === "Masuk" ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 shadow-emerald-500/25" : "bg-gradient-to-r from-rose-500 to-red-600 text-white border-rose-400 shadow-rose-500/25"}`}>
                          {item.aksi}
                        </div>
                      </motion.div>
                    ))
                  )}
               </div>

               {/* PAGINATION SCAN HISTORY */}
               {history.length > itemsPerPage && (
                 <div className="flex items-center justify-between p-6 lg:px-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, history.length)} dari {history.length}
                    </span>
                    <div className="flex gap-2">
                       <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                       >
                         <ChevronLeft size={16} />
                       </button>
                       <button
                          onClick={() => setCurrentPage(p => Math.min(Math.ceil(history.length / itemsPerPage), p + 1))}
                          disabled={currentPage === Math.ceil(history.length / itemsPerPage)}
                          className="p-2 bg-white dark:bg-slate-800 text-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all disabled:opacity-30 disabled:scale-100 active:scale-95"
                       >
                         <ChevronRight size={16} />
                       </button>
                    </div>
                 </div>
               )}
            </div>

          </div>
        </div>
      </div>
      
      <style>{`
        .scan-laser-modern {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, transparent, #3b82f6, transparent);
          box-shadow: 0 0 15px #3b82f6;
          animation: scan-move 2.5s ease-in-out infinite;
        }
        @keyframes scan-move {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        .flash {
          animation: flash-animation 0.15s ease-out;
        }
        @keyframes flash-animation {
          0% { background-color: rgba(255,255,255,0); }
          50% { background-color: rgba(255,255,255,0.4); }
          100% { background-color: rgba(255,255,255,0); }
        }
      `}</style>
    </MainLayout>
  );
}