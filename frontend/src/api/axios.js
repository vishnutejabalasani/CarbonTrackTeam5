import axios from "axios";

// Points at your Spring Boot backend. Override via .env with VITE_API_URL if needed.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT to every outgoing request, if we have one stored.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("carbontrack_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend says our token is invalid/expired, clear it and bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("carbontrack_token");
      localStorage.removeItem("carbontrack_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
