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

export const parseNaturalLanguageLog = async (text) => {
  const response = await api.post("/ai/parse-log", { text });
  return response.data;
};

export const analyzeImageLog = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const response = await api.post("/ai/analyze-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return response.data;
};


export const getForecast = async () => {
  const response = await api.get("/ai/forecast");
  return response.data;
};

export const getForestGuardianMsg = async () => {
  const response = await api.get("/ai/forest-guardian");
  return response.data;
};

export const chatWithGreenCoach = async (message) => {
  const response = await api.post("/ai/chat", { message });
  return response.data;
};

export const deleteActivity = async (id) => {
  const response = await api.delete(`/activities/${id}`);
  return response.data;
};