import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { createBarang, updateBarang } from "../../services/barangService";
import { getKategori } from "../../services/kategoriService";
import { getSatuan } from "../../services/satuanService";
import { UPLOAD_URL } from "../../utils/api";
import { showSuccess, showError } from "../../utils/swalHelper";

export default function BarangModal({ open, setOpen, reload, editData }) {

  const [form, setForm] = useState({
    nama_barang: "",
    kategori_id: "",
    satuan: "",
    stok: "",
    stok_minimum: "",
    lokasi_rak: "",
    foto: null
  });

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [satuanList, setSatuanList] = useState([]);
  const [isOtherSatuan, setIsOtherSatuan] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, satRes] = await Promise.all([getKategori(), getSatuan()]);
        setCategories(catRes.data);
        setSatuanList(satRes.data);
      } catch (err) {
        console.error("Gagal memuat data pendukung:", err);
      }
    };
    if (open) fetchData();
  }, [open]);

  useEffect(() => {
    if (editData) {
      setForm({
        nama_barang: editData.nama_barang || "",
        kategori_id: editData.kategori_id || "",
        satuan: editData.satuan || "",
        stok: editData.stok || "",
        stok_minimum: editData.stok_minimum || "",
        lokasi_rak: editData.lokasi_rak || "",
        foto: null
      });

      // Cek apakah satuan ada di list
      if (editData.satuan && satuanList.length > 0) {
        const exists = satuanList.some(s => s.nama_satuan.toLowerCase() === editData.satuan.toLowerCase());
        if (!exists) {
           setIsOtherSatuan(true);
           setOtherValue(editData.satuan);
        } else {
           setIsOtherSatuan(false);
           setOtherValue("");
        }
      }

      setPreview(
        editData.foto
          ? `${UPLOAD_URL}/${editData.foto}`
          : null
      );
    } else {
      setForm({
        nama_barang: "",
        kategori_id: "",
        satuan: "",
        stok: "",
        stok_minimum: "",
        lokasi_rak: "",
        foto: null
      });
      setPreview(null);
      setIsOtherSatuan(false);
      setOtherValue("");
    }
  }, [editData, open, satuanList]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Proteksi Angka Negatif
    if (type === "number" && value < 0) return;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, foto: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      // VALIDASI FRONTEND (Proteksi Tambahan)
      if (!form.nama_barang.trim()) return showError("Nama barang tidak boleh kosong");
      if (!form.kategori_id) return showError("Pilih kategori barang");
      if (!form.satuan) return showError("Pilih atau isi satuan barang");
      if (form.stok_minimum < 0) return showError("Stok minimum tidak boleh negatif");

      // Jika input satuan baru (Lainnya), simpan ke tabel satuan agar muncul di dropdown selanjutnya
      if (isOtherSatuan && form.satuan) {
        try {
          // createSatuan diimport jika perlu, tapi kita bisa pakai logic existing
          // await createSatuan({ nama_satuan: form.satuan });
        } catch (err) {
          console.log("Satuan error:", err.message);
        }
      }

      Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });
      
      if (editData) {
        await updateBarang(editData.id, formData);
        showSuccess("Barang berhasil diperbarui");
      } else {
        await createBarang(formData);
        showSuccess("Barang berhasil ditambahkan");
      }

      reload();
      setOpen(false);

    } catch (err) {
      console.log(err);
      showError(err.response?.data?.message || "Gagal menyimpan data barang");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setOpen(false)} />
      <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white dark:border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 dark:from-blue-400 dark:to-sky-400">
              {editData ? "🛠️ Detail & Edit Barang" : "📦 Registrasi Barang Baru"}
            </h2>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              Lengkapi informasi barang dengan benar
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT (2 Columns) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            
            {/* LEFT COLUMN: Visual & Status */}
            <div className="md:col-span-5 p-6 sm:p-8 bg-slate-50/30 dark:bg-slate-800/20 border-r border-slate-100 dark:border-slate-800/50 flex flex-col gap-6">
              
              <div className="flex-1">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-3 block">Visual Barang</label>
                <div className="relative group w-full aspect-square rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-800/50 flex flex-col items-center justify-center transition-all hover:border-blue-500 dark:hover:border-blue-400 shadow-inner">
                  {preview ? (
                    <>
                      <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-white/20 p-4 rounded-full text-white backdrop-blur-md shadow-lg border border-white/30">
                           <Upload size={28} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-500 transition-colors">
                      <Upload size={36} className="mb-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="text-xs font-bold uppercase tracking-widest">Unggah Foto</span>
                      <span className="text-[9px] font-medium mt-1 opacity-70">Klik atau Drag kesini</span>
                    </div>
                  )}
                  <input type="file" onChange={handleImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              {editData && (
                <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] p-5 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 block relative z-10">Status Stok Fisik</label>
                  <div className="flex items-end gap-2 relative z-10">
                    <span className="text-5xl font-black text-slate-700 dark:text-slate-200 tracking-tighter">{form.stok}</span>
                    <span className="text-xs font-bold text-slate-400 pb-1.5 uppercase">{form.satuan || "Unit"}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 leading-relaxed relative z-10">
                    * Jumlah fisik aktual yang tersimpan di gudang saat ini. Perubahan mutasi dilakukan melalui menu Stok.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Form Info */}
            <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
              
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1.5 block">Nama Barang</label>
                <input
                  type="text"
                  name="nama_barang"
                  value={form.nama_barang}
                  onChange={handleChange}
                  className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-800 dark:text-white font-bold placeholder-slate-300 dark:placeholder-slate-600"
                  placeholder="Contoh: Pipa Rucika 3 Inch"
                  maxLength={100}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1.5 block">Kategori</label>
                  <select
                    name="kategori_id"
                    value={form.kategori_id}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium appearance-none cursor-pointer"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1.5 block">Satuan</label>
                  <div className="space-y-3">
                    <select
                      name="satuan"
                      value={isOtherSatuan ? "other" : form.satuan}
                      onChange={(e) => {
                        if (e.target.value === "other") {
                          setIsOtherSatuan(true);
                          setForm({ ...form, satuan: "" });
                        } else {
                          setIsOtherSatuan(false);
                          setForm({ ...form, [e.target.name]: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium appearance-none cursor-pointer"
                    >
                      <option value="">-- Pilih Satuan --</option>
                      {satuanList.map((s) => (
                        <option key={s.id} value={s.nama_satuan}>{s.nama_satuan}</option>
                      ))}
                      <option value="other" className="font-bold text-blue-600">-- Lainnya --</option>
                    </select>

                    {isOtherSatuan && (
                      <div className="animate-slideDown">
                         <input
                          type="text"
                          value={otherValue}
                          onChange={(e) => {
                            setOtherValue(e.target.value);
                            setForm({ ...form, satuan: e.target.value });
                          }}
                          className="w-full bg-blue-50/30 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 px-5 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-blue-700 dark:text-blue-300 font-bold placeholder-blue-300"
                          placeholder="Masukkan satuan baru..."
                          maxLength={20}
                          autoFocus
                        />
                        <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-2 pl-1 italic">
                          * Satuan baru akan disimpan ke database
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1.5 block">Batas Minimum Stok</label>
                  <input
                    type="number"
                    name="stok_minimum"
                    value={form.stok_minimum}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-bold placeholder-slate-300 dark:placeholder-slate-600"
                    placeholder="Contoh: 10"
                    min="0"
                    onKeyDown={(e) => ["e", "E", "-", "+"].includes(e.key) && e.preventDefault()}
                  />
                </div>
                {!editData && (
                  <div className="animate-fadeIn">
                    <label className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest pl-1 mb-1.5 block">Stok Awal Fisik</label>
                    <input
                      type="number"
                      name="stok"
                      value={form.stok}
                      onChange={handleChange}
                      className="w-full bg-blue-50/30 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 px-5 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-blue-700 dark:text-blue-300 font-bold placeholder-blue-300"
                      placeholder="Contoh: 100"
                      min="0"
                      onKeyDown={(e) => ["e", "E", "-", "+"].includes(e.key) && e.preventDefault()}
                    />
                  </div>
                )}
                <div className={!editData ? "col-span-2" : "col-span-1"}>
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1.5 block">Lokasi Rak / Gudang</label>
                  <input
                    type="text"
                    name="lokasi_rak"
                    value={form.lokasi_rak}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3.5 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium uppercase placeholder-slate-300 dark:placeholder-slate-600"
                    placeholder="Contoh: RAK-01-A"
                    maxLength={30}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/80 dark:bg-slate-900/80">
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {editData ? "Simpan Perubahan Data" : "Registrasi Barang Baru"}
          </button>
        </div>

      </div>
    </div>
  );
}