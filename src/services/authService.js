import axios from "axios";

// login tidak butuh token, pakai axios biasa
export const loginUser = (data) => {
  return axios.post("http://localhost:5000/api/auth/login", data);
};