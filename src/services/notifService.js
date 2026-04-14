import api from "../utils/api"; // ✅ pakai instance

export const getNotif = (user_id) => {
  return api.get(`/notifikasi/${user_id}`); // ✅ fix: /notifikasi bukan /notif
};

export const readNotif = (id) => {
  return api.put(`/notifikasi/read/${id}`);
};

export const readAllNotif = (user_id) => {
  return api.put(`/notifikasi/read-all/${user_id}`);
};

export const deleteNotif = (id) => {
  return api.delete(`/notifikasi/${id}`);
};