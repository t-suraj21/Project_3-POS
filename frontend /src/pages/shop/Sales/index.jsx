import { Link } from "react-router-dom";
import useSales from "../../../hooks/useSales";
import s from "./styles";

/* ── format helpers ─────────────────────────────────────────────── */
const fmt  = (n) => `₹ ${parseFloat(n || 0).toFixed(2)}`;
const fmt2 = (n) => `${parseFloat(n || 0).toFixed(2)} ₹`;
const imgSrc = (img) => img ? `/uploads/products/${img.replace("uploads/products/", "")}` : null;

/* ─────────────────────────────────────────────────────────────────────────────
   Product Card
────────────────────────────────────────────────────────────────────────────── */
const ProductCard = ({ product, onAdd }) => {
  const outOfStock = parseInt(product.stock, 10) === 0;
  const src        = imgSrc(product.image);
  const showOld    = parseFloat(product.cost_price) > 0 &&
                     parseFloat(product.cost_price) !== parseFloat(product.sell_price);

  return (
    <div
      style={s.productCard(outOfStock)}
      onClick={() => !outOfStock && onAdd(product)}
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

/* Receipt modal lives on the Billing page — removed from Sales */

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
    note, setNote,
    subtotal, productDiscount, taxTotal, grandTotal,
    billingErr, proceedToBilling,
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
            <div style={s.billingHeader}>Order Summary</div>

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
                    borderColor: billingErr?.includes("name") ? "#fca5a5" : undefined,
                    background:  billingErr?.includes("name") ? "#fef2f2" : undefined,
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
                    borderColor: billingErr?.includes("mobile") ? "#fca5a5" : undefined,
                    background:  billingErr?.includes("mobile") ? "#fef2f2" : undefined,
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
                    borderColor: billingErr?.includes("address") ? "#fca5a5" : undefined,
                    background:  billingErr?.includes("address") ? "#fef2f2" : undefined,
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

              {/* Comments */}
              <div style={s.billingFieldLabel}>Comments (Optional)</div>
              <textarea
                style={s.commentsArea}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note about this order…"
                rows={2}
              />

              {/* Error */}
              {billingErr && <div style={s.errorMsg}>⛔ {billingErr}</div>}

              {/* Action buttons */}
              <div style={s.actionBtns}>
                <button style={s.cancelBtn} onClick={clearCart}>
                  <span style={{ color: "#ef4444" }}>✕</span> Cancel
                </button>
                <button
                  style={{
                    ...s.placeOrderBtn(cart.length === 0),
                    background: cart.length === 0 ? "#9ca3af" : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    flex: 2,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                    fontSize: "0.9rem",
                  }}
                  onClick={proceedToBilling}
                  disabled={cart.length === 0}
                >
                  Proceed to Billing →
                </button>
              </div>

            </div>{/* /billingBody */}
          </div>{/* /billingSection */}
        </div>
    </div>
  );
};

export default Sales;

