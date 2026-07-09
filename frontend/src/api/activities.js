import api from "./axios";

export const logActivity = async ({ category, activityType, quantity, unit, logDate }) => {
  const response = await api.post("/activities", {
    category,
    activityType,
    quantity,
    unit,
    logDate,
  });
  return response.data;
};

export const getRecentActivities = async (limit = 10) => {
  const response = await api.get("/activities/recent", {
    params: { limit },
  });
  return response.data;
};

export const getEmissionFactor = async (category, activityType) => {
  const response = await api.get(`/activities/emission-factor/${activityType}`);
  return response.data;
};
export const getWeeklySummary = async () => {
  const response = await api.get("/activities/weekly-summary");
  return response.data;
};

export const getAllActivities = async ({ category, startDate, endDate, sortBy, sortOrder, page, pageSize }) => {
  const response = await api.get("/activities", {
    params: { category, startDate, endDate, sortBy, sortOrder, page, pageSize },
  });
  return response.data;
};