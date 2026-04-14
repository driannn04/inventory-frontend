import api from "../utils/api";

export const getSettings = () => api.get("/settings");
export const getSettingsByCategory = (category) => api.get(`/settings/category/${category}`);
export const updateSettings = (data) => api.put("/settings", data);
