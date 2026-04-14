import api from "../utils/api"; // ✅ pakai instance, bukan axios langsung

export const createBarang = (formData) => {
  return api.post("/barang", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const getBarang = () => {
  return api.get("/barang");
};

export const updateBarang = (id, formData) => {
  return api.put(`/barang/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const deleteBarang = (id) => {
  return api.delete(`/barang/${id}`);
};

export const searchBarang = (keyword) => {
  return api.get(`/barang/search?keyword=${keyword}`);
};

export const getStokMinimum = () => {
  return api.get("/barang/stok-minimum");
};

export const scanQR = (kode_barang) => {
  return api.post("/barang/scan", { kode_barang });
};

export const downloadQR = (id) => {
  return api.get(`/barang/qr/download/${id}`, { responseType: "blob" });
};

export const getQR = (id) => {
  return api.get(`/barang/qr/${id}`);
};

export const getKartuStokByBarang = (id) => {
  return api.get(`/barang/kartu-stok/${id}`);
};

export const getKartuStokByBarangWithFilter = (id, params) => {
  return api.get(`/barang/kartu-stok/${id}`, { params });
};

export const exportKartuStokExcel = (id, params) => {
  return api.get(`/barang/kartu-stok/${id}/export/excel`, {
    params,
    responseType: "blob"
  });
};

export const exportKartuStokPDF = (id, params) => {
  return api.get(`/barang/kartu-stok/${id}/export/pdf`, {
    params,
    responseType: "blob"
  });
};