import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

/**
 * useRefundsList.js — Refunds List Page Hook
 *
 * Manages the refunds listing page:
 * - Fetch all refunds for the shop
 * - Search refunds by bill number, customer name, or phone
 * - View refund details and items
 * - Display refund statistics
 */

const useRefundsList = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter state
  const [search, setSearch] = useState("");
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  /**
   * Fetch all refunds from the API
   */
  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/sales/refunds/list?limit=500");
      setRefunds(res.data?.refunds || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch refunds");
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  /**
   * Filter refunds by search term (locally)
   */
  const filteredRefunds = useCallback(() => {
    if (!search.trim()) return refunds;
    
    const query = search.toLowerCase();
    return refunds.filter((r) => {
      return (
        r.bill_number?.toLowerCase().includes(query) ||
        r.customer_name?.toLowerCase().includes(query) ||
        r.customer_phone?.includes(query)
      );
    });
  }, [refunds, search]);

  /**
   * Open refund details modal
   */
  const openRefundDetails = (refund) => {
    setSelectedRefund(refund);
    setIsViewOpen(true);
  };

  /**
   * Close refund details modal
   */
  const closeRefundDetails = () => {
    setSelectedRefund(null);
    setIsViewOpen(false);
  };

  /**
   * Calculate refund statistics
   */
  const stats = useCallback(() => {
    const filtered = filteredRefunds();
    return {
      totalRefunds: filtered.length,
      totalAmount: filtered.reduce((sum, r) => sum + (parseFloat(r.refund_amount) || 0), 0),
      avgRefund: filtered.length > 0 
        ? (filtered.reduce((sum, r) => sum + (parseFloat(r.refund_amount) || 0), 0) / filtered.length).toFixed(2)
        : 0,
    };
  }, [filteredRefunds]);

  /**
   * Format currency
   */
  const formatCurrency = (amount) => {
    return "₹" + Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /**
   * Format date
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /**
   * Format time
   */
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    // State
    refunds,
    loading,
    error,
    search,
    setSearch,
    selectedRefund,
    isViewOpen,
    
    // Filters & data
    filteredRefunds: filteredRefunds(),
    stats: stats(),
    
    // Actions
    fetchRefunds,
    openRefundDetails,
    closeRefundDetails,
    
    // Formatters
    formatCurrency,
    formatDate,
    formatTime,
  };
};

export default useRefundsList;
