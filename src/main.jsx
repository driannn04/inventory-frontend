import React from "react";
import ReactDOM from "react-dom/client";
import Swal from "sweetalert2";
import App from "./App";
import "./index.css";

// Global Override alert()
window.alert = (msg) => {
  const isError = typeof msg === "string" && (msg.toLowerCase().includes("gagal") || msg.toLowerCase().includes("wajib") || msg.toLowerCase().includes("salah") || msg.includes("❌"));
  Swal.fire({
    title: isError ? "Perhatian" : "Berhasil",
    text: msg,
    icon: isError ? "error" : "success",
    confirmButtonColor: "#0284c7", // sky-600
    confirmButtonText: "Tutup",
    customClass: {
      popup: "rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl",
      confirmButton: "px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95"
    }
  });
};

ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
 
);