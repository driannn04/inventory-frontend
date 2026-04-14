import api from "../utils/api"; // ✅ pakai instance

export const tambahStokMasuk = (data) => {
  return api.post("/stok/masuk", data);
};

export const getStokMasuk = () => {
  return api.get("/stok/masuk");
};

export const getStokMasukById = (id) => {
  return api.get(`/stok/masuk/${id}`);
};

export const tambahStokKeluar = (data) => {
  return api.post("/stok/keluar", data);
};

export const getStokKeluar = () => {
  return api.get("/stok/keluar");
};

export const getStokKeluarById = (id) => {
  return api.get(`/stok/keluar/${id}`);
};