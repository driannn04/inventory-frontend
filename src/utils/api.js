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

// ✅ TAMBAH: auto logout kalau 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || "http://localhost:5000/uploads";

export default api;