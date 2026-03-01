import { useState, useMemo } from "react";
import useOrders from "../../../hooks/useOrders";
import s from "./styles";

const PAGE_SIZE = 10;

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Orders({ filter = "all" }) {
  const {
    orders,
    total,
    loading,
    error,
    search,
    setSearch,
    date,
    setDate,
    detail,
    detailLoading,
    loadDetail,
    closeDetail,
    refundOrder,
    exportCSV,
    refresh,
    // collect payment
    payModal, openPayModal, closePayModal, submitPayment,
    payAmount, setPayAmount,
    payMode,   setPayMode,
    payNote,   setPayNote,
    payErr,    payLoading,
  } = useOrders(filter);

  const [page, setPage] = useState(1);

  // Reset page when filter / search changes
  useMemo(() => setPage(1), [filter, search, date]);

  const title =
    filter === "completed" ? "Completed Orders"
    : filter === "refunded" ? "Refunded Orders"
    : filter === "pending"  ? "Pending / Balance Orders"
    : "All Order List";

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const pageOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <div style={s.headerRow}>
        <div style={s.titleWrap}>
          <h2 style={s.title}>{title}</h2>
          <span style={s.countBadge}>{total}</span>
        </div>
        <div style={s.headerActions}>
          <button style={s.exportBtn} onClick={exportCSV}>
            ⬇ Export CSV
          </button>
          <button style={s.refreshBtn} onClick={refresh}>
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && <div style={s.errorBar}>⚠ {error}</div>}

      {/* ── Toolbar ── */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Search Order ID / Customer…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <input
          type="date"
          style={s.dateInput}
          value={date}
          onChange={(e) => { setDate(e.target.value); setPage(1); }}
        />

        {date && (
          <button style={s.clearDateBtn} onClick={() => { setDate(""); setPage(1); }}>
            ✕ Clear date
          </button>
        )}

        <span style={s.filterLabel}>
          <span style={{ color: "#4f46e5" }}>▣</span>
          {filter === "all" ? "All Orders"
            : filter === "completed" ? "Completed"
            : filter === "pending" ? "Pending / Balance"
            : "Refunded"}
        </span>
      </div>

      {/* ── Table ── */}
      <div style={s.tableCard}>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead style={s.thead}>
              <tr>
                {["SL", "Order ID", "Order Date", "Customer Info", "Counter Info",
                  "Items", "Order Amount", "Discount", "Vat / Tax", "Total Amount",
                  "Paid Amt", "Balance Due", "Paid By", "Status", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      ...s.th,
                      ...(["Items","Action"].includes(h) ? s.thCenter : {}),
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={15} style={s.emptyRow}>
                    <div style={s.emptyIcon}>⏳</div>
                    <div>Loading orders…</div>
                  </td>
                </tr>
              ) : pageOrders.length === 0 ? (
                <tr>
                  <td colSpan={15} style={s.emptyRow}>
                    <div style={s.emptyIcon}>🧾</div>
                    <div>No orders found</div>
                  </td>
                </tr>
              ) : (
                pageOrders.map((order, i) => {
                  const sl = (page - 1) * PAGE_SIZE + i + 1;
                  const alreadyRefunded = order.status === "refunded";
                  const { style: stBadge, label: stLabel } = s.statusBadge(order.status);

                  return (
                    <tr key={order.id} style={s.tr(i)}>
                      {/* SL */}
                      <td style={s.td}>
                        <span style={s.slNum}>{sl}</span>
                      </td>

                      {/* Order ID */}
                      <td style={s.td}>
                        <span style={s.billNo}>{order.bill_number || `#${order.id}`}</span>
                      </td>

                      {/* Order Date */}
                      <td style={s.td}>
                        <div style={s.dateMain}>{fmtDate(order.created_at)}</div>
                        <div style={s.dateTime}>{fmtTime(order.created_at)}</div>
                      </td>

                      {/* Customer Info */}
                      <td style={s.td}>
                        <div style={s.customerName}>
                          {order.customer_name || "Walk-In Customer"}
                        </div>
                        {order.customer_phone && (
                          <div style={s.customerPhone}>{order.customer_phone}</div>
                        )}
                      </td>

                      {/* Counter Info */}
                      <td style={s.td}>
                        <span style={s.counterInfo}>Counter-01</span>
                      </td>

                      {/* Items */}
                      <td style={{ ...s.td, ...s.tdCenter }}>
                        <button style={s.itemsLink} onClick={() => loadDetail(order.id)}>
                          {order.item_count ?? "—"} items
                        </button>
                      </td>

                      {/* Order Amount (subtotal) */}
                      <td style={s.td}>
                        <span style={s.amtCell}>₹{fmt(order.subtotal)}</span>
                      </td>

                      {/* Discount (3-line) */}
                      <td style={s.td}>
                        <div style={s.discountBlock}>
                          <div style={s.discRow}>
                            <span>Discount</span>
                            <span style={s.discRowVal}>₹{fmt(order.discount)}</span>
                          </div>
                          <div style={s.discRow}>
                            <span>Extra</span>
                            <span style={s.discRowVal}>₹0.00</span>
                          </div>
                          <div style={s.discRow}>
                            <span>Coupon</span>
                            <span style={s.discRowVal}>₹0.00</span>
                          </div>
                        </div>
                      </td>

                      {/* Vat / Tax */}
                      <td style={s.td}>
                        <span style={s.amtCell}>₹{fmt(order.tax_amount)}</span>
                      </td>

                      {/* Total Amount */}
                      <td style={s.td}>
                        <span style={s.totalAmt}>₹{fmt(order.total_amount)}</span>
                      </td>

                      {/* Paid Amount */}
                      <td style={s.td}>
                        <span style={s.amtCell}>₹{fmt(order.paid_amount)}</span>
                      </td>

                      {/* Balance Due */}
                      <td style={s.td}>
                        {(() => {
                          const bal = parseFloat(order.total_amount || 0) - parseFloat(order.paid_amount || 0);
                          if (order.status === 'refunded') return <span style={s.balanceNone}>—</span>;
                          if (bal <= 0) return <span style={s.balancePaid}>✓ Paid</span>;
                          return <span style={s.balanceDue}>₹{fmt(bal)}</span>;
                        })()}
                      </td>

                      {/* Paid By */}
                      <td style={s.td}>
                        <span style={s.payBadge(order.payment_mode)}>
                          {order.payment_mode || "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={s.td}>
                        <span style={stBadge}>{stLabel}</span>
                      </td>

                      {/* Action */}
                      <td style={{ ...s.td, ...s.tdCenter }}>
                        <div style={s.actionWrap}>
                          {/* Eye — view detail */}
                          <button
                            style={s.eyeBtn}
                            title="View detail"
                            onClick={() => loadDetail(order.id)}
                          >
                            👁
                          </button>

                          {/* Pay — only for pending/credit/partial */}
                          {(order.status === "credit" || order.status === "partial") && (
                            <button
                              style={{
                                padding: "0.28rem 0.55rem",
                                borderRadius: "6px",
                                border: "none",
                                background: "#dcfce7",
                                color: "#15803d",
                                cursor: "pointer",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                fontFamily: "inherit",
                              }}
                              title="Collect balance payment"
                              onClick={() => openPayModal(order)}
                            >
                              💳 Pay
                            </button>
                          )}

                          {/* Refund — only for non-refunded */}
                          <button
                            style={s.refundBtn(alreadyRefunded)}
                            title={alreadyRefunded ? "Already refunded" : "Refund order"}
                            disabled={alreadyRefunded}
                            onClick={() => !alreadyRefunded && refundOrder(order.id)}
                          >
                            ↩
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={s.paginationWrap}>
            <button
              style={s.pageBtn(false)}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, k) => k + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} style={{ padding: "0 0.25rem", color: "#9ca3af" }}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    style={s.pageBtn(p === page)}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              style={s.pageBtn(false)}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {(detail || detailLoading) && (
        <div style={s.overlay} onClick={closeDetail}>
          <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>
                {detailLoading
                  ? "Loading…"
                  : `Order — ${detail?.bill_number || `#${detail?.id}`}`}
              </span>
              <button style={s.modalClose} onClick={closeDetail}>✕</button>
            </div>

            {detailLoading ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>
                Loading order details…
              </div>
            ) : detail ? (
              <div style={s.modalBody}>
                {/* Info grid */}
                <div style={s.infoGrid}>
                  {[
                    ["Bill No.", detail.bill_number || `#${detail.id}`],
                    ["Date", `${fmtDate(detail.created_at)} ${fmtTime(detail.created_at)}`],
                    ["Customer", detail.customer_name || "Walk-In Customer"],
                    ["Phone", detail.customer_phone || "—"],
                    ["Payment", detail.payment_mode || "—"],
                    ["Status", s.statusBadge(detail.status).label],
                    ["Paid", `₹${fmt(detail.paid_amount)}`],
                    ["Balance Due", (() => {
                      const bal = parseFloat(detail.total_amount || 0) - parseFloat(detail.paid_amount || 0);
                      return bal > 0 ? `₹${fmt(bal)}` : "Fully Paid";
                    })()],
                  ].map(([label, value]) => (
                    <div key={label} style={s.infoItem}>
                      <span style={s.infoLabel}>{label}</span>
                      <span style={{
                        ...s.infoValue,
                        ...(label === "Balance Due" && value !== "Fully Paid"
                          ? { color: "#dc2626", fontWeight: 800 } : {}),
                        ...(label === "Balance Due" && value === "Fully Paid"
                          ? { color: "#16a34a" } : {}),
                      }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Items table */}
                <div style={s.itemsTableWrap}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["#", "Product", "SKU", "Qty", "Price", "Disc", "Total"].map((h) => (
                          <th key={h} style={s.itemsTh}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.items || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ ...s.itemsTd, textAlign: "center", color: "#9ca3af" }}>
                            No items
                          </td>
                        </tr>
                      ) : (
                        (detail.items || []).map((item, i) => (
                          <tr key={item.id || i}>
                            <td style={s.itemsTd}>{i + 1}</td>
                            <td style={s.itemsTd}>{item.product_name}</td>
                            <td style={s.itemsTd}>{item.sku || "—"}</td>
                            <td style={s.itemsTd}>{item.quantity} {item.unit || ""}</td>
                            <td style={s.itemsTd}>₹{fmt(item.sell_price)}</td>
                            <td style={s.itemsTd}>₹{fmt(item.discount_amount)}</td>
                            <td style={{ ...s.itemsTd, fontWeight: 700 }}>₹{fmt(item.total)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div style={s.totalsBlock}>
                  <div style={s.totalRow}>
                    <span>Subtotal</span>
                    <span>₹{fmt(detail.subtotal)}</span>
                  </div>
                  <div style={s.totalRow}>
                    <span>Discount</span>
                    <span>- ₹{fmt(detail.discount)}</span>
                  </div>
                  <div style={s.totalRow}>
                    <span>Vat / Tax</span>
                    <span>₹{fmt(detail.tax_amount)}</span>
                  </div>
                  <div style={s.grandTotalRow}>
                    <span>Grand Total</span>
                    <span>₹{fmt(detail.total_amount)}</span>
                  </div>
                  <div style={{ ...s.totalRow, fontSize: "0.78rem" }}>
                    <span>Paid</span>
                    <span>₹{fmt(detail.paid_amount)}</span>
                  </div>
                  <div style={{ ...s.totalRow, fontSize: "0.78rem" }}>
                    <span>Change</span>
                    <span>₹{fmt(detail.change_amount)}</span>
                  </div>
                  {detail.note && (
                    <div style={{ ...s.totalRow, marginTop: "0.4rem", fontStyle: "italic" }}>
                      <span>Note: {detail.note}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Collect Payment Modal ── */}
      {payModal.open && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(17,24,39,0.45)",
            zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={closePayModal}
        >
          <div
            style={{
              background: "#fff", borderRadius: "16px",
              boxShadow: "0 8px 40px rgba(17,24,39,0.20)",
              padding: "1.75rem 2rem", minWidth: "340px", maxWidth: "420px", width: "100%",
              display: "flex", flexDirection: "column", gap: "1rem",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111827" }}>
                  💳 Collect Payment
                </div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.2rem" }}>
                  {payModal.billNo} · {payModal.customerName}
                </div>
              </div>
              <button
                onClick={closePayModal}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#9ca3af", padding: "0.2rem" }}
              >
                ✕
              </button>
            </div>

            {/* Balance due badge */}
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px",
              padding: "0.6rem 1rem", display: "flex", justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: "0.82rem", color: "#991b1b", fontWeight: 600 }}>Balance Due</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#dc2626" }}>
                ₹{payModal.remaining.toFixed(2)}
              </span>
            </div>

            {/* Amount input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>
                Payment Amount <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                autoFocus
                type="number"
                min="0.01"
                step="0.01"
                max={payModal.remaining}
                style={{
                  padding: "0.6rem 0.85rem", borderRadius: "8px",
                  border: "1.5px solid #e5e7eb", fontSize: "1rem", fontFamily: "inherit",
                  outline: "none", background: "#f9fafb",
                }}
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitPayment()}
              />
              <button
                style={{
                  alignSelf: "flex-start", fontSize: "0.73rem", color: "#1a56db",
                  background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit",
                }}
                onClick={() => setPayAmount(payModal.remaining.toFixed(2))}
              >
                Pay full balance
              </button>
            </div>

            {/* Payment mode */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Payment Mode</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["cash", "upi", "card"].map(m => (
                  <button
                    key={m}
                    type="button"
                    style={{
                      flex: 1, padding: "0.45rem 0", borderRadius: "7px", fontFamily: "inherit",
                      border: "1.5px solid " + (payMode === m ? "#1a56db" : "#e5e7eb"),
                      background: payMode === m ? "#eff6ff" : "#fff",
                      color: payMode === m ? "#1a56db" : "#374151",
                      fontWeight: payMode === m ? 700 : 500,
                      cursor: "pointer", fontSize: "0.82rem", textTransform: "uppercase",
                    }}
                    onClick={() => setPayMode(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>Note (optional)</label>
              <input
                type="text"
                style={{
                  padding: "0.5rem 0.85rem", borderRadius: "8px",
                  border: "1.5px solid #e5e7eb", fontSize: "0.88rem", fontFamily: "inherit",
                  outline: "none", background: "#f9fafb",
                }}
                placeholder="e.g. Paid by customer wife"
                value={payNote}
                onChange={e => setPayNote(e.target.value)}
              />
            </div>

            {/* Error */}
            {payErr && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "7px",
                padding: "0.45rem 0.75rem", fontSize: "0.8rem", color: "#dc2626",
              }}>
                ⛔ {payErr}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.65rem", justifyContent: "flex-end" }}>
              <button
                onClick={closePayModal}
                style={{
                  padding: "0.55rem 1.2rem", borderRadius: "8px",
                  border: "1px solid #e0e7ef", background: "#fff",
                  color: "#374151", cursor: "pointer", fontWeight: 600,
                  fontSize: "0.88rem", fontFamily: "inherit",
                }}
                disabled={payLoading}
              >
                Cancel
              </button>
              <button
                onClick={submitPayment}
                style={{
                  padding: "0.55rem 1.6rem", borderRadius: "8px", border: "none",
                  background: payLoading ? "#93c5fd" : "#16a34a",
                  color: "#fff", cursor: payLoading ? "not-allowed" : "pointer",
                  fontWeight: 700, fontSize: "0.88rem", fontFamily: "inherit",
                  boxShadow: payLoading ? "none" : "0 2px 6px rgba(22,163,74,0.3)",
                }}
                disabled={payLoading}
              >
                {payLoading ? "Processing…" : "✓ Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
