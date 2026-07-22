import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Home, 
  Package, 
  PlusCircle, 
  ArrowRight, 
  ArrowLeft,
  Settings,
  History,
  ClipboardList,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Users,
  PieChart,
  UserCircle
} from 'lucide-react';
import { getRole } from '../../utils/auth';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const role = getRole();

  // LIST MENU NAVIGASI
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Home size={18}/>, path: '/', tags: 'home beranda', roles: ['admin', 'staff', 'gudang', 'manager', 'asisten_manager'] },
    { id: 'barang', name: 'Daftar Barang', icon: <Package size={18}/>, path: '/barang', tags: 'inventory stok katalog item', roles: ['admin', 'gudang', 'staff', 'asisten_manager', 'manager'] },
    { id: 'tambah-masuk', name: 'Input Barang Masuk', icon: <PlusCircle size={18}/>, path: '/stok-masuk', tags: 'tambah stok entry', roles: ['admin', 'gudang'] },
    { id: 'tambah-keluar', name: 'Input Barang Keluar', icon: <ArrowRight size={18}/>, path: '/stok-keluar', tags: 'kurang stok exit', roles: ['admin', 'gudang'] },

    { id: 'pengajuan', name: 'Buat Pengajuan Barang', icon: <PlusCircle size={18}/>, path: '/buat-pengajuan', tags: 'permintaan request', roles: ['staff', 'admin', 'asisten_manager', 'manager'] },
    { id: 'list-pengajuan', name: 'Semua Pengajuan', icon: <ClipboardList size={18}/>, path: '/semua-pengajuan', tags: 'riwayat pengajuan', roles: ['admin', 'staff', 'gudang', 'manager', 'asisten_manager'] },
    { id: 'approval', name: 'Persetujuan Pengajuan', icon: <CheckCircle2 size={18}/>, path: '/persetujuan-pengajuan', tags: 'acc pengajuan manager admin', roles: ['admin', 'manager', 'asisten_manager', 'gudang'] },
    { id: 'scan', name: 'Scan QR Code', icon: <QrCode size={18}/>, path: '/scan', tags: 'barcode kamera scanner', roles: ['admin', 'gudang'] },
    { id: 'logs', name: 'Log Aktivitas Sistem', icon: <History size={18}/>, path: '/activity-log', tags: 'audit trail riwayat user', roles: ['admin'] },

    { id: 'users', name: 'Menu Pegawai (User)', icon: <Users size={18}/>, path: '/kelola-user', tags: 'karyawan user management pengguna', roles: ['admin'] },
    { id: 'kategori', name: 'Kategori Barang', icon: <Package size={18}/>, path: '/kategori', tags: 'jenis tipe barang kategori', roles: ['admin', 'gudang'] },
    { id: 'laporan', name: 'Laporan Analitik', icon: <PieChart size={18}/>, path: '/laporan', tags: 'export excel pdf grafik', roles: ['admin', 'gudang', 'manager', 'asisten_manager'] },
    { id: 'profil', name: 'Profil Akun', icon: <UserCircle size={18}/>, path: '/profil', tags: 'profil akun ganti password sandi', roles: ['admin', 'staff', 'gudang', 'manager', 'asisten_manager'] },
  ].filter(item => item.roles.includes(role));

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.tags.toLowerCase().includes(search.toLowerCase())
  );

  // HOTKEY CTRL+K & CUSTOM EVENT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('openCommandPalette', handleCustomOpen);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openCommandPalette', handleCustomOpen);
    };
  }, []);

  // SCROLL INTO VIEW
  useEffect(() => {
    if (isOpen) {
      const activeEl = document.getElementById(`cmd-item-${selectedIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  // KEYBOARD NAVIGATION
  const onKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        navigate(filteredItems[selectedIndex].path);
        setIsOpen(false);
        setSearch('');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-32 px-4">
          {/* BACKDROP */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* PALETTE */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/20"
          >
            {/* SEARCH INPUT */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <Search className="text-slate-400" size={20} />
              <input 
                autoFocus
                type="text"
                placeholder="Mau cari atau buka apa? (Ketik misalnya: 'Barang' atau 'Audit')"
                className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white text-lg placeholder:text-slate-400"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={onKeyDown}
              />
              <div className="hidden sm:flex items-center gap-1">
                <kbd className="px-1.5 py-1 bg-slate-100 dark:bg-slate-700 text-[10px] rounded text-slate-500 font-mono">ESC</kbd>
              </div>
            </div>

            {/* RESULTS */}
            <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
              {filteredItems.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <AlertCircle size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Maaf, menu atau aksi tidak ditemukan...</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item, index) => (
                    <button
                      id={`cmd-item-${index}`}
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200
                        ${index === selectedIndex 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-2' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${index === selectedIndex ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                          {item.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm leading-none mb-1">{item.name}</p>
                          <p className={`text-[10px] font-medium opacity-60 uppercase tracking-widest`}>
                            {item.path}
                          </p>
                        </div>
                      </div>
                      
                      {index === selectedIndex && (
                        <div className="flex items-center gap-2 text-xs font-bold bg-white/20 px-3 py-1 rounded-full animate-in slide-in-from-right-2">
                          <span>Buka</span>
                          <kbd className="text-[10px]">ENTER</kbd>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )
              }
            </div>

            {/* FOOTER */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><ArrowRight size={12}/> Pilih</span>
                <span className="flex items-center gap-1"><ArrowLeft size={12}/> Navigasi Panah</span>
              </div>
              <p>Magic Command Palette v1.0</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
