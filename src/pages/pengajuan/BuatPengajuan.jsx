import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import MainLayout from "../../components/layout/MainLayout";
import { Search, Plus, Minus, Trash2, ClipboardList, AlertCircle, CheckCircle, PackageSearch, FileText, Send, RefreshCw, X, Package } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { getBarang } from "../../services/barangService";
import { createPengajuan, updatePengajuan } from "../../services/pengajuanService";
import { UPLOAD_URL } from "../../utils/api";
import { ListBarangSkeleton } from "../../components/common/Skeleton";
import ImagePreview from "../../components/common/ImagePreview";
import { getUser, getRole } from "../../utils/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function BuatPengajuan() {
  const [barang, setBarang] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [jumlah, setJumlah] = useState(1);
  const [cart, setCart] = useState([]);
  const [loadingBarang, setLoadingBarang] = useState(true);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [urgensi, setUrgensi] = useState("normal");
  const [filterKategori, setFilterKategori] = useState("");

  const user = getUser();
  const role = getRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { 
    loadBarang(); 
    
    // ✅ EDIT MODE HANDLING
    if (location.state?.editMode) {
        const { existingData, editId } = location.state;
        
        // Map data dari format detail ke format cart
        const mappedCart = existingData.map(item => ({
            id: item.barang_id || item.id, // backend join pake barang_id
            nama: item.nama_barang,
            satuan: item.satuan,
            stok: item.stok_tersedia || 0, // Fallback
            stok_tersedia: item.stok_tersedia || 0,
            foto: item.foto,
            jumlah: item.jumlah
        }));

        setCart(mappedCart);
        setCatatan(existingData[0]?.catatan || "");
        setUrgensi(existingData[0]?.urgensi || "normal");

        Swal.fire({
            icon: "info",
            title: "Mode Edit",
            text: "Silakan ubah rincian pengajuan Anda",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    }
    
    // ✅ AUTO-ADD FROM CATALOG STATE (If not edit mode)
    else if (location.state?.directItem) {
        const item = location.state.directItem;
        
        // Pengecekan stok tersedia sebelum auto-add
        const available = Number(item.stok_tersedia ?? item.stok ?? 0);
        
        if (available <= 0) {
            Swal.fire({
                icon: "error",
                title: "Gagal Menambahkan",
                text: `Maaf, stok "${item.nama_barang}" sudah habis (dalam antrean).`
            });
            window.history.replaceState({}, document.title);
            return;
        }

        setTimeout(() => {
            const newItem = {
                id: item.id,
                nama: item.nama_barang,
                satuan: item.satuan,
                stok: item.stok,
                stok_tersedia: available,
                foto: item.foto,
                jumlah: 1
            };
            
            setCart(prev => {
                if (prev.find(i => i.id === item.id)) return prev;
                return [...prev, newItem];
            });
            
            Swal.fire({
                icon: "success",
                title: "Barang Terpilih",
                text: `${item.nama_barang} otomatis ditambahkan ke daftar`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            window.history.replaceState({}, document.title);
        }, 300);
    }
  }, []);

  const loadBarang = async () => {
    setLoadingBarang(true);
    try { 
      const res = await getBarang(); 
      setBarang(res.data); 
    }
    catch (err) { console.log(err); }
    finally { setLoadingBarang(false); }
  };

  // Fuzzy Search Algorithm
  const fuzzyMatch = (pattern, str) => {
    if (!pattern) return true;
    const cleanPattern = pattern.toLowerCase().replace(/\s+/g, '');
    const cleanStr = str.toLowerCase();
    let pIdx = 0;
    for (let i = 0; i < cleanStr.length; i++) {
        if (cleanStr[i] === cleanPattern[pIdx]) pIdx++;
        if (pIdx === cleanPattern.length) return true;
    }
    return false;
  };

  const filteredBarang = barang.filter(item => {
    const matchSearch = fuzzyMatch(search, item.nama_barang);
    const matchKategori = filterKategori ? item.nama_kategori === filterKategori : true;
    return matchSearch && matchKategori;
  });

  const addBarang = () => {
    if (!selectedBarang) { Swal.fire({ icon: "warning", title: "Perhatian", text: "Pilih barang terlebih dahulu" }); return; }
    if (!jumlah || jumlah <= 0) { Swal.fire({ icon: "warning", title: "Perhatian", text: "Jumlah harus lebih dari 0" }); return; }

    const exist = cart.find(i => i.id === selectedBarang.id);
    const newTotal = exist ? exist.jumlah + jumlah : jumlah;

    if (newTotal > selectedBarang.stok_tersedia) {
      Swal.fire({ 
         icon: "error", 
         title: "Melebihi Stok! 🚫", 
         text: exist 
            ? `Daftar Anda sudah ada ${exist.jumlah}. Jika ditambah ${jumlah} jadinya ${newTotal}, tetapi sisa stok hanya ${selectedBarang.stok_tersedia} ${selectedBarang.satuan}.`
            : `Anda meminta ${jumlah}, tetapi sisa tersedia untuk ${selectedBarang.nama_barang} hanya ${selectedBarang.stok_tersedia} ${selectedBarang.satuan}.`
      });
      return;
    }

    if (exist) {
      setCart(cart.map(i => i.id === selectedBarang.id ? { ...i, jumlah: newTotal } : i));
    } else {
      setCart([...cart, { id: selectedBarang.id, nama: selectedBarang.nama_barang, satuan: selectedBarang.satuan, stok: selectedBarang.stok, stok_tersedia: selectedBarang.stok_tersedia, foto: selectedBarang.foto, jumlah }]);
    }
    setJumlah(1); setSelectedBarang(null);
    Swal.fire({ icon: "success", title: "Ditambahkan!", text: `${selectedBarang.nama_barang} (${jumlah} ${selectedBarang.satuan}) masuk ke daftar`, timer: 1500, showConfirmButton: false });
  };

  const removeItem = (id) => {
    const item = cart.find(i => i.id === id);
    setCart(cart.filter(i => i.id !== id));
    Swal.fire({ icon: "info", title: "Dihapus", text: `${item?.nama} dihapus dari daftar`, timer: 1200, showConfirmButton: false });
  };

  const updateCartQty = (id, delta) => {
    setCart(cart.map(i => {
      if (i.id !== id) return i;
      const newQty = Math.max(1, i.jumlah + delta);
      if (newQty > i.stok_tersedia) {
        Swal.fire({ icon: "error", title: "Melebihi Stok", text: `Maksimal ${i.stok_tersedia} ${i.satuan}`, timer: 1500, showConfirmButton: false });
        return i;
      }
      return { ...i, jumlah: newQty };
    }));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) { Swal.fire({ icon: "warning", title: "Perhatian", text: "Tambahkan barang terlebih dahulu" }); return; }
    const payload = {
      user_id: user.id,
      items: cart.map(item => ({ barang_id: item.id, jumlah: item.jumlah })),
      catatan,
      role,
      urgensi
    };

    setLoading(true);
    try {
      if (location.state?.editMode) {
        await updatePengajuan(location.state.editId, payload);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Pengajuan berhasil diperbarui", timer: 2000, showConfirmButton: false });
      } else {
        await createPengajuan(payload);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Pengajuan berhasil dikirim", timer: 2000, showConfirmButton: false });
      }
      navigate("/list-pengajuan");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal mengirim pengajuan" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white focus:bg-white transition text-sm placeholder-slate-400 font-medium";

  return (
    <MainLayout>
      <div className="space-y-6 pb-20">

        <PageHeader
          icon={<ClipboardList size={22} />}
          title={location.state?.editMode ? "Ubah Pengajuan" : (getRole() === "staff" ? "Katalog & Pesan Barang" : "Buat Pengajuan")}
          subtitle={location.state?.editMode ? `Mengubah rincian berkas pengajuan` : "Pilih barang kebutuhan operasional dari katalog"}
          actions={
            <button onClick={() => navigate("/list-pengajuan")} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 hover:text-slate-800 transition-all active:scale-95 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm">
              <X size={16} /> Batal
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: ITEM SELECTOR */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SELECTION AREA */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"><PackageSearch size={16} /></div>
                  <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Katalog Pemesanan</h2>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{barang.length} Barang</span>
              </div>

              <div className="p-8 space-y-6">
                {/* SEARCH BAR */}
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari barang kebutuhan Anda..." 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setSelectedBarang(null); }}
                    className={`${inputClass} pl-14 pr-12 h-14 text-base shadow-sm group-hover:border-blue-200`} 
                  />
                  {search && (
                    <button onClick={() => { setSearch(""); setSelectedBarang(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={18} /></button>
                  )}
                </div>

                {/* FILTERS */}
                {(() => {
                  const categories = [...new Set(barang.map(b => b.nama_kategori).filter(Boolean))];
                  return categories.length > 0 && (
                    <div className="flex gap-2.5 flex-wrap items-center">
                      <button onClick={() => setFilterKategori("")}
                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${!filterKategori ? "bg-slate-800 text-white border-slate-800 shadow-xl shadow-slate-900/10 scale-105" : "bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-300"}`}>
                        Semua
                      </button>
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setFilterKategori(cat)}
                          className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterKategori === cat ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20 scale-105" : "bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-blue-300"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* GRID BARANG */}
                <div className="pt-2">
                  {loadingBarang ? (
                    <ListBarangSkeleton />
                  ) : filteredBarang.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredBarang.map(item => {
                        const available = Number(item.stok_tersedia || 0);
                        const isOutOfStock = available <= 0;
                        const isLowStock = available > 0 && available <= 5;
                        const isInCart = cart.some(c => c.id === item.id);
                        
                        return (
                          <div key={item.id}
                            onClick={() => { if (!isOutOfStock) { setSelectedBarang(item); setJumlah(1); } }}
                            className={`group relative rounded-[2rem] border-2 transition-all p-3 flex flex-col items-center text-center gap-3
                              ${isOutOfStock ? "bg-slate-50 dark:bg-slate-800/20 border-slate-50 dark:border-slate-800 opacity-60 grayscale cursor-not-allowed" : "bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer active:scale-95"}`}>
                            
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                              <img src={item.foto ? `${UPLOAD_URL}/${item.foto}` : "/no-image.png"} alt={item.nama_barang} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                              <div className="absolute top-2 right-2">
                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-lg backdrop-blur-md shadow-sm border
                                  ${isOutOfStock ? "bg-rose-500/90 text-white border-rose-400" : 
                                    isLowStock ? "bg-amber-500/90 text-white border-amber-400" : 
                                    "bg-emerald-500/90 text-white border-emerald-400"}`}>
                                  {isOutOfStock ? "Stok Habis" : isLowStock ? `Sisa ${available}` : `Tersedia ${available}`}
                                </span>
                              </div>
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
                                   <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">Stok Habis</span>
                                </div>
                              )}
                            </div>

                            <div className="w-full">
                              <h3 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-2 min-h-[30px] leading-snug">{item.nama_barang}</h3>
                              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.nama_kategori || "-"}</p>
                            </div>

                            {isInCart && (
                              <div className="absolute bottom-3 right-3 bg-blue-600 text-white p-1.5 rounded-xl shadow-lg ring-4 ring-white dark:ring-slate-900 border border-blue-400 animate-in">
                                <Plus size={12} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700">
                        <PackageSearch size={32} className="text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Barang Tidak Ditemukan</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Coba kata kunci lain atau filter kategori</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CART & SUMMARY (STICKY) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            {/* QUICK QUANTITY MODAL-LIKE PICKER (Only if item selected) */}
            <AnimatePresence>
              {selectedBarang && (
                <div className="bg-gradient-to-br from-blue-700 to-sky-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl" />
                  
                  <div className="relative z-10 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border border-white/20 bg-white/10 p-1">
                          <img src={selectedBarang.foto ? `${UPLOAD_URL}/${selectedBarang.foto}` : "/no-image.png"} className="w-full h-full object-cover rounded-lg" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black uppercase tracking-widest line-clamp-1">{selectedBarang.nama_barang}</h4>
                          <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Sisa: {selectedBarang.stok_tersedia} {selectedBarang.satuan}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedBarang(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex items-center justify-center gap-5 pt-2">
                       <button onClick={() => setJumlah(prev => Math.max(1, prev - 1))} className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"><Minus size={20} /></button>
                       <input type="number" value={jumlah} onChange={(e) => setJumlah(Math.min(selectedBarang.stok_tersedia, Math.max(1, parseInt(e.target.value) || 1)))} 
                          className="bg-transparent text-4xl font-black w-24 text-center outline-none" />
                       <button onClick={() => setJumlah(prev => Math.min(selectedBarang.stok_tersedia, prev + 1))} className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"><Plus size={20} /></button>
                    </div>

                    <button onClick={addBarang} className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-blue-50 transition-all transform active:scale-95">
                      Tambahkan ke Daftar
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* THE CART LIST */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-white/40 dark:border-slate-800 flex flex-col max-h-[70vh]">
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20"><ClipboardList size={18} /></div>
                  <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Ringkasan Daftar</h2>
                </div>
                {cart.length > 0 && <button onClick={() => setCart([])} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline">Hapus Semua</button>}
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                {cart.length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <Package size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Belum ada barang dipilih</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={item.id} className="group relative flex items-center gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-400">
                      <ImagePreview src={item.foto ? `${UPLOAD_URL}/${item.foto}` : "/no-image.png"} alt={item.nama} size="sm" />
                       <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight truncate leading-none mb-1">{item.nama}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-lg">{item.jumlah} {item.satuan}</span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Sisa: {item.stok_tersedia}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => updateCartQty(item.id, -1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><Minus size={12} /></button>
                         <button onClick={() => updateCartQty(item.id, 1)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"><Plus size={12} /></button>
                         <button onClick={() => removeItem(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-1"><Trash2 size={14} /></button>
                       </div>
                    </div>
                  ))
                )}
              </div>

              {/* NOTES & URGENSI — Inside the sticky right panel now */}
              <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} className="text-amber-500" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Keterangan / Keperluan</label>
                  </div>
                  <textarea rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)}
                    className={`${inputClass} resize-none mb-4`} placeholder="Bekerja untuk unit..." />
                  
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={14} className="text-rose-500" />
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tingkat Urgensi</label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["normal", "penting", "darurat"].map(val => (
                      <button key={val} onClick={() => setUrgensi(val)}
                        className={`py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border-2 
                          ${urgensi === val ? 
                            (val === 'normal' ? "bg-blue-50 border-blue-500 text-blue-600 shadow-lg shadow-blue-500/10" : 
                             val === 'penting' ? "bg-amber-50 border-amber-500 text-amber-600 shadow-lg shadow-amber-500/10" : 
                             "bg-rose-50 border-rose-500 text-rose-600 shadow-lg shadow-rose-500/10") 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200"}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="group relative">
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading || cart.length === 0}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-700 to-sky-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                      {location.state?.editMode ? "Simpan Perubahan" : "Ajukan Pengajuan"}
                    </button>
                    {cart.length === 0 && (
                      <span className="absolute -top-12 left-1/2 -translate-x-1/2 w-max px-3 py-2 bg-slate-800 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        Belum ada barang di daftar
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}