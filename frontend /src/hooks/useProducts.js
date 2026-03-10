/**
 * useProducts.js — Products List Hook
 *
 * Manages all the state and data-fetching logic for the Products list page.
 * Keeping this code in a hook (rather than directly in the component) means
 * the page component stays lean and focused on rendering, while all the
 * "how do I get products from the server?" complexity lives here.
 *
 * What this hook provides:
 *   - Fetching products from /api/products with search, category, low-stock filters
 *   - Toggling product availability (available ⮔ unavailable) with optimistic UI
 *   - Deleting a product with a confirmation prompt
 *   - The categories list (for the filter dropdown)
 *   - Loading and error state
 *
 * Must be used inside a route with a :id param (e.g., /shop/:id/products).
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";

// Base URL for product images. Empty because Vite proxies /uploads/* to PHP.
export const IMG_BASE = "";

/**
 * Hook for the Products list page.
 * Provides product and category data, search / filter / delete / toggle actions.
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
      // The API wraps products in { products: [...] }. We handle both shapes
      // (direct array or wrapped object) for backwards compatibility.
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
      // Update the local list immediately — no need to re-fetch the entire list
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete product.");
    }
  };

  // ── Toggle availability ───────────────────────────────────────────
  const toggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus ? 0 : 1;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => p.id === productId ? { ...p, is_available: newStatus } : p)
    );
    try {
      await api.patch(`/api/products/${productId}/status`, { is_available: newStatus });
    } catch (err) {
      // Revert the optimistic update so the toggle shows the real server value
      setProducts((prev) =>
        prev.map((p) => p.id === productId ? { ...p, is_available: currentStatus } : p)
      );
      alert(err.response?.data?.error || "Failed to update product status.");
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
    toggleStatus,
    refresh: fetchProducts,  // allows the page to trigger a manual re-fetch
  };
};
