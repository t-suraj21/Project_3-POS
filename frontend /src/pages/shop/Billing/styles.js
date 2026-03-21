/* ── Design Tokens ─────────────────────────────────────────────────────────── */
export const C = {
  bg:       "#f1f5f9",
  card:     "#ffffff",
  border:   "#e2e8f0",
  text:     "#0f172a",
  sub:      "#64748b",
  primary:  "#4f46e5",
  green:    "#16a34a",
  red:      "#dc2626",
  amber:    "#d97706",
  orange:   "#ea580c",
  shadow:   "0 2px 12px rgba(15,23,42,.08)",
};

/* ── Payment Mode Definitions ──────────────────────────────────────────────── */
export const PAY_MODES = [
  { key: "cash",   label: "Cash",        icon: "💵", color: "#166534", bg: "#f0fdf4", border: "#86efac" },
  { key: "upi",    label: "UPI",         icon: "📱", color: "#1e40af", bg: "#eff6ff", border: "#93c5fd" },
  { key: "card",   label: "Debit Card",  icon: "💳", color: "#5b21b6", bg: "#faf5ff", border: "#c4b5fd" },
  { key: "credit", label: "Credit",      icon: "📋", color: "#9a3412", bg: "#fff7ed", border: "#fdba74" },
  { key: "online", label: "Online (Razorpay)", icon: "🔒", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
];

/* ── Modal Container ───────────────────────────────────────────────────────── */
export const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "1rem",
  overflowY: "auto",
};

export const modalContent = {
  background: C.card,
  borderRadius: 20,
  padding: "2rem",
  width: "100%",
  maxWidth: "100%",
  boxShadow: "0 20px 60px rgba(15,23,42,.25)",
  position: "relative",
};

export const modalCloseBtn = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  background: "#f1f5f9",
  border: "none",
  borderRadius: "50%",
  width: 40,
  height: 40,
  cursor: "pointer",
  fontSize: "1.2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const modalPrintContent = {
  overflowY: "auto",
  maxHeight: "80vh",
  marginBottom: "2rem",
};

export const modalActionButtons = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "1rem",
  paddingTop: "1.5rem",
  borderTop: `1px solid ${C.border}`,
};

export const modalPrintBtn = {
  padding: "0.75rem 1rem",
  borderRadius: 10,
  border: `2px solid ${C.primary}`,
  background: "#fff",
  color: C.primary,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "0.9rem",
};

export const modalNewSaleBtn = {
  padding: "0.75rem 1rem",
  borderRadius: 10,
  border: "none",
  background: C.primary,
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

export const modalViewOrdersBtn = {
  padding: "0.75rem 1rem",
  borderRadius: 10,
  border: `1.5px solid ${C.border}`,
  background: "white",
  color: C.text,
  fontWeight: 700,
  cursor: "pointer",
};

/* ── Top Navigation Bar ────────────────────────────────────────────────────── */
export const topNav = {
  background: C.card,
  borderBottom: `1px solid ${C.border}`,
  padding: "0.85rem 1.5rem",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  boxShadow: "0 1px 4px rgba(15,23,42,.07)",
};

export const backBtn = (navDisabled) => ({
  background: "#f1f5f9",
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "0.85rem",
  color: C.sub,
  display: "flex",
  alignItems: "center",
  gap: "0.3rem",
  opacity: navDisabled ? 0.6 : 1,
});

export const navTitle = {
  margin: 0,
  fontSize: "1.15rem",
  fontWeight: 900,
  color: C.text,
};

export const navSubtitle = {
  margin: 0,
  fontSize: "0.78rem",
  color: C.sub,
};

export const totalSection = {
  marginLeft: "auto",
  textAlign: "right",
};

export const totalLabel = {
  fontSize: "0.75rem",
  color: C.sub,
  fontWeight: 600,
};

export const totalAmount = {
  fontSize: "1.5rem",
  fontWeight: 900,
  color: C.primary,
};

/* ── Main Body Grid ────────────────────────────────────────────────────────── */
export const bodyGrid = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "1.5rem",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.5rem",
};

export const leftPanel = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

export const rightPanel = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

