/**
 * styles.js — Inventory Page Design Tokens & Style Objects
 *
 * All visual styling for the Inventory page lives here so that index.jsx
 * stays focused purely on structure and logic.
 *
 * Naming convention:
 *   T          — design tokens (colors, used everywhere)
 *   S.*        — static style objects (spread directly onto style={})
 *   S.make*()  — factory functions that return styles depending on a prop/state
 */

// ─── Design tokens ────────────────────────────────────────────────────────────
export const T = {
  bg:      "#f0f2f5",
  white:   "#fff",
  border:  "#e2e8f0",
  text:    "#1a202c",
  sub:     "#64748b",
  primary: "#4f46e5",
  green:   "#16a34a",
  amber:   "#d97706",
  red:     "#dc2626",
  blue:    "#2563eb",
  purple:  "#7c3aed",
  greenBg: "#f0fdf4",
  amberBg: "#fffbeb",
  redBg:   "#fef2f2",
};

// ─── Page-level layout ────────────────────────────────────────────────────────
export const S = {

  // Outermost page wrapper
  page: {
    padding: "20px 24px",
    background: T.bg,
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
  },

  // Page title + subtitle block
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: T.text,
  },
  pageSubtitle: {
    margin: "4px 0 0",
    color: T.sub,
    fontSize: 13,
  },

  // KPI summary row
  kpiGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  kpiCardBase: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 13,
    padding: "16px 20px",
    flex: "1 1 150px",
    boxShadow: "0 1px 5px rgba(0,0,0,.04)",
  },
  kpiCardHeader: {
    display: "flex",
    justifyContent: "space-between",
  },
  kpiLabel: {
    margin: 0,
    color: T.sub,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: .6,
  },
  kpiIcon: {
    fontSize: 20,
  },
  kpiValue: {
    margin: "8px 0 0",
    fontSize: 22,
    fontWeight: 800,
    color: T.text,
    letterSpacing: "-0.02em",
  },
  kpiSub: {
    margin: "3px 0 0",
    fontSize: 12,
    color: T.sub,
  },

  // ─── Tab bar ──────────────────────────────────────────────────────
  tabBar: {
    display: "flex",
    gap: 4,
    marginBottom: 0,
    borderBottom: `2px solid ${T.border}`,
    overflowX: "auto",
  },
  tabBadge: {
    background: T.red,
    color: "#fff",
    fontSize: 10,
    fontWeight: 800,
    padding: "1px 6px",
    borderRadius: 20,
    lineHeight: 1.4,
  },

  // ─── White content card ───────────────────────────────────────────
  card: {
    background: T.white,
    borderRadius: 14,
    border: `1px solid ${T.border}`,
    boxShadow: "0 1px 6px rgba(0,0,0,.05)",
    padding: "20px 24px",
  },
  // Card that attaches flush to the bottom of the tab bar
  tabPanel: {
    background: T.white,
    borderRadius: 14,
    border: `1px solid ${T.border}`,
    boxShadow: "0 1px 6px rgba(0,0,0,.05)",
    padding: "20px 24px",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTop: "none",
  },

  // ─── Filters bar (search + dropdowns row) ────────────────────────
  filtersBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
    alignItems: "center",
  },

  // ─── Inputs / selects ─────────────────────────────────────────────
  input: {
    width: "100%",
    padding: "9px 12px",
    fontSize: 14,
    border: `1px solid ${T.border}`,
    borderRadius: 9,
    outline: "none",
    background: T.white,
    color: T.text,
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "9px 12px",
    fontSize: 14,
    border: `1px solid ${T.border}`,
    borderRadius: 9,
    outline: "none",
    background: T.white,
    color: T.text,
    boxSizing: "border-box",
    cursor: "pointer",
  },

  // ─── Table shared ──────────────────────────────────────────────────
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "10px 14px",
    background: "#f8fafc",
    textAlign: "left",
    color: T.sub,
    fontWeight: 700,
    borderBottom: `2px solid ${T.border}`,
    whiteSpace: "nowrap",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: .4,
  },
  td: {
    padding: "10px 14px",
  },
  tdSub: {
    padding: "10px 14px",
    color: T.sub,
  },
  tdNowrap: {
    padding: "10px 14px",
    whiteSpace: "nowrap",
    color: T.sub,
    fontSize: 12,
  },
  tdBold: {
    padding: "10px 14px",
    fontWeight: 700,
  },
  tableCount: {
    margin: "12px 0 0",
    fontSize: 12,
    color: T.sub,
  },

  // ─── Product cell (image + name) ──────────────────────────────────
  productCellInner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  productImg: {
    width: 34,
    height: 34,
    borderRadius: 8,
    objectFit: "cover",
    border: `1px solid ${T.border}`,
  },
  productImgPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "#f1f5f9",
    display: "grid",
    placeItems: "center",
    fontSize: 16,
    border: `1px solid ${T.border}`,
  },
  productName: {
    fontWeight: 600,
    color: T.text,
  },

  // Smaller image variant used in the history tab
  historyImg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    objectFit: "cover",
    border: `1px solid ${T.border}`,
  },
  historyImgPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: "#f1f5f9",
    display: "grid",
    placeItems: "center",
    fontSize: 13,
  },
  historyProductCell: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  historyProductName: {
    margin: 0,
    fontWeight: 600,
    fontSize: 12,
  },
  historyProductSku: {
    margin: 0,
    color: T.sub,
    fontSize: 11,
  },

  // ─── Low-stock warning banner ──────────────────────────────────────
  warningBanner: {
    background: "#fffbeb",
    border: "1px solid #fcd34d",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  warningBannerText: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    color: "#92400e",
  },

  // Restock quick-action button (in the low-stock table)
  restockBtn: {
    background: T.primary,
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },

  // ─── Spinner ───────────────────────────────────────────────────────
  spinnerWrap: {
    textAlign: "center",
    padding: "50px 20px",
    color: T.sub,
  },
  spinnerWheel: {
    width: 36,
    height: 36,
    border: "3px solid #e2e8f0",
    borderTopColor: T.primary,
    borderRadius: "50%",
    animation: "inv-spin 0.7s linear infinite",
    margin: "0 auto 12px",
  },
  spinnerLabel: {
    margin: 0,
    fontSize: 13,
  },

  // ─── Empty state ────────────────────────────────────────────────────
  emptyWrap: {
    textAlign: "center",
    padding: "50px 20px",
    color: T.sub,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyMessage: {
    margin: 0,
    fontWeight: 600,
    fontSize: 14,
  },

  // ─── Input row (label + field group) ──────────────────────────────
  inputRowWrap: {
    marginBottom: 16,
  },
  inputRowLabel: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: T.sub,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: .5,
  },

  // ─── Stock update form ─────────────────────────────────────────────
  updateFormWrap: {
    maxWidth: 600,
  },
  updateFormTitle: {
    margin: "0 0 20px",
    fontSize: 16,
    fontWeight: 800,
    color: T.text,
  },

  // Autocomplete/suggestion dropdown
  suggestionsDropdown: {
    border: `1px solid ${T.border}`,
    borderRadius: 9,
    marginTop: 4,
    background: T.white,
    boxShadow: "0 4px 18px rgba(0,0,0,.1)",
    maxHeight: 220,
    overflowY: "auto",
    zIndex: 10,
    position: "relative",
  },
  suggestionItem: {
    padding: "10px 14px",
    cursor: "pointer",
    borderBottom: `1px solid ${T.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  suggestionName: {
    margin: 0,
    fontWeight: 600,
    fontSize: 13,
  },
  suggestionMeta: {
    margin: "2px 0 0",
    color: T.sub,
    fontSize: 11,
  },

  // Chip that shows the currently selected product
  selectedProductChip: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 9,
    padding: "10px 14px",
    marginBottom: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedProductName: {
    margin: 0,
    fontWeight: 700,
    fontSize: 13,
  },
  selectedProductMeta: {
    margin: "2px 0 0",
    fontSize: 11,
    color: T.sub,
  },
  clearProductBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: T.sub,
    fontSize: 16,
  },

  // Change-type selector grid
  changeTypeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: 8,
  },

  // Quantity preview hint text
  qtyHintAdd: {
    margin: "5px 0 0",
    fontSize: 12.5,
    fontWeight: 600,
    color: T.green,
  },
  qtyHintRemove: {
    margin: "5px 0 0",
    fontSize: 12.5,
    fontWeight: 600,
    color: T.red,
  },

  // Feedback banners
  errorBanner: {
    background: T.redBg,
    border: "1px solid #fca5a5",
    borderRadius: 9,
    padding: "10px 14px",
    marginBottom: 14,
    color: T.red,
    fontWeight: 600,
    fontSize: 13,
  },
  successBanner: {
    background: T.greenBg,
    border: "1px solid #86efac",
    borderRadius: 9,
    padding: "12px 16px",
    marginBottom: 14,
  },
  successBannerTitle: {
    margin: 0,
    fontWeight: 700,
    color: T.green,
  },
  successBannerSub: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#15803d",
  },

  // Stock badge
  stockBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 20,
    whiteSpace: "nowrap",
  },

  // Change-type badge
  changeTypeBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 9px",
    borderRadius: 20,
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  },

  // ─── Dynamic style factories (depend on runtime values) ───────────

  /** Tab button — active/inactive state */
  makeTabBtn: (isActive) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: isActive ? 800 : 600,
    color: isActive ? T.primary : T.sub,
    whiteSpace: "nowrap",
    borderBottom: isActive ? `3px solid ${T.primary}` : "3px solid transparent",
    marginBottom: -2,
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "color 0.15s",
  }),

  /** KPI card top accent border */
  makeKpiCard: (accent) => ({
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: 13,
    borderTop: `3px solid ${accent}`,
    padding: "16px 20px",
    flex: "1 1 150px",
    boxShadow: "0 1px 5px rgba(0,0,0,.04)",
  }),

  /** Change-type button — selected vs idle */
  makeChangeTypeBtn: (isSelected) => ({
    padding: "9px 10px",
    border: `2px solid ${isSelected ? T.primary : T.border}`,
    borderRadius: 9,
    background: isSelected ? "#eff6ff" : T.white,
    color: isSelected ? T.primary : T.text,
    fontWeight: isSelected ? 700 : 500,
    fontSize: 12,
    cursor: "pointer",
    textAlign: "left",
  }),

  /** Quantity input — green border when adding, red when removing */
  makeQtyInput: (qty, baseBorder) => ({
    width: "100%",
    padding: "9px 12px",
    fontSize: 14,
    border: `1px solid ${qty ? (Number(qty) > 0 ? "#86efac" : "#fca5a5") : baseBorder}`,
    borderRadius: 9,
    outline: "none",
    background: "#fff",
    color: T.text,
    boxSizing: "border-box",
  }),

  /** Submit button  — loading / enabled */
  makeSubmitBtn: (isLoading) => ({
    background: isLoading ? "#a5b4fc" : T.primary,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "11px 24px",
    fontSize: 14,
    fontWeight: 700,
    cursor: isLoading ? "not-allowed" : "pointer",
    width: "100%",
  }),

  /** Alternating table row highlight */
  makeTrBg: (index, outOfStock = false) => ({
    background: outOfStock ? "#fff5f5" : (index % 2 === 0 ? "#fff" : "#f8fafc"),
  }),

  /** History quantity change cell — green for additions, red for removals */
  makeQtyChangeTd: {
    padding: "10px 14px",
  },
  makeQtyChangeSpan: (change) => ({
    fontWeight: 800,
    fontSize: 14,
    color: change >= 0 ? T.green : T.red,
  }),

  /** Low-stock current stock emphasis */
  makeLowStockQty: (isOut) => ({
    fontWeight: 800,
    fontSize: 16,
    color: isOut ? T.red : T.amber,
  }),
};

/**
 * Inject the spinner keyframe animation once into the document <head>.
 * Safe to call multiple times — it checks for an existing style block first.
 */
export function injectSpinnerStyle() {
  if (document.getElementById("inv-spinner-style")) return;
  const el = document.createElement("style");
  el.id = "inv-spinner-style";
  el.textContent = `@keyframes inv-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(el);
}
