import { useEffect, useState } from "react";
import api from "../services/api";

const useShopsList = () => {
  const [shops, setShops]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.get("/api/super/shops")
      .then((res) => setShops(res.data))
      .catch(() => setError("Failed to load shops"))
      .finally(() => setLoading(false));
  }, []);

  return { shops, loading, error };
};

export default useShopsList;
