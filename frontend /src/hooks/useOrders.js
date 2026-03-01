import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const useOrders = (statusFilter = "all") => {
  const { id: shopId } = useParams();

  const [orders,   setOrders]   = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [date,     setDate]     = useState("");
  const [detail,   setDetail]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Collect-payment modal state ────────────────────────────────────
  const [payModal, setPayModal] = useState({
    open: false, orderId: null, billNo: "", remaining: 0, customerName: "",
  });
  const [payAmount,  setPayAmount]  = useState("");
  const [payMode,    setPayMode]    = useState("cash");
  const [payNote,    setPayNote]    = useState("");
  const [payErr,     setPayErr]     = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // ── Fetch orders ───────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ status: statusFilter, limit: "200" });
      if (search) params.set("search", search);
      if (date)   params.set("date",   date);
      const res = await api.get(`/api/sales?${params.toString()}`);
      setOrders(res.data?.sales || []);
      setTotal(res.data?.total  || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, date]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Load order detail ──────────────────────────────────────────────
  const loadDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/sales/${id}`);
      setDetail(res.data?.sale);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setDetail(null);

  // ── Refund ─────────────────────────────────────────────────────────
  const refundOrder = async (id) => {
    if (!window.confirm("Refund this order? Stock will be restored and this cannot be undone.")) return;
    try {
      await api.put(`/api/sales/${id}/refund`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || "Refund failed.");
    }
  };

  // ── Collect payment (for pending / credit / partial orders) ────────
  const openPayModal = (order) => {
    const remaining = Math.max(0,
      parseFloat(order.total_amount || 0) - parseFloat(order.paid_amount || 0)
    );
    setPayModal({
      open: true,
      orderId:      order.id,
      billNo:       order.bill_number || `#${order.id}`,
      remaining,
      customerName: order.customer_name || "Customer",
    });
    setPayAmount(remaining.toFixed(2));
    setPayMode("cash");
    setPayNote("");
    setPayErr("");
  };

  const closePayModal = () => {
    setPayModal(m => ({ ...m, open: false }));
    setPayErr("");
  };

  const submitPayment = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { setPayErr("Enter a valid amount."); return; }
    if (amt > payModal.remaining + 0.01) {
      setPayErr(`Cannot exceed remaining balance ₹${payModal.remaining.toFixed(2)}.`);
      return;
    }
    setPayLoading(true); setPayErr("");
    try {
      await api.post(`/api/sales/${payModal.orderId}/collect-payment`, {
        amount:       amt,
        payment_mode: payMode,
        note:         payNote || null,
      });
      closePayModal();
      fetchOrders();
    } catch (err) {
      setPayErr(err.response?.data?.error || "Payment failed.");
    } finally {
      setPayLoading(false);
    }
  };

  // ── CSV Export ─────────────────────────────────────────────────────
  const exportCSV = () => {
    if (orders.length === 0) return;
    const headers = ["Order ID","Date","Customer","Items","Order Amount","Discount","Tax","Total","Paid By","Status"];
    const rows = orders.map(o => [
      o.bill_number,
      new Date(o.created_at).toLocaleString(),
      o.customer_name || "Walk-In Customer",
      o.item_count,
      o.subtotal,
      o.discount,
      o.tax_amount,
      o.total_amount,
      o.payment_mode,
      o.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
    const a   = document.createElement("a");
    a.href    = "data:text/csv," + encodeURIComponent(csv);
    a.download = `orders_${statusFilter}_${Date.now()}.csv`;
    a.click();
  };

  return {
    shopId,
    orders, total, loading, error,
    search, setSearch,
    date,   setDate,
    detail, detailLoading, loadDetail, closeDetail,
    refundOrder,
    exportCSV,
    refresh: fetchOrders,
    // collect payment
    payModal, openPayModal, closePayModal, submitPayment,
    payAmount, setPayAmount,
    payMode,   setPayMode,
    payNote,   setPayNote,
    payErr,    payLoading,
  };
};

export default useOrders;
