const s = {
  // ── Page ──────────────────────────────────────────────────────────────────
  page: {
    padding: "1.75rem 2rem",
    fontFamily: "'Segoe UI', Inter, sans-serif",
    background: "#f8fafc",
    minHeight: "100%",
  },

  // ── Header row ────────────────────────────────────────────────────────────
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "0.75rem",
  },

  titleWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  title: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "#111827",
    letterSpacing: "-0.4px",
    margin: 0,
  },

  countBadge: {
    background: "#4f46e5",
    color: "#fff",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "0.2rem 0.65rem",
  },

  headerActions: {
    display: "flex",
    gap: "0.65rem",
    alignItems: "center",
  },

  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.5rem 1.1rem",
    background: "#fff",
    border: "1.5px solid #4f46e5",
    borderRadius: "8px",
    color: "#4f46e5",
    fontWeight: 700,
    fontSize: "0.82rem",
    cursor: "pointer",
  },

  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.5rem 1.1rem",
    background: "#4f46e5",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.82rem",
    cursor: "pointer",
  },

  // ── Toolbar ───────────────────────────────────────────────────────────────
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.25rem",
    background: "#fff",
    padding: "0.85rem 1.25rem",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    flexWrap: "wrap",
  },

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0.45rem",
    flex: 1,
    minWidth: 200,
    maxWidth: 340,
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    padding: "0 0.85rem",
    background: "#f9fafb",
  },

  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    padding: "0.55rem 0",
    fontSize: "0.85rem",
    color: "#111827",
  },

  dateInput: {
    padding: "0.55rem 0.85rem",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#374151",
    outline: "none",
    background: "#f9fafb",
    cursor: "pointer",
  },

  clearDateBtn: {
    padding: "0.5rem 0.85rem",
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    borderRadius: "7px",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
  },

  filterLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.82rem",
    color: "#6b7280",
    fontWeight: 600,
    marginLeft: "auto",
  },

  // ── Table card ────────────────────────────────────────────────────────────
  tableCard: {
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  },

  tableWrap: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.82rem",
    minWidth: 900,
  },

  thead: {
    background: "#f8fafc",
    borderBottom: "2px solid #e5e7eb",
  },

  th: {
    padding: "0.85rem 1rem",
    textAlign: "left",
    fontWeight: 700,
    color: "#6b7280",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },

  thCenter: {
    textAlign: "center",
  },

  tr: (i) => ({
    background: i % 2 === 0 ? "#fff" : "#fafafa",
    borderBottom: "1px solid #f3f4f6",
  }),

  td: {
    padding: "0.9rem 1rem",
    color: "#374151",
    verticalAlign: "middle",
  },

  tdCenter: {
    textAlign: "center",
  },

  slNum: {
    fontWeight: 700,
    color: "#9ca3af",
    fontSize: "0.78rem",
  },

  billNo: {
    fontWeight: 800,
    color: "#1e1b4b",
    fontSize: "0.85rem",
  },

  dateMain: {
    fontWeight: 600,
    color: "#111827",
  },

  dateTime: {
    fontSize: "0.72rem",
    color: "#9ca3af",
    marginTop: "2px",
  },

  customerName: {
    fontWeight: 600,
    color: "#111827",
  },

  customerPhone: {
    fontSize: "0.72rem",
    color: "#9ca3af",
    marginTop: "2px",
  },

  counterInfo: {
    fontSize: "0.82rem",
    color: "#374151",
    fontWeight: 500,
  },

  itemsLink: {
    color: "#4f46e5",
    fontWeight: 700,
    textDecoration: "underline",
    cursor: "pointer",
    background: "none",
    border: "none",
    fontSize: "0.82rem",
    padding: 0,
  },

  amtCell: {
    fontWeight: 700,
    color: "#111827",
    fontSize: "0.88rem",
  },

  discountBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
    fontSize: "0.78rem",
  },

  discRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
    color: "#6b7280",
    minWidth: 160,
  },

  discRowVal: {
    fontWeight: 600,
    color: "#111827",
  },

  totalAmt: {
    fontWeight: 800,
    color: "#1e1b4b",
    fontSize: "0.92rem",
  },

  balanceDue: {
    display: "inline-block",
    fontWeight: 800,
    color: "#dc2626",
    fontSize: "0.88rem",
    background: "#fef2f2",
    padding: "0.2rem 0.6rem",
    borderRadius: "6px",
    border: "1px solid #fecaca",
  },

  balancePaid: {
    display: "inline-block",
    fontWeight: 700,
    color: "#16a34a",
    fontSize: "0.78rem",
    background: "#f0fdf4",
    padding: "0.2rem 0.6rem",
    borderRadius: "6px",
    border: "1px solid #bbf7d0",
  },

  balanceNone: {
    color: "#9ca3af",
    fontSize: "0.85rem",
  },

  payBadge: (mode) => {
    const map = {
      cash:   ["#f0fdf4", "#16a34a"],
      upi:    ["#eff6ff", "#3b82f6"],
      card:   ["#fdf4ff", "#a855f7"],
      credit: ["#fef2f2", "#dc2626"],
    };
    const [bg, color] = map[mode] || ["#f3f4f6", "#6b7280"];
    return {
      display: "inline-block",
      background: bg, color,
      borderRadius: "9999px",
      padding: "0.2rem 0.7rem",
      fontWeight: 700,
      fontSize: "0.72rem",
      textTransform: "capitalize",
    };
  },

  statusBadge: (status) => {
    const isRefunded  = status === "refunded";
    const isCredit    = status === "credit";
    const isPartial   = status === "partial";
    const bg    = isRefunded ? "#fef2f2" : isCredit ? "#fef9c3" : isPartial ? "#fff7ed" : "#f0fdf4";
    const color = isRefunded ? "#dc2626" : isCredit ? "#ca8a04" : isPartial ? "#ea580c" : "#16a34a";
    const label = isRefunded ? "Refunded" : isCredit ? "Credit" : isPartial ? "Partial" : "Completed";
    return {
      style: {
        display: "inline-block",
        background: bg, color,
        borderRadius: "8px",
        padding: "0.3rem 0.9rem",
        fontWeight: 700,
        fontSize: "0.75rem",
        border: `1px solid ${color}30`,
      },
      label,
    };
  },

  // ── Action buttons ────────────────────────────────────────────────────────
  actionWrap: {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "center",
  },

  viewBtn: {
    padding: "0.35rem 0.75rem",
    border: "none",
    background: "#eff6ff",
    color: "#3b82f6",
    borderRadius: "7px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.78rem",
    fontWeight: 600,
    fontFamily: "inherit",
  },

  refundBtn: (disabled) => ({
    padding: "0.35rem 0.75rem",
    border: "none",
    background: disabled ? "#f3f4f6" : "#fff1f2",
    color: disabled ? "#9ca3af" : "#ef4444",
    borderRadius: "7px",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.78rem",
    fontWeight: 600,
    fontFamily: "inherit",
  }),

  // ── Empty / loading ───────────────────────────────────────────────────────
  emptyRow: {
    textAlign: "center",
    padding: "4rem 1rem",
    color: "#9ca3af",
  },

  emptyIcon: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem",
  },

  // ── Pagination row ────────────────────────────────────────────────────────
  paginationWrap: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.85rem 1.25rem",
    borderTop: "1px solid #f3f4f6",
  },

  pageBtn: (active) => ({
    width: 32, height: 32,
    border: active ? "none" : "1px solid #e5e7eb",
    background: active ? "#4f46e5" : "#fff",
    color: active ? "#fff" : "#374151",
    borderRadius: "7px",
    fontWeight: active ? 700 : 400,
    fontSize: "0.82rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),

  // ── Detail modal ──────────────────────────────────────────────────────────
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },

  modalCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    width: "min(640px, 96vw)",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  modalHeader: {
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    padding: "1.25rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "16px 16px 0 0",
  },

  modalTitle: {
    fontWeight: 800,
    fontSize: "1.05rem",
  },

  modalClose: {
    background: "rgba(255,255,255,0.2)",
    border: "none",
    color: "#fff",
    width: 30, height: 30,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modalBody: {
    padding: "1.5rem",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem 1.5rem",
    marginBottom: "1.5rem",
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "1rem",
  },

  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
  },

  infoLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  infoValue: {
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "#111827",
  },

  itemsTableWrap: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "1.25rem",
  },

  itemsTh: {
    padding: "0.6rem 0.85rem",
    background: "#f8fafc",
    fontWeight: 700,
    fontSize: "0.72rem",
    color: "#6b7280",
    textTransform: "uppercase",
    borderBottom: "1px solid #e5e7eb",
    textAlign: "left",
  },

  itemsTd: {
    padding: "0.65rem 0.85rem",
    fontSize: "0.82rem",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
  },

  totalsBlock: {
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "0.85rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    color: "#6b7280",
  },

  grandTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "1rem",
    fontWeight: 800,
    color: "#1e1b4b",
    borderTop: "1px dashed #e5e7eb",
    paddingTop: "0.5rem",
    marginTop: "0.2rem",
  },

  // ── Error banner ──────────────────────────────────────────────────────────
  errorBar: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "#dc2626",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },
};

export default s;
