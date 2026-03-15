import { useNavigate } from "react-router-dom";
import useBilling from "../../../hooks/useBilling";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const r  = (n) => parseFloat(n || 0).toFixed(2);
const fmt = (n) => `₹ ${r(n)}`;
const imgSrc = (img) =>
  img ? `/uploads/products/${img.replace("uploads/products/", "")}` : null;

/* ── design tokens ─────────────────────────────────────────────────────────── */
const C = {
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

/* ── Payment mode definitions ──────────────────────────────────────────────── */
const PAY_MODES = [
  { key: "cash",   label: "Cash",        icon: "💵", color: "#166534", bg: "#f0fdf4", border: "#86efac" },
  { key: "upi",    label: "UPI",         icon: "📱", color: "#1e40af", bg: "#eff6ff", border: "#93c5fd" },
  { key: "card",   label: "Debit Card",  icon: "💳", color: "#5b21b6", bg: "#faf5ff", border: "#c4b5fd" },
  { key: "credit", label: "Credit",      icon: "📋", color: "#9a3412", bg: "#fff7ed", border: "#fdba74" },
  { key: "online", label: "Online (Razorpay)", icon: "🔒", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
];

/* ── Receipt Modal ──────────────────────────────────────────────────────────── */
const ReceiptModal = ({ receipt, shopId, onNewSale, goToOrders }) => {
  if (!receipt) return null;

  const statusColor =
    receipt.saleStatus === "paid"   ? C.green  :
    receipt.saleStatus === "credit" ? C.orange :
    C.amber;

  const statusLabel =
    receipt.saleStatus === "paid"    ? "✅ PAID" :
    receipt.saleStatus === "credit"  ? "📋 CREDIT — UNPAID" :
    "⏳ PARTIAL PAYMENT";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem",
    }}>
      <div style={{
        background: C.card, borderRadius: 20, padding: "2rem", width: "100%", maxWidth: 460,
        boxShadow: "0 20px 60px rgba(15,23,42,.25)", overflowY: "auto", maxHeight: "90vh",
      }}
        onClick={e => e.stopPropagation()}
      >
        {/* Sale status header */}
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.4rem" }}>
            {receipt.saleStatus === "paid" ? "✅" : receipt.saleStatus === "credit" ? "📋" : "⏳"}
          </div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 900, color: statusColor }}>
            {receipt.saleStatus === "paid" ? "Payment Complete!" :
             receipt.saleStatus === "credit" ? "Credit Sale Recorded!" : "Partial Payment Done!"}
          </h2>
          <p style={{ margin: "0.3rem 0 0", color: C.sub, fontSize: "0.85rem" }}>
            Bill No: <strong style={{ color: C.text }}>{receipt.bill_number}</strong>
          </p>
          <p style={{ margin: "0.15rem 0 0", color: C.sub, fontSize: "0.78rem" }}>
            {new Date().toLocaleString("en-IN")}
          </p>
        </div>

        {/* Customer info */}
        {receipt.customerName && (
          <div style={{
            background: "#f0f4ff", border: "1px solid #c7d7f9", borderRadius: 10,
            padding: "0.65rem 0.9rem", marginBottom: "1rem", fontSize: "0.82rem", color: "#1e3a8a",
            display: "flex", flexDirection: "column", gap: "0.2rem",
          }}>
            <div>👤 <strong>{receipt.customerName}</strong></div>
            {receipt.customerPhone   && <div>📞 {receipt.customerPhone}</div>}
            {receipt.customerAddress && <div>📍 {receipt.customerAddress}</div>}
          </div>
        )}

        {/* Items */}
        <div style={{ marginBottom: "0.75rem" }}>
          {receipt.cart.map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", padding: "0.35rem 0",
              borderBottom: "1px dashed #e2e8f0", fontSize: "0.82rem",
            }}>
              <span>{item.name} × {item.qty}</span>
              <span style={{ fontWeight: 700 }}>{fmt(item.sell_price * item.qty)}</span>
            </div>
          ))}
        </div>

        {/* Totals block */}
        <div style={{
          background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
          padding: "0.75rem 0.9rem", marginBottom: "1rem", fontSize: "0.82rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={{ color: C.sub }}>Total</span>
            <span style={{ fontWeight: 700 }}>{fmt(receipt.grandTotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={{ color: C.green }}>Paid</span>
            <span style={{ fontWeight: 700, color: C.green }}>{fmt(receipt.paidAmt)}</span>
          </div>
          {receipt.balanceDue > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ color: C.red }}>Balance Due</span>
              <span style={{ fontWeight: 800, color: C.red }}>{fmt(receipt.balanceDue)}</span>
            </div>
          )}
          {receipt.paymentMode === "cash" && receipt.change > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.sub }}>Change</span>
              <span style={{ fontWeight: 700 }}>{fmt(receipt.change)}</span>
            </div>
          )}
        </div>

        {/* Razorpay ID */}
        {receipt.paymentMode === "online" && receipt.paymentId && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8,
            padding: "0.45rem 0.8rem", fontSize: "0.78rem", color: "#166534",
            textAlign: "center", marginBottom: "0.75rem",
          }}>
            💳 Razorpay ID: <strong>{receipt.paymentId}</strong>
          </div>
        )}

        {/* Status badge */}
        <div style={{ textAlign: "center", marginBottom: "0.75rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ padding: "0.3rem 1rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 800, background: statusColor + "22", color: statusColor }}>
            {statusLabel}
          </span>
          <span style={{ padding: "0.3rem 0.9rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, background: "#f1f5f9", color: C.sub }}>
            {receipt.paymentMode.toUpperCase()}
          </span>
        </div>

        {receipt.balanceDue > 0 && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
            padding: "0.5rem 0.8rem", fontSize: "0.78rem", color: "#991b1b",
            textAlign: "center", marginBottom: "0.75rem",
          }}>
            ⚠ {fmt(receipt.balanceDue)} pending — visible in Orders → Pending &amp; Accounts
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            onClick={() => window.print()}
            style={{ flex: 1, padding: "0.65rem", background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
          >
            🖨️ Print
          </button>
          <button
            onClick={goToOrders}
            style={{ flex: 1, padding: "0.65rem", background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
          >
            📋 Orders
          </button>
          <button
            onClick={onNewSale}
            style={{ flex: 1, padding: "0.65rem", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
          >
            + New Sale
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Billing Page ─────────────────────────────────────────────────────── */
export default function Billing() {
  const {
    // order data
    cart, counterNumber,
    // customer
    customers, selectedCustomerId, handleCustomerSelect,
    activeCustomer, setActiveCustomer,
    subtotal, productDiscount, couponDiscountAmt, extraDiscountAmt,
    discountAmt, taxTotal, grandTotal,
    // payment
    paymentMode, handlePaymentModeChange,
    paidAmount, setPaidAmount, setFullPaid, setRoundedUp,
    upiRef, setUpiRef,
    cardRef, setCardRef,
    note, setNote,
    // derived
    paid, change, balanceDue,
    // checkout
    submitting, checkoutErr, handleCheckout, handleOnlineCheckout, rzProcessing,
    // receipt
    receipt, setReceipt,
    // nav
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
      <div style={{
        background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem",
        boxShadow: "0 1px 4px rgba(15,23,42,.07)",
      }}>
        <button
          onClick={goBackToCart}
          disabled={navDisabled}
          style={{
            background: "#f1f5f9", border: `1.5px solid ${C.border}`, borderRadius: 10,
            padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem",
            color: C.sub, display: "flex", alignItems: "center", gap: "0.3rem",
            opacity: navDisabled ? .6 : 1,
          }}
        >
          ← Back to Cart
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 900, color: C.text }}>
            💳 Billing &amp; Payment
          </h1>
          <p style={{ margin: 0, fontSize: "0.78rem", color: C.sub }}>
            Counter {counterNumber} &nbsp;·&nbsp; {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: "0.75rem", color: C.sub, fontWeight: 600 }}>TOTAL DUE</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: C.primary }}>{fmt(grandTotal)}</div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "1.5rem",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem",
      }}>

        {/* ════════════════════════════════════════════════════════
             LEFT — Order Summary
        ════════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Customer card */}
          <div style={{ background: C.card, borderRadius: 16, padding: "1.1rem 1.4rem", boxShadow: C.shadow }}>
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
              👤 Customer
            </h3>

            {/* Returning customer dropdown — Always visible */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: C.sub, display: "block", marginBottom: "0.4rem" }}>
                Existing Customer <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={handleCustomerSelect}
                style={{
                  width: "100%", padding: "0.5rem 0.7rem", borderRadius: 8,
                  border: `1.5px solid ${C.border}`, background: C.bg, color: C.text,
                  fontSize: "0.85rem", cursor: "pointer",
                }}
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
              style={{
                width: "100%", padding: "0.45rem 0.7rem", borderRadius: 8,
                border: `1.5px solid ${C.border}`, background: C.bg, color: C.text,
                fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.45rem", boxSizing: "border-box",
              }}
            />

            {/* Editable phone */}
            <input
              type="text"
              placeholder="Phone (optional)"
              value={activeCustomer.phone}
              onChange={e => setActiveCustomer(prev => ({ ...prev, phone: e.target.value }))}
              style={{
                width: "100%", padding: "0.45rem 0.7rem", borderRadius: 8,
                border: `1.5px solid ${C.border}`, background: C.bg, color: C.sub,
                fontSize: "0.85rem", marginBottom: "0.45rem", boxSizing: "border-box",
              }}
            />

            {/* Editable address */}
            <input
              type="text"
              placeholder="Address (optional)"
              value={activeCustomer.address}
              onChange={e => setActiveCustomer(prev => ({ ...prev, address: e.target.value }))}
              style={{
                width: "100%", padding: "0.45rem 0.7rem", borderRadius: 8,
                border: `1.5px solid ${C.border}`, background: C.bg, color: C.sub,
                fontSize: "0.85rem", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Items card */}
          <div style={{ background: C.card, borderRadius: 16, padding: "1.1rem 1.4rem", boxShadow: C.shadow, flex: 1 }}>
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
              🛒 Order Items ({totalItems})
            </h3>
            <div style={{ overflowY: "auto", maxHeight: 280 }}>
              {(cart || []).map((item, i) => {
                const src = item.image ? `${imgBase}${item.image.replace("uploads/products/", "")}` : null;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9",
                  }}>
                    {src
                      ? <img src={src} alt={item.name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} onError={e => { e.target.style.display = "none"; }} />
                      : <div style={{ width: 38, height: 38, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🖼️</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                      <div style={{ fontSize: "0.75rem", color: C.sub }}>{fmt(item.sell_price)} × {item.qty}</div>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: C.text, flexShrink: 0 }}>
                      {fmt(item.sell_price * item.qty)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals card */}
          <div style={{ background: C.card, borderRadius: 16, padding: "1.1rem 1.4rem", boxShadow: C.shadow }}>
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
              🧾 Bill Summary
            </h3>
            {[
              { label: "Subtotal",         value: subtotal,       color: C.sub },
              discountAmt > 0 && { label: "Discount",    value: -discountAmt,  color: C.green, prefix: "−" },
              taxTotal > 0    && { label: "Tax",          value: taxTotal,      color: C.sub },
            ].filter(Boolean).map(({ label, value, color, prefix = "" }, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", fontSize: "0.85rem" }}>
                <span style={{ color: C.sub }}>{label}</span>
                <span style={{ fontWeight: 600, color }}>{prefix}{fmt(Math.abs(value))}</span>
              </div>
            ))}
            <div style={{ height: 1, background: C.border, margin: "0.6rem 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 800, fontSize: "1rem", color: C.text }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: "1.3rem", color: C.primary }}>{fmt(grandTotal)}</span>
            </div>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════
             RIGHT — Payment Section
        ════════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Payment mode selection */}
          <div style={{ background: C.card, borderRadius: 16, padding: "1.2rem 1.4rem", boxShadow: C.shadow }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.8rem", fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Select Payment Method
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
              {PAY_MODES.map(m => {
                const active = paymentMode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => handlePaymentModeChange(m.key)}
                    disabled={navDisabled}
                    style={{
                      padding: "0.8rem", border: `2px solid ${active ? m.color : C.border}`,
                      borderRadius: 12, background: active ? m.bg : C.card,
                      cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
                      boxShadow: active ? `0 0 0 3px ${m.color}22` : "none",
                    }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>{m.icon}</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: active ? m.color : C.sub }}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode-specific panel */}
          <div style={{ background: C.card, borderRadius: 16, padding: "1.2rem 1.4rem", boxShadow: C.shadow }}>

            {/* CASH */}
            {paymentMode === "cash" && (
              <>
                <h3 style={{ margin: "0 0 0.9rem", fontSize: "0.8rem", fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  💵 Cash Payment
                </h3>

                {/* Quick amount buttons */}
                <div style={{ marginBottom: "0.9rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: C.sub, marginBottom: "0.5rem" }}>Quick Amount</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    <button
                      onClick={setFullPaid}
                      style={{ padding: "0.4rem 0.85rem", background: C.primary, color: "#fff", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      ₹{r(grandTotal)} (Exact)
                    </button>
                    {roundedPaid > grandTotal && (
                      <button
                        onClick={setRoundedUp}
                        style={{ padding: "0.4rem 0.85rem", background: "#f1f5f9", border: `1.5px solid ${C.border}`, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", color: C.text }}
                      >
                        ₹{roundedPaid} (Round)
                      </button>
                    )}
                    {quickAmounts.map(a => (
                      <button key={a} onClick={() => setPaidAmount(String(a))}
                        style={{ padding: "0.4rem 0.85rem", background: "#f1f5f9", border: `1.5px solid ${C.border}`, borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", color: C.text }}>
                        ₹{a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom paid amount */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: C.sub, display: "block", marginBottom: "0.35rem" }}>
                    Amount Received from Customer
                  </label>
                  <input
                    type="number" min="0" step="0.01"
                    value={paidAmount}
                    onChange={e => setPaidAmount(e.target.value)}
                    placeholder={`${r(grandTotal)}`}
                    style={{
                      width: "100%", padding: "0.75rem 1rem", border: `2px solid ${C.border}`,
                      borderRadius: 10, fontSize: "1.2rem", fontWeight: 800, color: C.text,
                      background: "#f8fafc", boxSizing: "border-box", outline: "none",
                    }}
                    autoFocus
                  />
                </div>

                {/* Change */}
                {change > 0 && (
                  <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 10, padding: "0.65rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                    <span style={{ fontWeight: 700, color: "#166534" }}>💰 Change to Return</span>
                    <span style={{ fontWeight: 900, fontSize: "1.2rem", color: "#166534" }}>{fmt(change)}</span>
                  </div>
                )}

                {/* Balance due */}
                {balanceDue > 0 && paid > 0 && (
                  <div style={{ background: "#fef2f2", border: "2px solid #fecaca", borderRadius: 10, padding: "0.65rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: C.red }}>⏳ Balance Due (Pending)</span>
                    <span style={{ fontWeight: 900, fontSize: "1.2rem", color: C.red }}>{fmt(balanceDue)}</span>
                  </div>
                )}

                <div style={{ fontSize: "0.72rem", color: C.sub, marginTop: "0.5rem", background: "#f8fafc", borderRadius: 8, padding: "0.4rem 0.6rem" }}>
                  💡 You can collect less than the total. The remaining amount will be tracked as a pending balance in Accounts &amp; Orders.
                </div>
              </>
            )}

            {/* UPI */}
            {paymentMode === "upi" && (
              <>
                <h3 style={{ margin: "0 0 0.9rem", fontSize: "0.8rem", fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  📱 UPI Payment
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.9rem" }}>
                  {["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"].map(app => (
                    <span key={app} style={{ background: "#dcfce7", color: "#166534", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.65rem", borderRadius: 999, border: "1px solid #86efac" }}>{app}</span>
                  ))}
                </div>
                <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "0.9rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 700 }}>Full amount will be collected</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#166534", marginTop: "0.2rem" }}>{fmt(grandTotal)}</div>
                </div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: C.sub, display: "block", marginBottom: "0.35rem" }}>
                  UTR / Transaction Reference <span style={{ fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text" placeholder="e.g. 123456789012"
                  value={upiRef} onChange={e => setUpiRef(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.9rem", border: `2px solid #86efac`, borderRadius: 10, fontSize: "0.95rem", boxSizing: "border-box", outline: "none" }}
                />
              </>
            )}

            {/* CARD (Debit / Credit) */}
            {paymentMode === "card" && (
              <>
                <h3 style={{ margin: "0 0 0.9rem", fontSize: "0.8rem", fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  💳 Card Payment
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.9rem" }}>
                  {["Visa", "Mastercard", "RuPay", "Amex", "Debit Card", "Credit Card"].map(t => (
                    <span key={t} style={{ background: "#f3e8ff", color: "#6b21a8", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.65rem", borderRadius: 999, border: "1px solid #d8b4fe" }}>{t}</span>
                  ))}
                </div>
                <div style={{ background: "#faf5ff", border: "2px solid #c4b5fd", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "0.9rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.8rem", color: "#5b21b6", fontWeight: 700 }}>Full amount collected via POS terminal</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#5b21b6", marginTop: "0.2rem" }}>{fmt(grandTotal)}</div>
                </div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: C.sub, display: "block", marginBottom: "0.35rem" }}>
                  Transaction Ref / Last 4 Digits <span style={{ fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="text" placeholder="e.g. TXNREF123 or last 4 digits"
                  value={cardRef} onChange={e => setCardRef(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.9rem", border: `2px solid #d8b4fe`, borderRadius: 10, fontSize: "0.95rem", boxSizing: "border-box", outline: "none" }}
                />
              </>
            )}

            {/* CREDIT */}
            {paymentMode === "credit" && (
              <>
                <h3 style={{ margin: "0 0 0.9rem", fontSize: "0.8rem", fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  📋 Credit Sale
                </h3>
                <div style={{ background: "#fff7ed", border: "2px solid #fdba74", borderRadius: 10, padding: "0.9rem 1rem", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontWeight: 700, color: "#c2410c", fontSize: "0.9rem" }}>Amount to be Credited</span>
                    <span style={{ fontWeight: 900, fontSize: "1.3rem", color: C.red }}>{fmt(grandTotal)}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9a3412", lineHeight: 1.5 }}>
                    ⚠ No cash will be collected now. The full balance of <strong>{fmt(grandTotal)}</strong> will be
                    tracked in <strong>Orders → Pending</strong> and <strong>Accounts</strong>.
                  </div>
                </div>
              </>
            )}

            {/* ONLINE / Razorpay */}
            {paymentMode === "online" && (
              <>
                <h3 style={{ margin: "0 0 0.9rem", fontSize: "0.8rem", fontWeight: 800, color: C.sub, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  🔒 Online Payment — Razorpay
                </h3>
                <div style={{ background: "#eff6ff", border: "2px solid #93c5fd", borderRadius: 10, padding: "0.9rem 1rem", marginBottom: "0.75rem" }}>
                  <div style={{ fontWeight: 800, color: "#1d4ed8", marginBottom: "0.5rem" }}>Secure Checkout</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.5rem" }}>
                    {["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "Credit Card", "Debit Card", "Net Banking"].map(m => (
                      <span key={m} style={{ background: "#dbeafe", color: "#1e40af", padding: "0.15rem 0.55rem", borderRadius: 999, fontWeight: 600, fontSize: "0.7rem" }}>{m}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: C.sub }}>
                    Payment verified automatically before the sale is confirmed.
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Note / Comments */}
          <div style={{ background: C.card, borderRadius: 16, padding: "1rem 1.4rem", boxShadow: C.shadow }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: C.sub, display: "block", marginBottom: "0.4rem" }}>
              📝 Order Note (Optional)
            </label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="Add a note about this order…"
              rows={2}
              style={{
                width: "100%", padding: "0.6rem 0.8rem", border: `1.5px solid ${C.border}`,
                borderRadius: 10, fontSize: "0.88rem", resize: "vertical",
                outline: "none", boxSizing: "border-box", color: C.text, fontFamily: "inherit",
              }}
            />
          </div>

          {/* Error */}
          {checkoutErr && (
            <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12, padding: "0.75rem 1rem", color: C.red, fontWeight: 700, fontSize: "0.88rem" }}>
              ⛔ {checkoutErr}
            </div>
          )}

          {/* Confirm button */}
          <div>
            {paymentMode === "online" ? (
              <button
                onClick={handleOnlineCheckout}
                disabled={rzProcessing}
                style={{
                  width: "100%", padding: "1rem", borderRadius: 14, border: "none",
                  background: rzProcessing ? "#9ca3af" : "#1d4ed8",
                  color: "#fff", fontWeight: 900, fontSize: "1.05rem", cursor: rzProcessing ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 15px rgba(29,78,216,.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}
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
                style={{
                  width: "100%", padding: "1rem", borderRadius: 14, border: "none",
                  background: submitting ? "#9ca3af" : `linear-gradient(135deg, ${C.primary}, #7c3aed)`,
                  color: "#fff", fontWeight: 900, fontSize: "1.05rem", cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 15px rgba(79,70,229,.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}
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
          shopId={null}
          onNewSale={startNewSale}
          goToOrders={goToOrders}
        />
      )}

    </div>
  );
}
