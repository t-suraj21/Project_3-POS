import { useParams, useNavigate } from "react-router-dom";
import { useWorkers } from "../../../hooks/useWorkers";
import s from "./styles";

const AddWorker = () => {
  const { id: shopId } = useParams();
  const navigate = useNavigate();

  const {
    addForm,
    handleAddFormChange,
    handleAddWorker,
    addError,
    addSaving,
  } = useWorkers();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAddWorker(e);
    // Navigate back to all workers after success
    setTimeout(() => {
      if (!addError) {
        navigate(`/shop/${shopId}/workers`);
      }
    }, 600);
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <button
            onClick={() => navigate(`/shop/${shopId}/workers`)}
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
          <h1 style={s.heading}>Add New Worker</h1>
        </div>
        <p style={s.subheading}>Create a new worker account with specific roles and permissions</p>
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: "1000px" }}>
        {/* Form Section */}
        <div style={s.formCard}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827", marginBottom: "1.5rem" }}>
            Worker Details
          </h2>

          {addError && (
            <div style={{ ...s.errorMsg, marginBottom: "1.5rem" }}>
              ⚠️ {addError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div style={s.formGroup}>
              <label style={s.label}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={addForm.name}
                onChange={handleAddFormChange}
                placeholder="e.g., John Salesman"
                style={s.input}
                disabled={addSaving}
              />
            </div>

            {/* Email Field */}
            <div style={s.formGroup}>
              <label style={s.label}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={addForm.email}
                onChange={handleAddFormChange}
                placeholder="e.g., john@shop.com"
                style={s.input}
                disabled={addSaving}
              />
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.4rem" }}>
                Used for login
              </p>
            </div>

            {/* Password Field */}
            <div style={s.formGroup}>
              <label style={s.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={addForm.password}
                onChange={handleAddFormChange}
                placeholder="At least 6 characters"
                style={s.input}
                disabled={addSaving}
              />
              <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.4rem" }}>
                Must be at least 6 characters
              </p>
            </div>

            {/* Role Field */}
            <div style={s.formGroup}>
              <label style={s.label}>Assign Role *</label>
              <select
                name="role"
                value={addForm.role}
                onChange={handleAddFormChange}
                style={{
                  ...s.input,
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%234b5563' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  paddingRight: "2.5rem",
                }}
                disabled={addSaving}
              >
                <option value="sales_worker">Sales Worker - Handle sales & orders</option>
                <option value="account_worker">Account Worker - Manage customers & accounts</option>
                <option value="stock_manager">Stock Manager - Handle inventory & products</option>
                <option value="manager">Manager - Full store access</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button
                type="button"
                onClick={() => navigate(`/shop/${shopId}/workers`)}
                style={{
                  ...s.cancelBtn,
                  flex: 1,
                }}
                disabled={addSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...s.submitBtn,
                  flex: 1,
                }}
                disabled={addSaving}
              >
                {addSaving ? "Creating…" : "Create Worker"}
              </button>
            </div>
          </form>
        </div>

        {/* Info Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Role Guide */}
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #bfdbfe",
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e40af", marginBottom: "1rem" }}>
              👥 Worker Roles
            </h3>
            <div style={{ fontSize: "0.85rem", color: "#1e3a8a", lineHeight: "1.8" }}>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Sales Worker</strong>
                <p style={{ margin: "0.3rem 0 0" }}>Access to sales, orders, and billing</p>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Account Worker</strong>
                <p style={{ margin: "0.3rem 0 0" }}>Manage customer accounts and profiles</p>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Stock Manager</strong>
                <p style={{ margin: "0.3rem 0 0" }}>Handle inventory and product management</p>
              </div>
              <div>
                <strong>Manager</strong>
                <p style={{ margin: "0.3rem 0 0" }}>Full access to all shop features</p>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#991b1b", marginBottom: "1rem" }}>
              🔐 Security
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#7f1d1d", margin: "0" }}>
              ✓ Passwords are securely hashed<br />
              ✓ Workers can login immediately<br />
              ✓ Each role has specific permissions<br />
              ✓ Activity is logged for auditing
            </p>
          </div>

          {/* Tips */}
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fcd34d",
              borderRadius: "12px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#b45309", marginBottom: "1rem" }}>
              💡 Tips
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#92400e", margin: "0" }}>
              • Use unique email addresses<br />
              • Create strong passwords<br />
              • You can change roles anytime<br />
              • Delete workers if needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddWorker;