/* ── Card Base ─────────────────────────────────────────────────────────────── */
export const card = {
  background: C.card,
  borderRadius: 16,
  padding: "1.1rem 1.4rem",
  boxShadow: C.shadow,
};

export const cardWithFlex = {
  ...card,
  flex: 1,
};

export const cardTitle = {
  margin: "0 0 0.75rem",
  fontSize: "0.8rem",
  fontWeight: 800,
  color: C.sub,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

export const largeCardTitle = {
  margin: "0 0 1rem",
  fontSize: "0.8rem",
  fontWeight: 800,
  color: C.sub,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

/* ── Customer Card ─────────────────────────────────────────────────────────── */
export const customerInput = {
  width: "100%",
  padding: "0.45rem 0.7rem",
  borderRadius: 8,
  border: `1.5px solid ${C.border}`,
  background: C.bg,
  color: C.text,
  fontSize: "0.85rem",
  marginBottom: "0.45rem",
  boxSizing: "border-box",
};

export const customerInputLabel = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: C.sub,
  display: "block",
  marginBottom: "0.4rem",
};

export const customerNameInput = {
  ...customerInput,
  fontSize: "0.9rem",
  fontWeight: 700,
};

export const customerPhoneInput = {
  ...customerInput,
  color: C.sub,
  fontSize: "0.85rem",
};

export const customerAddressInput = {
  ...customerInput,
  color: C.sub,
  fontSize: "0.85rem",
};

export const customerSelect = {
  width: "100%",
  padding: "0.5rem 0.7rem",
  borderRadius: 8,
  border: `1.5px solid ${C.border}`,
  background: C.bg,
  color: C.text,
  fontSize: "0.85rem",
  cursor: "pointer",
};

/* ── Items Card ────────────────────────────────────────────────────────────── */
export const itemsContainer = {
  overflowY: "auto",
  maxHeight: 280,
};

export const itemRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.5rem 0",
  borderBottom: "1px solid #f1f5f9",
};

export const itemImage = {
  width: 38,
  height: 38,
  borderRadius: 8,
  objectFit: "cover",
  flexShrink: 0,
};

export const itemPlaceholder = {
  width: 38,
  height: 38,
  borderRadius: 8,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
  flexShrink: 0,
};

export const itemDetails = {
  flex: 1,
  minWidth: 0,
};

export const itemName = {
  fontWeight: 700,
  fontSize: "0.88rem",
  color: C.text,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const itemPrice = {
  fontSize: "0.75rem",
  color: C.sub,
};

export const itemTotal = {
  fontWeight: 800,
  fontSize: "0.9rem",
  color: C.text,
  flexShrink: 0,
};

/* ── Bill Summary Card ─────────────────────────────────────────────────────── */
export const billSummaryRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "0.25rem 0",
  fontSize: "0.85rem",
};

export const billSummaryLabel = {
  color: C.sub,
};

export const billSummaryValue = {
  fontWeight: 600,
};

export const billDivider = {
  height: 1,
  background: C.border,
  margin: "0.6rem 0",
};

export const billTotalRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const billTotalLabel = {
  fontWeight: 800,
  fontSize: "1rem",
  color: C.text,
};

export const billTotalValue = {
  fontWeight: 900,
  fontSize: "1.3rem",
  color: C.primary,
};

/* ── Payment Mode Selection ────────────────────────────────────────────────── */
export const paymentModesGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.65rem",
};

export const paymentModeBtn = (active, mode) => ({
  padding: "0.8rem",
  border: `2px solid ${active ? mode.color : C.border}`,
  borderRadius: 12,
  background: active ? mode.bg : C.card,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.25rem",
  boxShadow: active ? `0 0 0 3px ${mode.color}22` : "none",
});

export const paymentModeIcon = {
  fontSize: "1.4rem",
};

export const paymentModeLabel = (active, mode) => ({
  fontSize: "0.78rem",
  fontWeight: 800,
  color: active ? mode.color : C.sub,
});

/* ── Payment Panel ────────────────────────────────────────────────────────── */
export const paymentCard = {
  background: C.card,
  borderRadius: 16,
  padding: "1.2rem 1.4rem",
  boxShadow: C.shadow,
};

