const s = {
  // ── Layout ────────────────────────────────────────────────────────
  page: { padding: "2rem", maxWidth: "1280px", margin: "0 auto", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  heading: { fontSize: "1.6rem", fontWeight: 700, color: "#1e1b4b", marginBottom: "0.25rem" },
  subheading: { fontSize: "0.9rem", color: "#6b7280", marginBottom: "1.5rem" },

  // ── Summary Stats Row ─────────────────────────────────────────────
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" },
  statCard: (bg, accent) => ({
    background: bg, borderRadius: "12px", padding: "1.1rem 1.4rem",
    display: "flex", flexDirection: "column", gap: "0.3rem",
    borderLeft: `4px solid ${accent}`,
  }),
  statLabel: { fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: (color) => ({ fontSize: "1.5rem", fontWeight: 800, color: color }),

  // ── Toolbar ───────────────────────────────────────────────────────
  toolbar: {
    display: "flex", alignItems: "center", gap: "0.75rem",
    marginBottom: "1.25rem", flexWrap: "wrap",
  },
  searchWrap: {
    display: "flex", flex: 1, minWidth: "220px", maxWidth: "400px",
    border: "1px solid #d1d5db", borderRadius: "8px", overflow: "hidden", background: "#fff",
  },
  searchInput: { border: "none", outline: "none", padding: "0.5rem 0.8rem", fontSize: "0.875rem", flex: 1 },
  searchBtn: {
    background: "#4f46e5", color: "#fff", border: "none",
    padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem",
  },
  filterChip: (active) => ({
    padding: "0.45rem 1rem", borderRadius: "9999px", cursor: "pointer", fontWeight: 600,
    fontSize: "0.82rem", border: "1px solid " + (active ? "#4f46e5" : "#d1d5db"),
    background: active ? "#ede9fe" : "#fff",
    color: active ? "#4f46e5" : "#6b7280",
  }),
  addBtn: {
    marginLeft: "auto", background: "#4f46e5", color: "#fff", border: "none",
    borderRadius: "8px", padding: "0.5rem 1.25rem", cursor: "pointer",
    fontWeight: 700, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem",
  },

  // ── Table Card ────────────────────────────────────────────────────
  tableCard: {
    background: "#fff", borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb", overflow: "hidden",
  },
  tableHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 1.4rem", borderBottom: "1px solid #f3f4f6",
  },
  tableTitle: { fontSize: "1rem", fontWeight: 700, color: "#1e1b4b" },
  countBadge: {
    background: "#ede9fe", color: "#4f46e5", borderRadius: "9999px",
    padding: "0.15rem 0.65rem", fontSize: "0.75rem", fontWeight: 700, marginLeft: "0.5rem",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "0.75rem 1rem",
    background: "#f8fafc", fontSize: "0.75rem", fontWeight: 700,
    color: "#6b7280", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap",
    textTransform: "uppercase", letterSpacing: "0.04em",
  },
  td: {
    padding: "0.9rem 1rem", fontSize: "0.875rem", color: "#374151",
    borderBottom: "1px solid #f3f4f6", verticalAlign: "middle",
  },
  tdRed: {
    padding: "0.9rem 1rem", fontSize: "0.875rem", color: "#dc2626",
    borderBottom: "1px solid #f3f4f6", verticalAlign: "middle", fontWeight: 700,
  },

  // ── Customer Name Cell ────────────────────────────────────────────
  nameCell: { display: "flex", alignItems: "center", gap: "0.75rem" },
  avatar: {
    width: "38px", height: "38px", borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: "0.95rem", flexShrink: 0,
  },
  custName: { fontWeight: 600, color: "#111827" },
  custPhone: { fontSize: "0.75rem", color: "#9ca3af", marginTop: "2px" },

  // ── Status / badges ───────────────────────────────────────────────
  statusBadge: (cleared) => ({
    display: "inline-block", borderRadius: "9999px",
    padding: "0.2rem 0.7rem", fontSize: "0.75rem", fontWeight: 700,
    background: cleared ? "#f0fdf4" : "#fef2f2",
    color: cleared ? "#16a34a" : "#dc2626",
  }),
  amountBadge: (hasBalance) => ({
    fontWeight: 700, color: hasBalance ? "#dc2626" : "#16a34a",
  }),

  // ── Action buttons ────────────────────────────────────────────────
  actionWrap: { display: "flex", gap: "0.4rem" },
  viewBtn:   { border: "none", background: "#eff6ff", color: "#3b82f6", borderRadius: "7px", padding: "0.35rem 0.6rem", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 },
  editBtn:   { border: "none", background: "#fef3c7", color: "#d97706", borderRadius: "7px", padding: "0.35rem 0.6rem", cursor: "pointer", fontSize: "0.82rem" },
  deleteBtn: { border: "none", background: "#fee2e2", color: "#ef4444", borderRadius: "7px", padding: "0.35rem 0.6rem", cursor: "pointer", fontSize: "0.82rem" },

  // ── Pagination ────────────────────────────────────────────────────
  paginationWrap: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.4rem", padding: "0.75rem 1rem", borderTop: "1px solid #f3f4f6" },
  pageBtn: (active) => ({
    border: active ? "none" : "1px solid #e5e7eb",
    background: active ? "#4f46e5" : "#fff",
    color: active ? "#fff" : "#374151",
    borderRadius: "6px", padding: "0.3rem 0.65rem",
    cursor: "pointer", fontWeight: active ? 700 : 400, fontSize: "0.82rem",
  }),

  empty: { textAlign: "center", padding: "3.5rem 1rem", color: "#9ca3af", fontSize: "0.9rem" },

  // ── Modal ─────────────────────────────────────────────────────────
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    background: "#fff", borderRadius: "16px",
    boxShadow: "0 8px 48px rgba(0,0,0,0.18)", padding: "2rem",
    width: "min(540px, 94vw)", maxHeight: "90vh", overflowY: "auto",
  },
  modalTitle: { fontSize: "1.15rem", fontWeight: 700, color: "#1e1b4b", marginBottom: "1.4rem" },
  formGroup: { display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1rem" },
  label: { fontSize: "0.82rem", fontWeight: 600, color: "#374151" },
  input: {
    padding: "0.55rem 0.8rem", borderRadius: "8px", border: "1px solid #d1d5db",
    fontSize: "0.9rem", outline: "none",
  },
  select: {
    padding: "0.55rem 0.8rem", borderRadius: "8px", border: "1px solid #d1d5db",
    fontSize: "0.9rem", outline: "none", background: "#fff",
  },
  textarea: {
    padding: "0.55rem 0.8rem", borderRadius: "8px", border: "1px solid #d1d5db",
    fontSize: "0.9rem", outline: "none", resize: "vertical", minHeight: "70px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  errorMsg: { color: "#ef4444", fontSize: "0.82rem", marginTop: "0.4rem" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.4rem" },
  cancelBtn: {
    padding: "0.5rem 1.3rem", borderRadius: "8px", border: "1px solid #d1d5db",
    background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem",
  },
  submitBtn: {
    padding: "0.5rem 1.5rem", borderRadius: "8px", border: "none",
    background: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem",
  },

  // ── Detail page ───────────────────────────────────────────────────
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: "0.4rem",
    background: "none", border: "1px solid #d1d5db", borderRadius: "8px",
    padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem",
    color: "#374151", fontWeight: 600, marginBottom: "1.25rem",
  },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" },
  infoCard: {
    background: "#fff", borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb", padding: "1.5rem",
  },
  infoCardTitle: { fontSize: "0.78rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" },
  infoLabel: { fontSize: "0.85rem", color: "#6b7280" },
  infoValue: { fontSize: "0.9rem", fontWeight: 600, color: "#111827" },
  balanceValue: (hasBalance) => ({
    fontSize: "1.1rem", fontWeight: 800, color: hasBalance ? "#dc2626" : "#16a34a",
  }),
  balanceAlert: {
    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px",
    padding: "0.75rem 1rem", marginTop: "0.75rem",
    display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#dc2626",
  },
  clearedAlert: {
    background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px",
    padding: "0.75rem 1rem", marginTop: "0.75rem",
    display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#16a34a",
  },
  payBtn: {
    width: "100%", marginTop: "1.25rem", padding: "0.65rem",
    background: "#4f46e5", color: "#fff", border: "none",
    borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem",
  },

  // Transaction / payment section
  sectionCard: {
    background: "#fff", borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb",
    overflow: "hidden", marginBottom: "1.5rem",
  },
  sectionHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1rem 1.4rem", borderBottom: "1px solid #f3f4f6",
  },
  sectionTitle: { fontSize: "1rem", fontWeight: 700, color: "#1e1b4b" },
  sectionBadge: {
    background: "#ede9fe", color: "#4f46e5", borderRadius: "9999px",
    padding: "0.15rem 0.65rem", fontSize: "0.75rem", fontWeight: 700,
  },

  // Items mini list inside expanded row
  itemsTable: { width: "100%", borderCollapse: "collapse", background: "#f8fafc", fontSize: "0.82rem" },
  itemsTh: { padding: "0.45rem 0.8rem", fontWeight: 700, color: "#6b7280", textAlign: "left", borderBottom: "1px solid #e5e7eb" },
  itemsTd: { padding: "0.45rem 0.8rem", color: "#374151", borderBottom: "1px solid #f3f4f6" },

  // Payment mode chip
  modeChip: (mode) => {
    const colors = { cash: ["#f0fdf4","#16a34a"], upi: ["#eff6ff","#3b82f6"], card: ["#fdf4ff","#a855f7"] };
    const [bg, color] = colors[mode] || ["#f3f4f6","#6b7280"];
    return { background: bg, color, borderRadius: "9999px", padding: "0.15rem 0.6rem", fontSize: "0.75rem", fontWeight: 700 };
  },

  // Remaining in red / cleared in green
  rBadge: (amount) => ({
    fontWeight: 700,
    color: parseFloat(amount) > 0 ? "#dc2626" : "#16a34a",
    fontSize: "0.875rem",
  }),

  // Loading / error states
  loadingWrap: { textAlign: "center", padding: "4rem", color: "#9ca3af" },
};

export default s;
