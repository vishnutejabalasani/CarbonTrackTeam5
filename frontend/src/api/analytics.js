import api from "./axios";

export const getEmissionsByCategory = async (startDate, endDate) => {
  const response = await api.get("/analytics/category", {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getEmissionsByDate = async (startDate, endDate) => {
  const response = await api.get("/analytics/trend", {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getPeerBenchmarking = async () => {
  const response = await api.get("/analytics/benchmarking");
  return response.data;
};

export const getOrganizationDashboard = async () => {
  const response = await api.get("/analytics/organization");
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get("/analytics/leaderboard");
  return response.data;
};
