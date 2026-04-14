import Swal from 'sweetalert2';

/**
 * Premium SweetAlert2 Helpers for PDAM Inventory
 */
export const showSuccess = (message) => {
  return Swal.fire({
    title: "Berhasil",
    text: message,
    icon: "success",
    timer: 2000,
    showConfirmButton: false,
    customClass: {
      popup: "rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90",
      title: "text-slate-800 dark:text-white font-black",
      htmlContainer: "text-slate-500 dark:text-slate-400 font-medium"
    }
  });
};

export const showError = (message) => {
  return Swal.fire({
    title: "Oops!",
    text: message,
    icon: "error",
    confirmButtonColor: "#3b82f6",
    customClass: {
      popup: "rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90",
      title: "text-slate-800 dark:text-white font-black",
      htmlContainer: "text-slate-500 dark:text-slate-400 font-medium",
      confirmButton: "rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-xs"
    }
  });
};

export const confirmDelete = (title, text) => {
  return Swal.fire({
    title: title || "Apakah Anda yakin?",
    text: text || "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#94a3b8",
    confirmButtonText: "Ya, Hapus!",
    cancelButtonText: "Batal",
    customClass: {
      popup: "rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90",
      title: "text-slate-800 dark:text-white font-black",
      htmlContainer: "text-slate-500 dark:text-slate-400 font-medium",
      confirmButton: "rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-xs",
      cancelButton: "rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-xs"
    }
  });
};
