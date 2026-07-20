import api from "./axios";

export const analyzeVisionImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const response = await api.post("/vision/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000, // 60s for large images + Gemini processing
  });
  return response.data;
};

export const getVisionHistory = async () => {
  const response = await api.get("/vision/history");
  return response.data;
};

export const updateVisionAnalysis = async (id, data) => {
  const response = await api.put(`/vision/${id}`, data);
  return response.data;
};
