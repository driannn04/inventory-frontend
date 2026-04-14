import axios from "axios";
import { getToken } from "../utils/auth";

const API_URL = "http://localhost:5000/api/supplier";

const getHeader = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

export const getSuppliers = () => axios.get(API_URL, getHeader());
export const createSupplier = (data) => axios.post(API_URL, data, getHeader());
export const updateSupplier = (id, data) => axios.put(`${API_URL}/${id}`, data, getHeader());
export const deleteSupplier = (id) => axios.delete(`${API_URL}/${id}`, getHeader());
