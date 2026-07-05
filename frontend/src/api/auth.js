import api from "./axios";

// NOTE: field names below (email, password, fullName, confirmPassword) are
// assumed to match your LoginRequest / RegisterRequest DTOs. Double-check
// against your actual backend DTO field names and adjust if they differ.

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data; // expected shape: { token, user: {...} } — adjust to match your AuthResponse
};

export const register = async ({ fullName, email, password, confirmPassword }) => {
  const response = await api.post("/auth/register", {
    username: email.split("@")[0], // e.g., "jayasri4manickam" from "jayasri4manickam@gmail.com"
    fullName,
    email,
    password,
    // Don't send confirmPassword — backend doesn't expect it
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("carbontrack_token");
  localStorage.removeItem("carbontrack_user");
};
