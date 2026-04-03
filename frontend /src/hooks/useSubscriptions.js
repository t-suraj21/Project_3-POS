import { useState, useEffect } from "react";
import api from "../services/api";

const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all subscriptions
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      console.log("[useSubscriptions] Fetching from /api/subscriptions/all");
      const res = await api.get("/api/subscriptions/all");
      console.log("[useSubscriptions] Success:", res.data);
      setSubscriptions(res.data);
      setError("");
    } catch (err) {
      console.error("[useSubscriptions] Error:", err);
      setError(err.response?.data?.message || "Failed to fetch subscriptions");
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/api/subscriptions/status");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Pause a subscription
  const pauseSubscription = async (subscriptionId) => {
    try {
      await api.post(`/api/subscriptions/${subscriptionId}/pause`);
      fetchSubscriptions();
      fetchStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  // Resume a subscription
  const resumeSubscription = async (subscriptionId) => {
    try {
      await api.post(`/api/subscriptions/${subscriptionId}/resume`);
      fetchSubscriptions();
      fetchStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, []);

  return {
    subscriptions,
    stats,
    loading,
    error,
    fetchSubscriptions,
    fetchStats,
    pauseSubscription,
    resumeSubscription,
  };
};

export default useSubscriptions;
