import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

/**
 * Hook for managing shop workers and their role assignments.
 */
export const useWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states for add/edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "sales_worker" });
  const [addError, setAddError] = useState(null);
  const [addSaving, setAddSaving] = useState(false);

  // Modal states for role update
  const [editWorker, setEditWorker] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Fetch workers list
  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[useWorkers] Fetching workers from /api/workers...");
      const res = await api.get("/api/workers");
      console.log("[useWorkers] Response status:", res.status);
      console.log("[useWorkers] Response data:", res.data);
      console.log("[useWorkers] Raw workers array:", res.data?.workers);
      
      const workersList = res.data?.workers || [];
      console.log("[useWorkers] Setting " + workersList.length + " workers");
      setWorkers(workersList);
    } catch (err) {
      console.error("[useWorkers] Error response status:", err.response?.status);
      console.error("[useWorkers] Error response data:", err.response?.data);
      console.error("[useWorkers] Error message:", err.message);
      console.error("[useWorkers] Full error:", err);
      setError(err.response?.data?.error || "Failed to load workers: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Add worker
  const openAddModal = () => {
    setAddForm({ name: "", email: "", password: "", role: "sales_worker" });
    setAddError(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => setShowAddModal(false);

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((p) => ({ ...p, [name]: value }));
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      setAddError("Name, email, and password are required");
      return;
    }
    if (addForm.password.length < 6) {
      setAddError("Password must be at least 6 characters");
      return;
    }

    setAddSaving(true);
    setAddError(null);
    try {
      console.log("[useWorkers] Sending worker data:", addForm);
      const res = await api.post("/api/workers", addForm);
      console.log("[useWorkers] Worker created successfully:", res.data);
      console.log("[useWorkers] Response status:", res.status);
      
      // Close modal
      closeAddModal();
      
      // Wait a full second for database commit, then refresh
      console.log("[useWorkers] Waiting 1 second before refreshing workers list...");
      setTimeout(() => {
        console.log("[useWorkers] Now refreshing workers list...");
        fetchWorkers();
      }, 1000);
    } catch (err) {
      console.error("[useWorkers] Failed to add worker");
      console.error("[useWorkers] Error status:", err.response?.status);
      console.error("[useWorkers] Error data:", err.response?.data);
      console.error("[useWorkers] Error message:", err.message);
      console.error("[useWorkers] Full error:", err);
      setAddError(err.response?.data?.error || err.response?.data?.message || "Failed to add worker: " + err.message);
    } finally {
      setAddSaving(false);
    }
  };

  // Update worker role
  const openEditModal = (worker) => {
    setEditWorker(worker);
    setEditRole(worker.role);
    setEditError(null);
  };

  const closeEditModal = () => setEditWorker(null);

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editRole.trim()) {
      setEditError("Please select a role");
      return;
    }

    setEditSaving(true);
    setEditError(null);
    try {
      console.log("Updating worker", editWorker.id, "to role:", editRole);
      await api.patch(`/api/workers/${editWorker.id}`, { role: editRole });
      console.log("Worker role updated successfully");
      closeEditModal();
      fetchWorkers();
    } catch (err) {
      console.error("Failed to update worker:", err.response?.data || err.message);
      setEditError(err.response?.data?.error || err.response?.data?.message || "Failed to update worker");
    } finally {
      setEditSaving(false);
    }
  };

  // Delete worker
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this worker? They will lose access to the system.")) return;
    try {
      console.log("Deleting worker with ID:", id);
      await api.delete(`/api/workers/${id}`);
      console.log("Worker deleted successfully");
      fetchWorkers();
    } catch (err) {
      console.error("Failed to delete worker:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Failed to delete worker");
    }
  };

  return {
    workers,
    loading,
    error,
    fetchWorkers,
    // Add
    showAddModal,
    openAddModal,
    closeAddModal,
    addForm,
    handleAddFormChange,
    handleAddWorker,
    addError,
    addSaving,
    // Edit
    editWorker,
    editRole,
    setEditRole,
    openEditModal,
    closeEditModal,
    handleUpdateRole,
    editError,
    editSaving,
    // Delete
    handleDelete,
  };
};
