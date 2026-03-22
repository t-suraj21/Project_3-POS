import { printStyles } from "../pages/shop/Billing/styles";

/**
 * usePrintReceipt
 * Handles receipt printing functionality with proper formatting
 * 
 * Returns:
 * - handlePrint: Function to print receipt
 */
export const usePrintReceipt = () => {
  const handlePrint = (receipt, shopData) => {
    if (!receipt) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");

    const statusColor =
      receipt.saleStatus === "paid"
        ? "#16a34a"
        : receipt.saleStatus === "credit"
        ? "#d97706"
        : "#0066cc";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Receipt - ${receipt.bill_number || "Bill"}</title>
          <style>
            ${printStyles}
            .status-badge {
              color: ${statusColor};
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              <div class="shop-name">${shopData?.name || "Receipt"}</div>
              <div class="shop-details">${shopData?.address || ""}</div>
              <div class="shop-details">${shopData?.phone || ""}</div>
            </div>
            
            <div class="status-badge">
              ${
                receipt.saleStatus === "paid"
                  ? "✓ PAID"
                  : receipt.saleStatus === "credit"
                  ? "📋 CREDIT"
                  : "⏳ PENDING"
              }
            </div>
            
            <div class="receipt-details">
              <div class="detail-row">
                <span>Bill #:</span>
                <span>${receipt.bill_number || "-"}</span>
              </div>
              <div class="detail-row">
                <span>Date:</span>
                <span>${new Date().toLocaleDateString("en-IN")}</span>
              </div>
              <div class="detail-row">
                <span>Time:</span>
                <span>${new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
              </div>
              ${
                receipt.customerName
                  ? `<div class="detail-row">
                <span>Customer:</span>
                <span>${receipt.customerName}</span>
              </div>`
                  : ""
              }
            </div>
            
            <div class="items-section">
              <div class="item-header">
                <span class="item-name">Item</span>
                <span class="item-qty">Qty</span>
                <span class="item-rate">Rate</span>
                <span class="item-total">Total</span>
              </div>
              ${(receipt.cart || [])
                .map(
                  (item) => `
                <div class="item-row">
                  <span class="item-name">${item.name || "-"}</span>
                  <span class="item-qty">${item.qty || 1}</span>
                  <span class="item-rate">₹${parseFloat(
                    item.sell_price || 0
                  ).toFixed(2)}</span>
                  <span class="item-total">₹${parseFloat(
                    (item.sell_price || 0) * (item.qty || 1)
                  ).toFixed(2)}</span>
                </div>
              `
                )
                .join("")}
            </div>
            
            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${parseFloat(
                  receipt.subtotal || receipt.grandTotal || 0
                ).toFixed(2)}</span>
              </div>
              ${
                receipt.discountAmt > 0
                  ? `
                <div class="total-row">
                  <span>Discount:</span>
                  <span>−₹${parseFloat(receipt.discountAmt || 0).toFixed(
                    2
                  )}</span>
                </div>
              `
                  : ""
              }
              ${
                receipt.taxTotal > 0
                  ? `
                <div class="total-row">
                  <span>GST:</span>
                  <span>₹${parseFloat(receipt.taxTotal || 0).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              <div class="total-row final">
                <span>Total:</span>
                <span>₹${parseFloat(receipt.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
            
            <div class="payment-summary">
              <div class="payment-row">
                <span>Paid:</span>
                <span>₹${parseFloat(receipt.paidAmt || 0).toFixed(2)}</span>
              </div>
              ${
                receipt.balanceDue > 0
                  ? `
                <div class="payment-row">
                  <span style="color: #dc2626; font-weight: bold;">Balance Due:</span>
                  <span style="color: #dc2626; font-weight: bold;">₹${parseFloat(
                    receipt.balanceDue || 0
                  ).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
              ${
                receipt.change > 0
                  ? `
                <div class="payment-row">
                  <span>Change:</span>
                  <span>₹${parseFloat(receipt.change || 0).toFixed(2)}</span>
                </div>
              `
                  : ""
              }
            </div>
            
            <div class="footer">
              <p>Thank you for your purchase!</p>
              <p>Please keep this receipt for your records</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return { handlePrint };
};

export default usePrintReceipt;
