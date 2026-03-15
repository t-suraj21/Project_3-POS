import useRefund from "../../../hooks/useRefund";

/**
 * RefundModal Component
 *
 * Modal for processing refunds (full or partial) for a sale.
 * Shows:
 * - Refund type selection (full/partial)
 * - Item selection for partial refunds
 * - Refund reason
 * - Refund method (cash/upi/card/credit)
 * - Refund history
 */

const RefundModal = ({ sale, isOpen, onClose, onRefundComplete }) => {
  const {
    refundType,
    selectedItems,
    reason,
    refundMode,
    processing,
    error,
    saleRefunds,
    setRefundType,
    setReason,
    setRefundMode,
    processRefund,
    toggleItemSelection,
    updateItemRefundQty,
    fetchSaleRefunds,
    formatRefund,
  } = useRefund();

  if (!isOpen || !sale) return null;

  const hasRefunds = saleRefunds && saleRefunds.length > 0;
  const totalRefunded = saleRefunds?.reduce((sum, r) => sum + parseFloat(r.refund_amount || 0), 0) || 0;
  const remainingRefundable = (parseFloat(sale.total_amount || 0) - totalRefunded).toFixed(2);

  const handleRefund = async () => {
    const result = await processRefund(sale.id);
    if (result) {
      await fetchSaleRefunds(sale.id);
      onRefundComplete?.(result);
    }
  };

  const modalStyle = {
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

  const contentStyle = {
    background: "white",
    borderRadius: "16px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  };

  const headerStyle = {
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
  };

  const bodyStyle = {
    padding: "20px",
  };

  const sectionStyle = {
    marginBottom: "20px",
    padding: "15px",
    background: "#f8fafc",
    borderRadius: "10px",
  };

  const labelStyle = {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block",
  };

  const buttonStyle = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
  };

  const refundType1Btn = {
    ...buttonStyle,
    background: refundType === "full" ? "#3b82f6" : "#e2e8f0",
    color: refundType === "full" ? "white" : "#64748b",
    flex: 1,
    marginRight: "8px",
  };

  const refundType2Btn = {
    ...buttonStyle,
    background: refundType === "partial" ? "#3b82f6" : "#e2e8f0",
    color: refundType === "partial" ? "white" : "#64748b",
    flex: 1,
  };

  const refundModeBtn = (mode) => ({
    ...buttonStyle,
    padding: "8px 12px",
    background: refundMode === mode ? "#d97706" : "#e2e8f0",
    color: refundMode === mode ? "white" : "#64748b",
    marginRight: "8px",
    marginBottom: "8px",
  });

  const itemCheckboxStyle = {
    marginRight: "10px",
    cursor: "pointer",
  };

  const itemRowStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #e2e8f0",
    background: "white",
    borderRadius: "6px",
    marginBottom: "8px",
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1f2937" }}>
            🔙 Refund Bill {sale.bill_number}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {/* Sale Summary */}
          <div style={sectionStyle}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <span style={labelStyle}>Original Total</span>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#1f2937" }}>
                  ₹{parseFloat(sale.total_amount || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={labelStyle}>Already Refunded</span>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#dc2626" }}>
                  ₹{totalRefunded.toFixed(2)}
                </div>
              </div>
              <div>
                <span style={labelStyle}>Refundable Remaining</span>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#16a34a" }}>
                  ₹{remainingRefundable}
                </div>
              </div>
              <div>
                <span style={labelStyle}>Customer</span>
                <div style={{ fontSize: "0.95rem", color: "#1f2937", fontWeight: "600" }}>
                  {sale.customer_name} {sale.customer_phone ? `(${sale.customer_phone})` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "12px",
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                color: "#dc2626",
                marginBottom: "16px",
                fontSize: "0.875rem",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Refund Type Selection */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Refund Type</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={refundType1Btn}
                onClick={() => setRefundType("full")}
                disabled={processing}
              >
                💯 Full Refund
              </button>
              <button
                style={refundType2Btn}
                onClick={() => setRefundType("partial")}
                disabled={processing || !sale.items?.length}
              >
                📋 Partial Refund
              </button>
            </div>
          </div>

          {/* Items Selection for Partial Refund */}
          {refundType === "partial" && sale.items && (
            <div style={sectionStyle}>
              <label style={labelStyle}>Select Items to Refund</label>
              {sale.items.map((item) => (
                <div key={item.id} style={itemRowStyle}>
                  <input
                    type="checkbox"
                    style={itemCheckboxStyle}
                    checked={selectedItems.some((i) => i.id === item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    disabled={processing}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", color: "#1f2937" }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      Qty: {item.quantity} × ₹{parseFloat(item.sell_price || 0).toFixed(2)}
                    </div>
                  </div>
                  {selectedItems.find((i) => i.id === item.id) && (
                    <input
                      type="number"
                      min="1"
                      max={item.quantity}
                      value={selectedItems.find((i) => i.id === item.id)?.refund_qty || item.quantity}
                      onChange={(e) => updateItemRefundQty(item.id, e.target.value)}
                      disabled={processing}
                      style={{
                        width: "50px",
                        padding: "6px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        marginLeft: "10px",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Refund Method */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Refund Method</label>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {["cash", "upi", "card", "credit"].map((mode) => (
                <button
                  key={mode}
                  style={refundModeBtn(mode)}
                  onClick={() => setRefundMode(mode)}
                  disabled={processing}
                >
                  {mode === "cash" && "💵"}
                  {mode === "upi" && "📱"}
                  {mode === "card" && "💳"}
                  {mode === "credit" && "📝"}
                  {" " + mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Reason for Refund (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Item defective, Customer changed mind..."
              disabled={processing}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontFamily: "inherit",
                boxSizing: "border-box",
                minHeight: "80px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Refund History */}
          {hasRefunds && (
            <div style={sectionStyle}>
              <label style={labelStyle}>Refund History</label>
              {saleRefunds.map((refund) => (
                <div
                  key={refund.id}
                  style={{
                    padding: "10px",
                    background: "white",
                    borderLeft: "4px solid #16a34a",
                    marginBottom: "8px",
                    borderRadius: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "600", color: "#1f2937" }}>
                      ₹{formatRefund(refund).refund_amount}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {refund.refund_mode?.toUpperCase()} • {formatRefund(refund).date}
                    </span>
                  </div>
                  {refund.reason && (
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      Reason: {refund.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              onClick={onClose}
              disabled={processing}
              style={{
                ...buttonStyle,
                flex: 1,
                background: "#e2e8f0",
                color: "#1f2937",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleRefund}
              disabled={processing}
              style={{
                ...buttonStyle,
                flex: 1,
                background: processing ? "#94a3b8" : "#dc2626",
                color: "white",
                cursor: processing ? "not-allowed" : "pointer",
              }}
            >
              {processing ? "Processing..." : "🔙 Process Refund"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
