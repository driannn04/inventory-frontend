import api from "../utils/api";

// login tidak butuh token, pakai axios biasa
export const loginUser = (data) => {
  return api.post("/auth/login", data);
};

export const checkNup = (nup) => api.get(`/auth/check-nup/${nup}`);