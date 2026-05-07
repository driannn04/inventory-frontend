import api from "../utils/api";

// CRUD Users
export const getUsers = () => api.get("/users");
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const resetPassword = (id, data) => api.put(`/users/${id}/reset-password`, data);

// Roles & Utility
export const getRoles = () => api.get("/users/roles");
export const getNextNup = () => api.get("/users/next-nup");
export const getJabatans = () => api.get("/users/jabatans");
export const getDepartments = () => api.get("/users/departments");
export const getSubDepartments = (deptId) => api.get(`/users/departments/${deptId}/sub`);

// Profil
export const getMyProfile = () => api.get("/users/profile/me");
export const updateMyProfile = (data) => api.put("/users/profile/me", data);
export const changeMyPassword = (data) => api.put("/users/profile/change-password", data);
