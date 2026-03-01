import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";

export const IMG_BASE = "";

/**
 * Hook for the Products list page.
 * Provides product and category data, search / filter / delete actions,
 * and loading / error state.
 *
 * Reads the current shop id from the :id URL param.
 * Must be used inside a route that has a :id segment.
 */
export const useProducts = () => {
  const { id: shopId }   = useParams();
  const [searchParams]   = useSearchParams();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState(searchParams.get("search")      || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("category_id") || "");
  const [lowStock,   setLowStock]   = useState(searchParams.get("low_stock") === "1");

  // ── Categories (non-critical) ─────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/api/categories/flat");
      setCategories(res.data?.categories || []);
    } catch { /* silent — categories are a filter aid only */ }
  }, []);

  // ── Products ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search)     params.set("search",      search);
      if (categoryId) params.set("category_id", categoryId);
      if (lowStock)   params.set("low_stock",   "1");

      const res = await api.get(`/api/products?${params.toString()}`);
      setProducts(Array.isArray(res.data) ? res.data : (res.data?.products || []));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, lowStock]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts();   }, [fetchProducts]);

  // ── Delete ────────────────────────────────────────────────────────
  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/api/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete product.");
    }
  };

  return {
    shopId,
    products,
    categories,
    loading,
    error,
    search,     setSearch,
    categoryId, setCategoryId,
    lowStock,   setLowStock,
    deleteProduct,
    refresh: fetchProducts,
  };
};
