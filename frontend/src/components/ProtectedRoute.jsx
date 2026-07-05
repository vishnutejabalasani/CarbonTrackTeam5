import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // could show a spinner here
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
