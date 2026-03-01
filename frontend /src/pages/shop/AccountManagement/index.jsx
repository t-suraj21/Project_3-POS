import { useNavigate, useParams } from "react-router-dom";
import { useAccountManagement } from "../../../hooks/useAccountManagement";
import s from "./styles";

const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const AccountManagement = () => {
  const { id: shopId } = useParams();
  const navigate       = useNavigate();

  const {
    summary,
    customers, totalPages, page, setPage,
    loading, error,
    search, setSearch, handleSearch,
    onlyPending, handlePending,
    showAddModal, openAddModal, closeAddModal,
    addForm, handleAddFormChange, handleAddCustomer, addSaving, addError,
    editCustomer, editForm, handleEditFormChange, handleUpdateCustomer,
    closeEditModal, openEditModal, editSaving, editError,
    handleDelete,
  } = useAccountManagement();

  return (
    <div style={s.page}>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={s.heading}>Account Management</h1>
        <p style={s.subheading}>All customers — billing history, paid amount &amp; outstanding balance</p>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────── */}
      {summary && (
        <div style={s.statsRow}>
          <div style={s.statCard("#ede9fe", "#6366f1")}>
            <span style={s.statLabel}>Total Customers</span>
            <span style={s.statValue("#4f46e5")}>{summary.total_customers ?? 0}</span>
          </div>
          <div style={s.statCard("#fef2f2", "#ef4444")}>
            <span style={s.statLabel}>Total Outstanding</span>
            <span style={s.statValue("#dc2626")}>{fmt(summary.total_outstanding)}</span>
          </div>
          <div style={s.statCard("#f0fdf4", "#22c55e")}>
            <span style={s.statLabel}>Total Collected</span>
            <span style={s.statValue("#16a34a")}>{fmt(summary.total_collected)}</span>
          </div>
          <div style={s.statCard("#eff6ff", "#3b82f6")}>
            <span style={s.statLabel}>Pending / Cleared</span>
            <span style={s.statValue("#2563eb")}>{summary.pending_customers ?? 0} / {summary.cleared_customers ?? 0}</span>
          </div>
        </div>
      )}

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <input
            style={s.searchInput}
            placeholder="🔍  Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button style={s.searchBtn} onClick={handleSearch}>Search</button>
        </div>

        <button style={s.filterChip(onlyPending)} onClick={handlePending}>
          {onlyPending ? "✓ " : ""}Pending Only
        </button>

        <button style={s.addBtn} onClick={openAddModal}>
          <span style={{ fontSize: "1rem" }}>＋</span> Add Customer
        </button>
      </div>

      {/* ── Customer Table ────────────────────────────────────────────── */}
      <div style={s.tableCard}>
        <div style={s.tableHead}>
          <div>
            <span style={s.tableTitle}>All Customers</span>
            <span style={s.countBadge}>{customers.length}</span>
          </div>
        </div>

        {error && <p style={{ color: "#dc2626", padding: "1rem" }}>{error}</p>}
        {loading ? (
          <p style={s.loadingWrap}>Loading customers…</p>
        ) : customers.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👥</div>
            No customers found. Customers are automatically added when a sale is completed with a name.
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>SL</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Total Billed</th>
                <th style={s.th}>Total Paid</th>
                <th style={s.th}>Balance Due</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust, idx) => {
                const balance = parseFloat(cust.remaining_balance || 0);
                return (
                  <tr key={cust.id} style={{ cursor: "pointer" }}>
                    <td style={s.td}>{(page - 1) * 10 + idx + 1}</td>

                    <td style={s.td}>
                      <div style={s.nameCell}>
                        <div style={s.avatar}>{cust.name[0].toUpperCase()}</div>
                        <div>
                          <div style={s.custName}>{cust.name}</div>
                          <div style={s.custPhone}>📞 {cust.phone}</div>
                          {cust.address && <div style={{ ...s.custPhone, marginTop: "1px" }}>📍 {cust.address}</div>}
                        </div>
                      </div>
                    </td>

                    <td style={s.td}>{fmt(cust.total_credit)}</td>
                    <td style={s.td}>{fmt(cust.total_paid)}</td>

                    <td style={balance > 0 ? s.tdRed : s.td}>
                      {fmt(cust.remaining_balance)}
                    </td>

                    <td style={s.td}>
                      <span style={s.statusBadge(cust.status === "cleared")}>
                        {cust.status === "cleared" ? "✓ Cleared" : "⚠ Pending"}
                      </span>
                    </td>

                    <td style={s.td}>
                      <div style={s.actionWrap}>
                        <button
                          style={s.viewBtn}
                          title="View Account"
                          onClick={() => navigate(`/shop/${shopId}/accounts/${cust.id}`)}
                        >
                          👁 View
                        </button>
                        <button
                          style={s.editBtn}
                          title="Edit"
                          onClick={() => openEditModal(cust)}
                        >✏</button>
                        <button
                          style={s.deleteBtn}
                          title="Delete"
                          onClick={() => handleDelete(cust.id)}
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={s.paginationWrap}>
            <button style={s.pageBtn(false)} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} style={s.pageBtn(n === page)} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button style={s.pageBtn(false)} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>

      {/* ── Add Customer Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <div style={s.overlay} onClick={closeAddModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Add Credit Customer</h2>
            <form onSubmit={handleAddCustomer}>
              <div style={s.formGroup}>
                <label style={s.label}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={s.input} name="name" value={addForm.name} onChange={handleAddFormChange} placeholder="Customer name" autoComplete="off" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Phone Number <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={s.input} name="phone" value={addForm.phone} onChange={handleAddFormChange} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Address (optional)</label>
                <textarea style={s.textarea} name="address" value={addForm.address} onChange={handleAddFormChange} placeholder="Customer address…" />
              </div>
              {addError && <p style={s.errorMsg}>{addError}</p>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={closeAddModal}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={addSaving}>{addSaving ? "Saving…" : "Add Customer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Customer Modal ────────────────────────────────────── */}
      {editCustomer && (
        <div style={s.overlay} onClick={closeEditModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Edit Customer</h2>
            <form onSubmit={handleUpdateCustomer}>
              <div style={s.formGroup}>
                <label style={s.label}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={s.input} name="name" value={editForm.name} onChange={handleEditFormChange} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Phone Number <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={s.input} name="phone" value={editForm.phone} onChange={handleEditFormChange} />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Address</label>
                <textarea style={s.textarea} name="address" value={editForm.address} onChange={handleEditFormChange} />
              </div>
              {editError && <p style={s.errorMsg}>{editError}</p>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={closeEditModal}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={editSaving}>{editSaving ? "Saving…" : "Update"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
