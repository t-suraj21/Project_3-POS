import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomerDetail } from "../../../hooks/useCustomerDetail";
import s from "../AccountManagement/styles";

const fmt = (v) =>
  `₹${parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const CustomerDetail = () => {
  const { id: shopId } = useParams();
  const navigate       = useNavigate();

  const {
    customer, transactions, payments, loading, error,
    expanded, toggleExpand,
    showPayModal, openPayModal, closePayModal,
    payForm, handlePayFormChange, handleAddPayment, paySaving, payError,
    showTxnModal, openTxnModal, closeTxnModal,
    txnForm, handleTxnFormChange, handleItemChange, addItem, removeItem,
    handleAddTransaction, txnSaving, txnError,
  } = useCustomerDetail();

  if (loading) return <div style={{ padding: "2rem", color: "#6b7280" }}>Loading customer details…</div>;
  if (error)   return <div style={{ padding: "2rem", color: "#ef4444" }}>{error}</div>;
  if (!customer) return null;

  const hasBalance = parseFloat(customer.remaining_balance) > 0;

  return (
    <div style={{ padding: "1.75rem 2rem 2.5rem", maxWidth: 1100, margin: "0 auto", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Back ────────────────────────────────────────────────── */}
      <button style={s.backBtn} onClick={() => navigate(`/shop/${shopId}/accounts`)}>
        ← Back to Customers
      </button>

      {/* ── Profile Hero Card ────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(120deg, #4f46e5 0%, #7c3aed 100%)",
        borderRadius: "20px",
        padding: "1.75rem 2rem",
        marginBottom: "1.5rem",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: "1.5rem",
        alignItems: "center",
        boxShadow: "0 8px 30px rgba(79,70,229,0.28)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "80px", bottom: "-60px", width: "130px", height: "130px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        {/* Avatar */}
        <div style={{
          width: "72px", height: "72px", borderRadius: "18px",
          background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 900, fontSize: "2rem", flexShrink: 0,
        }}>
          {customer.name[0].toUpperCase()}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#fff" }}>{customer.name}</h2>
            <span style={{
              background: customer.status === "cleared" ? "rgba(134,239,172,0.2)" : "rgba(254,202,202,0.2)",
              border: "1px solid " + (customer.status === "cleared" ? "rgba(134,239,172,0.4)" : "rgba(254,202,202,0.4)"),
              color: customer.status === "cleared" ? "#86efac" : "#fca5a5",
              borderRadius: "9999px", padding: "0.2rem 0.75rem",
              fontSize: "0.73rem", fontWeight: 700,
            }}>
              {customer.status === "cleared" ? "✓ Cleared" : "⏳ Pending"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.875rem" }}>📞 {customer.phone}</span>
            {customer.address && <span style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.875rem" }}>📍 {customer.address}</span>}
          </div>
        </div>

        {/* Balance + Actions */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.25rem" }}>Balance Due</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 900, color: hasBalance ? "#fca5a5" : "#86efac" }}>
            {fmt(customer.remaining_balance)}
          </div>
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem", justifyContent: "flex-end" }}>
            {hasBalance && (
              <button
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "10px", padding: "0.5rem 1.1rem", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", backdropFilter: "blur(4px)" }}
                onClick={openPayModal}
              >
                💳 Add Payment
              </button>
            )}
            <button
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "10px", padding: "0.5rem 1.1rem", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", backdropFilter: "blur(4px)" }}
              onClick={openTxnModal}
            >
              ＋ Add Transaction
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Row ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
        {[
          { label: "Transactions",  value: transactions.length,                   bg: "#f0f9ff", color: "#0284c7", icon: "📋" },
          { label: "Payments",      value: payments.length,                        bg: "#f0fdf4", color: "#15803d", icon: "💳" },
          { label: "Total Credit",  value: fmt(customer.total_credit),             bg: "#fff7ed", color: "#c2410c", icon: "📈" },
          { label: "Total Paid",    value: fmt(customer.total_paid),               bg: "#f0fdf4", color: "#15803d", icon: "✅" },
        ].map((c) => (
          <div key={c.label} style={{
            background: "#fff", borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
            padding: "1.1rem 1.3rem", borderTop: `3px solid ${c.color}`,
          }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{c.icon} {c.label}</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, color: c.color, marginTop: "0.3rem" }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* ── Balance alert strip ───────────────────────────────── */}
      {hasBalance ? (
        <div style={s.balanceAlert}>⚠ Outstanding balance of {fmt(customer.remaining_balance)} is pending.</div>
      ) : (
        <div style={s.clearedAlert}>✓ All dues are cleared. Great!</div>
      )}

      {/* ── Transactions ─────────────────────────────────────── */}
      <div style={s.sectionCard}>
        <div style={s.sectionHead}>
          <span style={s.sectionTitle}>📋 Transactions</span>
          <span style={s.sectionBadge}>{transactions.length}</span>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8", fontSize: "0.9rem" }}>📋 No transactions recorded yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Date", "Bill #", "Items", "Total", "Paid", "Remaining", "Note", ""].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => {
                  const isOpen = expanded.has(txn.id);
                  const rem    = parseFloat(txn.remaining_amount);
                  return (
                    <React.Fragment key={txn.id}>
                      <tr>
                        <td style={s.td}>{fmtDate(txn.created_at)}</td>
                        <td style={s.td}>{txn.bill_number || "—"}</td>
                        <td style={s.td}>{(txn.items || []).length} items</td>
                        <td style={s.td}>{fmt(txn.total_amount)}</td>
                        <td style={{ ...s.td, color: "#16a34a", fontWeight: 600 }}>{fmt(txn.paid_amount)}</td>
                        <td style={rem > 0 ? s.tdRed : s.td}>{fmt(txn.remaining_amount)}</td>
                        <td style={s.td}>{txn.note || "—"}</td>
                        <td style={s.td}>
                          {(txn.items || []).length > 0 && (
                            <button
                              onClick={() => toggleExpand(txn.id)}
                              style={{ background: "none", border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: "0.78rem", color: "#6b7280" }}
                            >
                              {isOpen ? "▲ Hide" : "▼ Items"}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isOpen && (txn.items || []).length > 0 && (
                        <tr>
                          <td colSpan={8} style={{ padding: "0 1rem 0.75rem 3rem", background: "#f9fafb" }}>
                            <table style={s.itemsTable}>
                              <thead>
                                <tr>
                                  {["Product", "Qty", "Price", "Total"].map((h) => (
                                    <th key={h} style={s.itemsTh}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {txn.items.map((it, i) => (
                                  <tr key={i}>
                                    <td style={s.itemsTd}>{it.product_name}</td>
                                    <td style={s.itemsTd}>{it.quantity}</td>
                                    <td style={s.itemsTd}>{fmt(it.price)}</td>
                                    <td style={s.itemsTd}>{fmt(it.total)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Payment History ──────────────────────────────────── */}
      <div style={s.sectionCard}>
        <div style={s.sectionHead}>
          <span style={s.sectionTitle}>💳 Payment History</span>
          <span style={s.sectionBadge}>{payments.length}</span>
        </div>

        {payments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8", fontSize: "0.9rem" }}>💳 No payments recorded yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Date", "Amount", "Mode", "Note"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((pay) => (
                  <tr key={pay.id}>
                    <td style={s.td}>{fmtDate(pay.created_at)}</td>
                    <td style={{ ...s.td, color: "#16a34a", fontWeight: 700 }}>{fmt(pay.amount)}</td>
                    <td style={s.td}>
                      <span style={s.modeChip(pay.payment_mode)}>
                        {pay.payment_mode?.toUpperCase()}
                      </span>
                    </td>
                    <td style={s.td}>{pay.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Payment Modal ────────────────────────────────── */}
      {showPayModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>💳 Record Payment</h3>
            <form onSubmit={handleAddPayment}>
              <div style={s.formGroup}>
                <label style={s.label}>Amount (₹) *</label>
                <input
                  name="amount" type="number" min="0.01" step="0.01"
                  value={payForm.amount}
                  onChange={handlePayFormChange}
                  placeholder="Enter amount"
                  style={s.input} required
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Payment Mode *</label>
                <select name="payment_mode" value={payForm.payment_mode} onChange={handlePayFormChange} style={s.select}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Note</label>
                <textarea
                  name="note" value={payForm.note}
                  onChange={handlePayFormChange}
                  placeholder="Optional note"
                  rows={2} style={s.textarea}
                />
              </div>
              {payError && <div style={s.errorMsg}>{payError}</div>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={closePayModal}>Cancel</button>
                <button type="submit"  style={s.submitBtn} disabled={paySaving}>
                  {paySaving ? "Saving…" : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Transaction Modal ────────────────────────────── */}
      {showTxnModal && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: 680 }}>
            <h3 style={s.modalTitle}>📋 Add Credit Transaction</h3>
            <form onSubmit={handleAddTransaction}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={s.formGroup}>
                  <label style={s.label}>Bill Number</label>
                  <input name="bill_number" value={txnForm.bill_number} onChange={handleTxnFormChange} placeholder="Optional" style={s.input} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Paid on Spot (₹)</label>
                  <input name="paid_amount" type="number" min="0" step="0.01" value={txnForm.paid_amount} onChange={handleTxnFormChange} style={s.input} />
                </div>
              </div>

              {/* Items */}
              <div style={{ margin: "0.5rem 0 0.75rem" }}>
                <label style={{ ...s.label, marginBottom: "0.4rem", display: "block" }}>Items</label>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
                  <thead>
                    <tr>
                      {["Product Name", "Qty", "Price (₹)", "Total", ""].map((h) => (
                        <th key={h} style={{ ...s.itemsTh, textAlign: "left", padding: "4px 6px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {txnForm.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "4px 4px" }}>
                          <input value={item.product_name} onChange={(e) => handleItemChange(idx, "product_name", e.target.value)} placeholder="Product" style={{ ...s.input, padding: "4px 8px", marginBottom: 0 }} />
                        </td>
                        <td style={{ padding: "4px 4px" }}>
                          <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(idx, "quantity", e.target.value)} style={{ ...s.input, padding: "4px 8px", marginBottom: 0, width: 60 }} />
                        </td>
                        <td style={{ padding: "4px 4px" }}>
                          <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(idx, "price", e.target.value)} style={{ ...s.input, padding: "4px 8px", marginBottom: 0, width: 90 }} />
                        </td>
                        <td style={{ padding: "4px 8px", fontWeight: 600 }}>
                          {item.total ? `₹${parseFloat(item.total).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td style={{ padding: "4px 4px" }}>
                          {txnForm.items.length > 1 && (
                            <button type="button" onClick={() => removeItem(idx)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 4, cursor: "pointer", padding: "2px 7px" }}>✕</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={addItem} style={{ marginTop: "0.5rem", background: "#eff6ff", color: "#2563eb", border: "1px dashed #93c5fd", borderRadius: 6, padding: "4px 14px", cursor: "pointer", fontSize: "0.82rem" }}>
                  + Add Item
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={s.formGroup}>
                  <label style={s.label}>Total Amount (₹) *</label>
                  <input name="total_amount" type="number" min="0.01" step="0.01" value={txnForm.total_amount} onChange={handleTxnFormChange} placeholder="Auto-calculated from items" style={s.input} required />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Note</label>
                  <input name="note" value={txnForm.note} onChange={handleTxnFormChange} placeholder="Optional" style={s.input} />
                </div>
              </div>

              {txnError && <div style={s.errorMsg}>{txnError}</div>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={closeTxnModal}>Cancel</button>
                <button type="submit"  style={s.submitBtn} disabled={txnSaving}>
                  {txnSaving ? "Saving…" : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
