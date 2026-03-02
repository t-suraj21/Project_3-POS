import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSales from "../../../hooks/useSales";
import s from "./styles";

/* ── tiny format helpers ────────────────────────────────────────────── */
const fmt   = (n) => `₹ ${parseFloat(n || 0).toFixed(2)}`;
const imgSrc = (img) => img ? `/uploads/products/${img.replace("uploads/products/", "")}` : null;

/* ── payment mode config ─────────────────────────────────────────────── */
const PAY_MODES = [
  { key: "cash",   label: "Cash"       },
  { key: "upi",    label: "UPI"        },
  { key: "card",   label: "Card"       },
  { key: "credit", label: "Credit"     },
  { key: "online", label: "🔒 Online"  },  // Razorpay gateway
];

/* ── dollar-style formatter for billing section ───────────────── */
const fmt2 = (n) => `${parseFloat(n || 0).toFixed(2)} ₹`;

/* ─────────────────────────────────────────────────────────────────────────────
   Product Card
────────────────────────────────────────────────────────────────────────────── */
const ProductCard = ({ product, onAdd }) => {
  const [hovered, setHovered] = useState(false);
  const outOfStock = parseInt(product.stock, 10) === 0;
  const src        = imgSrc(product.image);
  const showOld    = parseFloat(product.cost_price) > 0 &&
                     parseFloat(product.cost_price) !== parseFloat(product.sell_price);

  return (
    <div
      style={{
        ...s.productCard(outOfStock),
        ...(hovered && !outOfStock ? s.productCardHover : {}),
      }}
      onClick={() => !outOfStock && onAdd(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={outOfStock ? "Out of stock" : `Add ${product.name} to cart`}
    >
      {/* Image */}
      <div style={s.productImgWrap}>
        {src
          ? <img src={src} alt={product.name} style={s.productImg} onError={e => { e.target.style.display = "none"; }} />
          : <span style={s.productImgPlaceholder}>🖼️</span>
        }
      </div>

      {/* Info */}
      <div style={s.productInfo}>
        <div style={s.productName} title={product.name}>{product.name}</div>

        {product.unit && <div style={s.productUnit}>{product.unit}</div>}

        {showOld && (
          <div style={s.productCostStrike}>{fmt(product.cost_price)}</div>
        )}

        <div style={s.productPrice}>{fmt(product.sell_price)}</div>

        {outOfStock
          ? <span style={s.outOfStockBadge}>Out of Stock</span>
          : <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>Stock: {product.stock}</span>
        }
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Receipt Modal
────────────────────────────────────────────────────────────────────────────── */
const ReceiptModal = ({ receipt, shopId, onNewSale }) => {
  const navigate = useNavigate();
  if (!receipt) return null;

  const handleViewOrders = () => {
    onNewSale();
    navigate(`/shop/${shopId}/orders`);
  };

  return (
    <div style={s.overlay} onClick={onNewSale}>
      <div style={s.receiptCard} onClick={e => e.stopPropagation()}>
        <div style={s.receiptHeader}>
          <div style={s.receiptIcon}>
            {receipt.saleStatus === "paid" ? "✅" : receipt.saleStatus === "credit" ? "📋" : "⏳"}
          </div>
          <h2 style={s.receiptTitle}>
            {receipt.saleStatus === "paid" ? "Sale Complete!" : receipt.saleStatus === "credit" ? "Credit Sale!" : "Partial Payment!"}
          </h2>
          <p style={s.receiptBill}>Bill No: <strong>{receipt.bill_number}</strong></p>
        </div>

        <div style={{ fontSize: "0.8rem", color: "#6b7280", textAlign: "center", marginBottom: "0.75rem" }}>
          {new Date().toLocaleString()}
        </div>

        {/* Customer info block */}
        {receipt.customerName && (
          <div style={{
            background: "#f0f4ff",
            border: "1px solid #c7d7f9",
            borderRadius: "8px",
            padding: "0.55rem 0.8rem",
            marginBottom: "0.75rem",
            fontSize: "0.8rem",
            color: "#1e3a8a",
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
          }}>
            <div>👤 <strong>{receipt.customerName}</strong></div>
            {receipt.customerPhone && <div>📞 {receipt.customerPhone}</div>}
            {receipt.customerAddress && <div>📍 {receipt.customerAddress}</div>}
          </div>
        )}

        {/* Items */}
        <div>
          {receipt.cart.map((item, i) => (
            <div key={i} style={s.receiptItemRow}>
              <span>{item.name} × {item.qty}</span>
              <span style={{ fontWeight: 600 }}>{fmt(item.sell_price * item.qty)}</span>
            </div>
          ))}
        </div>

        <div style={s.receiptDivider} />

        <div style={s.receiptTotalRow}>
          <span>Total</span>
          <span>{fmt(receipt.grandTotal)}</span>
        </div>

        <div style={{ ...s.receiptTotalRow, fontWeight: 500, color: "#16a34a" }}>
          <span>Paid</span>
          <span>{fmt(receipt.paidAmt)}</span>
        </div>

        {receipt.balanceDue > 0 && (
          <div style={{ ...s.receiptTotalRow, fontWeight: 700, color: "#dc2626" }}>
            <span>Balance Due</span>
            <span>{fmt(receipt.balanceDue)}</span>
          </div>
        )}

        {receipt.paymentMode === "cash" && receipt.change > 0 && (
          <div style={s.receiptChangeRow}>
            <span>Change</span>
            <span>{fmt(receipt.change)}</span>
          </div>
        )}

        {receipt.paymentMode === "online" && receipt.paymentId && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: "7px", padding: "0.45rem 0.8rem",
            fontSize: "0.78rem", color: "#166534", textAlign: "center",
            marginBottom: "0.5rem",
          }}>
            💳 Razorpay ID: <strong>{receipt.paymentId}</strong>
          </div>
        )}

        {/* Status + payment mode badges */}
        <div style={{ marginTop: "0.75rem", textAlign: "center", display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{
            display: "inline-block",
            padding: "0.25rem 0.85rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: 700,
            background: receipt.saleStatus === "paid" ? "#f0fdf4" : "#fef2f2",
            color:      receipt.saleStatus === "paid" ? "#16a34a" : "#dc2626",
          }}>
            {receipt.saleStatus === "paid" ? "✓ PAID" : receipt.saleStatus === "credit" ? "CREDIT — UNPAID" : "⏳ PARTIAL — PENDING"}
          </span>
          <span style={{
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: "#f4f7fb",
            color:      "#6b7280",
          }}>
            {receipt.paymentMode.toUpperCase()}
          </span>
        </div>

        {receipt.balanceDue > 0 && (
          <div style={{
            marginTop: "0.6rem",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "7px",
            padding: "0.45rem 0.8rem",
            fontSize: "0.78rem",
            color: "#991b1b",
            textAlign: "center",
          }}>
            ⚠ {fmt(receipt.balanceDue)} pending — visible in Orders → Pending &amp; Accounts page
          </div>
        )}

        <div style={s.receiptActions}>
          <button style={s.printBtn} onClick={() => window.print()}>🖨️ Print</button>
          <button style={s.viewOrdersBtn} onClick={handleViewOrders}>📋 View Orders</button>
          <button style={s.newSaleBtn} onClick={onNewSale}>+ New Sale</button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main Sales Page
────────────────────────────────────────────────────────────────────────────── */
const Sales = () => {
  const {
    shopId,
    products, categories, loading,
    search, setSearch,
    categoryId, setCategoryId,
    cart, addToCart, removeFromCart, updateQty, setQtyDirect, clearCart,
    customers, selectedCustomerId, setSelectedCustomerId,
    counterNumber, setCounterNumber,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    customerAddress, setCustomerAddress,
    couponDiscount, setCouponDiscount,
    extraDiscount, setExtraDiscount,
    paymentMode, setPaymentMode,
    paidAmount, setPaidAmount,
    note, setNote,
    upiRef, setUpiRef,
    cardRef, setCardRef,
    subtotal, productDiscount, taxTotal, grandTotal, change,
    submitting, checkoutErr, handleCheckout,
    handleOnlineCheckout, rzProcessing,
    handlePaymentModeChange,
    receipt, setReceipt,
  } = useSales();

  // Auto-fill typed fields when a returning customer is selected from dropdown
  const handleDropdownSelect = (e) => {
    const val = e.target.value;
    setSelectedCustomerId(val);
    if (val) {
      const c = customers.find(cs => String(cs.id) === val);
      if (c) {
        setCustomerName(c.name    || "");
        setCustomerPhone(c.phone  || "");
        setCustomerAddress(c.address || "");
      }
    } else {
      setCustomerName(""); setCustomerPhone(""); setCustomerAddress("");
    }
  };

  const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);

  return (
    <>
      <div style={s.page}>

        {/* ════════════════════════════════════════════════════════════
            LEFT — Product Panel
        ════════════════════════════════════════════════════════════ */}
        <div style={s.leftPanel}>

          {/* Top bar */}
          <div style={s.topBar}>
            <div style={s.topBarLeft}>
              <span style={s.topTitle}>🛒 Search or Scan</span>
              <span style={s.topSub}>{loading ? "Loading…" : `${products.length} products`}</span>
            </div>
            <Link to={`/shop/${shopId}/add-product`} style={s.addNewLink}>
              Product isn't in the List? &nbsp;<strong>Add New +</strong>
            </Link>
          </div>

          {/* Search + filter row */}
          <div style={s.searchRow}>
            <div style={s.searchBox}>
              <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                style={s.searchInput}
                type="text"
                placeholder="Search product name or scan barcode"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <select
              style={s.filterSelect}
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.parent_name ? `↳ ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product grid */}
          <div style={s.productGrid}>
            {loading ? (
              <div style={s.centerMsg}>⏳ Loading products…</div>
            ) : products.length === 0 ? (
              <div style={s.centerMsg}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔍</div>
                No products found.
              </div>
            ) : products.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            RIGHT — Cart Panel
        ════════════════════════════════════════════════════════════ */}
        <div style={s.rightPanel}>

          {/* Cart header */}
          <div style={s.cartHeader}>
            <span style={s.cartTitle}>Current Order</span>
            <span style={s.cartCount}>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
            {cart.length > 0 && (
              <button style={s.clearBtn} onClick={clearCart}>Clear</button>
            )}
          </div>

          {/* Cart body */}
          <div style={s.cartBody}>
            {cart.length === 0 ? (
              <div style={s.emptyCart}>
                <div style={s.emptyCartIcon}>🛒</div>
                <div style={s.emptyCartText}>Cart is empty</div>
                <div style={s.emptyCartSub}>Click a product<br />to add it here</div>
              </div>
            ) : cart.map(item => {
              const src = imgSrc(item.image);
              return (
                <div key={item.id} style={s.cartItem}>
                  {/* Thumbnail */}
                  {src
                    ? <img src={src} alt={item.name} style={s.cartItemImg}
                           onError={e => { e.target.style.display = "none"; }} />
                    : <div style={s.cartItemImgPlaceholder}>🖼️</div>
                  }

                  {/* Info + qty */}
                  <div style={s.cartItemInfo}>
                    <div style={s.cartItemName}>{item.name}</div>
                    {item.unit && <div style={s.cartItemUnit}>{item.unit}</div>}
                    <div style={s.cartItemPrice}>{fmt(item.sell_price)} each</div>

                    <div style={s.qtyRow}>
                      <button style={s.qtyBtn} onClick={() => updateQty(item.id, -1)}>−</button>
                      <input
                        style={s.qtyInput}
                        type="number"
                        min={1}
                        max={item.stock}
                        value={item.qty}
                        onChange={e => setQtyDirect(item.id, e.target.value)}
                      />
                      <button style={s.qtyBtn} onClick={() => updateQty(item.id, +1)}>+</button>
                    </div>
                  </div>

                  {/* Row total + remove */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
                    <span style={s.cartItemTotal}>{fmt(item.sell_price * item.qty)}</span>
                    <button style={s.removeBtn} onClick={() => removeFromCart(item.id)} title="Remove">✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ══ BILLING SECTION ══════════════════════════════════ */}
          <div style={s.billingSection}>

            {/* Header */}
            <div style={s.billingHeader}>Billing Section</div>

            <div style={s.billingBody}>

              {/* Counter Number */}
              <div style={s.billingFieldWrap}>
                <div style={s.billingFieldLabel}>Counter Number</div>
                <select style={s.billingSelect} value={counterNumber} onChange={e => setCounterNumber(e.target.value)}>
                  <option value="01">01 (Counter A)</option>
                  <option value="02">02 (Counter B)</option>
                  <option value="03">03 (Counter C)</option>
                </select>
              </div>

              {/* ══ Customer Details — REQUIRED ══════════════════ */}
              <div style={{
                background: "#f8faff",
                border: "1.5px solid #c7d7f9",
                borderRadius: "10px",
                padding: "0.85rem 0.9rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginBottom: "0.4rem",
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1a56db", marginBottom: "0.1rem" }}>
                  👤 Customer Details
                  <span style={{ color: "#dc2626", marginLeft: "0.2rem" }}>*</span>
                  <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: "0.4rem", fontSize: "0.7rem" }}>
                    Required for all orders
                  </span>
                </div>

                {/* Returning customer quick-fill */}
                {customers.length > 0 && (
                  <select
                    style={{ ...s.billingSelect, fontSize: "0.78rem", color: "#374151" }}
                    value={selectedCustomerId}
                    onChange={handleDropdownSelect}
                  >
                    <option value="">↩ Select returning customer (optional)</option>
                    {customers.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.name}{c.phone ? ` — ${c.phone}` : ""}</option>
                    ))}
                  </select>
                )}

                {/* Name */}
                <input
                  style={{
                    ...s.billingSelect,
                    borderColor: checkoutErr?.includes("name") ? "#fca5a5" : undefined,
                    background:  checkoutErr?.includes("name") ? "#fef2f2" : undefined,
                  }}
                  type="text"
                  placeholder="Full name *"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />

                {/* Phone */}
                <input
                  style={{
                    ...s.billingSelect,
                    borderColor: checkoutErr?.includes("mobile") ? "#fca5a5" : undefined,
                    background:  checkoutErr?.includes("mobile") ? "#fef2f2" : undefined,
                  }}
                  type="tel"
                  placeholder="Mobile number *"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />

                {/* Address */}
                <input
                  style={{
                    ...s.billingSelect,
                    borderColor: checkoutErr?.includes("address") ? "#fca5a5" : undefined,
                    background:  checkoutErr?.includes("address") ? "#fef2f2" : undefined,
                  }}
                  type="text"
                  placeholder="Address *"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                />
              </div>

              {/* Totals block */}
              <div style={s.totalsBlock}>
                <div style={s.totalsRow}>
                  <span>Sub total :</span>
                  <span>{fmt2(subtotal)}</span>
                </div>
                <div style={s.totalsRow}>
                  <span>Product discount :</span>
                  <span>{fmt2(productDiscount)}</span>
                </div>

                {/* Coupon discount — inline editable */}
                <div style={s.totalsRow}>
                  <span>Coupon discount:</span>
                  <div style={s.inlineEditRow}>
                    <span style={s.pencilIcon}>✏</span>
                    <input
                      type="number" min="0"
                      style={s.inlineDiscInput}
                      value={couponDiscount}
                      onChange={e => setCouponDiscount(e.target.value)}
                      placeholder="0.00"
                    />
                    <span style={s.inlineCur}>₹</span>
                  </div>
                </div>

                {/* Extra discount — inline editable */}
                <div style={s.totalsRow}>
                  <span>Extra discount:</span>
                  <div style={s.inlineEditRow}>
                    <span style={s.pencilIcon}>✏</span>
                    <input
                      type="number" min="0"
                      style={s.inlineDiscInput}
                      value={extraDiscount}
                      onChange={e => setExtraDiscount(e.target.value)}
                      placeholder="0.00"
                    />
                    <span style={s.inlineCur}>₹</span>
                  </div>
                </div>

                <div style={s.totalsRow}>
                  <span>Tax :</span>
                  <span>{fmt2(taxTotal)}</span>
                </div>

                <div style={s.totalsBoldRow}>
                  <span>Total :</span>
                  <span>{fmt2(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div style={s.billingFieldLabel}>Payment Method</div>
              <div style={s.payBtnRow}>
                {PAY_MODES.map(m => (
                  <button
                    key={m.key}
                    style={s.payBtn(paymentMode === m.key)}
                    onClick={() => handlePaymentModeChange(m.key)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* ─────── MODE-SPECIFIC PANELS ─────────────────────────── */}

              {/* CASH: partial payment tip */}
              {paymentMode === "cash" && (
                <div style={{ fontSize: "0.72rem", color: "#6b7280", background: "#f9fafb", borderRadius: "8px", padding: "0.5rem 0.75rem", border: "1px solid #e5e7eb" }}>
                  💡 Enter less than total for a partial payment — balance is tracked in Accounts.
                </div>
              )}

              {/* UPI: app badges + UTR reference input */}
              {paymentMode === "upi" && (
                <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "10px", padding: "0.75rem 0.9rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#15803d" }}>
                    📱 UPI Payment — Full amount collected automatically
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"].map(app => (
                      <span key={app} style={{ background: "#dcfce7", color: "#166534", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.55rem", borderRadius: "999px", border: "1px solid #86efac" }}>{app}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <label style={{ fontSize: "0.74rem", fontWeight: 600, color: "#374151" }}>UTR / Transaction Reference <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789012"
                      value={upiRef}
                      onChange={e => setUpiRef(e.target.value)}
                      style={{ padding: "0.5rem 0.75rem", border: "1.5px solid #86efac", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#fff", color: "#111827", letterSpacing: "0.05em" }}
                    />
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>
                    ✔ Ask customer to scan your UPI QR code. Enter the UTR from their payment screenshot for records.
                  </div>
                </div>
              )}

              {/* CARD: transaction ref + last 4 digits */}
              {paymentMode === "card" && (
                <div style={{ background: "#faf5ff", border: "1.5px solid #d8b4fe", borderRadius: "10px", padding: "0.75rem 0.9rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#7e22ce" }}>
                    💳 Card Payment — Full amount collected via POS terminal
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {["Visa", "Mastercard", "RuPay", "Amex", "Debit Card", "Credit Card"].map(t => (
                      <span key={t} style={{ background: "#f3e8ff", color: "#6b21a8", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.55rem", borderRadius: "999px", border: "1px solid #d8b4fe" }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <label style={{ fontSize: "0.74rem", fontWeight: 600, color: "#374151" }}>Transaction Ref / Card Last 4 Digits <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g. TXNREF123 or last 4 digits"
                      value={cardRef}
                      onChange={e => setCardRef(e.target.value)}
                      style={{ padding: "0.5rem 0.75rem", border: "1.5px solid #d8b4fe", borderRadius: "8px", fontSize: "0.85rem", outline: "none", background: "#fff", color: "#111827", letterSpacing: "0.05em" }}
                    />
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>
                    ✔ Swipe / tap / insert card on your POS terminal. Enter the approval code or last 4 digits for records.
                  </div>
                </div>
              )}

              {/* CREDIT: full credit sale info */}
              {paymentMode === "credit" && (
                <div style={{ background: "#fff7ed", border: "1.5px solid #fdba74", borderRadius: "10px", padding: "0.75rem 0.9rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#c2410c" }}>
                    📋 Credit Sale — Customer Owes Full Amount
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "7px", padding: "0.45rem 0.75rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "#92400e", fontWeight: 600 }}>Amount to be credited:</span>
                    <span style={{ fontSize: "1rem", fontWeight: 800, color: "#dc2626" }}>₹ {grandTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", lineHeight: 1.5 }}>
                    ⚠ No cash collected now. Full balance of <strong>₹{grandTotal.toFixed(2)}</strong> will be tracked in
                    the <strong>Orders → Pending</strong> and <strong>Accounts</strong> sections.
                  </div>
                </div>
              )}

              {/* ONLINE: Razorpay info panel */}
              {paymentMode === "online" && (
                <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "10px", padding: "0.75rem 0.9rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#1d4ed8" }}>
                    🔒 Secure Online Payment via Razorpay
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {["Google Pay","PhonePe","Paytm","BHIM UPI","Credit Card","Debit Card","Net Banking","Wallets"].map(m => (
                      <span key={m} style={{ background: "#dbeafe", color: "#1e40af", padding: "0.15rem 0.5rem", borderRadius: "999px", fontWeight: 600, fontSize: "0.7rem" }}>{m}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#6b7280" }}>
                    Customer pays via the Razorpay popup. Payment is verified automatically before sale is confirmed.
                  </div>
                </div>
              )}
              {paymentMode !== "online" && (
              <div style={s.paidRow}>
                <span style={s.paidLabel}>Paid Amount</span>
                <input
                  type="number" min="0"
                  style={{
                    ...s.paidInput,
                    ...(paymentMode === "upi" || paymentMode === "card"
                      ? { background: "#f3f4f6", color: "#9ca3af", cursor: "not-allowed" }
                      : {}),
                  }}
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  placeholder={
                    paymentMode === "credit"  ? "0 (full credit)" :
                    paymentMode === "upi" || paymentMode === "card" ? "Auto - full amount" :
                    grandTotal.toFixed(2)
                  }
                  disabled={paymentMode === "upi" || paymentMode === "card"}
                />
              </div>
              )}

              {/* Change Amount — only for cash */}
              {paymentMode === "cash" && (
              <div style={s.changeRow}>
                <span style={s.changeLabel}>Change Amount</span>
                <span style={s.changeVal}>{change.toFixed(2)} ₹</span>
              </div>
              )}

              {/* Comments */}
              <div style={s.billingFieldLabel}>Comments</div>
              <textarea
                style={s.commentsArea}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note…"
                rows={3}
              />

              {/* Error */}
              {checkoutErr && <div style={s.errorMsg}>⛔ {checkoutErr}</div>}

              {/* Action buttons */}
              <div style={s.actionBtns}>
                <button style={s.cancelBtn} onClick={clearCart}>
                  <span style={{ color: "#ef4444" }}>✕</span> Cancel
                </button>
                <button style={s.holdBtn}>
                  <span style={{ color: "#f59e0b" }}>⏸</span> Hold
                </button>

                {/* ─ ONLINE: Razorpay button ──────────────────────────── */}
                {paymentMode === "online" ? (
                  <button
                    style={{
                      ...s.placeOrderBtn(cart.length === 0 || rzProcessing),
                      background: cart.length === 0 || rzProcessing ? "#9ca3af" : "#1d4ed8",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                    }}
                    onClick={handleOnlineCheckout}
                    disabled={cart.length === 0 || rzProcessing}
                  >
                    {rzProcessing ? (
                      <>
                        <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                        Processing…
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                      </>
                    ) : (
                      <>🔒 Pay ₹{grandTotal.toFixed(2)}</>
                    )}
                  </button>
                ) : (
                  /* ─ OFFLINE: standard Place Order button ────────────── */
                  <button
                    style={s.placeOrderBtn(cart.length === 0 || submitting)}
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || submitting}
                  >
                    {submitting ? "Processing…" : "Place Order"}
                  </button>
                )}
              </div>

            </div>{/* /billingBody */}
          </div>{/* /billingSection */}
        </div>
      </div>

      {/* ── Receipt modal ── */}
      {receipt && (
        <ReceiptModal
          receipt={receipt}
          shopId={shopId}
          onNewSale={() => setReceipt(null)}
        />
      )}
    </>
  );
};

export default Sales;
