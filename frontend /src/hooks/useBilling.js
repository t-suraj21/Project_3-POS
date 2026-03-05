import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import useRazorpay from "./useRazorpay";

/* ─────────────────────────────────────────────────────────────────────────────
   useBilling
   Reads order data from navigation state (passed from Sales page),
   manages payment UI, and submits the final sale to the backend.
───────────────────────────────────────────────────────────────────────────── */
const useBilling = () => {
  const { id: shopId } = useParams();
  const location       = useLocation();
  const navigate       = useNavigate();
  const { openCheckout } = useRazorpay();

  // ── Order data from Sales page ─────────────────────────────────────
  const orderState = location.state;

  // Redirect immediately if billing was opened without order state
  useEffect(() => {
    if (!orderState?.cart || orderState.cart.length === 0) {
      navigate(`/shop/${shopId}/sales`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    cart          = [],
    customer      = {},
    counterNumber = "01",
    subtotal      = 0,
    productDiscount = 0,
    couponDiscountAmt = 0,
    extraDiscountAmt  = 0,
    discountAmt   = 0,
    taxTotal      = 0,
    grandTotal    = 0,
    note: orderNote = "",
  } = orderState || {};

  // ── Customers (for returning customer dropdown) ──────────────────
  const [customers,          setCustomers]          = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // ── Editable active customer (pre-filled from Sales, overrideable) ─
  const [activeCustomer, setActiveCustomer] = useState({
    id:      customer.id      || null,
    name:    customer.name    || "",
    phone:   customer.phone   || "",
    address: customer.address || "",
  });

  useEffect(() => {
    api.get("/api/accounts/customers?limit=200")
      .then(r => setCustomers(r.data?.customers || []))
      .catch(() => {});
  }, []);

  const handleCustomerSelect = (e) => {
    const val = e.target.value;
    setSelectedCustomerId(val);
    if (val) {
      const c = customers.find(cs => String(cs.id) === val);
      if (c) setActiveCustomer({ id: c.id, name: c.name || "", phone: c.phone || "", address: c.address || "" });
    } else {
      setActiveCustomer({ id: null, name: "", phone: "", address: "" });
    }
  };

  // ── Payment state ──────────────────────────────────────────────────
  const [paymentMode, setPaymentMode] = useState("cash");
  const [paidAmount,  setPaidAmount]  = useState("");
  const [upiRef,      setUpiRef]      = useState("");
  const [cardRef,     setCardRef]     = useState("");
  const [note,        setNote]        = useState(orderNote || "");

  // ── Checkout state ─────────────────────────────────────────────────
  const [submitting,   setSubmitting]   = useState(false);
  const [checkoutErr,  setCheckoutErr]  = useState("");
  const [receipt,      setReceipt]      = useState(null);
  const [rzProcessing, setRzProcessing] = useState(false);

  // ── Derived amounts ────────────────────────────────────────────────
  const paid     = parseFloat(paidAmount) || 0;
  const change   = paymentMode === "cash"   ? Math.max(0, paid - grandTotal)   : 0;
  const balanceDue =
    paymentMode === "credit"                           ? grandTotal
    : paymentMode === "upi"  || paymentMode === "card" ? 0
    : paymentMode === "cash"                           ? Math.max(0, grandTotal - paid)
    : 0; // online handled separately

  // ── Mode change helper ──────────────────────────────────────────────
  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
    setUpiRef("");
    setCardRef("");
    setCheckoutErr("");
    if (mode !== "cash") setPaidAmount("");
  };

  // ── Quick amount setters ───────────────────────────────────────────
  const setFullPaid   = () => setPaidAmount(grandTotal.toFixed(2));
  const setRoundedUp  = () => {
    const rounded = Math.ceil(grandTotal / 50) * 50;
    setPaidAmount(rounded.toFixed(2));
  };

  // ── Items builder (shared) ─────────────────────────────────────────
  const buildItems = () =>
    cart.map(i => ({
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

  // ── Offline checkout (cash / upi / card / credit) ─────────────────
  const handleCheckout = async () => {
    if (cart.length === 0) { setCheckoutErr("Cart is empty."); return; }

    const effectivePaid =
      paymentMode === "credit"                              ? 0
      : paymentMode === "upi" || paymentMode === "card"    ? grandTotal
      : (paid > 0 ? Math.min(paid + change, paid + change) : grandTotal);

    // Cash: use exact paid, not grandTotal
    const finalPaid =
      paymentMode === "credit" ? 0
      : paymentMode === "upi" || paymentMode === "card" ? grandTotal
      : paid > 0 ? paid : grandTotal;

    let finalNote = (note || "").trim();
    if (paymentMode === "upi"  && upiRef.trim())  finalNote = `UPI Ref/UTR: ${upiRef.trim()}${finalNote ? " | " + finalNote : ""}`;
    if (paymentMode === "card" && cardRef.trim())  finalNote = `Card Ref: ${cardRef.trim()}${finalNote ? " | " + finalNote : ""}`;

    setCheckoutErr("");
    setSubmitting(true);

    try {
      const res = await api.post("/api/sales", {
        items:            buildItems(),
        discount:         discountAmt,
        tax_amount:       taxTotal,
        paid_amount:      finalPaid,
        payment_mode:     paymentMode,
        customer_id:      activeCustomer.id      || null,
        customer_name:    activeCustomer.name    || "",
        customer_phone:   activeCustomer.phone   || "",
        customer_address: activeCustomer.address || "",
        note:             finalNote || null,
      });

      const balDue = Math.max(0, grandTotal - finalPaid);
      const saleStatus =
        paymentMode === "credit" ? "credit"
        : finalPaid >= grandTotal ? "paid"
        : "partial";

      setReceipt({
        ...res.data,
        grandTotal,
        paidAmt:    finalPaid,
        balanceDue: balDue,
        saleStatus,
        change:     paymentMode === "cash" ? Math.max(0, finalPaid - grandTotal) : 0,
        cart:       [...cart],
        paymentMode,
        customerName:    activeCustomer.name    || "",
        customerPhone:   activeCustomer.phone   || "",
        customerAddress: activeCustomer.address || "",
      });
    } catch (err) {
      setCheckoutErr(err.response?.data?.error || "Sale failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Online checkout (Razorpay) ────────────────────────────────────
  const handleOnlineCheckout = async () => {
    if (cart.length === 0) { setCheckoutErr("Cart is empty."); return; }
    setCheckoutErr("");
    setRzProcessing(true);

    try {
      const { data: orderData } = await api.post("/api/sales/razorpay/create-order", {
        items:            buildItems(),
        discount:         discountAmt,
        tax_amount:       taxTotal,
        customer_id:      activeCustomer.id      || null,
        customer_name:    activeCustomer.name    || "",
        customer_phone:   activeCustomer.phone   || "",
        customer_address: activeCustomer.address || "",
        note:             note || null,
      });
      setRzProcessing(false);

      openCheckout(orderData, {
        onSuccess: async (rzResponse) => {
          setRzProcessing(true);
          try {
            const { data: verifyData } = await api.post("/api/sales/razorpay/verify-payment", {
              razorpay_order_id:   rzResponse.razorpay_order_id,
              razorpay_payment_id: rzResponse.razorpay_payment_id,
              razorpay_signature:  rzResponse.razorpay_signature,
            });
            setReceipt({
              ...verifyData,
              grandTotal,
              paidAmt:    grandTotal,
              balanceDue: 0,
              saleStatus: "paid",
              change:     0,
              cart:       [...cart],
              paymentMode: "online",
              paymentId:   rzResponse.razorpay_payment_id,
              customerName:    activeCustomer.name    || "",
              customerPhone:   activeCustomer.phone   || "",
              customerAddress: activeCustomer.address || "",
            });
          } catch (err) {
            setCheckoutErr(err.response?.data?.error || "Payment verification failed.");
          } finally {
            setRzProcessing(false);
          }
        },
        onFailure: (err) => {
          setCheckoutErr(`Payment failed: ${err?.description || "Please try again."}`);
          setRzProcessing(false);
        },
        onDismiss: () => {
          setCheckoutErr("Payment cancelled.");
          setRzProcessing(false);
        },
      });
    } catch (err) {
      setCheckoutErr(err.response?.data?.error || "Failed to initiate payment.");
      setRzProcessing(false);
    }
  };

  // ── Navigation helpers ─────────────────────────────────────────────
  const goBackToCart = () => navigate(-1);

  const startNewSale = () =>
    navigate(`/shop/${shopId}/sales`, { replace: true });

  const goToOrders = () =>
    navigate(`/shop/${shopId}/orders`, { replace: true });

  return {
    shopId,
    // order data
    cart, counterNumber,
    // customer
    customers, selectedCustomerId, handleCustomerSelect,
    activeCustomer, setActiveCustomer,
    subtotal, productDiscount, couponDiscountAmt, extraDiscountAmt,
    discountAmt, taxTotal, grandTotal,
    // payment state
    paymentMode, handlePaymentModeChange,
    paidAmount, setPaidAmount, setFullPaid, setRoundedUp,
    upiRef, setUpiRef,
    cardRef, setCardRef,
    note, setNote,
    // derived
    paid, change, balanceDue,
    // checkout
    submitting, checkoutErr,
    handleCheckout, handleOnlineCheckout, rzProcessing,
    // receipt
    receipt, setReceipt,
    // nav
    goBackToCart, startNewSale, goToOrders,
  };
};

export default useBilling;
