import api from "../utils/api";

export const getKategori = () => api.get("/kategori");
export const getKategoriById = (id) => api.get(`/kategori/${id}`);
export const createKategori = (data) => api.post("/kategori", data);
export const updateKategori = (id, data) => api.put(`/kategori/${id}`, data);
export const deleteKategori = (id) => api.delete(`/kategori/${id}`);
