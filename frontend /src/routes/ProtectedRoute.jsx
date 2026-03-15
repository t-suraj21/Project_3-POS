import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { canAccessModule, getPrimaryModule, moduleToPath } from "../utils/accessControl";

/**
 * Wraps a route that requires authentication and specific module access.
 *
 * @param {React.ReactNode} children  – the protected page component
 * @param {string|string[]}  role     – required role(s); omit to allow any authenticated user
 * @param {string}           module   – module to check access for (e.g., 'products', 'accounts')
 */
const ProtectedRoute = ({ children, role, module }) => {
  const { user } = useAuth();
  const { id: shopId } = useParams() || {};

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Role-based check (old-style, kept for backward compatibility)
  const allowedRoles = Array.isArray(role) ? role : role ? [role] : null;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Module-based access check (new-style, for worker enforcement)
  if (module && !canAccessModule(user.role, module)) {
    // Worker tried to access a module they don't have access to
    // Redirect them to their primary allowed module
    const primaryModule = getPrimaryModule(user.role);
    if (primaryModule && shopId) {
      const fallbackPath = moduleToPath(primaryModule, shopId);
      return <Navigate to={fallbackPath} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
