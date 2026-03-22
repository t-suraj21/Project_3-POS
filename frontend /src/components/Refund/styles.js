/**
 * RefundModal Styles
 * All styling for the refund modal component
 */

export const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

export const contentStyle = {
  background: "white",
  borderRadius: "16px",
  maxWidth: "600px",
  width: "90%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};

export const headerStyle = {
  padding: "20px",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f8fafc",
};

export const headerTitleStyle = {
  margin: 0,
  fontSize: "1.25rem",
  color: "#1f2937",
};

export const closeButtonStyle = {
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  cursor: "pointer",
  color: "#94a3b8",
};

export const bodyStyle = {
  padding: "20px",
};

export const sectionStyle = {
  marginBottom: "20px",
  padding: "15px",
  background: "#f8fafc",
  borderRadius: "10px",
};

export const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  marginBottom: "8px",
  display: "block",
};

export const buttonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  fontSize: "0.875rem",
  fontWeight: "600",
  cursor: "pointer",
};

export const getRefundTypeButton = (isActive) => ({
  ...buttonStyle,
  background: isActive ? "#3b82f6" : "#e2e8f0",
  color: isActive ? "white" : "#64748b",
  flex: 1,
});

export const getRefundModeButton = (isActive) => ({
  ...buttonStyle,
  padding: "8px 12px",
  background: isActive ? "#d97706" : "#e2e8f0",
  color: isActive ? "white" : "#64748b",
  marginRight: "8px",
  marginBottom: "8px",
});

export const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

export const summaryAmountStyle = {
  fontSize: "1.25rem",
  fontWeight: "700",
  color: "#1f2937",
};

export const summaryAmountRefundedStyle = {
  ...summaryAmountStyle,
  color: "#dc2626",
};

export const summaryAmountRefundableStyle = {
  ...summaryAmountStyle,
  color: "#16a34a",
};

export const customerNameStyle = {
  fontSize: "0.95rem",
  color: "#1f2937",
  fontWeight: "600",
};

export const errorStyle = {
  padding: "12px",
  background: "#fee2e2",
  border: "1px solid #fca5a5",
  borderRadius: "8px",
  color: "#dc2626",
  marginBottom: "16px",
  fontSize: "0.875rem",
};

export const itemCheckboxStyle = {
  marginRight: "10px",
  cursor: "pointer",
};

export const itemRowStyle = {
  display: "flex",
  alignItems: "center",
  padding: "10px",
  borderBottom: "1px solid #e2e8f0",
  background: "white",
  borderRadius: "6px",
  marginBottom: "8px",
};

export const itemNameStyle = {
  fontWeight: "600",
  color: "#1f2937",
};

export const itemDetailsStyle = {
  fontSize: "0.85rem",
  color: "#64748b",
};

export const itemQtyInputStyle = {
  width: "50px",
  padding: "6px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  marginLeft: "10px",
};

export const textareaStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  boxSizing: "border-box",
  minHeight: "80px",
  resize: "vertical",
};

export const refundHistoryItemStyle = {
  padding: "10px",
  background: "white",
  borderLeft: "4px solid #16a34a",
  marginBottom: "8px",
  borderRadius: "6px",
};

export const refundHistoryHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "4px",
};

export const refundHistoryAmountStyle = {
  fontWeight: "600",
  color: "#1f2937",
};

export const refundHistoryMetaStyle = {
  fontSize: "0.8rem",
  color: "#64748b",
};

export const refundHistoryReasonStyle = {
  fontSize: "0.8rem",
  color: "#64748b",
};

export const buttonContainerStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};

export const cancelButtonStyle = {
  ...buttonStyle,
  flex: 1,
  background: "#e2e8f0",
  color: "#1f2937",
};

export const getProcessButtonStyle = (processing) => ({
  ...buttonStyle,
  flex: 1,
  background: processing ? "#94a3b8" : "#dc2626",
  color: "white",
  cursor: processing ? "not-allowed" : "pointer",
});

export const refundTypeContainerStyle = {
  display: "flex",
  gap: "10px",
};

export const refundModeContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
};