export const paymentTitle = {
  margin: "0 0 0.9rem",
  fontSize: "0.8rem",
  fontWeight: 800,
  color: C.sub,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

/* ── Cash Payment ──────────────────────────────────────────────────────────── */
export const quickAmountSection = {
  marginBottom: "0.9rem",
};

export const quickAmountLabel = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: C.sub,
  marginBottom: "0.5rem",
};

export const quickAmountButtons = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
};

export const quickAmountBtnPrimary = {
  padding: "0.4rem 0.85rem",
  background: C.primary,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "0.8rem",
};

export const quickAmountBtnSecondary = {
  padding: "0.4rem 0.85rem",
  background: "#f1f5f9",
  border: `1.5px solid ${C.border}`,
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "0.8rem",
  color: C.text,
};

export const paidAmountInput = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: `2px solid ${C.border}`,
  borderRadius: 10,
  fontSize: "1.2rem",
  fontWeight: 800,
  color: C.text,
  background: "#f8fafc",
  boxSizing: "border-box",
  outline: "none",
};

export const changeBox = {
  background: "#f0fdf4",
  border: "2px solid #86efac",
  borderRadius: 10,
  padding: "0.65rem 1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.6rem",
};

export const changeLabel = {
  fontWeight: 700,
  color: "#166534",
};

export const changeValue = {
  fontWeight: 900,
  fontSize: "1.2rem",
  color: "#166534",
};

export const balanceDueBox = {
  background: "#fef2f2",
  border: "2px solid #fecaca",
  borderRadius: 10,
  padding: "0.65rem 1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const balanceDueLabel = {
  fontWeight: 700,
  color: C.red,
};

export const balanceDueValue = {
  fontWeight: 900,
  fontSize: "1.2rem",
  color: C.red,
};

export const cashHintText = {
  fontSize: "0.72rem",
  color: C.sub,
  marginTop: "0.5rem",
  background: "#f8fafc",
  borderRadius: 8,
  padding: "0.4rem 0.6rem",
};

/* ── UPI Payment ───────────────────────────────────────────────────────────── */
export const upiApps = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  marginBottom: "0.9rem",
};

export const upiAppBadge = {
  background: "#dcfce7",
  color: "#166534",
  fontSize: "0.72rem",
  fontWeight: 700,
  padding: "0.2rem 0.65rem",
  borderRadius: 999,
  border: "1px solid #86efac",
};

export const upiBox = {
  background: "#f0fdf4",
  border: "2px solid #86efac",
  borderRadius: 10,
  padding: "0.75rem 1rem",
  marginBottom: "0.9rem",
  textAlign: "center",
};

export const upiBoxTitle = {
  fontSize: "0.8rem",
  color: "#166534",
  fontWeight: 700,
};

export const upiBoxAmount = {
  fontSize: "1.5rem",
  fontWeight: 900,
  color: "#166534",
  marginTop: "0.2rem",
};

export const upiInputLabel = {
  fontSize: "0.78rem",
  fontWeight: 700,
  color: C.sub,
  display: "block",
  marginBottom: "0.35rem",
};

export const upiInput = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  border: "2px solid #86efac",
  borderRadius: 10,
  fontSize: "0.95rem",
  boxSizing: "border-box",
  outline: "none",
};

/* ── Card Payment ──────────────────────────────────────────────────────────── */
export const cardTypes = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  marginBottom: "0.9rem",
};

export const cardTypeBadge = {
  background: "#f3e8ff",
  color: "#6b21a8",
  fontSize: "0.72rem",
  fontWeight: 700,
  padding: "0.2rem 0.65rem",
  borderRadius: 999,
  border: "1px solid #d8b4fe",
};

export const cardBox = {
  background: "#faf5ff",
  border: "2px solid #c4b5fd",
  borderRadius: 10,
  padding: "0.75rem 1rem",
  marginBottom: "0.9rem",
  textAlign: "center",
};

export const cardBoxTitle = {
  fontSize: "0.8rem",
  color: "#5b21b6",
  fontWeight: 700,
};

