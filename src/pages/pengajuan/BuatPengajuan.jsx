import { useState, useEffect } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Search, Plus, Minus, Trash2, ClipboardList, AlertCircle, CheckCircle, PackageSearch, FileText, Send, RefreshCw, X, Package } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { getBarang } from "../../services/barangService";
import { createPengajuan } from "../../services/pengajuanService";
import { ListBarangSkeleton } from "../../components/common/Skeleton";
import ImagePreview from "../../components/common/ImagePreview";
import { getUser, getRole } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => { loadBarang(); }, []);

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
    if (!selectedBarang) { import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Perhatian", text: "Pilih barang terlebih dahulu" })); return; }
    if (!jumlah || jumlah <= 0) { import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Perhatian", text: "Jumlah harus lebih dari 0" })); return; }

    const exist = cart.find(i => i.id === selectedBarang.id);
    const newTotal = exist ? exist.jumlah + jumlah : jumlah;

    if (newTotal > selectedBarang.stok_tersedia) {
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ 
         icon: "error", 
         title: "Melebihi Stok! 🚫", 
         text: exist 
            ? `Daftar Anda sudah ada ${exist.jumlah}. Jika ditambah ${jumlah} jadinya ${newTotal}, tetapi sisa stok hanya ${selectedBarang.stok_tersedia} ${selectedBarang.satuan}.`
            : `Anda meminta ${jumlah}, tetapi sisa tersedia untuk ${selectedBarang.nama_barang} hanya ${selectedBarang.stok_tersedia} ${selectedBarang.satuan}.`
      }));
      return;
    }

    if (exist) {
      setCart(cart.map(i => i.id === selectedBarang.id ? { ...i, jumlah: newTotal } : i));
    } else {
      setCart([...cart, { id: selectedBarang.id, nama: selectedBarang.nama_barang, satuan: selectedBarang.satuan, stok: selectedBarang.stok, stok_tersedia: selectedBarang.stok_tersedia, foto: selectedBarang.foto, jumlah }]);
    }
    setJumlah(1); setSelectedBarang(null);
    import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "success", title: "Ditambahkan!", text: `${selectedBarang.nama_barang} (${jumlah} ${selectedBarang.satuan}) masuk ke daftar`, timer: 1500, showConfirmButton: false }));
  };

  const removeItem = (id) => {
    const item = cart.find(i => i.id === id);
    setCart(cart.filter(i => i.id !== id));
    import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "info", title: "Dihapus", text: `${item?.nama} dihapus dari daftar`, timer: 1200, showConfirmButton: false }));
  };

  const updateCartQty = (id, delta) => {
    setCart(cart.map(i => {
      if (i.id !== id) return i;
      const newQty = Math.max(1, i.jumlah + delta);
      if (newQty > i.stok_tersedia) {
        import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "error", title: "Melebihi Stok", text: `Maksimal ${i.stok_tersedia} ${i.satuan}`, timer: 1500, showConfirmButton: false }));
        return i;
      }
      return { ...i, jumlah: newQty };
    }));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) { import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "warning", title: "Perhatian", text: "Tambahkan barang terlebih dahulu" })); return; }
    const payload = { user_id: user.id, role, catatan, urgensi, items: cart.map(item => ({ barang_id: item.id, jumlah: item.jumlah })) };
    setLoading(true);
    try {
      await createPengajuan(payload);
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "success", title: "Berhasil!", text: "Pengajuan berhasil dibuat!" }));
      setCart([]); setCatatan(""); navigate("/list-pengajuan");
    } catch (err) { 
      import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: "error", title: "Gagal", text: err.response?.data?.message || "Gagal membuat pengajuan" })); 
    }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-5 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white focus:bg-white transition text-sm placeholder-slate-400";

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        {/* PAGE HEADER */}
        <PageHeader
          icon={<ClipboardList size={22} />}
          title="Buat Pengajuan Barang"
          subtitle={`Pengaju: ${user?.nama} • Role: ${role}`}
          actions={
            <div className="flex items-center gap-2">
              {[
                { step: 1, icon: <PackageSearch size={12} />, label: `Pilih${cart.length > 0 ? ` (${cart.length})` : ""}`, active: cart.length > 0 },
                { step: 2, icon: <FileText size={12} />, label: "Catatan", active: !!catatan },
                { step: 3, icon: <Send size={12} />, label: "Submit", active: false },
              ].map(({ step, icon, label, active }, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700"}`}>
                    {icon} {step}. {label}
                  </div>
                  {i < arr.length - 1 && <div className="w-4 h-px bg-slate-200 dark:bg-slate-700" />}
                </div>
              ))}
            </div>
          }
        />

        {/* KATALOG BARANG - BROWSE & PILIH */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl"><PackageSearch size={18} /></div>
              <div>
                <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Pilih Barang</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Klik barang untuk memilih, atur jumlah, lalu tambah ke daftar</p>
              </div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredBarang.length} barang ditemukan</span>
          </div>

          <div className="p-8 space-y-6">
            {/* SEARCH + JUMLAH + TAMBAH */}
            <div className="flex gap-3 flex-wrap items-end">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Filter barang... (support typo)" value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedBarang(null); }}
                  className={`${inputClass} pl-12 pr-10`} />
                {search && (
                  <button onClick={() => { setSearch(""); setSelectedBarang(null); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"><X size={16} /></button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Jumlah:</label>
                <input type="number" min="1" value={jumlah} onChange={(e) => setJumlah(parseInt(e.target.value) || 1)}
                  className="border border-slate-200 dark:border-slate-700 rounded-2xl w-24 py-3.5 px-4 text-center outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-800/50 dark:text-white transition text-sm font-black" />
              </div>
              <button onClick={addBarang} disabled={loadingBarang} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50">
                <Plus size={15} /> Tambah ke Daftar
              </button>
            </div>

            {/* CATEGORY FILTER TABS */}
            {(() => {
              const categories = [...new Set(barang.map(b => b.nama_kategori).filter(Boolean))];
              return categories.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setFilterKategori("")}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filterKategori ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-blue-300"}`}>
                    Semua
                  </button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setFilterKategori(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterKategori === cat ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-blue-300"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* SELECTED ITEM PREVIEW BAR */}
            {selectedBarang && (
              <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-center gap-4 animate-in">
                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 shrink-0">
                  <img src={selectedBarang.foto ? `http://localhost:5000/uploads/${selectedBarang.foto}` : "/no-image.png"} alt={selectedBarang.nama_barang} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-blue-600 shrink-0" />
                    <span className="font-black text-blue-800 dark:text-blue-200 text-sm uppercase tracking-tight truncate">{selectedBarang.nama_barang}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300">Tersedia: {selectedBarang.stok_tersedia} {selectedBarang.satuan}</span>
                    {selectedBarang.nama_kategori && <span className="text-[9px] font-bold text-blue-400">• {selectedBarang.nama_kategori}</span>}
                  </div>
                  {jumlah > selectedBarang.stok_tersedia && (
                    <p className="text-[10px] text-rose-500 font-black flex items-center gap-1 mt-1"><AlertCircle size={10} /> Jumlah melebihi stok tersedia!</p>
                  )}
                </div>
                <button onClick={() => setSelectedBarang(null)} className="p-2 rounded-xl text-blue-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all shrink-0" title="Batal pilih">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* PRODUCT GRID — ALWAYS VISIBLE */}
            {loadingBarang ? (
              <ListBarangSkeleton />
            ) : filteredBarang.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar pb-1">
                {filteredBarang.map(item => {
                  const isSelected = selectedBarang?.id === item.id;
                  const isOutOfStock = item.stok_tersedia === 0;
                  const isLowStock = item.stok_tersedia > 0 && item.stok_tersedia <= item.stok_minimum;
                  const isInCart = cart.some(c => c.id === item.id);
                  return (
                    <div key={item.id}
                      onClick={() => { if (!isOutOfStock) { setSelectedBarang(prev => prev?.id === item.id ? null : item); } }}
                      className={`group relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg
                        ${isSelected ? "border-blue-500 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/20" : isOutOfStock ? "border-slate-100 dark:border-slate-800 opacity-45 cursor-not-allowed" : "border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"}`}>
                      
                      {/* GAMBAR */}
                      <div className="relative aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={item.foto ? `http://localhost:5000/uploads/${item.foto}` : "/no-image.png"}
                          alt={item.nama_barang}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* STOK BADGE */}
                        <div className="absolute top-2 right-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md backdrop-blur-md shadow-sm
                            ${isOutOfStock ? "bg-rose-500/90 text-white" : isLowStock ? "bg-amber-500/90 text-white" : "bg-emerald-500/90 text-white"}`}>
                            {isOutOfStock ? "HABIS" : item.stok_tersedia}
                          </span>
                        </div>
                        {/* IN CART BADGE */}
                        {isInCart && (
                          <div className="absolute top-2 left-2">
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-600/90 text-white backdrop-blur-md shadow-sm">✓ Dipilih</span>
                          </div>
                        )}
                        {/* SELECTED OVERLAY */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/15 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-blue-600 shadow-xl flex items-center justify-center"><CheckCircle size={20} className="text-white" /></div>
                          </div>
                        )}
                        {/* OUT OF STOCK OVERLAY */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest bg-rose-600/90 px-2.5 py-1 rounded-md">Habis</span>
                          </div>
                        )}
                      </div>

                      {/* INFO */}
                      <div className="p-3">
                        <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-tight line-clamp-2 min-h-[28px]">{item.nama_barang}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.satuan}</span>
                          {item.nama_kategori && (
                            <span className="text-[7px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wide truncate max-w-[60px]">{item.nama_kategori}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-14">
                <PackageSearch size={40} className="mx-auto mb-3 text-slate-200 dark:text-slate-700" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tidak ada barang ditemukan</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">Coba kata kunci lain atau ubah filter kategori</p>
              </div>
            )}
          </div>
        </div>

        {/* CART */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl"><ClipboardList size={18} /></div>
              <div>
                <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Daftar Barang Diajukan</h2>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{cart.length === 0 ? "Belum ada barang" : `${cart.length} item ditambahkan`}</p>
              </div>
            </div>
            {cart.length > 0 && <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/25">{cart.length} Item</span>}
          </div>
          <div className="p-8">
            {cart.length === 0 ? (
              <div className="text-center py-14 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <ClipboardList size={28} className="text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Belum ada barang ditambahkan</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600">Pilih barang di atas lalu klik "Tambah ke Daftar"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    {/* NOMOR + FOTO */}
                    <span className="text-[10px] font-black text-slate-300 w-5 text-center">{index + 1}</span>
                    <ImagePreview
                      src={item.foto ? `http://localhost:5000/uploads/${item.foto}` : "/no-image.png"}
                      alt={item.nama}
                      size="md"
                    />
                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">{item.nama}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-0.5">Stok: {item.stok_tersedia} {item.satuan}</p>
                    </div>
                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateCartQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all active:scale-90"><Minus size={12} /></button>
                      <span className="text-[12px] font-black text-blue-600 w-8 text-center">{item.jumlah}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all active:scale-90"><Plus size={12} /></button>
                    </div>
                    {/* STATUS */}
                    {item.jumlah > item.stok_tersedia ? (
                      <span className="text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap"><AlertCircle size={9} className="inline mr-1" />Over</span>
                    ) : (
                      <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg uppercase tracking-widest whitespace-nowrap"><CheckCircle size={9} className="inline mr-1" />OK</span>
                    )}
                    {/* DELETE */}
                    <button onClick={() => removeItem(item.id)} className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CATATAN */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl"><FileText size={18} /></div>
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Catatan Pengajuan</h2>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Jelaskan keperluan barang (opsional)</p>
            </div>
          </div>
          <div className="p-8">
            <textarea rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Contoh: Untuk keperluan maintenance pompa di unit X bulan April..." />
          </div>
        </div>

        {/* TINGKAT URGENSI */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4">
            <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl"><AlertCircle size={18} /></div>
            <div>
              <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Tingkat Urgensi</h2>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Seberapa mendesak permintaan ini?</p>
            </div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { val: "normal",  color: "blue",  label: "Normal",  desc: "Kebutuhan operasional rutin" },
                { val: "penting", color: "amber", label: "Penting",  desc: "Kebutuhan prioritas tinggi" },
                { val: "darurat", color: "rose",  label: "Darurat",  desc: "Mendesak (Kebocoran, Mati total)" },
              ].map(({ val, color, label, desc }) => (
                <label key={val} onClick={() => setUrgensi(val)}
                  className={`cursor-pointer rounded-2xl p-5 flex flex-col items-center gap-2.5 transition-all border-2 ${urgensi === val ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20` : "border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-slate-50/50 dark:bg-slate-800/30"}`}>
                  <input type="radio" name="urgensi" value={val} className="hidden" onChange={() => setUrgensi(val)} />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${urgensi === val ? `border-${color}-500` : "border-slate-300"}`}>
                    {urgensi === val && <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500`} />}
                  </div>
                  <span className={`font-black text-sm uppercase tracking-tight ${urgensi === val ? `text-${color}-600` : "text-slate-500"}`}>{label}</span>
                  <span className="text-[10px] text-slate-400 text-center leading-tight font-medium">{desc}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT BAR */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 px-8 py-6 flex justify-between items-center">
          <div>
            {cart.length > 0 ? (
               cart.some(i => i.jumlah > i.stok_tersedia) 
               ? <span className="text-[11px] font-bold text-rose-500 flex items-center gap-2 uppercase tracking-widest"><AlertCircle size={13} /> Selesaikan error stok</span>
               : <span className="text-xs font-black text-emerald-600 flex items-center gap-2 uppercase tracking-widest"><CheckCircle size={15} /> {cart.length} barang siap diajukan</span>
            ) : (
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest"><AlertCircle size={13} /> Masukkan barang ke daftar</span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/list-pengajuan")}
              className="px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Batal
            </button>
            <div className="group relative">
              <button 
                onClick={handleSubmit} 
                disabled={loading || cart.length === 0 || cart.some(i => i.jumlah > i.stok_tersedia)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-7 py-3 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {loading ? "Menyimpan..." : "Submit Pengajuan"}
              </button>
              
              {/* Info Tooltip untuk Disabled Button */}
              {cart.length === 0 && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  Keranjang masih kosong
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}