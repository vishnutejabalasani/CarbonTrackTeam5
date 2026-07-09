import api from "./axios";

// NOTE: assumed shape based on your Goal entity/migration. Adjust field
// names once your GoalController DTOs are finalized.

export const getCurrentGoal = async () => {
  const response = await api.get("/goals/current");
  return response.data; // expected: null if no goal set, else { targetReductionPercent, timeframe, progressPercent, ... }
};

export const setGoal = async ({ targetReductionPercent, timeframe }) => {
  const response = await api.post("/goals", {
    targetReductionPercent,
    timeframe,
  });
  return response.data;
};

export const getGoalHistory = async () => {
  const response = await api.get("/goals/history");
  return response.data;
};
