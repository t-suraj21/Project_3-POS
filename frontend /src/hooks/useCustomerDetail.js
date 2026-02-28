import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

/**
 * Hook for the Customer Detail page.
 * Fetches a single credit customer together with their full transaction
 * history (including line items) and payment history.
 * Provides an "Add Payment" modal (FIFO allocation handled by the backend)
 * and an "Add Transaction" modal with auto-calculated item totals.
 *
 * Reads :customerId from the URL.
 * Must be used inside a route that has an :customerId segment.
 */
export const useCustomerDetail = () => {
  const { customerId } = useParams();

  const [customer,     setCustomer]     = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments,     setPayments]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // ── Expanded transaction rows ─────────────────────────────────────
  const [expanded, setExpanded] = useState(new Set());

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Add Payment modal ─────────────────────────────────────────────
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm,      setPayForm]      = useState({ amount: "", payment_mode: "cash", note: "" });
  const [paySaving,    setPaySaving]    = useState(false);
  const [payError,     setPayError]     = useState(null);

  // ── Add Transaction modal ─────────────────────────────────────────
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnForm,      setTxnForm]      = useState({
    bill_number: "", total_amount: "", paid_amount: "0", note: "",
    items: [{ product_name: "", quantity: "1", price: "", total: "" }],
  });
  const [txnSaving, setTxnSaving] = useState(false);
  const [txnError,  setTxnError]  = useState(null);

  // ── Fetch customer detail ─────────────────────────────────────────
  const fetchDetail = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/api/accounts/customers/${customerId}`);
      setCustomer(res.data.customer);
      setTransactions(res.data.transactions || []);
      setPayments(res.data.payments || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load customer details.");
    } finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  // ── Payment form handlers ─────────────────────────────────────────
  const openPayModal  = () => {
    setPayForm({ amount: "", payment_mode: "cash", note: "" });
    setPayError(null);
    setShowPayModal(true);
  };
  const closePayModal = () => setShowPayModal(false);

  const handlePayFormChange = (e) => {
    const { name, value } = e.target;
    setPayForm((p) => ({ ...p, [name]: value }));
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    const amount = parseFloat(payForm.amount);
    if (!amount || amount <= 0) { setPayError("Enter a valid payment amount."); return; }

    setPaySaving(true); setPayError(null);
    try {
      await api.post("/api/accounts/payments", {
        customer_id:  parseInt(customerId),
        amount,
        payment_mode: payForm.payment_mode,
        note:         payForm.note || null,
      });
      closePayModal();
      fetchDetail();
    } catch (err) {
      setPayError(err.response?.data?.error || "Failed to record payment.");
    } finally { setPaySaving(false); }
  };

  // ── Transaction form handlers ─────────────────────────────────────
  const openTxnModal = () => {
    setTxnForm({
      bill_number: "", total_amount: "", paid_amount: "0", note: "",
      items: [{ product_name: "", quantity: "1", price: "", total: "" }],
    });
    setTxnError(null);
    setShowTxnModal(true);
  };
  const closeTxnModal = () => setShowTxnModal(false);

  const handleTxnFormChange = (e) => {
    const { name, value } = e.target;
    setTxnForm((p) => ({ ...p, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setTxnForm((p) => {
      const items = [...p.items];
      items[idx]  = { ...items[idx], [field]: value };

      // Auto-calc row total when qty or price changes
      if (field === "quantity" || field === "price") {
        const qty   = parseFloat(field === "quantity" ? value : items[idx].quantity) || 0;
        const price = parseFloat(field === "price"    ? value : items[idx].price)    || 0;
        items[idx].total = (qty * price).toFixed(2);
      }

      // Auto-sum total_amount from all rows
      const sum = items.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);
      return { ...p, items, total_amount: sum.toFixed(2) };
    });
  };

  const addItem    = () =>
    setTxnForm((p) => ({
      ...p,
      items: [...p.items, { product_name: "", quantity: "1", price: "", total: "" }],
    }));

  const removeItem = (idx) =>
    setTxnForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const total = parseFloat(txnForm.total_amount);
    if (!total || total <= 0) { setTxnError("Total amount must be greater than 0."); return; }

    setTxnSaving(true); setTxnError(null);
    try {
      await api.post("/api/accounts/transactions", {
        customer_id:  parseInt(customerId),
        bill_number:  txnForm.bill_number  || undefined,
        total_amount: total,
        paid_amount:  parseFloat(txnForm.paid_amount) || 0,
        note:         txnForm.note || null,
        items: txnForm.items
          .filter((it) => it.product_name.trim())
          .map((it) => ({
            product_name: it.product_name.trim(),
            quantity:     parseInt(it.quantity) || 1,
            price:        parseFloat(it.price)  || 0,
            total:        parseFloat(it.total)  || 0,
          })),
      });
      closeTxnModal();
      fetchDetail();
    } catch (err) {
      setTxnError(err.response?.data?.error || "Failed to record transaction.");
    } finally { setTxnSaving(false); }
  };

  return {
    customer, transactions, payments, loading, error,
    expanded, toggleExpand,
    // payment modal
    showPayModal, openPayModal, closePayModal,
    payForm, handlePayFormChange, handleAddPayment, paySaving, payError,
    // transaction modal
    showTxnModal, openTxnModal, closeTxnModal,
    txnForm, handleTxnFormChange, handleItemChange, addItem, removeItem,
    handleAddTransaction, txnSaving, txnError,
  };
};
