import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export default function useReports() {
  // ── active tab ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("daily"); // daily | monthly | bestProducts | profit

  // ── shared loading / error ───────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── DAILY state ──────────────────────────────────────────────────────────
  const [dailyDate, setDailyDate] = useState(today());
  const [dailyData, setDailyData] = useState(null);

  // ── MONTHLY state ────────────────────────────────────────────────────────
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState(null);

  // ── BEST PRODUCTS state ──────────────────────────────────────────────────
  const [bpFrom, setBpFrom] = useState(firstDayOfMonth());
  const [bpTo, setBpTo] = useState(today());
  const [bpSortBy, setBpSortBy] = useState("qty"); // qty | revenue
  const [bpData, setBpData] = useState(null);

  // ── PROFIT state ─────────────────────────────────────────────────────────
  const [profitFrom, setProfitFrom] = useState(firstDayOfMonth());
  const [profitTo, setProfitTo] = useState(today());
  const [profitData, setProfitData] = useState(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function today() {
    return new Date().toISOString().slice(0, 10);
  }
  function firstDayOfMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  }

  const fetchDaily = useCallback(async (date) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/reports/daily`, { params: { date } });
      setDailyData(data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load daily report");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthly = useCallback(async (year, month) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/reports/monthly`, { params: { year, month } });
      setMonthlyData(data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load monthly report");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBestProducts = useCallback(async (from, to) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/reports/best-products`, { params: { from, to, limit: 20 } });
      setBpData(data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load best products report");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfit = useCallback(async (from, to) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/reports/profit`, { params: { from, to } });
      setProfitData(data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load profit report");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-fetch on tab/param change ────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "daily")       fetchDaily(dailyDate);
  }, [activeTab, dailyDate, fetchDaily]);

  useEffect(() => {
    if (activeTab === "monthly")     fetchMonthly(monthlyYear, monthlyMonth);
  }, [activeTab, monthlyYear, monthlyMonth, fetchMonthly]);

  useEffect(() => {
    if (activeTab === "bestProducts") fetchBestProducts(bpFrom, bpTo);
  }, [activeTab, bpFrom, bpTo, fetchBestProducts]);

  useEffect(() => {
    if (activeTab === "profit")      fetchProfit(profitFrom, profitTo);
  }, [activeTab, profitFrom, profitTo, fetchProfit]);

  return {
    activeTab, setActiveTab,
    loading, error,
    // daily
    dailyDate, setDailyDate, dailyData, fetchDaily,
    // monthly
    monthlyYear, setMonthlyYear, monthlyMonth, setMonthlyMonth, monthlyData, fetchMonthly,
    // best products
    bpFrom, setBpFrom, bpTo, setBpTo, bpSortBy, setBpSortBy, bpData, fetchBestProducts,
    // profit
    profitFrom, setProfitFrom, profitTo, setProfitTo, profitData, fetchProfit,
  };
}
