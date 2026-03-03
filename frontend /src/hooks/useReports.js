import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function useReports() {
  // ── Summary (fixed periods) ──────────────────────────────────────────────
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/reports/summary");
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  // ── Date-range report ────────────────────────────────────────────────────
  const [drFrom,    setDrFrom]    = useState(localToday());
  const [drTo,      setDrTo]      = useState(localToday());
  const [drData,    setDrData]    = useState(null);
  const [drLoading, setDrLoading] = useState(false);
  const [drError,   setDrError]   = useState("");

  const fetchDateRange = useCallback(async (from, to) => {
    setDrLoading(true);
    setDrError("");
    setDrData(null);
    try {
      const res = await api.get("/api/reports/date-range", { params: { from, to } });
      setDrData(res.data);
    } catch (e) {
      setDrError(e.response?.data?.error || "Failed to load date-range report");
    } finally {
      setDrLoading(false);
    }
  }, []);

  return {
    // summary
    data, loading, error, refresh: fetchSummary,
    // date-range
    drFrom, setDrFrom, drTo, setDrTo,
    drData, drLoading, drError, fetchDateRange,
  };
}
