import api from "./axios";

export const getDashboardMetrics = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

export const getWeeklyEmissionsData = async () => {
  const res = await api.get("/dashboard/weekly-emissions");
  return res.data;
};

export const getChartData = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await api.get("/dashboard/chart-data", { params });
  return res.data;
};

export const getPersonalMetrics = async () => {
  const res = await api.get("/dashboard/personal-metrics");
  return res.data;
};


