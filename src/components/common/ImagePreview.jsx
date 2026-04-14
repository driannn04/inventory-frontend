import { useState } from "react";
import { X, ZoomIn, Package } from "lucide-react";

/**
 * ImagePreview — Reusable clickable thumbnail + lightbox modal
 * Usage: <ImagePreview src="/uploads/xxx.jpg" alt="Pipa PVC" size="md" />
 */
export default function ImagePreview({ src, alt = "Preview", size = "md", className = "" }) {
  const [open, setOpen] = useState(false);

  const sizeMap = {
    sm: "w-10 h-10 rounded-xl",
    md: "w-12 h-12 rounded-2xl",
    lg: "w-16 h-16 rounded-2xl",
  };

  const hasImage = src && !src.endsWith("/no-image.png");

  return (
    <>
      {/* THUMBNAIL */}
      <div
        onClick={(e) => { e.stopPropagation(); if (hasImage) setOpen(true); }}
        className={`${sizeMap[size] || sizeMap.md} overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 group relative cursor-pointer ${className}`}
      >
        {hasImage ? (
          <>
            <img src={src} alt={alt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn size={14} className="text-white drop-shadow-lg" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={16} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all"
            >
              <X size={18} />
            </button>

            {/* IMAGE */}
            <img
              src={src}
              alt={alt}
              className="w-full h-auto max-h-[75vh] object-contain"
            />

            {/* CAPTION */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest truncate">{alt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
