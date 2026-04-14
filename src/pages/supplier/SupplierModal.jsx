import { useState, useEffect } from "react";
import { X, Save, Building2, User, Phone, Mail, MapPin, Hash } from "lucide-react";

export default function SupplierModal({ isOpen, onClose, onSave, editingData }) {
  const [form, setForm] = useState({
    kode_supplier: "",
    nama_supplier: "",
    pic: "",
    no_telp: "",
    email: "",
    alamat: ""
  });

  useEffect(() => {
    if (editingData) {
      setForm(editingData);
    } else {
      setForm({
        kode_supplier: "",
        nama_supplier: "",
        pic: "",
        no_telp: "",
        email: "",
        alamat: ""
      });
    }
  }, [editingData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-white dark:border-slate-800 animate-in fade-in flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
                {editingData ? "Edit Supplier" : "Tambah Supplier Baru"}
              </h2>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                Data mitra pemasok
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="p-6 sm:p-8 space-y-5 max-h-[60vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 flex items-center gap-1.5"><Hash size={12} /> Kode Supplier</label>
              <input
                type="text"
                name="kode_supplier"
                value={form.kode_supplier}
                onChange={handleChange}
                placeholder="Otomatis"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 flex items-center gap-1.5"><Building2 size={12} /> Nama Perusahaan</label>
              <input
                type="text"
                name="nama_supplier"
                value={form.nama_supplier}
                onChange={handleChange}
                placeholder="Contoh: PT. Sumber Tirta"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 flex items-center gap-1.5"><User size={12} /> Kontak / PIC</label>
              <input
                type="text"
                name="pic"
                value={form.pic}
                onChange={handleChange}
                placeholder="Nama penanggung jawab"
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 flex items-center gap-1.5"><Phone size={12} /> No. Telepon</label>
              <input
                type="text"
                name="no_telp"
                value={form.no_telp}
                onChange={handleChange}
                placeholder="0812..."
                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 flex items-center gap-1.5"><Mail size={12} /> Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="supplier@email.com"
              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium"
            />
          </div>

          <div>
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 flex items-center gap-1.5"><MapPin size={12} /> Alamat</label>
            <textarea
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              rows="3"
              placeholder="Alamat kantor / gudang supplier"
              className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl text-sm focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium resize-none"
            />
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/50 flex justify-end gap-3 rounded-b-[2rem]">
          <button
            onClick={onClose}
            className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all active:scale-95 text-sm"
          >
            <Save size={18} />
            Simpan Supplier
          </button>
        </div>

      </div>
    </div>
  );
}
