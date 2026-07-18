import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { idToken, loadingAuth } = useAuth();

  if (loadingAuth) return null; // blank while checking auth
  if (!idToken) return <Navigate to="/login" replace />;
  return children;
}
