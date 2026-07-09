import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("carbontrack_user");
    const token = localStorage.getItem("carbontrack_token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    // Adjust these keys if your AuthResponse DTO uses different field names.
    localStorage.setItem("carbontrack_token", data.token);
    localStorage.setItem("carbontrack_user", JSON.stringify(data.user ?? { email }));
    setUser(data.user ?? { email });
    return data;
  };

  const googleLogin = async (idToken) => {
    const data = await authApi.googleLogin(idToken);
    if (!data.token) {
      throw new Error(data.message || "Google login failed.");
    }
    localStorage.setItem("carbontrack_token", data.token);

    // Fetch profile
    const profile = await authApi.getProfile();
    localStorage.setItem("carbontrack_user", JSON.stringify(profile));
    setUser(profile);
    return data;
  };

  const register = async (formData) => {
    const data = await authApi.register(formData);
    if (data.token) {
      localStorage.setItem("carbontrack_token", data.token);
      localStorage.setItem("carbontrack_user", JSON.stringify(data.user ?? { email: formData.email }));
      setUser(data.user ?? { email: formData.email });
    }
    return data;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
