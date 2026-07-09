import api from "./axios";

export const getAllBadges = async () => {
  const response = await api.get("/badges");
  return response.data;
};

export const getEarnedBadges = async () => {
  const response = await api.get("/badges/earned");
  return response.data;
};
