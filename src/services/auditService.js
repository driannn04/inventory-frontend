import api from "../utils/api";

export const getAuditLogs = () => {
  return api.get("/audit");
};

export const exportAuditLogs = () => {
  return api.get("/audit/export", { responseType: "blob" });
};

export const logUserLogin = (user_id) => {
  return api.post("/audit/login", { user_id });
};
