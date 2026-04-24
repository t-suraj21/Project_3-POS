const s = {
  page: {
    padding: "1.75rem 2rem",
    maxWidth: "1060px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: "#f4f7fb",
    minHeight: "100vh",
  },

  // ── Page header ───────────────────────────────────────────
  pageHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },

  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    background: "#fff",
    color: "#6b7280",
    border: "1px solid #e0e7ef",
    borderRadius: "8px",
    padding: "0.42rem 0.85rem",
    cursor: "pointer",
    fontSize: "0.83rem",
    fontWeight: 600,
    textDecoration: "none",
  },

  heading: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },

  // ── Section card ─────────────────────────────────────────
  section: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e8edf3",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    marginBottom: "1.25rem",
    overflow: "hidden",
  },

  sectionHead: {
    padding: "0.9rem 1.4rem",
    borderBottom: "1px solid #f1f4f9",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#111827",
    background: "#fafbfc",
  },

  sectionBody: {
    padding: "1.4rem",
  },

  // ── Basic Setup: two-pane row ─────────────────────────────
  basicRow: {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "1.5rem",
    alignItems: "start",
  },

  // ── General Setup: 3-col grid ────────────────────────────
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1.1rem",
    marginBottom: "1.1rem",
  },

  grid3Last: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1.1rem",
  },

  // Price row: 3 cols too
  priceRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1.1rem",
    marginBottom: "1.1rem",
  },

  priceRow2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.1rem",
  },

  // ── Field group ──────────────────────────────────────────
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },

  label: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#374151",
  },

  required: { color: "#ef4444", marginLeft: "0.1rem" },

  input: {
    padding: "0.58rem 0.85rem",
    border: "1px solid #e0e7ef",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#fdfdfd",
    color: "#111827",
    fontFamily: "inherit",
  },

  skuRow: {
    display: "flex",
    alignItems: "center",
    gap: "0",
  },

  skuInput: {
    flex: 1,
    padding: "0.58rem 0.85rem",
    border: "1px solid #e0e7ef",
    borderRadius: "8px 0 0 8px",
    fontSize: "0.9rem",
    outline: "none",
    background: "#fdfdfd",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
  },

  generateBtn: {
    padding: "0.58rem 0.9rem",
    border: "1px solid #1a56db",
    borderLeft: "none",
    borderRadius: "0 8px 8px 0",
    background: "#eff6ff",
    color: "#1a56db",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },

  barcodeActions: {
    marginTop: "0.45rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  printBtn: (disabled) => ({
    padding: "0.45rem 0.8rem",
    border: "1px solid #16a34a",
    borderRadius: "6px",
    background: disabled ? "#f3f4f6" : "#ecfdf3",
    color: disabled ? "#9ca3af" : "#16a34a",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.78rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  }),

  textarea: {
    padding: "0.58rem 0.85rem",
    border: "1px solid #e0e7ef",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#fdfdfd",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "90px",
    color: "#111827",
  },

  select: {
    padding: "0.58rem 0.85rem",
    border: "1px solid #e0e7ef",
    borderRadius: "8px",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#fdfdfd",
    cursor: "pointer",
    color: "#111827",
    fontFamily: "inherit",
  },

  // ── Image upload panel ─────────────────────────────────
  imageCard: {
    border: "1px solid #e0e7ef",
    borderRadius: "10px",
    background: "#f9fafb",
    overflow: "hidden",
  },

  imageCardHead: {
    padding: "0.7rem 1rem",
    borderBottom: "1px solid #e8edf3",
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#374151",
    background: "#fff",
    textAlign: "center",
  },

  imagePreviewBox: {
    width: "100%",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },

  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  imagePlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    color: "#9ca3af",
  },

  cameraIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#e0e7ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
  },

  imageCardFooter: {
    padding: "0.65rem 1rem",
    fontSize: "0.72rem",
    color: "#9ca3af",
    textAlign: "center",
    borderTop: "1px solid #e8edf3",
    lineHeight: 1.5,
  },

  uploadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    padding: "0.5rem",
    borderRadius: "0",
    border: "none",
    borderTop: "1px solid #e8edf3",
    background: "#eff6ff",
    color: "#1a56db",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 700,
    width: "100%",
  },

  removeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    padding: "0.45rem",
    borderRadius: "0",
    border: "none",
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 700,
    width: "100%",
  },

  // ── Stock +/- ─────────────────────────────────────────
  stockRow: {
    display: "flex",
    alignItems: "center",
    gap: "0",
  },

  stockBtn: {
    width: "36px",
    height: "38px",
    border: "1px solid #e0e7ef",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: "1.05rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
    flexShrink: 0,
  },

  stockBtnLeft: {
    borderRadius: "8px 0 0 8px",
    borderRight: "none",
  },

  stockBtnRight: {
    borderRadius: "0 8px 8px 0",
    borderLeft: "none",
  },

  stockInput: {
    flex: 1,
    padding: "0.58rem 0.5rem",
    border: "1px solid #e0e7ef",
    fontSize: "0.95rem",
    fontWeight: 700,
    textAlign: "center",
    outline: "none",
    background: "#fdfdfd",
    fontFamily: "inherit",
    minWidth: 0,
  },

  // ── GST toggle ───────────────────────────────────────────
  gstToggle: {
    display: "flex",
    gap: "0.5rem",
  },

  gstBtn: (active) => ({
    flex: 1,
    padding: "0.5rem",
    borderRadius: "8px",
    border: `1px solid ${active ? "#1a56db" : "#e0e7ef"}`,
    background: active ? "#dbeafe" : "#f9fafb",
    color: active ? "#1a56db" : "#9ca3af",
    fontWeight: 700,
    fontSize: "0.82rem",
    cursor: "pointer",
    fontFamily: "inherit",
  }),

  // ── GST price breakdown ──────────────────────────────────
  gstBreakdown: {
    background: "#f8fafd",
    borderRadius: "8px",
    padding: "0.85rem 1rem",
    fontSize: "0.82rem",
    color: "#374151",
    border: "1px solid #e0e7ef",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.35rem 0.75rem",
    marginTop: "0.75rem",
  },

  gstLabel: { color: "#6b7280", fontWeight: 500 },
  gstValue: { fontWeight: 700, color: "#111827", textAlign: "right" },

  // ── Error banner ──────────────────────────────────────────
  error: {
    padding: "0.75rem 1rem",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    fontSize: "0.88rem",
    fontWeight: 500,
    marginBottom: "1rem",
  },

  // ── Bottom actions bar ────────────────────────────────────
  actionsBar: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    paddingTop: "0.25rem",
  },

  cancelBtn: {
    padding: "0.6rem 1.5rem",
    borderRadius: "8px",
    border: "1px solid #e0e7ef",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "inherit",
  },

  submitBtn: (disabled) => ({
    padding: "0.6rem 2rem",
    borderRadius: "8px",
    border: "none",
    background: disabled ? "#93c5fd" : "#1a56db",
    color: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700,
    fontSize: "0.9rem",
    boxShadow: disabled ? "none" : "0 2px 6px rgba(26,86,219,0.3)",
    fontFamily: "inherit",
  }),

  spanFull: { gridColumn: "1 / -1" },
  fieldGroupFull: { display: "flex", flexDirection: "column", gap: "0.35rem", gridColumn: "1 / -1" },

  // ── Inline category "+ New" button ───────────────────────────────
  addCatBtn: {
    flexShrink: 0,
    padding: "0.42rem 0.75rem",
    fontSize: "0.78rem",
    fontWeight: 700,
    background: "#f0f4ff",
    color: "#1a56db",
    border: "1.5px solid #c7d7f9",
    borderRadius: "7px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },

  // ── Selected category path breadcrumb ────────────────────────────
  catPath: {
    marginTop: "0.38rem",
    fontSize: "0.78rem",
    color: "#1a56db",
    background: "#f0f4ff",
    border: "1px solid #c7d7f9",
    borderRadius: "6px",
    padding: "0.28rem 0.62rem",
    display: "inline-block",
    maxWidth: "100%",
  },

  // ── Category Creation Modal overlay ──────────────────────────────
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,24,39,0.40)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modalBox: {
    background: "#fff",
    borderRadius: "14px",
    boxShadow: "0 8px 32px rgba(17,24,39,0.18)",
    padding: "1.6rem 1.8rem 1.4rem",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },

  modalHead: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },

  modalSub: {
    fontSize: "0.82rem",
    color: "#6b7280",
    background: "#f4f7fb",
    borderRadius: "6px",
    padding: "0.35rem 0.65rem",
  },

  modalError: {
    fontSize: "0.8rem",
    color: "#dc2626",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "0.35rem 0.65rem",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.6rem",
  },

  modalCancelBtn: {
    padding: "0.5rem 1.1rem",
    borderRadius: "7px",
    border: "1px solid #e0e7ef",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.88rem",
    fontFamily: "inherit",
  },

  modalSaveBtn: (disabled) => ({
    padding: "0.5rem 1.4rem",
    borderRadius: "7px",
    border: "none",
    background: disabled ? "#93c5fd" : "#1a56db",
    color: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700,
    fontSize: "0.88rem",
    fontFamily: "inherit",
  }),
};

export default s;
