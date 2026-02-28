const s = {
  page: {
    padding: "1.75rem 2rem",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    minHeight: "100vh",
    background: "#f4f7fb",
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.25rem",
    flexWrap: "wrap",
    gap: "0.75rem",
  },

  titleRow: { display: "flex", alignItems: "center", gap: "0.6rem" },

  heading: {
    fontSize: "1.35rem",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },

  countChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a56db",
    color: "#fff",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 700,
    minWidth: "26px",
    height: "22px",
    padding: "0 7px",
  },

  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    background: "#1a56db",
    color: "#fff",
    padding: "0.55rem 1.1rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.88rem",
    boxShadow: "0 2px 6px rgba(26,86,219,0.3)",
  },

  // ── Toolbar ─────────────────────────────────────────────
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    marginBottom: "1.1rem",
    flexWrap: "wrap",
  },

  searchWrap: {
    display: "flex",
    flex: 1,
    minWidth: "200px",
    maxWidth: "340px",
  },

  searchInput: {
    flex: 1,
    padding: "0.5rem 0.85rem",
    border: "1px solid #e0e7ef",
    borderRight: "none",
    borderRadius: "8px 0 0 8px",
    fontSize: "0.88rem",
    outline: "none",
    background: "#fff",
  },

  searchBtn: {
    padding: "0.5rem 1rem",
    background: "#1a56db",
    color: "#fff",
    border: "none",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
  },

  categorySelect: {
    padding: "0.5rem 0.85rem",
    border: "1px solid #e0e7ef",
    borderRadius: "8px",
    fontSize: "0.88rem",
    outline: "none",
    background: "#fff",
    cursor: "pointer",
    color: "#374151",
    minWidth: "150px",
  },

  toolRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginLeft: "auto",
  },

  iconToolBtn: (active) => ({
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${active ? "#1a56db" : "#e0e7ef"}`,
    borderRadius: "8px",
    background: active ? "#eff6ff" : "#fff",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: active ? "#1a56db" : "#6b7280",
  }),

  lowStockBtn: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.45rem 0.85rem",
    border: `1px solid ${active ? "#d97706" : "#e0e7ef"}`,
    borderRadius: "8px",
    background: active ? "#fef3c7" : "#fff",
    color: active ? "#92400e" : "#6b7280",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 600,
  }),

  // ── Table card ──────────────────────────────────────────
  card: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e8edf3",
  },

  table: { width: "100%", borderCollapse: "collapse" },

  th: {
    padding: "0.7rem 0.9rem",
    background: "#f8fafd",
    textAlign: "left",
    fontSize: "0.76rem",
    color: "#6b7280",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderBottom: "1px solid #e8edf3",
    whiteSpace: "nowrap",
  },

  thCenter: {
    padding: "0.7rem 0.9rem",
    background: "#f8fafd",
    textAlign: "center",
    fontSize: "0.76rem",
    color: "#6b7280",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderBottom: "1px solid #e8edf3",
    whiteSpace: "nowrap",
  },

  tr: (isLow) => ({
    background: isLow ? "#fffbeb" : "transparent",
    transition: "background 0.12s",
  }),

  td: {
    padding: "0.75rem 0.9rem",
    fontSize: "0.86rem",
    color: "#374151",
    borderBottom: "1px solid #f1f4f9",
    verticalAlign: "middle",
  },

  tdCenter: {
    padding: "0.75rem 0.9rem",
    fontSize: "0.86rem",
    color: "#374151",
    borderBottom: "1px solid #f1f4f9",
    verticalAlign: "middle",
    textAlign: "center",
  },

  slNum: {
    fontSize: "0.82rem",
    color: "#9ca3af",
    fontWeight: 500,
  },

  imgThumb: {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
    flexShrink: 0,
  },

  imgPlaceholder: {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    flexShrink: 0,
    border: "1px solid #e5e7eb",
  },

  nameCell: { display: "flex", alignItems: "center", gap: "0.7rem" },

  namePrimary: {
    fontWeight: 600,
    color: "#111827",
    fontSize: "0.86rem",
  },

  nameId: {
    fontSize: "0.74rem",
    color: "#9ca3af",
    marginTop: "0.1rem",
  },

  descText: {
    fontSize: "0.81rem",
    color: "#6b7280",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "block",
  },

  catChip: {
    display: "inline-block",
    padding: "0.2rem 0.55rem",
    borderRadius: "6px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "0.76rem",
    fontWeight: 600,
  },

  price: {
    fontWeight: 700,
    color: "#111827",
    fontSize: "0.86rem",
  },

  priceLabel: {
    fontSize: "0.71rem",
    color: "#9ca3af",
    marginTop: "0.1rem",
  },

  gstBadge: {
    display: "inline-block",
    padding: "0.15rem 0.45rem",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "0.72rem",
    fontWeight: 700,
  },

  stockBadge: (danger) => ({
    display: "inline-block",
    padding: "0.2rem 0.55rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: 700,
    background: danger ? "#fee2e2" : "#d1fae5",
    color: danger ? "#b91c1c" : "#065f46",
  }),

  // ── Status toggle ────────────────────────────────────────
  toggleTrack: (on) => ({
    width: "36px",
    height: "20px",
    borderRadius: "999px",
    background: on ? "#1a56db" : "#d1d5db",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.2s",
    border: "none",
    flexShrink: 0,
    display: "inline-block",
  }),

  toggleThumb: (on) => ({
    position: "absolute",
    top: "3px",
    left: on ? "19px" : "3px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#fff",
    transition: "left 0.18s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
  }),

  // ── Action icon buttons ──────────────────────────────────
  actions: { display: "flex", gap: "0.4rem", alignItems: "center" },

  actionBtn: (color, bg) => ({
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    border: "none",
    background: bg,
    color: color,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.78rem",
    fontWeight: 700,
    textDecoration: "none",
  }),

  // ── Pagination ───────────────────────────────────────────
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "0.35rem",
    padding: "0.9rem 1.25rem",
    borderTop: "1px solid #f1f4f9",
    background: "#fff",
  },

  pageBtn: (active, disabled) => ({
    minWidth: "32px",
    height: "32px",
    padding: "0 0.5rem",
    borderRadius: "7px",
    border: `1px solid ${active ? "#1a56db" : "#e0e7ef"}`,
    background: active ? "#1a56db" : "#fff",
    color: active ? "#fff" : disabled ? "#c4c9d4" : "#374151",
    cursor: disabled ? "default" : "pointer",
    fontWeight: 600,
    fontSize: "0.82rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  }),

  empty: {
    textAlign: "center",
    padding: "3.5rem",
    color: "#9ca3af",
    fontSize: "0.95rem",
  },
};

export default s;
