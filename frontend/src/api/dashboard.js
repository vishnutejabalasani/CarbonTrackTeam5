import api from "./axios";

export const getDashboardMetrics = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

export const getWeeklyEmissionsData = async () => {
  const res = await api.get("/dashboard/weekly-emissions");
  return res.data;
};