export const cardBoxAmount = {
  fontSize: "1.5rem",
  fontWeight: 900,
  color: "#5b21b6",
  marginTop: "0.2rem",
};

export const cardInput = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  border: "2px solid #d8b4fe",
  borderRadius: 10,
  fontSize: "0.95rem",
  boxSizing: "border-box",
  outline: "none",
};

/* ── Credit Sale ───────────────────────────────────────────────────────────── */
export const creditBox = {
  background: "#fff7ed",
  border: "2px solid #fdba74",
  borderRadius: 10,
  padding: "0.9rem 1rem",
  marginBottom: "0.75rem",
};

export const creditBoxHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.4rem",
};

export const creditBoxLabel = {
  fontWeight: 700,
  color: "#c2410c",
  fontSize: "0.9rem",
};

export const creditBoxAmount = {
  fontWeight: 900,
  fontSize: "1.3rem",
  color: C.red,
};

export const creditBoxText = {
  fontSize: "0.75rem",
  color: "#9a3412",
  lineHeight: 1.5,
};

/* ── Online Payment ────────────────────────────────────────────────────────── */
export const onlineMethods = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem",
  marginBottom: "0.5rem",
};

export const onlineMethodBadge = {
  background: "#dbeafe",
  color: "#1e40af",
  padding: "0.15rem 0.55rem",
  borderRadius: 999,
  fontWeight: 600,
  fontSize: "0.7rem",
};

export const onlineBox = {
  background: "#eff6ff",
  border: "2px solid #93c5fd",
  borderRadius: 10,
  padding: "0.9rem 1rem",
  marginBottom: "0.75rem",
};

export const onlineBoxTitle = {
  fontWeight: 800,
  color: "#1d4ed8",
  marginBottom: "0.5rem",
};

export const onlineBoxText = {
  fontSize: "0.75rem",
  color: C.sub,
};

/* ── Note Card ─────────────────────────────────────────────────────────────── */
export const noteCard = {
  background: C.card,
  borderRadius: 16,
  padding: "1rem 1.4rem",
  boxShadow: C.shadow,
};

export const noteLabel = {
  fontSize: "0.78rem",
  fontWeight: 700,
  color: C.sub,
  display: "block",
  marginBottom: "0.4rem",
};

export const noteTextarea = {
  width: "100%",
  padding: "0.6rem 0.8rem",
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  fontSize: "0.88rem",
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
  color: C.text,
  fontFamily: "inherit",
};

/* ── Error Message ────────────────────────────────────────────────────────── */
export const errorBox = {
  background: "#fef2f2",
  border: "1.5px solid #fecaca",
  borderRadius: 12,
  padding: "0.75rem 1rem",
  color: C.red,
  fontWeight: 700,
  fontSize: "0.88rem",
};

/* ── Confirm Button ────────────────────────────────────────────────────────── */
export const confirmBtn = {
  width: "100%",
  padding: "1rem",
  borderRadius: 14,
  border: "none",
  color: "#fff",
  fontWeight: 900,
  fontSize: "1.05rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
};

export const confirmBtnOnline = (rzProcessing) => ({
  ...confirmBtn,
  background: rzProcessing ? "#9ca3af" : "#1d4ed8",
  cursor: rzProcessing ? "not-allowed" : "pointer",
  boxShadow: "0 4px 15px rgba(29,78,216,.35)",
});

export const confirmBtnCash = (submitting) => ({
  ...confirmBtn,
  background: submitting ? "#9ca3af" : `linear-gradient(135deg, ${C.primary}, #7c3aed)`,
  cursor: submitting ? "not-allowed" : "pointer",
  boxShadow: "0 4px 15px rgba(79,70,229,.35)",
});

