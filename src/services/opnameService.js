import api from "../utils/api";

export const createOpname = (data) => {
  return api.post("/opname", data);
};

export const getOpnameHistory = () => {
  return api.get("/opname/history");
};
