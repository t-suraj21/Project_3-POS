import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

/**
 * useRefund.js — Refund Management Hook
 *
 * Manages refund operations:
 * - Full refund of entire sale
 * - Partial refund of specific items
 * - Track refund history
 * - Process refunds with proper stock restoration
 */

const useRefund = () => {
  const { id: shopId } = useParams();

  // Refund state
  const [refunds, setRefunds] = useState([]);
  const [saleRefunds, setSaleRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refund form state
  const [refundType, setRefundType] = useState("full"); // full or partial
  const [selectedItems, setSelectedItems] = useState([]); // for partial refunds
  const [reason, setReason] = useState("");
  const [refundMode, setRefundMode] = useState("cash");
  const [processing, setProcessing] = useState(false);

  /**
   * Fetch all refunds for the shop
   */
  const fetchRefunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/sales/refunds/list?limit=100");
      setRefunds(res.data?.refunds || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch refunds");
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch refunds for a specific sale
   */
  const fetchSaleRefunds = async (saleId) => {
    try {
      const res = await api.get(`/api/sales/${saleId}/refunds`);
      setSaleRefunds(res.data?.refunds || []);
      return res.data?.refunds || [];
    } catch (err) {
      console.error("Failed to fetch sale refunds:", err);
      setSaleRefunds([]);
      return [];
    }
  };

  /**
   * Process full or partial refund
   */
  const processRefund = async (saleId) => {
    if (refundType === "partial" && selectedItems.length === 0) {
      setError("Select at least one item to refund");
      return null;
    }

    setProcessing(true);
    setError(null);

    try {
      const body = {
        reason: reason.trim() || null,
        refund_mode: refundMode,
      };

      // For partial refund, include selected items
      if (refundType === "partial") {
        body.items = selectedItems.map(item => ({
          sale_item_id: item.id,
          quantity: item.refund_qty || item.quantity,
          reason: item.reason || reason,
        }));
      }

      const res = await api.put(`/api/sales/${saleId}/refund`, body);

      setError(null);
      setReason("");
      setSelectedItems([]);
      setRefundType("full");

      // Refresh refund history
      await fetchSaleRefunds(saleId);

      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.error || "Refund failed";
      setError(errMsg);
      return null;
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Toggle item selection for partial refund
   */
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        return prev.filter(i => i.id !== itemId);
      } else {
        return [...prev, { id: itemId }];
      }
    });
  };

  /**
   * Update refund quantity for an item
   */
  const updateItemRefundQty = (itemId, qty) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, refund_qty: Math.max(1, parseInt(qty) || 1) } : item
      )
    );
  };

  /**
   * Format refund data for display
   */
  const formatRefund = (refund) => ({
    ...refund,
    refund_amount: parseFloat(refund.refund_amount || 0).toFixed(2),
    original_total: parseFloat(refund.original_total || 0).toFixed(2),
    date: new Date(refund.created_at || refund.refund_date).toLocaleDateString("en-IN"),
    time: new Date(refund.created_at || refund.refund_date).toLocaleTimeString("en-IN"),
  });

  return {
    refunds,
    saleRefunds,
    loading,
    error,
    refundType,
    selectedItems,
    reason,
    refundMode,
    processing,
    setRefundType,
    setReason,
    setRefundMode,
    fetchRefunds,
    fetchSaleRefunds,
    processRefund,
    toggleItemSelection,
    updateItemRefundQty,
    formatRefund,
  };
};

export default useRefund;
