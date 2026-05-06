import api from "../utils/api"; // ✅ pakai instance

export const getDashboard = (params = {}) => {
  return api.get("/dashboard", { params });
};

export const getActivity = () => {
  return api.get("/dashboard/activity");
};