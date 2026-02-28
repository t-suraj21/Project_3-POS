import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const EMPTY_FORM = { name: "", phone: "", address: "" };
const PER_PAGE   = 10;

/**
 * Hook for the Account Management (credit customers) list page.
 * Fetches the summary stats and paginated customer list, and provides
 * add / edit / delete actions with loading and error state.
 *
 * Must be used inside a route protected by <ProtectedRoute role="shop_admin">.
 */
export const useAccountManagement = () => {
  // ── Summary stats ─────────────────────────────────────────────────
  const [summary,   setSummary]   = useState(null);

  // ── Customer list ─────────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  // ── Filters / pagination ──────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [searchQ,     setSearchQ]     = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [page,        setPage]        = useState(1);

  // ── Add Customer modal ────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm,      setAddForm]      = useState(EMPTY_FORM);
  const [addSaving,    setAddSaving]    = useState(false);
  const [addError,     setAddError]     = useState(null);

  // ── Edit Customer modal ───────────────────────────────────────────
  const [editCustomer, setEditCustomer] = useState(null);
  const [editForm,     setEditForm]     = useState(EMPTY_FORM);
  const [editSaving,   setEditSaving]   = useState(false);
  const [editError,    setEditError]    = useState(null);

  // ── Fetch summary ─────────────────────────────────────────────────
  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/api/accounts/summary");
      setSummary(res.data?.summary);
    } catch { /* silent */ }
  }, []);

  // ── Fetch customers ───────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQ)     params.append("search",  searchQ);
      if (onlyPending) params.append("pending", "1");

      const res = await api.get(`/api/accounts/customers?${params}`);
      setCustomers(res.data?.customers || []);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load customers.");
    } finally { setLoading(false); }
  }, [searchQ, onlyPending]);

  useEffect(() => { fetchCustomers(); fetchSummary(); }, [fetchCustomers, fetchSummary]);

  // ── Search / filter ───────────────────────────────────────────────
  const handleSearch  = () => setSearchQ(search);
  const handlePending = () => setOnlyPending((v) => !v);

  // ── Add Customer ──────────────────────────────────────────────────
  const openAddModal  = () => { setAddForm(EMPTY_FORM); setAddError(null); setShowAddModal(true); };
  const closeAddModal = () => setShowAddModal(false);

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((p) => ({ ...p, [name]: value }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.phone.trim()) {
      setAddError("Name and phone are required.");
      return;
    }
    setAddSaving(true); setAddError(null);
    try {
      await api.post("/api/accounts/customers", addForm);
      closeAddModal();
      fetchCustomers();
      fetchSummary();
    } catch (err) {
      setAddError(err.response?.data?.error || "Failed to add customer.");
    } finally { setAddSaving(false); }
  };

  // ── Edit Customer ─────────────────────────────────────────────────
  const openEditModal = (cust) => {
    setEditCustomer(cust);
    setEditForm({ name: cust.name, phone: cust.phone, address: cust.address || "" });
    setEditError(null);
  };
  const closeEditModal = () => setEditCustomer(null);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      setEditError("Name and phone are required.");
      return;
    }
    setEditSaving(true); setEditError(null);
    try {
      await api.put(`/api/accounts/customers/${editCustomer.id}`, editForm);
      closeEditModal();
      fetchCustomers();
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update customer.");
    } finally { setEditSaving(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer? This will remove all their transaction history.")) return;
    try {
      await api.delete(`/api/accounts/customers/${id}`);
      fetchCustomers();
      fetchSummary();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete customer.");
    }
  };

  // ── Pagination ────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(customers.length / PER_PAGE));
  const paged      = customers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return {
    summary,
    customers: paged, totalPages, page, setPage,
    loading, error,
    search, setSearch, handleSearch,
    onlyPending, handlePending,
    fetchCustomers,
    // add
    showAddModal, openAddModal, closeAddModal,
    addForm, handleAddFormChange, handleAddCustomer, addSaving, addError,
    // edit
    editCustomer, editForm, handleEditFormChange, handleUpdateCustomer,
    openEditModal, closeEditModal, editSaving, editError,
    // delete
    handleDelete,
  };
};
