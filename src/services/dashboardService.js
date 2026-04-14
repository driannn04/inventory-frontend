import api from "../utils/api"; // ✅ pakai instance

export const getDashboard = () => {
  return api.get("/dashboard");
};

export const getActivity = () => {
  return api.get("/dashboard/activity");
};