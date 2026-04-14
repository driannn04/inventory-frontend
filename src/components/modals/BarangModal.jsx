import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { createBarang, updateBarang } from "../../services/barangService";
import { getKategori } from "../../services/kategoriService";
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getKategori();
        setCategories(res.data);
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      }
    };
    if (open) fetchCategories();
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

      setPreview(
        editData.foto
          ? `http://localhost:5000/uploads/${editData.foto}`
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
    }
  }, [editData, open]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setOpen(false)} />
      <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white dark:border-slate-800 w-full max-w-xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col flex-grow text-left animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
              {editData ? "🛠️ Edit Barang" : "📦 Tambah Barang Baru"}
            </h2>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              Lengkapi formulir di bawah dengan benar
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">
          <div>
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Nama Barang</label>
            <input
              type="text"
              name="nama_barang"
              value={form.nama_barang}
              onChange={handleChange}
              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium"
              placeholder="Contoh: Pipa Rucika 3 Inch"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Kategori</label>
              <select
                name="kategori_id"
                value={form.kategori_id}
                onChange={handleChange}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium appearance-none"
              >
                <option value="">-- Pilih --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nama_kategori}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Satuan</label>
              <select
                name="satuan"
                value={form.satuan}
                onChange={handleChange}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium appearance-none"
              >
                <option value="">-- Pilih --</option>
                <option value="pcs">PCS</option>
                <option value="dus">DUS</option>
                <option value="meter">Meter</option>
                <option value="unit">Unit</option>
              </select>
            </div>

            {editData && (
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Stok Saat Ini (Read-Only)</label>
                <input
                  type="number"
                  value={form.stok}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm outline-none text-slate-400 font-black cursor-not-allowed"
                />
              </div>
            )}
            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Batas Minimum Stok</label>
              <input
                type="number"
                name="stok_minimum"
                value={form.stok_minimum}
                onChange={handleChange}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-bold"
              />
            </div>
            <div className={editData ? "col-span-2" : "col-span-1"}>
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Lokasi Penyimpanan (Rak)</label>
              <input
                type="text"
                name="lokasi_rak"
                value={form.lokasi_rak}
                onChange={handleChange}
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium uppercase"
                placeholder="Contoh: RAK-01-A"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Unggah Foto (Opsional)</label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl p-5 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer flex flex-col items-center">
              <Upload className="text-slate-400 mb-2" size={24} />
              <input type="file" onChange={handleImage} className="text-xs text-slate-500 font-bold outline-none decoration-transparent" />
            </div>
            {preview && <img src={preview} className="w-24 h-24 object-cover mx-auto mt-4 rounded-2xl shadow-lg border-2 border-white dark:border-slate-700" alt="Preview" />}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 rounded-b-[2rem]">
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold tracking-wide py-4 rounded-2xl shadow-lg shadow-sky-500/30 transition-all transform active:scale-95"
          >
            {editData ? "Update Data Barang" : "Registrasi Barang Baru"}
          </button>
        </div>
      </div>
    </div>
  );
}