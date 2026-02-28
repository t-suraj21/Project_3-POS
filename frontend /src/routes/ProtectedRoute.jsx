import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Wraps a route that requires authentication.
 *
 * @param {React.ReactNode} children  – the protected page component
 * @param {string|string[]}  role     – required role(s); omit to allow any authenticated user
 */
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role → redirect to login
  const allowedRoles = Array.isArray(role) ? role : role ? [role] : null;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
