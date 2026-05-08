import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

// ✅ FIX: format header harus "Bearer <token>"
api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // ✅ tambah "Bearer "
  }

  return config;
});

// ✅ TAMBAH: Global Error Handler (401, 403, 503)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (!error.response) {
      // Server mati total atau internet user mati (Network Error)
      // Kita anggap sebagai maintenance jika internet user masih nyala
      if (navigator.onLine) {
        window.location.href = "/maintenance";
      }
    } else if (status === 401) {
      // Sesi habis, paksa login ulang
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (status === 403) {
      // Akses ditolak (Role tidak sesuai)
      window.location.href = "/forbidden";
    } else if (status === 503) {
      // Server sedang Maintenance
      window.location.href = "/maintenance";
    }
    
    return Promise.reject(error);
  }
);

export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000/uploads";

export default api;