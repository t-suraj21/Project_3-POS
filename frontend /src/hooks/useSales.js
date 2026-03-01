import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export const IMG_BASE = "";   // images proxied via Vite → /uploads/...

const useSales = () => {
  const { id: shopId } = useParams();

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
  const [paymentMode,      setPaymentMode]      = useState("cash");
  const [paidAmount,       setPaidAmount]       = useState("");
  const [customerName,     setCustomerName]     = useState("");
  const [customerPhone,    setCustomerPhone]    = useState("");
  const [customerAddress,  setCustomerAddress]  = useState("");
  const [note,             setNote]             = useState("");
  const [counterNumber,    setCounterNumber]    = useState("01");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customers,        setCustomers]        = useState([]);

  // ── Checkout state ────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [receipt,    setReceipt]    = useState(null);  // receipt data on success
  const [checkoutErr,setCheckoutErr]= useState("");

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
    setCart([]); setPaidAmount("");
    setCouponDiscount(""); setExtraDiscount("");
    setCustomerName(""); setCustomerPhone(""); setCustomerAddress(""); setNote("");
    setPaymentMode("cash"); setCheckoutErr("");
    setSelectedCustomerId("");
  };

  // ── Two-level category handlers ───────────────────────────────────────────
  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
    // For UPI/Card always full payment; clear paid field for cash and credit
    if (mode === "upi" || mode === "card") {
      setPaidAmount("");  // will default to grandTotal at submit
    } else if (mode === "credit") {
      setPaidAmount("");
    }
    // cash: keep whatever the user typed
  };

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
  const paid              = parseFloat(paidAmount) || 0;
  const change            = paymentMode === "cash" ? Math.max(0, paid - grandTotal) : 0;

  // ── Checkout ──────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0) { setCheckoutErr("Add at least one product."); return; }

    // Resolve name/phone/address — either from dropdown or typed fields
    const resolvedName    = selectedCustomerId
      ? (customers.find(c => String(c.id) === String(selectedCustomerId))?.name    || "")
      : customerName.trim();
    const resolvedPhone   = selectedCustomerId
      ? (customers.find(c => String(c.id) === String(selectedCustomerId))?.phone   || "")
      : customerPhone.trim();
    const resolvedAddress = selectedCustomerId
      ? (customers.find(c => String(c.id) === String(selectedCustomerId))?.address || "")
      : customerAddress.trim();

    if (!resolvedName) {
      setCheckoutErr("Customer name is required."); return;
    }
    if (!resolvedPhone) {
      setCheckoutErr("Customer mobile number is required."); return;
    }
    if (!resolvedAddress) {
      setCheckoutErr("Customer address is required."); return;
    }

    setCheckoutErr("");
    setSubmitting(true);

    const items = cart.map(i => ({
      product_id:      i.id,
      product_name:    i.name,
      sku:             i.sku    || null,
      unit:            i.unit   || null,
      quantity:        i.qty,
      cost_price:      parseFloat(i.cost_price) || 0,
      sell_price:      parseFloat(i.sell_price),
      discount_amount: 0,
      total:           parseFloat(i.sell_price) * i.qty,
    }));

    // Paid amount logic:
    //  credit → 0 paid (owes full amount)
    //  upi / card → always full payment
    //  cash → whatever cashier entered; if blank default to grandTotal (full)
    const effectivePaid =
      paymentMode === "credit"                      ? 0
      : paymentMode === "upi" || paymentMode === "card" ? grandTotal
      : (paid > 0 ? paid : grandTotal);

    const body = {
      items,
      discount:          discountAmt,
      tax_amount:        taxTotal,
      paid_amount:       effectivePaid,
      payment_mode:      paymentMode,
      customer_id:       selectedCustomerId || null,
      customer_name:     resolvedName,
      customer_phone:    resolvedPhone,
      customer_address:  resolvedAddress,
      note:              note || null,
    };

    try {
      const res   = await api.post("/api/sales", body);
      const balDue = Math.max(0, grandTotal - effectivePaid);
      const saleStatus =
        paymentMode === "credit" ? "credit"
        : effectivePaid >= grandTotal ? "paid"
        : "partial";

      setReceipt({
        ...res.data,
        grandTotal,
        paidAmt:       effectivePaid,
        balanceDue:    balDue,
        saleStatus,
        change:        paymentMode === "cash" ? Math.max(0, effectivePaid - grandTotal) : 0,
        cart:          [...cart],
        paymentMode,
        customerName:    resolvedName,
        customerPhone:   resolvedPhone,
        customerAddress: resolvedAddress,
      });
      clearCart();
    } catch (err) {
      setCheckoutErr(err.response?.data?.error || "Sale failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
    paymentMode, setPaymentMode,
    paidAmount, setPaidAmount,
    note, setNote,
    // computed
    subtotal, productDiscount, taxTotal,
    couponDiscountAmt, extraDiscountAmt, discountAmt,
    grandTotal, paid, change,
    // checkout
    submitting, checkoutErr, handleCheckout,
    handlePaymentModeChange,
    // receipt
    receipt, setReceipt,
  };
};

export default useSales;
