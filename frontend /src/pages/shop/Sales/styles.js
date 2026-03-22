const s = {
  // ── Layout ──────────────────────────────────────────────────────────────────
  page: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "#f1f5f9",
    fontFamily: "'Segoe UI', Inter, sans-serif",
  },

  // ── Left: product panel ──────────────────────────────────────────────────────
  leftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRight: "1px solid #e2e8f0",
  },

  topBar: {
    background: "#fff",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },

  topBarLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
    marginRight: "auto",
  },

  topTitle: {
    fontWeight: 800,
    fontSize: "1.05rem",
    color: "#1e1b4b",
    letterSpacing: "-0.3px",
  },

  topSub: {
    fontSize: "0.78rem",
    color: "#6b7280",
  },

  searchRow: {
    background: "#fff",
    padding: "0.85rem 1.5rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },

  searchBox: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    background: "#f9fafb",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    padding: "0 1rem",
    gap: "0.5rem",
    maxWidth: 480,
  },

  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    padding: "0.62rem 0",
    fontSize: "0.9rem",
    color: "#111827",
  },

  filterSelect: {
    padding: "0.6rem 0.9rem",
    borderRadius: "8px",
    border: "1.5px solid #e5e7eb",
    background: "#fff",
    fontSize: "0.85rem",
    color: "#374151",
    outline: "none",
    cursor: "pointer",
  },

  addNewLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#4f46e5",
    textDecoration: "none",
    whiteSpace: "nowrap",
    padding: "0.55rem 1rem",
    background: "#eef2ff",
    borderRadius: "8px",
    border: "1px solid #c7d2fe",
    marginLeft: "auto",
  },

  // ── Product grid ─────────────────────────────────────────────────────────────
  productGrid: {
    flex: 1,
    overflowY: "auto",
    padding: "1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1.5rem",
    alignContent: "start",
  },

  productCard: (outOfStock) => ({
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    cursor: outOfStock ? "not-allowed" : "pointer",
    opacity: outOfStock ? 0.65 : 1,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    minHeight: "370px",
    maxHeight: "420px"
  }),

  productCardHover: {},

  productImgWrap: {
    width: "100%",
    height: "220px",
    overflow: "hidden",
    background: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0
  },

  productImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease"
  },

  productImgPlaceholder: {
    fontSize: "2.5rem",
    color: "#d1d5db",
  },

  productInfo: {
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
    flex: 1,
    justifyContent: "space-between"
  },

  productCategory: {
    fontSize: "0.7rem",
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "0.25rem"
  },

  productName: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#111827",
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    marginBottom: "0.05rem",
    minHeight: "2.5rem"
  },

  productUnit: {
    fontSize: "0.72rem",
    color: "#9ca3af",
  },

  productCostStrike: {
    fontSize: "0.8rem",
    color: "#b8bcc4",
    textDecoration: "line-through",
    marginBottom: "0.05rem",
    fontWeight: "500"
  },

  productPrice: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#2563eb",
    marginBottom: "0.1rem",
    letterSpacing: "0.2px"
  },

  productDescription: {
    fontSize: "0.75rem",
    color: "#6b7280",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    marginBottom: "0.1rem",
    minHeight: "1.8rem"
  },

  outOfStockBadge: {
    display: "inline-block",
    background: "transparent",
    color: "#374151",
    fontSize: "0.8rem",
    fontWeight: "500",
    padding: "0",
    borderRadius: "0",
    marginTop: "auto"
  },

  cartBadge: (count) => ({
    position: "absolute",
    top: -6,
    right: -6,
    background: "#ef4444",
    color: "#fff",
    borderRadius: "9999px",
    fontSize: "0.62rem",
    fontWeight: 800,
    width: 18,
    height: 18,
    display: count > 0 ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  }),

  // ── Loading / empty states ───────────────────────────────────────────────────
  centerMsg: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "4rem 1rem",
    color: "#9ca3af",
    fontSize: "0.95rem",
  },

  // ── Right: cart panel ────────────────────────────────────────────────────────
  rightPanel: {
    width: 400,
    minWidth: 360,
    display: "flex",
    flexDirection: "column",
    background: "#f1f5f9",
    overflow: "hidden",
    borderLeft: "1px solid #e2e8f0",
  },

  cartHeader: {
    padding: "1.1rem 1.4rem",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    flexShrink: 0,
  },

  cartTitle: {
    fontWeight: 800,
    fontSize: "1.05rem",
    letterSpacing: "-0.2px",
  },

  cartCount: {
    background: "rgba(255,255,255,0.25)",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "0.15rem 0.65rem",
  },

  clearBtn: {
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    borderRadius: "7px",
    padding: "0.3rem 0.65rem",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 600,
  },

  cartBody: {
    maxHeight: "38vh",
    overflowY: "auto",
    padding: "0.75rem 1rem",
    background: "#fff",
    flexShrink: 0,
    borderBottom: "1px solid #e2e8f0",
  },

  emptyCart: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    height: "100%",
    color: "#9ca3af",
    paddingBottom: "2rem",
  },

  emptyCartIcon: {
    fontSize: "3.5rem",
    opacity: 0.4,
  },

  emptyCartText: {
    fontWeight: 600,
    fontSize: "0.9rem",
  },

  emptyCartSub: {
    fontSize: "0.8rem",
    textAlign: "center",
    lineHeight: 1.6,
  },

  // ── Cart item ────────────────────────────────────────────────────────────────
  cartItem: {
    display: "flex",
    gap: "0.65rem",
    padding: "0.65rem 0",
    borderBottom: "1px solid #f3f4f6",
    alignItems: "flex-start",
  },

  cartItemImg: {
    width: 44,
    height: 44,
    borderRadius: "8px",
    objectFit: "cover",
    background: "#f3f4f6",
    flexShrink: 0,
  },

  cartItemImgPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: "8px",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    flexShrink: 0,
  },

  cartItemInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },

  cartItemName: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  cartItemUnit: {
    fontSize: "0.72rem",
    color: "#9ca3af",
  },

  cartItemPrice: {
    fontSize: "0.8rem",
    color: "#4f46e5",
    fontWeight: 700,
  },

  qtyRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    marginTop: "0.2rem",
  },

  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    color: "#374151",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    padding: 0,
  },

  qtyInput: {
    width: 32,
    height: 24,
    textAlign: "center",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#111827",
    outline: "none",
    background: "#fff",
    padding: 0,
  },

  cartItemTotal: {
    fontSize: "0.88rem",
    fontWeight: 800,
    color: "#111827",
    textAlign: "right",
    flexShrink: 0,
  },

  removeBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontSize: "0.75rem",
    padding: "0.1rem 0.25rem",
    borderRadius: "4px",
    lineHeight: 1,
  },

  // ── Billing section ──────────────────────────────────────────────────────────
  billingSection: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
  },

  billingHeader: {
    background: "#e8eaf0",
    color: "#1e1b4b",
    fontWeight: 800,
    fontSize: "0.95rem",
    textAlign: "center",
    padding: "0.75rem 1rem",
    letterSpacing: "0.02em",
    borderBottom: "1px solid #d1d5db",
    flexShrink: 0,
  },

  billingBody: {
    flex: 1,
    overflowY: "auto",
    padding: "0.9rem 1.1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.55rem",
  },

  billingFieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },

  billingFieldLabel: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "0.1rem",
  },

  billingSelect: {
    width: "100%",
    padding: "0.55rem 0.85rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#1f2937",
    background: "#fff",
    outline: "none",
    cursor: "pointer",
  },

  addCustRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-0.1rem",
  },

  addCustLink: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: 600,
    fontSize: "0.82rem",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
  },

  customerSelectRow: {
    display: "flex",
    gap: "0.45rem",
    alignItems: "center",
  },

  customerSelect: {
    flex: 1,
    padding: "0.55rem 0.85rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#1f2937",
    background: "#fff",
    outline: "none",
    cursor: "pointer",
  },

  gearBtn: {
    width: 36,
    height: 36,
    background: "#1e3a8a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  custInfoLine: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.55rem 0.75rem",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },

  custInfoName: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#1f2937",
    flex: 1,
  },

  custInfoPhone: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },

  totalsBlock: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },

  totalsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.83rem",
    color: "#6b7280",
  },

  totalsBoldRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "1rem",
    fontWeight: 800,
    color: "#1e1b4b",
    borderTop: "1px dashed #e5e7eb",
    paddingTop: "0.5rem",
    marginTop: "0.1rem",
  },

  inlineEditRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    color: "#2563eb",
  },

  pencilIcon: {
    fontSize: "0.78rem",
    color: "#2563eb",
  },

  inlineDiscInput: {
    width: 64,
    padding: "0.2rem 0.4rem",
    border: "1px solid #93c5fd",
    borderRadius: "5px",
    fontSize: "0.82rem",
    color: "#1d4ed8",
    fontWeight: 600,
    outline: "none",
    background: "#eff6ff",
    textAlign: "right",
  },

  inlineCur: {
    fontSize: "0.8rem",
    color: "#2563eb",
    fontWeight: 600,
  },

  payBtnRow: {
    display: "flex",
    gap: "0.45rem",
    flexWrap: "wrap",
  },

  payBtn: (active) => ({
    flex: "1 1 auto",
    padding: "0.5rem 0.65rem",
    border: active ? "none" : "1.5px solid #d1d5db",
    borderRadius: "8px",
    background: active ? "#1e3a8a" : "#fff",
    color: active ? "#fff" : "#374151",
    fontWeight: active ? 700 : 500,
    fontSize: "0.82rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }),

  paidRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
  },

  paidLabel: {
    fontSize: "0.83rem",
    color: "#6b7280",
    whiteSpace: "nowrap",
  },

  paidInput: {
    width: 120,
    padding: "0.5rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "#1f2937",
    outline: "none",
    textAlign: "right",
    background: "#fff",
  },

  changeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.83rem",
    color: "#374151",
  },

  changeLabel: {
    color: "#374151",
    fontWeight: 500,
  },

  changeVal: {
    fontWeight: 800,
    fontSize: "0.95rem",
    color: "#1f2937",
  },

  commentsArea: {
    width: "100%",
    padding: "0.6rem 0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#374151",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "#fff",
  },

  errorMsg: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    color: "#dc2626",
    fontSize: "0.8rem",
    padding: "0.5rem 0.75rem",
  },

  actionBtns: {
    display: "flex",
    gap: "0.5rem",
    paddingTop: "0.25rem",
    paddingBottom: "0.5rem",
  },

  cancelBtn: {
    flex: 1,
    padding: "0.7rem",
    background: "#fff",
    border: "1.5px solid #fca5a5",
    borderRadius: "10px",
    color: "#ef4444",
    fontWeight: 700,
    fontSize: "0.82rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.3rem",
  },

  holdBtn: {
    flex: 1,
    padding: "0.7rem",
    background: "#fff",
    border: "1.5px solid #fcd34d",
    borderRadius: "10px",
    color: "#d97706",
    fontWeight: 700,
    fontSize: "0.82rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.3rem",
  },

  placeOrderBtn: (disabled) => ({
    flex: 2,
    padding: "0.7rem",
    background: disabled ? "#e5e7eb" : "#1e3a8a",
    color: disabled ? "#9ca3af" : "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "0.88rem",
    cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: "0.2px",
    boxShadow: disabled ? "none" : "0 3px 10px rgba(30,58,138,0.25)",
  }),

  // ── Receipt / success modal ───────────────────────────────────────────────────
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },

  receiptCard: {
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    width: "min(480px, 96vw)",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "2rem",
  },

  receiptHeader: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },

  receiptIcon: {
    fontSize: "3rem",
    marginBottom: "0.5rem",
  },

  receiptTitle: {
    fontWeight: 800,
    fontSize: "1.4rem",
    color: "#111827",
    margin: "0 0 0.3rem",
  },

  receiptBill: {
    fontSize: "0.85rem",
    color: "#6b7280",
  },

  receiptDivider: {
    borderTop: "1px dashed #e5e7eb",
    margin: "1rem 0",
  },

  receiptItemRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    color: "#374151",
    marginBottom: "0.4rem",
  },

  receiptTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 800,
    fontSize: "1.05rem",
    color: "#1e1b4b",
    borderTop: "2px solid #e5e7eb",
    paddingTop: "0.75rem",
    marginTop: "0.5rem",
  },

  receiptChangeRow: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#16a34a",
    marginTop: "0.35rem",
  },

  receiptActions: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },

  newSaleBtn: {
    flex: 1,
    padding: "0.75rem",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
  },

  printBtn: {
    flex: 1,
    padding: "0.75rem",
    background: "#fff",
    color: "#374151",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
  },

  viewOrdersBtn: {
    flex: 1,
    padding: "0.75rem",
    background: "#f0fdf4",
    color: "#15803d",
    border: "1.5px solid #86efac",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
  },
};

export default s;
