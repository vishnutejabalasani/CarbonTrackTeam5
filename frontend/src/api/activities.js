import api from "./axios";

/**
 * Log a new activity
 */
export const logActivity = async ({
  category,
  activityType,
  quantity,
  unit,
  logDate,
}) => {
  const response = await api.post("/activities", {
    category,
    activityType,
    quantity,
    unit,
    logDate,
  });
  return response.data;
};

/**
 * Get recent activities
 */
export const getRecentActivities = async (limit = 10) => {
  const response = await api.get("/activities/recent", {
    params: { limit },
  });
  return response.data;
};

/**
 * Get emission factor
 */
export const getEmissionFactor = async (category, activityType) => {
  const response = await api.get("/emission-factors", {
    params: {
      category,
      activityType,
    },
  });
  return response.data;
};

/**
 * Weekly summary
 */
export const getWeeklySummary = async () => {
  const response = await api.get("/activities/summary/weekly");
  return response.data;
};

/**
 * Get all activities with filters
 */
export const getAllActivities = async (filters = {}) => {
  const {
    category,
    startDate,
    endDate,
    sortBy = "date",
    sortOrder = "desc",
    page = 1,
    pageSize = 20,
  } = filters;

  const response = await api.get("/activities", {
    params: {
      category,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      pageSize,
    },
  });

  return response.data;
};

/**
 * Activity statistics
 */
export const getActivityStats = async (startDate, endDate) => {
  const response = await api.get("/activities/stats", {
    params: {
      startDate,
      endDate,
    },
  });

  return response.data;
};

/**
 * Pie chart data - Category breakdown
 */
export const getCategoryBreakdown = async (days = 30) => {
  const response = await api.get("/activities/breakdown/category", {
    params: { days },
  });

  return response.data;
};

/**
 * Line chart data - Daily emissions
 */
export const getDailyEmissions = async (days = 30) => {
  const response = await api.get("/activities/breakdown/daily", {
    params: { days },
  });

  return response.data;
};

/**
 * Line chart data - Monthly emissions
 */
export const getMonthlyEmissions = async (months = 12) => {
  const response = await api.get("/activities/breakdown/monthly", {
    params: { months },
  });

  return response.data;
};

/**
 * Search activities by keyword
 */
export const searchActivities = async (query) => {
  const response = await api.get("/activities/search", {
    params: { q: query },
  });

  return response.data;
};

/**
 * Get current goal for user
 */
export const getCurrentGoal = async () => {
  const response = await api.get("/goals/current");
  return response.data;
};