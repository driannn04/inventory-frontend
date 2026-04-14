import api from "../utils/api"; // ✅ pakai instance

export const createPengajuan = (data) => {
  return api.post("/pengajuan", data);
};

export const getPengajuan = () => {
  return api.get("/pengajuan");
};

export const getPengajuanById = (id) => {
  return api.get(`/pengajuan/${id}`);
};

export const approvePengajuan = (data) => {
  return api.post("/pengajuan/approve", data);
};

export const rejectPengajuan = (data) => {
  return api.post("/pengajuan/reject", data);
};

export const getApprovalHistory = (id) => {
  return api.get(`/pengajuan/history/${id}`);
};