import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import useBilling from "../../../hooks/useBilling";
import { BillingLayoutRenderer } from "../../../components/BillingLayouts";
import api from "../../../services/api";
import {
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
} from "./styles";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const r  = (n) => parseFloat(n || 0).toFixed(2);
const fmt = (n) => `₹ ${r(n)}`;
const imgSrc = (img) =>
  img ? `/uploads/products/${img.replace("uploads/products/", "")}` : null;

/* ── Receipt Modal ──────────────────────────────────────────────────────────── */
const ReceiptModal = ({ receipt, shop, billingLayout, onNewSale, goToOrders }) => {
  if (!receipt) return null;

  // Transform receipt data to match billing layout component's expected format
  const saleData = {
    ...receipt,
    sale_items: receipt.cart || [],
    bill_number: receipt.bill_number,
    customer_name: receipt.customerName,
    created_at: new Date().toISOString(),
    status: receipt.saleStatus === "paid" ? "completed" : receipt.saleStatus === "credit" ? "pending" : "partial",
    total_amount: receipt.grandTotal,
    paid_amount: receipt.paidAmt,
  };

  const shopData = shop || {};

  // Print functionality
  const handlePrint = () => {
    const printContent = document.getElementById("receipt-print-content");
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    
    const statusColor =
      receipt.saleStatus === "paid" ? "#16a34a" :
      receipt.saleStatus === "credit" ? "#d97706" :
      "#0066cc";
    
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
              ${receipt.saleStatus === "paid" ? "✓ PAID" : receipt.saleStatus === "credit" ? "📋 CREDIT" : "⏳ PENDING"}
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
                <span>${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              ${receipt.customerName ? `<div class="detail-row">
                <span>Customer:</span>
                <span>${receipt.customerName}</span>
              </div>` : ""}
            </div>
            
            <div class="items-section">
              <div class="item-header">
                <span class="item-name">Item</span>
                <span class="item-qty">Qty</span>
                <span class="item-rate">Rate</span>
                <span class="item-total">Total</span>
              </div>
              ${(receipt.cart || []).map(item => `
                <div class="item-row">
                  <span class="item-name">${item.name || "-"}</span>
                  <span class="item-qty">${item.qty || 1}</span>
                  <span class="item-rate">₹${parseFloat(item.sell_price || 0).toFixed(2)}</span>
                  <span class="item-total">₹${parseFloat((item.sell_price || 0) * (item.qty || 1)).toFixed(2)}</span>
                </div>
              `).join("")}
            </div>
            
            <div class="totals-section">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${parseFloat(receipt.subtotal || receipt.grandTotal || 0).toFixed(2)}</span>
              </div>
              ${receipt.discountAmt > 0 ? `
                <div class="total-row">
                  <span>Discount:</span>
                  <span>−₹${parseFloat(receipt.discountAmt || 0).toFixed(2)}</span>
                </div>
              ` : ""}
              ${receipt.taxTotal > 0 ? `
                <div class="total-row">
                  <span>Tax:</span>
                  <span>₹${parseFloat(receipt.taxTotal || 0).toFixed(2)}</span>
                </div>
              ` : ""}
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
              ${receipt.balanceDue > 0 ? `
                <div class="payment-row">
                  <span style="color: #dc2626; font-weight: bold;">Balance Due:</span>
                  <span style="color: #dc2626; font-weight: bold;">₹${parseFloat(receipt.balanceDue || 0).toFixed(2)}</span>
                </div>
              ` : ""}
              ${receipt.change > 0 ? `
                <div class="payment-row">
                  <span>Change:</span>
                  <span>₹${parseFloat(receipt.change || 0).toFixed(2)}</span>
                </div>
              ` : ""}
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

  return (
    <div style={modalOverlay}>
      <div style={modalContent} onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onNewSale} style={modalCloseBtn}>
          ✕
        </button>

        {/* Billing Layout Renderer */}
        <div id="receipt-print-content" style={modalPrintContent}>
          <BillingLayoutRenderer sale={saleData} shop={shopData} layoutCode={billingLayout || "classic"} />
        </div>

        {/* Action buttons */}
        <div style={modalActionButtons}>
          <button onClick={handlePrint} style={modalPrintBtn}>
            🖨️ Print Receipt
          </button>
          <button onClick={onNewSale} style={modalNewSaleBtn}>
            ➕ New Sale
          </button>
          <button onClick={goToOrders} style={modalViewOrdersBtn}>
            📊 View Orders
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Billing Page ─────────────────────────────────────────────────────── */
export default function Billing() {
  const { id: shopId } = useParams();
  const [shop, setShop] = useState(null);

  useEffect(() => {
    api.get("/api/settings")
      .then(res => setShop(res.data?.shop || {}))
      .catch(err => console.error("Failed to load shop settings:", err));
  }, []);

  const {
    // order data
    cart, counterNumber,
    customers, selectedCustomerId, handleCustomerSelect,
    activeCustomer, setActiveCustomer,
    subtotal, productDiscount, couponDiscountAmt, extraDiscountAmt,
    discountAmt, taxTotal, grandTotal,
    paymentMode, handlePaymentModeChange,
    paidAmount, setPaidAmount, setFullPaid, setRoundedUp,
    upiRef, setUpiRef,
    cardRef, setCardRef,
    note, setNote,
    paid, change, balanceDue,
    submitting, checkoutErr, handleCheckout, handleOnlineCheckout, rzProcessing,
    receipt, setReceipt,
    goBackToCart, startNewSale, goToOrders,
  } = useBilling();

  const navDisabled = submitting || rzProcessing;
  const activeMode  = PAY_MODES.find(m => m.key === paymentMode);

  const totalItems = (cart || []).reduce((s, i) => s + i.qty, 0);
  const imgBase    = "/uploads/products/";

  /* ── quick cash amounts ──────────────────────────────────────── */
  const quickAmounts = [50, 100, 200, 500, 1000, 2000].filter(a => a <= grandTotal + 100);
  const roundedPaid = Math.ceil(grandTotal / 50) * 50;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, sans-serif" }}>

      {/* ── Top nav bar ──────────────────────────────────────────── */}
      <div style={topNav}>
        <button
          onClick={goBackToCart}
          disabled={navDisabled}
          style={backBtn(navDisabled)}
        >
          ← Back to Cart
        </button>
        <div>
          <h1 style={navTitle}>
            💳 Billing &amp; Payment
          </h1>
          <p style={navSubtitle}>
            Counter {counterNumber} &nbsp;·&nbsp; {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={totalSection}>
          <div style={totalLabel}>TOTAL DUE</div>
          <div style={totalAmount}>{fmt(grandTotal)}</div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div style={bodyGrid}>

        {/* ════════════════════════════════════════════════════════
             LEFT — Order Summary
        ════════════════════════════════════════════════════════ */}
        <div style={leftPanel}>

          {/* Customer card */}
          <div style={card}>
            <h3 style={cardTitle}>
              👤 Customer
            </h3>

            {/* Returning customer dropdown — Always visible */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={customerInputLabel}>
                Existing Customer <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={handleCustomerSelect}
                style={customerSelect}
              >
                <option value="">
                  {customers.length === 0 ? "— No saved customers yet —" : "— Select a customer —"}
                </option>
                {customers.map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}{c.phone ? ` · ${c.phone}` : ""} {c.remaining_balance ? `(₹${parseFloat(c.remaining_balance).toFixed(2)})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Editable name */}
            <input
              type="text"
              placeholder="Customer name"
              value={activeCustomer.name}
              onChange={e => setActiveCustomer(prev => ({ ...prev, name: e.target.value }))}
              style={customerNameInput}
            />

            {/* Editable phone */}
            <input
              type="text"
              placeholder="Phone (optional)"
              value={activeCustomer.phone}
              onChange={e => setActiveCustomer(prev => ({ ...prev, phone: e.target.value }))}
              style={customerPhoneInput}
            />

            {/* Editable address */}
            <input
              type="text"
              placeholder="Address (optional)"
              value={activeCustomer.address}
              onChange={e => setActiveCustomer(prev => ({ ...prev, address: e.target.value }))}
              style={customerAddressInput}
            />
          </div>

          {/* Items card */}
          <div style={cardWithFlex}>
            <h3 style={cardTitle}>
              🛒 Order Items ({totalItems})
            </h3>
            <div style={itemsContainer}>
              {(cart || []).map((item, i) => {
                const src = item.image ? `${imgBase}${item.image.replace("uploads/products/", "")}` : null;
                return (
                  <div key={i} style={itemRow}>
                    {src
                      ? <img src={src} alt={item.name} style={itemImage} onError={e => { e.target.style.display = "none"; }} />
                      : <div style={itemPlaceholder}>🖼️</div>
                    }
                    <div style={itemDetails}>
                      <div style={itemName}>{item.name}</div>
                      <div style={itemPrice}>{fmt(item.sell_price)} × {item.qty}</div>
                    </div>
                    <span style={itemTotal}>
                      {fmt(item.sell_price * item.qty)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals card */}
          <div style={card}>
            <h3 style={cardTitle}>
              🧾 Bill Summary
            </h3>
            {[
              { label: "Subtotal",         value: subtotal,       color: C.sub },
              discountAmt > 0 && { label: "Discount",    value: -discountAmt,  color: C.green, prefix: "−" },
              taxTotal > 0    && { label: "Tax",          value: taxTotal,      color: C.sub },
            ].filter(Boolean).map(({ label, value, color, prefix = "" }, i) => (
              <div key={i} style={billSummaryRow}>
                <span style={billSummaryLabel}>{label}</span>
                <span style={{ ...billSummaryValue, color }}>{prefix}{fmt(Math.abs(value))}</span>
              </div>
            ))}
            <div style={billDivider} />
            <div style={billTotalRow}>
              <span style={billTotalLabel}>Total</span>
              <span style={billTotalValue}>{fmt(grandTotal)}</span>
            </div>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════
             RIGHT — Payment Section
        ════════════════════════════════════════════════════════ */}
        <div style={rightPanel}>

          {/* Payment mode selection */}
          <div style={paymentCard}>
            <h3 style={largeCardTitle}>
              Select Payment Method
            </h3>
            <div style={paymentModesGrid}>
              {PAY_MODES.map(m => {
                const active = paymentMode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => handlePaymentModeChange(m.key)}
                    disabled={navDisabled}
                    style={paymentModeBtn(active, m)}
                  >
                    <span style={paymentModeIcon}>{m.icon}</span>
                    <span style={paymentModeLabel(active, m)}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode-specific panel */}
          <div style={paymentCard}>

            {/* CASH */}
            {paymentMode === "cash" && (
              <>
                <h3 style={paymentTitle}>
                  💵 Cash Payment
                </h3>

                {/* Quick amount buttons */}
                <div style={quickAmountSection}>
                  <div style={quickAmountLabel}>Quick Amount</div>
                  <div style={quickAmountButtons}>
                    <button
                      onClick={setFullPaid}
                      style={quickAmountBtnPrimary}
                    >
                      ₹{r(grandTotal)} (Exact)
                    </button>
                    {roundedPaid > grandTotal && (
                      <button
                        onClick={setRoundedUp}
                        style={quickAmountBtnSecondary}
                      >
                        ₹{roundedPaid} (Round)
                      </button>
                    )}
                    {quickAmounts.map(a => (
                      <button key={a} onClick={() => setPaidAmount(String(a))}
                        style={quickAmountBtnSecondary}>
                        ₹{a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom paid amount */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={upiInputLabel}>
                    Amount Received from Customer
                  </label>
                  <input
                    type="number" min="0" step="0.01"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    placeholder={`${r(grandTotal)}`}
                    style={paidAmountInput}
                    autoFocus
                  />
                </div>

                {/* Change */}
                {change > 0 && (
                  <div style={changeBox}>
                    <span style={changeLabel}>💰 Change to Return</span>
                    <span style={changeValue}>{fmt(change)}</span>
                  </div>
                )}

                {/* Balance due */}
                {balanceDue > 0 && paid > 0 && (
                  <div style={balanceDueBox}>
                    <span style={balanceDueLabel}>⏳ Balance Due (Pending)</span>
                    <span style={balanceDueValue}>{fmt(balanceDue)}</span>
                  </div>
                )}

                <div style={cashHintText}>
                  💡 You can collect less than the total. The remaining amount will be tracked as a pending balance in Accounts &amp; Orders.
                </div>
              </>
            )}

            {/* UPI */}
            {paymentMode === "upi" && (
              <>
                <h3 style={paymentTitle}>
                  📱 UPI Payment
                </h3>
                <div style={upiApps}>
                  {["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"].map(app => (
                    <span key={app} style={upiAppBadge}>{app}</span>
                  ))}
                </div>
                <div style={upiBox}>
                  <div style={upiBoxTitle}>Full amount will be collected</div>
                  <div style={upiBoxAmount}>{fmt(grandTotal)}</div>
                </div>
                <label style={upiInputLabel}>
                  UTR / Transaction Reference <span style={{ fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text" placeholder="e.g. 123456789012"
                  value={upiRef} onChange={e => setUpiRef(e.target.value)}
                  style={upiInput}
                />
              </>
            )}

            {/* CARD (Debit / Credit) */}
            {paymentMode === "card" && (
              <>
                <h3 style={paymentTitle}>
                  💳 Card Payment
                </h3>
                <div style={cardTypes}>
                  {["Visa", "Mastercard", "RuPay", "Amex", "Debit Card", "Credit Card"].map(t => (
                    <span key={t} style={cardTypeBadge}>{t}</span>
                  ))}
                </div>
                <div style={cardBox}>
                  <div style={cardBoxTitle}>Full amount collected via POS terminal</div>
                  <div style={cardBoxAmount}>{fmt(grandTotal)}</div>
                </div>
                <label style={upiInputLabel}>
                  Transaction Ref / Last 4 Digits <span style={{ fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text" placeholder="e.g. TXNREF123 or last 4 digits"
                  value={cardRef} onChange={e => setCardRef(e.target.value)}
                  style={cardInput}
                />
              </>
            )}

            {/* CREDIT */}
            {paymentMode === "credit" && (
              <>
                <h3 style={paymentTitle}>
                  📋 Credit Sale
                </h3>
                <div style={creditBox}>
                  <div style={creditBoxHeader}>
                    <span style={creditBoxLabel}>Amount to be Credited</span>
                    <span style={creditBoxAmount}>{fmt(grandTotal)}</span>
                  </div>
                  <div style={creditBoxText}>
                    ⚠ No cash will be collected now. The full balance of <strong>{fmt(grandTotal)}</strong> will be
                    tracked in <strong>Orders → Pending</strong> and <strong>Accounts</strong>.
                  </div>
                </div>
              </>
            )}

            {/* ONLINE / Razorpay */}
            {paymentMode === "online" && (
              <>
                <h3 style={paymentTitle}>
                  🔒 Online Payment — Razorpay
                </h3>
                <div style={onlineBox}>
                  <div style={onlineBoxTitle}>Secure Checkout</div>
                  <div style={onlineMethods}>
                    {["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "Credit Card", "Debit Card", "Net Banking"].map(m => (
                      <span key={m} style={onlineMethodBadge}>{m}</span>
                    ))}
                  </div>
                  <div style={onlineBoxText}>
                    Payment verified automatically before the sale is confirmed.
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Note / Comments */}
          <div style={noteCard}>
            <label style={noteLabel}>
              📝 Order Note (Optional)
            </label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add a note about this order…"
              rows={2}
              style={noteTextarea}
            />
          </div>

          {/* Error */}
          {checkoutErr && (
            <div style={errorBox}>
              ⛔ {checkoutErr}
            </div>
          )}

          {/* Confirm button */}
          <div>
            {paymentMode === "online" ? (
              <button
                onClick={handleOnlineCheckout}
                disabled={rzProcessing}
                style={confirmBtnOnline(rzProcessing)}
              >
                {rzProcessing ? (
                  <>Processing…</>
                ) : (
                  <>🔒 Pay {fmt(grandTotal)} via Razorpay</>
                )}
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={submitting}
                style={confirmBtnCash(submitting)}
              >
                {submitting ? (
                  <>Processing…</>
                ) : (
                  <>
                    {activeMode?.icon} Confirm {activeMode?.label} Payment — {
                      paymentMode === "credit" ? "Credit ₹" + r(grandTotal) :
                      paymentMode === "upi" || paymentMode === "card" ? fmt(grandTotal) :
                      paidAmount ? fmt(parseFloat(paidAmount)) : fmt(grandTotal)
                    }
                  </>
                )}
              </button>
            )}
          </div>

        </div>{/* /right panel */}
      </div>

      {/* Receipt modal */}
      {receipt && (
        <ReceiptModal
          receipt={receipt}
          shop={shop}
          billingLayout={shop?.billing_layout}
          onNewSale={startNewSale}
          goToOrders={goToOrders}
        />
      )}

    </div>
  );
}