/* ── Print Styles ──────────────────────────────────────────────────────────── */
export const printStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Courier New', Courier, monospace;
    background: #fff;
    padding: 0;
    line-height: 1.4;
  }
  
  .receipt-container {
    max-width: 80mm;
    margin: 0 auto;
    padding: 10mm;
    background: white;
    font-size: 12px;
  }
  
  @media print {
    body {
      background: white;
    }
    .receipt-container {
      padding: 0;
      max-width: 100%;
    }
    button, .no-print {
      display: none !important;
    }
  }
  
  .receipt-header {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
  
  .shop-name {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 2px;
  }
  
  .shop-details {
    font-size: 10px;
    color: #333;
    margin-bottom: 4px;
  }
  
  .receipt-details {
    margin-bottom: 8px;
    font-size: 11px;
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }
  
  .items-section {
    border-top: 1px dashed #000;
    border-bottom: 1px dashed #000;
    padding: 6px 0;
    margin: 8px 0;
    font-size: 11px;
  }
  
  .item-header {
    display: grid;
    grid-template-columns: 2fr 0.5fr 1fr 1fr;
    gap: 4px;
    font-weight: bold;
    margin-bottom: 3px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 2px;
  }
  
  .item-row {
    display: grid;
    grid-template-columns: 2fr 0.5fr 1fr 1fr;
    gap: 4px;
    margin-bottom: 2px;
  }
  
  .item-name {
    text-align: left;
    word-break: break-word;
  }
  
  .item-qty {
    text-align: center;
  }
  
  .item-rate {
    text-align: right;
  }
  
  .item-total {
    text-align: right;
    font-weight: 600;
  }
  
  .totals-section {
    margin: 8px 0;
    font-size: 11px;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
  }
  
  .total-row.final {
    border-top: 2px solid #000;
    padding-top: 4px;
    font-weight: bold;
    font-size: 13px;
  }
  
  .payment-summary {
    background: #f9f9f9;
    border: 1px solid #ddd;
    padding: 6px;
    margin: 6px 0;
    font-size: 11px;
  }
  
  .payment-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }
  
  .footer {
    text-align: center;
    border-top: 1px dashed #000;
    margin-top: 8px;
    padding-top: 6px;
    font-size: 10px;
    color: #666;
  }
  
  .status-badge {
    text-align: center;
    margin: 4px 0;
    font-weight: bold;
  }
`;

export default {
  C,
  PAY_MODES,
  modalOverlay,
  modalContent,
  modalCloseBtn,
  modalPrintContent,
  modalActionButtons,
  modalPrintBtn,
  modalNewSaleBtn,
  modalViewOrdersBtn,
  topNav,
  backBtn,
  navTitle,
  navSubtitle,
  totalSection,
  totalLabel,
  totalAmount,
  bodyGrid,
  leftPanel,
  rightPanel,
  card,
  cardWithFlex,
  cardTitle,
  largeCardTitle,
  customerInput,
  customerInputLabel,
  customerNameInput,
  customerPhoneInput,
  customerAddressInput,
  customerSelect,
  itemsContainer,
  itemRow,
  itemImage,
  itemPlaceholder,
  itemDetails,
  itemName,
  itemPrice,
  itemTotal,
  billSummaryRow,
  billSummaryLabel,
  billSummaryValue,
  billDivider,
  billTotalRow,
  billTotalLabel,
  billTotalValue,
  paymentModesGrid,
  paymentModeBtn,
  paymentModeIcon,
  paymentModeLabel,
  paymentCard,
  paymentTitle,
  quickAmountSection,
  quickAmountLabel,
  quickAmountButtons,
  quickAmountBtnPrimary,
  quickAmountBtnSecondary,
  paidAmountInput,
  changeBox,
  changeLabel,
  changeValue,
  balanceDueBox,
  balanceDueLabel,
  balanceDueValue,
  cashHintText,
  upiApps,
  upiAppBadge,
  upiBox,
  upiBoxTitle,
  upiBoxAmount,
  upiInputLabel,
  upiInput,
  cardTypes,
  cardTypeBadge,
  cardBox,
  cardBoxTitle,
  cardBoxAmount,
  cardInput,
  creditBox,
  creditBoxHeader,
  creditBoxLabel,
  creditBoxAmount,
  creditBoxText,
  onlineMethods,
  onlineMethodBadge,
  onlineBox,
  onlineBoxTitle,
  onlineBoxText,
  noteCard,
  noteLabel,
  noteTextarea,
  errorBox,
  confirmBtn,
  confirmBtnOnline,
  confirmBtnCash,
  printStyles,
};
