import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../../services/api";
import s from "./styles";

const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const SupplierDetail = () => {
  const { id: shopId, supplierId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showPay, setShowPay] = useState(false);
  const [payForm, setPayForm] = useState({ amount: "", payment_mode: "cash", note: "" });
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState(null);

  // Edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/suppliers/${supplierId}`);
      setData(res.data);
    } catch (err) {
      setError("Failed to load supplier details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supplierId]);

  const handleEdit = () => {
    if (!data) return;
    setEditForm({
      name: data.supplier.name,
      email: data.supplier.email || "",
      phone: data.supplier.phone || "",
      address: data.supplier.address || ""
    });
    setShowEdit(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return setEditError("Name is required");
    setEditSaving(true);
    setEditError(null);
    try {
      await api.put(`/api/suppliers/${supplierId}`, editForm);
      setShowEdit(false);
      fetchData();
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update");
    } finally {
      setEditSaving(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payForm.amount || payForm.amount <= 0) return setPayError("Valid amount required");
    setPaySaving(true);
    setPayError(null);
    try {
      await api.post(`/api/suppliers/${supplierId}/payments`, payForm);
      setShowPay(false);
      setPayForm({ amount: "", payment_mode: "cash", note: "" });
      fetchData(); // Reload details
    } catch (err) {
      setPayError(err.response?.data?.error || "Payment failed");
    } finally {
      setPaySaving(false);
    }
  };

  if (loading) return <div style={s.page}>Loading...</div>;
  if (error || !data) return <div style={s.page}>{error}</div>;

  const { supplier, purchases, payments } = data;

  return (
    <div style={s.page}>
      <Link to={`/shop/${shopId}/accounts`} style={s.backLink}>← Back to Accounts</Link>

      <div style={s.headerDiv}>
        <div>
          <h1 style={s.title}>{supplier.name}</h1>
          {supplier.phone && <p style={s.pSubtitle}>📞 {supplier.phone}</p>}
          {supplier.email && <p style={s.pSubtitle}>✉️ {supplier.email}</p>}
          {supplier.address && <p style={s.pSubtitle}>📍 {supplier.address}</p>}
          <p style={{ ...s.pSubtitle, fontSize: "0.85rem" }}>Joined: {new Date(supplier.created_at).toLocaleDateString()}</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button style={s.addPaymentBtn} onClick={() => setShowPay(true)}>
            💳 Record Payment
          </button>
          <button style={{ ...s.addPaymentBtn, backgroundColor: "#3b82f6" }} onClick={handleEdit}>
            ✏️ Edit Details
          </button>
        </div>
      </div>

      <div style={s.statsGrid}>
        <div style={s.statCard("#f3f4f6", "#d1d5db")}>
          <span style={s.statLabel}>Total Purchased</span>
          <span style={s.statValue("#374151")}>{fmt(supplier.total_purchased)}</span>
        </div>
        <div style={s.statCard("#f0fdf4", "#22c55e")}>
          <span style={s.statLabel}>Total Paid</span>
          <span style={s.statValue("#16a34a")}>{fmt(supplier.total_paid)}</span>
        </div>
        <div style={s.statCard("#fef2f2", "#ef4444")}>
          <span style={s.statLabel}>Remaining Balance</span>
          <span style={s.statValue(parseFloat(supplier.remaining_balance) > 0 ? "#dc2626" : "#16a34a")}>
            {fmt(supplier.remaining_balance)}
          </span>
        </div>
        <div style={s.statCard("#fef3c7", "#f59e0b")}>
          <span style={s.statLabel}>Status</span>
          <span style={s.statValue(supplier.status === "cleared" ? "#16a34a" : "#d97706")}>
            {supplier.status === "cleared" ? "✓ Cleared" : "⚠ Pending"}
          </span>
        </div>
      </div>

      <div style={s.twoCols}>
        {/* Products Purchased Table */}
        <div style={s.tableCard}>
          <div style={s.tableHeadText}>📦 Latest Purchases</div>
          {purchases.length === 0 ? (
            <div style={s.emptyText}>No purchases found from this supplier.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Product</th>
                  <th style={s.th}>Qty × Cost</th>
                  <th style={s.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id}>
                    <td style={s.td}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={s.td}><strong>{p.product_name}</strong><br /><span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{p.note}</span></td>
                    <td style={s.td}>{p.quantity} × {fmt(p.cost_price)}</td>
                    <td style={s.td}><strong>{fmt(p.total_amount)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payments Table */}
        <div style={s.tableCard}>
          <div style={s.tableHeadText}>💰 Payment History</div>
          {payments.length === 0 ? (
            <div style={s.emptyText}>No payments recorded yet.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Mode</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>Note</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={s.td}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={s.td}><span style={{ textTransform: "uppercase", fontWeight: 600, fontSize: "0.85rem", padding: "0.25rem 0.5rem", backgroundColor: "#f3f4f6", borderRadius: "4px" }}>{p.payment_mode}</span></td>
                    <td style={s.td}><strong>{fmt(p.amount)}</strong></td>
                    <td style={s.td}>{p.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPay && (
        <div style={s.overlay} onClick={() => setShowPay(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>💳 Record Payment</h2>
            <form onSubmit={handlePay}>
              <div style={s.formGroup}>
                <label style={s.label}>Amount (Max: {fmt(supplier.remaining_balance)})</label>
                <input style={s.input} type="number" step="0.01" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} placeholder="0.00" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Payment Mode</label>
                <select style={s.select} value={payForm.payment_mode} onChange={e => setPayForm({ ...payForm, payment_mode: e.target.value })}>
                  <option value="cash">💵 Cash</option>
                  <option value="upi">📱 UPI</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                  <option value="card">💳 Card</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Note (Optional)</label>
                <input style={s.input} value={payForm.note} onChange={e => setPayForm({ ...payForm, note: e.target.value })} placeholder="Check No., Auth Code, etc." />
              </div>
              {payError && <div style={s.errorMsg}>{payError}</div>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowPay(false)}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={paySaving}>{paySaving ? "Saving..." : "Save Payment"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEdit && (
        <div style={s.overlay} onClick={() => setShowEdit(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>✏️ Edit Supplier Details</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={s.formGroup}>
                <label style={s.label}>Supplier Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={s.input} autoFocus value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Supplier name" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Mobile Number</label>
                <input style={s.input} type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Phone number" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Email Address</label>
                <input style={s.input} type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email address" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Address</label>
                <textarea style={{...s.input, minHeight: "80px", fontFamily: "Arial" }} value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} placeholder="Full address" />
              </div>
              {editError && <div style={s.errorMsg}>{editError}</div>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowEdit(false)}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={editSaving}>{editSaving ? "Updating..." : "Update Details"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SupplierDetail;
