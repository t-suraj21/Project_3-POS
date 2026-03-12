/**
 * useInventory.js — Inventory Management Hook
 *
 * This hook is the single source of truth for everything the Inventory
 * page needs. Keeping all the data-fetching, filtering and mutation logic
 * here means the page component stays clean and focused on rendering.
 *
 * What this hook manages:
 *   - Summary KPI cards  (total SKUs, stock value, low-stock count …)
 *   - Full stock list    (searchable + filterable by category / status)
 *   - Low-stock warnings (products at or below their alert level)
 *   - Stock update form  (add / subtract / restock / adjust a product)
 *   - Stock history      (full audit log with optional per-product filter)
 *
 * All API calls are scoped to the authenticated shop via the JWT that
 * the Axios instance in services/api.js attaches automatically.
 */
import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Empty skeleton so the summary KPIs render with zeros, not undefined. */
const EMPTY_SUMMARY = {
  total_products:    0,
  total_stock_units: 0,
  low_stock_count:   0,
  out_of_stock:      0,
  stock_value:       0,
  retail_value:      0,
};

/** Default shape for the stock-update form. */
const EMPTY_FORM = {
  productId:   "",
  changeType:  "restock",   // restock | manual | adjustment | return
  quantity:    "",
  note:        "",
};

// ─── Main hook ────────────────────────────────────────────────────────────────

/**
 * useInventory()
 *
 * Returns everything the Inventory page needs in one flat object.
 * Destructure only what each sub-section needs so components stay lean.
 */
