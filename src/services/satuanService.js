import api from "../utils/api";

export const getSatuan = () => api.get("/satuan");
export const createSatuan = (data) => api.post("/satuan", data);
