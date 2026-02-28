import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

/**
 * Hook for the Shop Dashboard page.
 * Fetches aggregated stats (sales, products, low-stock, etc.)
 * for the currently authenticated shop admin.
 *
 * Must be used inside a route protected by <ProtectedRoute role="shop_admin">.
 */
export const useShopDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/shop/dashboard");
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};