const useInventory = () => {
  // ── Active tab ─────────────────────────────────────────────────
  // "stock-list" | "low-stock" | "stock-update" | "history"
  const [activeTab, setActiveTab] = useState("stock-list");

  // ── Summary KPIs ───────────────────────────────────────────────
  const [summary,        setSummary]        = useState(EMPTY_SUMMARY);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError,   setSummaryError]   = useState(null);

  // ── Stock list ─────────────────────────────────────────────────
  const [stockList,        setStockList]        = useState([]);
  const [stockListLoading, setStockListLoading] = useState(false);
  const [stockListError,   setStockListError]   = useState(null);
  // Filters for the stock list tab
  const [stockSearch,     setStockSearch]     = useState("");
  const [stockCategory,   setStockCategory]   = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState(""); // "" | "low" | "out"
  const [stockSort,       setStockSort]       = useState("name");

  // ── Low-stock items ────────────────────────────────────────────
  const [lowStockItems,   setLowStockItems]   = useState([]);
  const [lowStockLoading, setLowStockLoading] = useState(false);
  const [lowStockError,   setLowStockError]   = useState(null);

  // ── Stock update form ──────────────────────────────────────────
  const [updateForm,      setUpdateForm]      = useState(EMPTY_FORM);
  const [updateLoading,   setUpdateLoading]   = useState(false);
  const [updateError,     setUpdateError]     = useState(null);
  const [updateSuccess,   setUpdateSuccess]   = useState(null);
  // Product search inside the update tab
  const [productSearch,   setProductSearch]   = useState("");
  const [productOptions,  setProductOptions]  = useState([]);

  // ── Stock history ──────────────────────────────────────────────
  const [history,        setHistory]        = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError,   setHistoryError]   = useState(null);
  const [historyFilter,  setHistoryFilter]  = useState({
    productId:  "",
    changeType: "",
    limit:      100,
  });

  // ── Categories (used in stock list filter dropdown) ────────────
  const [categories, setCategories] = useState([]);

  // ─────────────────────────────────────────────────────────────
  // Fetch helpers — each wrapped in useCallback so they can be
  // safely listed as dependencies in useEffect without infinite loops
  // ─────────────────────────────────────────────────────────────

  /** Fetch the KPI summary cards. */
  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await api.get("/api/inventory/summary");
      setSummary(res.data);
    } catch (err) {
      setSummaryError(err.response?.data?.error || "Could not load inventory summary.");
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  /** Fetch the full stock list, respecting current filter state. */
  const fetchStockList = useCallback(async () => {
    setStockListLoading(true);
    setStockListError(null);
    try {
      const params = new URLSearchParams();
      if (stockSearch)       params.set("search",      stockSearch);
      if (stockCategory)     params.set("category_id", stockCategory);
      if (stockStatusFilter) params.set("status",      stockStatusFilter);
      if (stockSort)         params.set("sort",        stockSort);

      const res = await api.get(`/api/inventory/stock?${params}`);
      setStockList(res.data?.products || []);
    } catch (err) {
      setStockListError(err.response?.data?.error || "Could not load stock list.");
    } finally {
      setStockListLoading(false);
    }
  }, [stockSearch, stockCategory, stockStatusFilter, stockSort]);

  /** Fetch products at or below their alert stock level. */
  const fetchLowStock = useCallback(async () => {
    setLowStockLoading(true);
    setLowStockError(null);
    try {
      const res = await api.get("/api/inventory/low-stock");
      setLowStockItems(res.data?.products || []);
    } catch (err) {
      setLowStockError(err.response?.data?.error || "Could not load low-stock data.");
    } finally {
      setLowStockLoading(false);
    }
  }, []);

  /** Fetch stock change history, honouring current filter state. */
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const params = new URLSearchParams();
      if (historyFilter.productId)  params.set("product_id",  historyFilter.productId);
      if (historyFilter.changeType) params.set("change_type", historyFilter.changeType);
      if (historyFilter.limit)      params.set("limit",       historyFilter.limit);

      const res = await api.get(`/api/inventory/history?${params}`);
      setHistory(res.data?.history || []);
    } catch (err) {
      setHistoryError(err.response?.data?.error || "Could not load stock history.");
    } finally {
      setHistoryLoading(false);
    }
  }, [historyFilter]);

  /** Fetch categories for the filter dropdown. */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/api/categories/flat");
      setCategories(res.data?.categories || []);
    } catch { /* categories are optional — fail silently */ }
  }, []);

  /** Search products by name for the stock-update product picker. */
  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) { setProductOptions([]); return; }
    try {
      const res = await api.get(`/api/products?search=${encodeURIComponent(query)}`);
      setProductOptions(res.data?.products || []);
    } catch { setProductOptions([]); }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Side effects — auto-fetch when filters or active tab change
  // ─────────────────────────────────────────────────────────────

  // Summary always loads (it's shown on every tab)
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  // Categories load once
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Stock list loads when its tab is active or its filters change
  useEffect(() => {
    if (activeTab === "stock-list") fetchStockList();
  }, [activeTab, fetchStockList]);

  // Low-stock loads when its tab is active
  useEffect(() => {
    if (activeTab === "low-stock") fetchLowStock();
  }, [activeTab, fetchLowStock]);

  // History loads when its tab is active or its filters change
  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab, fetchHistory]);

  // Debounce the product search in the update form to avoid hammering the API
  useEffect(() => {
    const timer = setTimeout(() => searchProducts(productSearch), 350);
    return () => clearTimeout(timer);
  }, [productSearch, searchProducts]);

  // ─────────────────────────────────────────────────────────────
  // Mutation — submit stock update
  // ─────────────────────────────────────────────────────────────

  /**
   * Submit the stock update form.
   * On success we refresh the summary, stock list, and history so
   * all tabs reflect the latest data without needing a page reload.
   */
  const submitStockUpdate = useCallback(async () => {
    setUpdateError(null);
    setUpdateSuccess(null);

    if (!updateForm.productId) {
      setUpdateError("Please select a product first.");
      return;
    }
    if (!updateForm.quantity || isNaN(Number(updateForm.quantity))) {
      setUpdateError("Please enter a valid quantity.");
      return;
    }

    setUpdateLoading(true);
    try {
      const res = await api.post(`/api/inventory/stock/${updateForm.productId}`, {
        change_type: updateForm.changeType,
        quantity:    Number(updateForm.quantity),
        note:        updateForm.note.trim() || undefined,
      });

      setUpdateSuccess(res.data);
      // Reset the form but keep the product selected so the user can
      // do another quick update without re-selecting the product.
      setUpdateForm((prev) => ({ ...prev, quantity: "", note: "" }));

      // Refresh everything so other tabs stay up-to-date
      fetchSummary();
      if (activeTab === "stock-list") fetchStockList();
      if (activeTab === "low-stock")  fetchLowStock();
    } catch (err) {
      setUpdateError(err.response?.data?.error || "Stock update failed. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  }, [updateForm, activeTab, fetchSummary, fetchStockList, fetchLowStock]);

  /** Helpers to update specific form fields cleanly from the form UI. */
  const setUpdateField = useCallback((field, value) => {
    setUpdateForm((prev) => ({ ...prev, [field]: value }));
    // Clear result messages when the user starts editing again
    setUpdateError(null);
    setUpdateSuccess(null);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Expose everything
  // ─────────────────────────────────────────────────────────────
  return {
    // Tab control
    activeTab, setActiveTab,

    // Summary
    summary, summaryLoading, summaryError, refreshSummary: fetchSummary,

    // Stock list
    stockList, stockListLoading, stockListError,
    stockSearch, setStockSearch,
    stockCategory, setStockCategory,
    stockStatusFilter, setStockStatusFilter,
    stockSort, setStockSort,
    refreshStockList: fetchStockList,

    // Low stock
    lowStockItems, lowStockLoading, lowStockError, refreshLowStock: fetchLowStock,

    // Stock update
    updateForm, setUpdateField,
    productSearch, setProductSearch,
    productOptions, setProductOptions,
    updateLoading, updateError, updateSuccess,
    submitStockUpdate,

    // History
    history, historyLoading, historyError,
    historyFilter, setHistoryFilter,
    refreshHistory: fetchHistory,

    // Shared
    categories,
  };
};

export default useInventory;
