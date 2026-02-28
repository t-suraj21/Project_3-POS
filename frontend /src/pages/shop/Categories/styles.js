const s = {
  // ── Layout ────────────────────────────────────────────────────────
  page: { padding: "2rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" },

  heading: { fontSize: "1.6rem", fontWeight: 700, color: "#1e1b4b", marginBottom: "1.5rem" },

  // ── Add Form Card ─────────────────────────────────────────────────
  formCard: {
    background: "#fff", borderRadius: "12px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb",
    padding: "1.5rem", marginBottom: "1.5rem",
  },
  formCardTitle: { fontSize: "1rem", fontWeight: 700, color: "#374151", marginBottom: "1.25rem" },

  formGrid: { display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem" },
  formLeft: { display: "flex", flexDirection: "column", gap: "1rem" },

  formGroup: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#374151" },
  input: {
    padding: "0.55rem 0.75rem", borderRadius: "8px",
    border: "1px solid #d1d5db", fontSize: "0.9rem", outline: "none",
    transition: "border 0.15s",
  },
  textarea: {
    padding: "0.55rem 0.75rem", borderRadius: "8px",
    border: "1px solid #d1d5db", fontSize: "0.9rem", outline: "none",
    resize: "vertical", minHeight: "100px", fontFamily: "'Segoe UI', sans-serif",
  },

  // ── Image Upload Panel ────────────────────────────────────────────
  imgPanel: {
    border: "2px dashed #d1d5db", borderRadius: "10px",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "160px", cursor: "pointer",
    background: "#f9fafb", transition: "border-color 0.2s", position: "relative",
    overflow: "hidden",
  },
  imgIcon: { fontSize: "2.5rem", marginBottom: "0.4rem", color: "#9ca3af" },
  imgHint: { fontSize: "0.78rem", color: "#9ca3af", textAlign: "center" },
  imgPreview: { width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" },
  removeImgBtn: {
    position: "absolute", top: "6px", right: "6px",
    background: "rgba(0,0,0,0.55)", color: "#fff", border: "none",
    borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer",
    fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center",
  },

  // ── Form actions ──────────────────────────────────────────────────
  formActions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" },
  resetBtn: {
    padding: "0.5rem 1.4rem", borderRadius: "8px", border: "1px solid #d1d5db",
    background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem",
  },
  submitBtn: {
    padding: "0.5rem 1.6rem", borderRadius: "8px", border: "none",
    background: "#4f46e5", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem",
  },
  errorMsg: { color: "#ef4444", fontSize: "0.82rem", marginTop: "0.5rem" },

  // ── Table Card ────────────────────────────────────────────────────
  tableCard: {
    background: "#fff", borderRadius: "12px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", overflow: "hidden",
  },
  tableHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 1.25rem", borderBottom: "1px solid #f3f4f6",
  },
  tableTitle: { fontSize: "1rem", fontWeight: 700, color: "#1e1b4b" },
  badge: {
    background: "#dbeafe", color: "#1d4ed8", borderRadius: "9999px",
    padding: "0.15rem 0.6rem", fontSize: "0.75rem", fontWeight: 700, marginLeft: "0.5rem",
  },
  toolbar: { display: "flex", gap: "0.5rem", alignItems: "center" },
  searchWrap: {
    display: "flex", border: "1px solid #d1d5db", borderRadius: "8px",
    overflow: "hidden", background: "#fff",
  },
  searchInput: {
    border: "none", outline: "none", padding: "0.4rem 0.7rem",
    fontSize: "0.85rem", width: "180px",
  },
  searchBtn: {
    background: "#4f46e5", color: "#fff", border: "none",
    padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
  },
  iconBtn: {
    border: "1px solid #e5e7eb", background: "#fff", borderRadius: "8px",
    padding: "0.4rem 0.65rem", cursor: "pointer", fontSize: "1rem",
  },

  // ── Table ─────────────────────────────────────────────────────────
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "0.75rem 1rem",
    background: "#f8fafc", fontSize: "0.78rem", fontWeight: 700,
    color: "#6b7280", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
  },
  td: { padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#374151", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" },

  // ── Cell variants ─────────────────────────────────────────────────
  nameCellWrap: { display: "flex", alignItems: "center", gap: "0.75rem" },
  catThumb: { width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", background: "#f3f4f6" },
  catThumbPlaceholder: {
    width: "40px", height: "40px", borderRadius: "8px",
    background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.1rem", flexShrink: 0,
  },
  catName: { fontWeight: 600, color: "#111827" },
  catId: { fontSize: "0.72rem", color: "#9ca3af" },
  descTrunc: { maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#6b7280", fontSize: "0.82rem" },
  countBadge: {
    background: "#f0fdf4", color: "#16a34a", borderRadius: "8px",
    padding: "0.15rem 0.5rem", fontSize: "0.78rem", fontWeight: 700,
  },

  // ── Status toggle ─────────────────────────────────────────────────
  toggleWrap: { display: "flex", alignItems: "center", gap: "0.4rem" },
  toggleTrack: (on) => ({
    width: "36px", height: "20px", borderRadius: "999px",
    background: on ? "#4f46e5" : "#d1d5db",
    position: "relative", cursor: "pointer", transition: "background 0.2s", border: "none",
  }),
  toggleThumb: (on) => ({
    position: "absolute", top: "2px", left: on ? "18px" : "2px",
    width: "16px", height: "16px", borderRadius: "50%",
    background: "#fff", transition: "left 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  }),

  // ── Action buttons ────────────────────────────────────────────────
  actionWrap: { display: "flex", gap: "0.3rem" },
  viewBtn:   { border: "none", background: "#eff6ff", color: "#3b82f6", borderRadius: "6px", padding: "0.3rem 0.5rem", cursor: "pointer", fontSize: "0.8rem" },
  editBtn:   { border: "none", background: "#fef3c7", color: "#d97706", borderRadius: "6px", padding: "0.3rem 0.5rem", cursor: "pointer", fontSize: "0.8rem" },
  deleteBtn: { border: "none", background: "#fee2e2", color: "#ef4444", borderRadius: "6px", padding: "0.3rem 0.5rem", cursor: "pointer", fontSize: "0.8rem" },

  // ── Pagination ────────────────────────────────────────────────────
  paginationWrap: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderTop: "1px solid #f3f4f6" },
  pageBtn: (active) => ({
    border: active ? "none" : "1px solid #e5e7eb",
    background: active ? "#4f46e5" : "#fff",
    color: active ? "#fff" : "#374151",
    borderRadius: "6px", padding: "0.3rem 0.65rem",
    cursor: "pointer", fontWeight: active ? 700 : 400, fontSize: "0.82rem",
  }),

  // ── Modal ─────────────────────────────────────────────────────────
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: "14px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)", padding: "2rem",
    width: "min(500px, 92vw)", maxHeight: "90vh", overflowY: "auto",
  },
  modalTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#1e1b4b", marginBottom: "1.25rem" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" },
  cancelBtn: {
    padding: "0.5rem 1.2rem", borderRadius: "8px", border: "1px solid #d1d5db",
    background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer",
  },
  updateBtn: {
    padding: "0.5rem 1.4rem", borderRadius: "8px", border: "none",
    background: "#4f46e5", color: "#fff", fontWeight: 600, cursor: "pointer",
  },

  empty: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af", fontSize: "0.9rem" },
};

export default s;
