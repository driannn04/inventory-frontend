/**
 * PageHeader - Komponen header standar untuk semua halaman
 * 
 * Props:
 *  - icon: JSX element (dari lucide-react)
 *  - title: string - judul halaman
 *  - subtitle: string - deskripsi singkat (opsional)
 *  - actions: JSX element - tombol-tombol aksi kanan (opsional)
 *  - badge: { label: string, value: number|string } (opsional)
 */

export default function PageHeader({ icon, title, subtitle, actions, badge }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] px-5 py-5 md:px-8 md:py-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 overflow-hidden">
      
      {/* LEFT: Icon + Text */}
      <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto flex-wrap">
        {icon && (
          <div className="p-3.5 bg-gradient-to-br from-blue-600 to-sky-500 text-white rounded-2xl shadow-lg shadow-blue-500/25 shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Badge / Counter */}
        {badge && (
          <div className="ml-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-2 text-center shrink-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{badge.label}</p>
            <p className="text-lg font-black text-slate-800 dark:text-white leading-none mt-0.5">{badge.value}</p>
          </div>
        )}
      </div>

      {/* RIGHT: Actions */}
      {actions && (
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0 hide-scrollbar">
          {actions}
        </div>
      )}
    </div>
  );
}
