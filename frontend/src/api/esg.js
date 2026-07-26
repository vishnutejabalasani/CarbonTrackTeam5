import api from "./axios";

export const getEsgReport = async (id) => {
  const url = id ? `/esg/report/${id}` : "/esg/report/0";
  const res = await api.get(url);
  return res.data;
};

export const getEsgHistory = async () => {
  const res = await api.get("/esg/history");
  return res.data;
};

export const generateEsgReport = async () => {
  const res = await api.post("/esg/generate");
  return res.data;
};

export const exportEsgPdf = async (id) => {
  const res = await api.get(`/esg/export/pdf/${id}`);
  return res.data;
};

export const exportEsgExcel = async (id) => {
  const res = await api.get(`/esg/export/excel/${id}`);
  return res.data;
};
