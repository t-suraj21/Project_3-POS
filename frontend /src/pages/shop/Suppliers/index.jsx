import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import s from "../AccountManagement/styles";

const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const Suppliers = () => {
  const { id: shopId } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/suppliers");
      
      // Handle both old and new response formats
      const supplierList = res.data?.suppliers || res.data?.data?.suppliers || [];
      setSuppliers(Array.isArray(supplierList) ? supplierList : []);
      
      if (Array.isArray(supplierList) && supplierList.length === 0) {
        console.info("No suppliers found for this shop");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "Failed to load suppliers";
      setError(errorMsg);
      console.error("Supplier fetch error:", {
        message: errorMsg,
        status: err.response?.status,
        data: err.response?.data
      });
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setAddError("Supplier Name is required.");
      return;
    }
    
    setAddSaving(true);
    setAddError(null);
    
    try {
      if (editingId) {
        await api.put(`/api/suppliers/${editingId}`, addForm);
        console.log("Supplier updated:", editingId);
      } else {
        const res = await api.post("/api/suppliers", addForm);
        console.log("Supplier created:", res.data?.supplier);
      }
      
      // Close modals and reset form
      setAddModal(false);
      setEditModal(false);
      setEditingId(null);
      setAddForm({ name: "", email: "", phone: "", address: "" });
      
      // Reload suppliers
      await fetchSuppliers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || (editingId ? "Failed to update supplier" : "Failed to add supplier");
      setAddError(errorMsg);
      console.error("Submit error:", errorMsg, err.response?.data);
    } finally {
      setAddSaving(false);
    }
  };

  const handleEdit = (supplier) => {
    setEditingId(supplier.id);
    setAddForm({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || ""
    });
    setEditModal(true);
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await api.delete(`/api/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete supplier");
      }
    }
  };

  return (
    <div style={s.page}>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={s.heading}>Suppliers Directory</h1>
          <p style={s.subheading}>Manage your suppliers, purchases, and payments.</p>
        </div>
        <button style={s.addBtn} onClick={() => { setEditingId(null); setAddForm({ name: "", email: "", phone: "", address: "" }); setAddModal(true); }}>
          <span style={{ fontSize: "1rem" }}>＋</span> Add Supplier
        </button>
      </div>

      <div style={s.tableCard}>
        <div style={s.tableHead}>
          <div>
            <span style={s.tableTitle}>All Suppliers</span>
            <span style={s.countBadge}>{suppliers.length}</span>
          </div>
        </div>

        {error && <p style={{ color: "#dc2626", padding: "1rem" }}>{error}</p>}
        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center" }}>Loading suppliers…</p>
        ) : suppliers.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
            No suppliers found. Add suppliers when creating products.
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>SL</th>
                <th style={s.th}>Supplier Details</th>
                <th style={s.th}>Contact Info</th>
                <th style={s.th}>Total Purchase</th>
                <th style={s.th}>Total Paid</th>
                <th style={s.th}>Remaining Due</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup, idx) => {
                const balance = parseFloat(sup.remaining_balance || 0);
                return (
                  <tr key={sup.id} style={{ cursor: "pointer" }}>
                    <td style={s.td}>{idx + 1}</td>
                    <td style={s.td}>
                      <div style={s.nameCell}>
                        <div style={s.avatar}>{sup.name[0].toUpperCase()}</div>
                        <div>
                          <div style={s.custName}>{sup.name}</div>
                          {sup.address && <div style={s.custPhone}>📍 {sup.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <div>
                        {sup.phone && <div style={s.custPhone}>📞 {sup.phone}</div>}
                        {sup.email && <div style={s.custPhone}>✉️ {sup.email}</div>}
                      </div>
                    </td>
                    <td style={s.td}>{fmt(sup.total_purchased)}</td>
                    <td style={s.td}>{fmt(sup.total_paid)}</td>
                    <td style={balance > 0 ? s.tdRed : s.td}>{fmt(sup.remaining_balance)}</td>
                    <td style={s.td}>
                      <span style={s.statusBadge(sup.status === "cleared")}>
                        {sup.status === "cleared" ? "✓ Cleared" : "⚠ Pending"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          style={{ ...s.viewBtn, padding: "0.4rem 0.8rem" }}
                          title="View Details"
                          onClick={() => navigate(`/shop/${shopId}/suppliers/${sup.id}`)}
                        >
                          👁 View
                        </button>
                        <button
                          style={{ ...s.viewBtn, padding: "0.4rem 0.8rem", backgroundColor: "#3b82f6" }}
                          title="Edit Supplier"
                          onClick={() => handleEdit(sup)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          style={{ ...s.viewBtn, padding: "0.4rem 0.8rem", backgroundColor: "#ef4444" }}
                          title="Delete Supplier"
                          onClick={() => handleDeleteSupplier(sup.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {(addModal || editModal) && (
        <div style={s.overlay} onClick={() => { setAddModal(false); setEditModal(false); }}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>{editingId ? "Edit Supplier" : "Add New Supplier"}</h2>
            <form onSubmit={handleAddSubmit}>
              <div style={s.formGroup}>
                <label style={s.label}>Supplier Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={s.input} autoFocus value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} placeholder="e.g. ABC Distributors" autoComplete="off" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Mobile Number</label>
                <input style={s.input} type="tel" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} placeholder="Phone number" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Email Address</label>
                <input style={s.input} type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} placeholder="Supplier email" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Address</label>
                <textarea style={s.textarea} value={addForm.address} onChange={e => setAddForm({...addForm, address: e.target.value})} placeholder="Full address" />
              </div>
              {addError && <p style={s.errorMsg}>{addError}</p>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => { setAddModal(false); setEditModal(false); }}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={addSaving}>{addSaving ? (editingId ? "Updating…" : "Saving…") : (editingId ? "Update Supplier" : "Add Supplier")}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Suppliers;
