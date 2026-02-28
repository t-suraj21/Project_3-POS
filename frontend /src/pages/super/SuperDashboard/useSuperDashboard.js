import { useEffect, useState } from "react";
import api from "../../../services/api";

const useSuperDashboard = () => {
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.get("/api/super/revenue")
      .then((res) => setRevenue(res.data.total ?? 0))
      .catch(() => setError("Failed to load revenue"))
      .finally(() => setLoading(false));
  }, []);

  return { revenue, loading, error };
};

export default useSuperDashboard;
