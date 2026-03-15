import { useParams } from "react-router-dom";
import { useWorkers } from "../../../hooks/useWorkers";
import s from "./styles";

const ROLE_LABELS = {
  sales_worker: "Sales Worker",
  account_worker: "Account Worker",
  stock_manager: "Stock Manager",
  manager: "Manager",
};

const ROLE_COLORS = {
  sales_worker: { bg: "#dbeafe", color: "#1e40af" },
  account_worker: { bg: "#fef3c7", color: "#b45309" },
  stock_manager: { bg: "#d1fae5", color: "#065f46" },
  manager: { bg: "#ede9fe", color: "#5b21b6" },
};

const Workers = () => {
  const { id: shopId } = useParams();

  const {
    workers,
    loading,
    error,
    showAddModal,
    openAddModal,
    closeAddModal,
    addForm,
    handleAddFormChange,
    handleAddWorker,
    addError,
    addSaving,
    editWorker,
    editRole,
    setEditRole,
    openEditModal,
    closeEditModal,
    handleUpdateRole,
    editError,
    editSaving,
    handleDelete,
  } = useWorkers();

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={s.heading}>Worker Management</h1>
        <p style={s.subheading}>Manage shop workers and assign roles & permissions</p>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <button style={s.addBtn} onClick={openAddModal}>
          <span style={{ fontSize: "1rem" }}>＋</span> Add Worker
        </button>
        <button
          onClick={() => {
            console.log("Refreshing workers list...");
            window.location.reload();
          }}
          style={{
            background: "#e5e7eb",
            color: "#374151",
            border: "none",
            padding: "0.65rem 1.2rem",
            borderRadius: "10px",
            fontSize: "0.9rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Workers Table */}
      <div style={s.tableCard}>
        <div style={s.tableHead}>
          <span style={s.tableTitle}>All Workers</span>
          <span style={s.countBadge}>{workers.length}</span>
        </div>

        {error && (
          <div style={{ ...s.errorMsg, color: "#dc2626", margin: "1rem" }}>
            ⚠️ {error}
          </div>
        )}
        {loading ? (
          <p style={s.loadingWrap}>Loading workers…</p>
        ) : workers.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👷</div>
            No workers yet. Create your first worker to get started.
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>#</th>
                <th style={s.th}>Name</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Created</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker, idx) => {
                const roleInfo = ROLE_COLORS[worker.role] || { bg: "#f1f5f9", color: "#475569" };
                const createdDate = new Date(worker.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <tr key={worker.id}>
                    <td style={s.td}>{idx + 1}</td>
                    <td style={{ ...s.td, fontWeight: 700 }}>{worker.name}</td>
                    <td style={s.td}>{worker.email}</td>
                    <td style={s.td}>
                      <span style={{ ...roleInfo, fontSize: "0.75rem", fontWeight: 700, padding: "0.3rem 0.7rem", borderRadius: "6px", display: "inline-block" }}>
                        {ROLE_LABELS[worker.role] || worker.role}
                      </span>
                    </td>
                    <td style={{ ...s.td, fontSize: "0.85rem", color: "#9ca3af" }}>{createdDate}</td>
                    <td style={s.td}>
                      <div style={s.actionWrap}>
                        <button style={s.editBtn} title="Edit Role" onClick={() => openEditModal(worker)}>
                          ✏
                        </button>
                        <button style={s.deleteBtn} title="Delete" onClick={() => handleDelete(worker.id)}>
                          🗑
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

      {/* Add Worker Modal */}
      {showAddModal && (
        <div style={s.overlay} onClick={closeAddModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Add New Worker</h2>
            <form onSubmit={handleAddWorker}>
              <div style={s.formGroup}>
                <label style={s.label}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  style={s.input}
                  name="name"
                  value={addForm.name}
                  onChange={handleAddFormChange}
                  placeholder="Worker full name"
                  autoComplete="off"
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Email Address <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  style={s.input}
                  name="email"
                  type="email"
                  value={addForm.email}
                  onChange={handleAddFormChange}
                  placeholder="worker@shop.com"
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Password <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  style={s.input}
                  name="password"
                  type="password"
                  value={addForm.password}
                  onChange={handleAddFormChange}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Assign Role <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  style={s.input}
                  name="role"
                  value={addForm.role}
                  onChange={handleAddFormChange}
                >
                  <option value="sales_worker">Sales Worker (Sales & Orders only)</option>
                  <option value="account_worker">Account Worker (Accounts/Customers only)</option>
                  <option value="stock_manager">Stock Manager (Products, Categories, Inventory)</option>
                  <option value="manager">Manager (Full access)</option>
                </select>
              </div>
              {addError && <p style={s.errorMsg}>{addError}</p>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={closeAddModal}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={addSaving}>{addSaving ? "Creating…" : "Create Worker"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editWorker && (
        <div style={s.overlay} onClick={closeEditModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Update Role</h2>
            <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Worker: <strong>{editWorker.name}</strong></p>
            <form onSubmit={handleUpdateRole}>
              <div style={s.formGroup}>
                <label style={s.label}>New Role <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  style={s.input}
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="sales_worker">Sales Worker (Sales & Orders only)</option>
                  <option value="account_worker">Account Worker (Accounts/Customers only)</option>
                  <option value="stock_manager">Stock Manager (Products, Categories, Inventory)</option>
                  <option value="manager">Manager (Full access)</option>
                </select>
              </div>
              {editError && <p style={s.errorMsg}>{editError}</p>}
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={closeEditModal}>Cancel</button>
                <button type="submit" style={s.submitBtn} disabled={editSaving}>{editSaving ? "Updating…" : "Update Role"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
