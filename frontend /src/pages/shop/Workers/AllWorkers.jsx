import { useParams, useNavigate } from "react-router-dom";
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

const AllWorkers = () => {
  const { id: shopId } = useParams();
  const navigate = useNavigate();

  const {
    workers,
    loading,
    error,
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
      {/* Header Section */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ← Back
          </button>
          <h1 style={s.heading}>All Workers</h1>
        </div>
        <p style={s.subheading}>View and manage all workers in your shop</p>
      </div>

      {/* Actions Bar */}
      <div style={s.toolbar}>
        <button
          onClick={() => navigate(`/shop/${shopId}/workers/add`)}
          style={{
            ...s.addBtn,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>+</span> Add New Worker
        </button>
        <button
          onClick={() => window.location.reload()}
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
          <span style={s.tableTitle}>Worker Directory</span>
          <span style={s.countBadge}>{workers.length}</span>
        </div>

        {error && (
          <div style={{ ...s.errorMsg, color: "#dc2626", margin: "1rem" }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <p style={s.loadingWrap}>📂 Loading workers…</p>
        ) : workers.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👷</div>
            <h3 style={{ color: "#111827", marginBottom: "0.5rem" }}>No workers yet</h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Create your first worker to get started</p>
            <button
              onClick={() => navigate(`/shop/${shopId}/workers/add`)}
              style={{
                ...s.addBtn,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>+</span> Create First Worker
            </button>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>#</th>
                <th style={s.th}>Name</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Joined</th>
                <th style={s.th}>Actions</th>
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
                    <td style={{ ...s.td, fontWeight: 700, color: "#111827" }}>{worker.name}</td>
                    <td style={s.td}>{worker.email}</td>
                    <td style={s.td}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.35rem 0.8rem",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          background: roleInfo.bg,
                          color: roleInfo.color,
                        }}
                      >
                        {ROLE_LABELS[worker.role] || worker.role}
                      </span>
                    </td>
                    <td style={s.td}>{createdDate}</td>
                    <td style={s.td}>
                      <div style={s.actionWrap}>
                        <button
                          onClick={() => openEditModal(worker)}
                          style={s.editBtn}
                          title="Edit role"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(worker.id)}
                          style={s.deleteBtn}
                          title="Delete worker"
                        >
                          🗑️
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

      {/* Edit Role Modal */}
      {editWorker && (
        <div style={s.overlay} onClick={closeEditModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Update Worker Role</h3>

            {editError && (
              <div style={s.errorMsg}>
                ⚠️ {editError}
              </div>
            )}

            <form onSubmit={handleUpdateRole}>
              <div style={s.formGroup}>
                <label style={s.label}>Worker</label>
                <div
                  style={{
                    ...s.input,
                    display: "flex",
                    alignItems: "center",
                    background: "#f9fafb",
                    color: "#374151",
                  }}
                >
                  {editWorker.name} ({editWorker.email})
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Select New Role *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  style={{
                    ...s.input,
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%234b5563' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="">-- Select a role --</option>
                  <option value="sales_worker">Sales Worker</option>
                  <option value="account_worker">Account Worker</option>
                  <option value="stock_manager">Stock Manager</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div style={s.modalActions}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  style={s.cancelBtn}
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={s.submitBtn}
                  disabled={editSaving || !editRole}
                >
                  {editSaving ? "Updating…" : "Update Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWorkers;
