import useRefund from "../../hooks/useRefund";
import * as S from "./styles";

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

  return (
    <div style={S.modalStyle} onClick={onClose}>
      <div style={S.contentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={S.headerStyle}>
          <h2 style={S.headerTitleStyle}>
            🔙 Refund Bill {sale.bill_number}
          </h2>
          <button onClick={onClose} style={S.closeButtonStyle}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={S.bodyStyle}>
          {/* Sale Summary */}
          <div style={S.sectionStyle}>
            <div style={S.summaryGridStyle}>
              <div>
                <span style={S.labelStyle}>Original Total</span>
                <div style={S.summaryAmountStyle}>
                  ₹{parseFloat(sale.total_amount || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={S.labelStyle}>Already Refunded</span>
                <div style={S.summaryAmountRefundedStyle}>
                  ₹{totalRefunded.toFixed(2)}
                </div>
              </div>
              <div>
                <span style={S.labelStyle}>Refundable Remaining</span>
                <div style={S.summaryAmountRefundableStyle}>
                  ₹{remainingRefundable}
                </div>
              </div>
              <div>
                <span style={S.labelStyle}>Customer</span>
                <div style={S.customerNameStyle}>
                  {sale.customer_name} {sale.customer_phone ? `(${sale.customer_phone})` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={S.errorStyle}>
              ⚠️ {error}
            </div>
          )}

          {/* Refund Type Selection */}
          <div style={S.sectionStyle}>
            <label style={S.labelStyle}>Refund Type</label>
            <div style={S.refundTypeContainerStyle}>
              <button
                style={S.getRefundTypeButton(refundType === "full")}
                onClick={() => setRefundType("full")}
                disabled={processing}
              >
                💯 Full Refund
              </button>
              <button
                style={S.getRefundTypeButton(refundType === "partial")}
                onClick={() => setRefundType("partial")}
                disabled={processing || !sale.items?.length}
              >
                📋 Partial Refund
              </button>
            </div>
          </div>

          {/* Items Selection for Partial Refund */}
          {refundType === "partial" && sale.items && (
            <div style={S.sectionStyle}>
              <label style={S.labelStyle}>Select Items to Refund</label>
              {sale.items.map((item) => (
                <div key={item.id} style={S.itemRowStyle}>
                  <input
                    type="checkbox"
                    style={S.itemCheckboxStyle}
                    checked={selectedItems.some((i) => i.id === item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    disabled={processing}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={S.itemNameStyle}>
                      {item.product_name}
                    </div>
                    <div style={S.itemDetailsStyle}>
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
                      style={S.itemQtyInputStyle}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Refund Method */}
          <div style={S.sectionStyle}>
            <label style={S.labelStyle}>Refund Method</label>
            <div style={S.refundModeContainerStyle}>
              {["cash", "upi", "card", "credit"].map((mode) => (
                <button
                  key={mode}
                  style={S.getRefundModeButton(refundMode === mode)}
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
          <div style={S.sectionStyle}>
            <label style={S.labelStyle}>Reason for Refund (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Item defective, Customer changed mind..."
              disabled={processing}
              style={S.textareaStyle}
            />
          </div>

          {/* Refund History */}
          {hasRefunds && (
            <div style={S.sectionStyle}>
              <label style={S.labelStyle}>Refund History</label>
              {saleRefunds.map((refund) => (
                <div key={refund.id} style={S.refundHistoryItemStyle}>
                  <div style={S.refundHistoryHeaderStyle}>
                    <span style={S.refundHistoryAmountStyle}>
                      ₹{formatRefund(refund).refund_amount}
                    </span>
                    <span style={S.refundHistoryMetaStyle}>
                      {refund.refund_mode?.toUpperCase()} • {formatRefund(refund).date}
                    </span>
                  </div>
                  {refund.reason && (
                    <div style={S.refundHistoryReasonStyle}>
                      Reason: {refund.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div style={S.buttonContainerStyle}>
            <button
              onClick={onClose}
              disabled={processing}
              style={S.cancelButtonStyle}
            >
              Cancel
            </button>
            <button
              onClick={handleRefund}
              disabled={processing}
              style={S.getProcessButtonStyle(processing)}
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
