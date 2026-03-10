const s = {
  // ── Page ────────────────────────────────────────────────────────────────────
  page: {
    paddingTop: "1.75rem",
    paddingRight: "2rem",
    paddingBottom: "3rem",
    paddingLeft: "2rem",
    fontFamily: "'Segoe UI', Inter, sans-serif",
    background: "#f1f5f9",
    minHeight: "100%",
  },

  // ── Page header ──────────────────────────────────────────────────────────────
  pageTitle: {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "#111827",
    marginBottom: "1.75rem",
    letterSpacing: "-0.3px",
  },

  // ── Section card ─────────────────────────────────────────────────────────────
  card: {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    marginBottom: "1.5rem",
    overflow: "hidden",
  },

  cardHeader: {
    paddingTop: "1.1rem",
    paddingRight: "1.5rem",
    paddingBottom: "0.85rem",
    paddingLeft: "1.5rem",
    borderBottom: "1px solid #f3f4f6",
  },

  cardTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },

  cardSubtitle: {
    fontSize: "0.78rem",
    color: "#9ca3af",
    marginTop: "0.2rem",
  },

  cardBody: {
    paddingTop: "1.25rem",
    paddingRight: "1.5rem",
    paddingBottom: "1.5rem",
    paddingLeft: "1.5rem",
  },

  // ── Form grid ─────────────────────────────────────────────────────────────────
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.1rem 1.5rem",
  },

  formGridFull: {
    gridColumn: "1 / -1",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },

  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
  },

  required: {
    color: "#ef4444",
    fontSize: "0.82rem",
  },

  input: {
    padding: "0.6rem 0.85rem",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.88rem",
    color: "#111827",
    outline: "none",
    background: "#fafafa",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },

  select: {
    padding: "0.6rem 0.85rem",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.88rem",
    color: "#111827",
    outline: "none",
    background: "#fafafa",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
  },

  textarea: {
    padding: "0.6rem 0.85rem",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.88rem",
    color: "#111827",
    outline: "none",
    background: "#fafafa",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "80px",
    width: "100%",
    boxSizing: "border-box",
  },

  // ── Checkbox row ─────────────────────────────────────────────────────────────
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginTop: "0.25rem",
  },

  checkbox: {
    width: 18, height: 18,
    accentColor: "#4f46e5",
    cursor: "pointer",
    flexShrink: 0,
  },

  checkLabel: {
    fontSize: "0.88rem",
    color: "#374151",
    fontWeight: 500,
    cursor: "pointer",
  },

  // ── Image upload ───────────────────────────────────────────────────────────
  uploadGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
  },

  uploadBox: {
    border: "1.5px dashed #d1d5db",
    borderRadius: "12px",
    paddingTop: "1.5rem",
    paddingRight: "1rem",
    paddingBottom: "1.5rem",
    paddingLeft: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    background: "#fafafa",
    textAlign: "center",
    position: "relative",
  },

  uploadLabel: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "0.1rem",
  },

  uploadHint: {
    fontSize: "0.73rem",
    color: "#9ca3af",
    lineHeight: 1.4,
  },

  uploadImgWrap: {
    position: "relative",
    display: "inline-flex",
  },

  uploadImg: {
    maxHeight: 80,
    maxWidth: 180,
    borderRadius: "8px",
    objectFit: "contain",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
  },

  faviconImg: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e5e7eb",
    background: "#f3f4f6",
  },

  editBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 22,
    height: 22,
    background: "#4f46e5",
    color: "#fff",
    borderRadius: "50%",
    fontSize: "0.65rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "2px solid #fff",
    boxShadow: "0 2px 6px rgba(79,70,229,0.4)",
  },

  uploadBtns: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  uploadPickBtn: {
    paddingTop: "0.4rem",
    paddingRight: "0.9rem",
    paddingBottom: "0.4rem",
    paddingLeft: "0.9rem",
    background: "#eff6ff",
    color: "#3b82f6",
    border: "1.5px solid #bfdbfe",
    borderRadius: "7px",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  uploadRemoveBtn: {
    paddingTop: "0.4rem",
    paddingRight: "0.9rem",
    paddingBottom: "0.4rem",
    paddingLeft: "0.9rem",
    background: "#fef2f2",
    color: "#ef4444",
    border: "1.5px solid #fecaca",
    borderRadius: "7px",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // ── Alert banner ──────────────────────────────────────────────────────────
  alertError: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: "10px",
    padding: "0.8rem 1rem",
    fontSize: "0.85rem",
    marginBottom: "1.25rem",
    fontWeight: 500,
  },

  alertSuccess: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    borderRadius: "10px",
    padding: "0.8rem 1rem",
    fontSize: "0.85rem",
    marginBottom: "1.25rem",
    fontWeight: 500,
  },

  // ── Footer actions ─────────────────────────────────────────────────────────
  footerBar: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },

  saveBtn: {
    paddingTop: "0.65rem",
    paddingRight: "2rem",
    paddingBottom: "0.65rem",
    paddingLeft: "2rem",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.92rem",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
    fontFamily: "inherit",
  },

  saveBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  // ── Danger zone ────────────────────────────────────────────────────────────
  dangerCard: {
    background: "#fff",
    borderRadius: "14px",
    border: "2px solid #fecaca",
    boxShadow: "0 2px 10px rgba(220,38,38,0.07)",
    marginBottom: "1.5rem",
    overflow: "hidden",
  },

  dangerHeader: {
    paddingTop: "1rem",
    paddingRight: "1.5rem",
    paddingBottom: "0.85rem",
    paddingLeft: "1.5rem",
    borderBottom: "1px solid #fecaca",
    background: "#fef2f2",
  },

  dangerTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#dc2626",
    margin: 0,
  },

  dangerBody: {
    paddingTop: "1.25rem",
    paddingRight: "1.5rem",
    paddingBottom: "1.5rem",
    paddingLeft: "1.5rem",
  },

  dangerDesc: {
    fontSize: "0.85rem",
    color: "#6b7280",
    marginBottom: "1rem",
    lineHeight: 1.6,
  },

  dangerInputRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
  },

  dangerInput: {
    padding: "0.6rem 0.85rem",
    border: "1.5px solid #fca5a5",
    borderRadius: "8px",
    fontSize: "0.88rem",
    color: "#111827",
    outline: "none",
    background: "#fafafa",
    fontFamily: "inherit",
    flex: 1,
    minWidth: 200,
    boxSizing: "border-box",
    letterSpacing: "0.05em",
  },

  deleteBtn: (active) => ({
    paddingTop: "0.65rem",
    paddingRight: "1.5rem",
    paddingBottom: "0.65rem",
    paddingLeft: "1.5rem",
    background: active ? "#dc2626" : "#f3f4f6",
    color: active ? "#fff" : "#9ca3af",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: active ? "pointer" : "not-allowed",
    fontFamily: "inherit",
  }),

  // ── Loading skeleton ──────────────────────────────────────────────────────
  loading: {
    paddingTop: "4rem",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "0.95rem",
  },
};

export default s;
