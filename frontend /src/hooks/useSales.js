/**
 * useSales.js — Sales / POS Terminal Hook
 *
 * Manages all state and logic for the Sales (POS) page where the cashier
 * builds up a cart and proceeds to billing. This is the most interactive
 * hook in the app — it handles:
 *
 *   Product catalogue:
 *     - Fetching available products and filtering by search / category
 *     - Only available products are loaded (available_only=1) so the
 *       cashier never sees products the owner has disabled
 *
 *   Cart management:
 *     - Adding / removing items
 *     - Adjusting quantity (with stock limit enforcement)
 *     - Setting per-item discounts
 *     - Clearing the cart
 *
 *   Customer:
 *     - Selecting an existing customer account from the dropdown
 *     - Or entering a walk-in customer's name and phone manually
 *
 *   Pricing:
 *     - Coupon and extra discount amounts (in rupees)
 *     - Real-time grand total, subtotal, tax, and discount calculations
 *
 *   Checkout:
 *     - Validates the cart is not empty before proceeding
 *     - Navigates to /billing, passing the full cart + totals as route state
 *       so the Billing page can render the receipt and take payment
 *
 * The shopId comes from the :id URL param and must be present on the route.
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export const IMG_BASE = "";   // product images are proxied via Vite → /uploads/...

const useSales = () => {
  const { id: shopId } = useParams();
  const navigate = useNavigate();

  // ── Product list state ────────────────────────────────────────────
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [categoryId, setCategoryId] = useState("");

  // ── Cart state ────────────────────────────────────────────────────
  const [cart,             setCart]             = useState([]);

  const [couponDiscount,   setCouponDiscount]   = useState("");
  const [extraDiscount,    setExtraDiscount]    = useState("");
  const [customerName,     setCustomerName]     = useState("");
  const [customerPhone,    setCustomerPhone]    = useState("");
  const [customerAddress,  setCustomerAddress]  = useState("");
  const [note,             setNote]             = useState("");
  const [counterNumber,    setCounterNumber]    = useState("01");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customers,        setCustomers]        = useState([]);

  // ── Billing nav error ─────────────────────────────────────────────
  const [billingErr, setBillingErr] = useState("");

  // ── Fetch categories ──────────────────────────────────────────────
  useEffect(() => {
    api.get("/api/categories/flat")
      .then(r => setCategories(r.data?.categories || []))
      .catch(() => {});
  }, []);

  // ── Fetch customers (for billing dropdown) ────────────────────────
  useEffect(() => {
    api.get("/api/accounts/customers?limit=200")
      .then(r => setCustomers(r.data?.customers || []))
      .catch(() => {});
  }, []);

  // ── Fetch products ────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.set("search",      search);
      if (categoryId) params.set("category_id", categoryId);
      params.set("available_only", "1"); // hide products marked as unavailable
      const res = await api.get(`/api/products?${params.toString()}`);
      setProducts(Array.isArray(res.data) ? res.data : (res.data?.products || []));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Cart helpers ──────────────────────────────────────────────────
  const addToCart = (product) => {
    if (product.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;  // can't exceed stock
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1, itemDiscount: 0 }];
    });
  };

  const removeFromCart = (productId) =>
    setCart(prev => prev.filter(i => i.id !== productId));

  const updateQty = (productId, delta) =>
    setCart(prev => prev
      .map(i => i.id === productId ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.stock)) } : i)
    );

  const setQtyDirect = (productId, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 1) return;
    setCart(prev => prev.map(i => {
      if (i.id !== productId) return i;
      return { ...i, qty: Math.min(n, i.stock) };
    }));
  };

  const clearCart = () => {
    setCart([]);
    setCouponDiscount(""); setExtraDiscount("");
    setCustomerName(""); setCustomerPhone(""); setCustomerAddress(""); setNote("");
    setCounterNumber("01");
    setSelectedCustomerId("");
    setBillingErr("");
  };

  // ── Two-level category handlers ───────────────────────────────────────────
  // (kept for API compatibility — no payment mode here anymore)

  // ── Computed totals ────────────────────────────────────────────────
  const subtotal         = cart.reduce((s, i) => s + i.sell_price * i.qty, 0);
  const productDiscount  = cart.reduce((s, i) => s + (parseFloat(i.itemDiscount) || 0), 0);
  const taxTotal         = cart.reduce((s, i) => {
    const gst = parseFloat(i.gst_percent) || 0;
    return s + (i.sell_price * i.qty * gst / 100);
  }, 0);
  const couponDiscountAmt = Math.min(parseFloat(couponDiscount) || 0, subtotal);
  const extraDiscountAmt  = Math.min(parseFloat(extraDiscount)  || 0, subtotal);
  const discountAmt       = productDiscount + couponDiscountAmt + extraDiscountAmt;
  const grandTotal        = Math.max(0, subtotal + taxTotal - discountAmt);

  // ── Proceed to Billing ─────────────────────────────────────────────
  const proceedToBilling = () => {
    if (cart.length === 0) { setBillingErr("Add at least one product to the cart."); return; }

    const resolvedName    = selectedCustomerId
      ? (customers.find(c => String(c.id) === String(selectedCustomerId))?.name    || "")
      : customerName.trim();
    const resolvedPhone   = selectedCustomerId
      ? (customers.find(c => String(c.id) === String(selectedCustomerId))?.phone   || "")
      : customerPhone.trim();
    const resolvedAddress = selectedCustomerId
      ? (customers.find(c => String(c.id) === String(selectedCustomerId))?.address || "")
      : customerAddress.trim();

    if (!resolvedName)    { setBillingErr("Customer name is required.");          return; }
    if (!resolvedPhone)   { setBillingErr("Customer mobile number is required."); return; }
    if (!resolvedAddress) { setBillingErr("Customer address is required.");        return; }

    setBillingErr("");

    navigate(`/shop/${shopId}/billing`, {
      state: {
        cart: [...cart],
        customer: {
          id:      selectedCustomerId || null,
          name:    resolvedName,
          phone:   resolvedPhone,
          address: resolvedAddress,
        },
        counterNumber,
        subtotal,
        productDiscount,
        couponDiscountAmt,
        extraDiscountAmt,
        discountAmt,
        taxTotal,
        grandTotal,
        note,
      },
    });
  };

  return {
    shopId,
    // product list
    products, categories, loading,
    search, setSearch,
    categoryId, setCategoryId,
    // cart
    cart, addToCart, removeFromCart, updateQty, setQtyDirect, clearCart,
    // customer / counter
    customers, selectedCustomerId, setSelectedCustomerId,
    counterNumber, setCounterNumber,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    customerAddress, setCustomerAddress,
    // order
    couponDiscount, setCouponDiscount,
    extraDiscount, setExtraDiscount,
    note, setNote,
    // computed
    subtotal, productDiscount, taxTotal,
    couponDiscountAmt, extraDiscountAmt, discountAmt,
    grandTotal,
    // billing nav
    billingErr, proceedToBilling,
  };
};

export default useSales;
