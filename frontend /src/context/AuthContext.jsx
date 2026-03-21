/**
 * AuthContext.jsx — Global Authentication State
 *
 * Provides the entire app with a single source of truth for the
 * current user session. Any component that needs to know "who is
 * logged in?" or trigger a login/logout should consume this context
 * via the useAuth() hook (src/hooks/useAuth.js).
 *
 * State is bootstrapped from localStorage on first render so the user
 * stays logged in across page refreshes without hitting the server.
 * The JWT itself is stored separately (key: "token") and attached to
 * outgoing API requests by the Axios interceptor in services/api.js.
 *
 * Exported:
 *   AuthContext   — the React context object (used internally by useAuth)
 *   AuthProvider  — wrap the app with this to make the context available
 */
import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Try to restore the previous session from localStorage. If the stored
  // value is corrupted (bad JSON), we fall back to null gracefully.
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) ?? null;
    } catch {
      return null;
    }
  });

  const [shopName, setShopName] = useState(() => {
    try {
      return localStorage.getItem("shop_name") ?? "";
    } catch {
      return "";
    }
  });

  /**
   * Called by the Login page after a successful API response.
   * Persists both the token (for API calls) and the user object
   * (for UI rendering) to localStorage, then updates the React state
   * so every subscriber re-renders with the new session.
   *
   * @param {object} data  The API response: { token: string, user: object, shop_name: string }
   */
  const login = useCallback((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("shop_name", data.shop_name || "");
    setUser(data.user);
    setShopName(data.shop_name || "");
  }, []);

  /**
   * Called when the user clicks "Log Out" or when the API interceptor
   * detects a 401 (expired/invalid token). Clears all stored session
   * data and resets the user state to null, which causes ProtectedRoute
   * to redirect to /login.
   */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("shop_name");
    setUser(null);
    setShopName("");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, shopName, setShopName }}>
      {children}
    </AuthContext.Provider>
  );
};
