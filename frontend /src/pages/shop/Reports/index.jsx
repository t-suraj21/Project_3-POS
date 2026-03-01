import useReports from "../../../hooks/useReports";

// ─── colour palette (matches rest of the POS) ─────────────────────────────
const CLR = {
  bg: "#f0f2f5",
  white: "#fff",
  primary: "#2196f3",
  primaryDk: "#1565c0",
  success: "#43a047",
  warning: "#fb8c00",
  danger: "#e53935",
  purple: "#8e24aa",
  text: "#1a1a2e",
  sub: "#5f6368",
  border: "#e8eaf0",
  card: "#fff",
  hover: "#e3f2fd",
};

// ─── tiny helpers ─────────────────────────────────────────────────────────
const fmt = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtN = (n) => Number(n || 0).toLocaleString("en-IN");
const pct = (part, total) =>
  total > 0 ? ((part / total) * 100).toFixed(1) + "%" : "0%";

// ─── reusable stat card ────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = CLR.primary, icon }) {
  return (
    <div style={{
      background: CLR.white, border: `1px solid ${CLR.border}`,
      borderRadius: 12, padding: "18px 22px", flex: "1 1 180px",
      borderTop: `4px solid ${color}`, boxShadow: "0 2px 8px rgba(0,0,0,.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, color: CLR.sub, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5 }}>{label}</p>
          <p style={{ margin: "6px 0 0", color: CLR.text, fontSize: 22, fontWeight: 700 }}>{value}</p>
          {sub && <p style={{ margin: "4px 0 0", color: CLR.sub, fontSize: 12 }}>{sub}</p>}
        </div>
        <span style={{ fontSize: 28, opacity: .7 }}>{icon}</span>
      </div>
    </div>
  );
}

// ─── section wrapper ──────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ background: CLR.white, borderRadius: 12, border: `1px solid ${CLR.border}`, marginBottom: 20, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${CLR.border}`, fontWeight: 700, color: CLR.text, fontSize: 15 }}>
        {title}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ─── simple table ─────────────────────────────────────────────────────────
function Tbl({ heads, rows, emptyMsg = "No data" }) {
  return rows.length === 0 ? (
    <p style={{ textAlign: "center", color: CLR.sub, padding: 24 }}>{emptyMsg}</p>
  ) : (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h} style={{ padding: "10px 12px", background: "#f8f9fc", textAlign: "left", color: CLR.sub, fontWeight: 600, borderBottom: `2px solid ${CLR.border}`, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? CLR.white : "#fafbff", transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = CLR.hover}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? CLR.white : "#fafbff"}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "9px 12px", borderBottom: `1px solid ${CLR.border}`, color: CLR.text }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── status badge ──────────────────────────────────────────────────────────
function Badge({ s }) {
  const map = { paid: [CLR.success, "#e8f5e9"], credit: [CLR.danger, "#fce4ec"], partial: [CLR.warning, "#fff3e0"], refunded: [CLR.sub, "#f5f5f5"] };
  const [fg, bg] = map[s] || [CLR.sub, "#f5f5f5"];
  return <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: bg, color: fg, textTransform: "capitalize" }}>{s}</span>;
}

// ─── horizontal bar ────────────────────────────────────────────────────────
function Bar({ pctVal, color }) {
  return (
    <div style={{ height: 8, borderRadius: 4, background: "#eee", overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: `${Math.min(100, pctVal)}%`, background: color, borderRadius: 4, transition: "width .4s" }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// ─── 1. DAILY ─────────────────────────────────────────────────────────────
function DailyTab({ dailyDate, setDailyDate, dailyData, loading }) {
  if (loading) return <Spinner />;
  const s = dailyData?.summary;
  const hourly = dailyData?.hourly || [];
  const orders = dailyData?.orders || [];
  const maxHourRev = Math.max(...hourly.map(r => +r.revenue), 1);

  return (
    <div>
      {/* date picker */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <label style={{ fontWeight: 600, color: CLR.text }}>📅 Select Date</label>
        <input
          type="date"
          value={dailyDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => setDailyDate(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${CLR.border}`, fontSize: 14, color: CLR.text }}
        />
      </div>

      {!s ? null : (
        <>
          {/* summary cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
            <StatCard label="Total Orders" value={fmtN(s.total_orders)} icon="🛒" color={CLR.primary} />
            <StatCard label="Total Revenue" value={fmt(s.total_revenue)} icon="💰" color={CLR.success} />
            <StatCard label="Collected" value={fmt(s.total_paid)} icon="✅" color={CLR.purple}
              sub={`Balance: ${fmt(s.total_balance)}`} />
            <StatCard label="Discount Given" value={fmt(s.total_discount)} icon="🏷️" color={CLR.warning} />
          </div>

          {/* payment mode breakdown */}
          <Section title="💳 Payment Mode Breakdown">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {[
                { mode: "Cash", orders: s.cash_orders, rev: s.cash_revenue, clr: CLR.success },
                { mode: "UPI", orders: s.upi_orders, rev: s.upi_revenue, clr: CLR.primary },
                { mode: "Card", orders: s.card_orders, rev: s.card_revenue, clr: CLR.purple },
                { mode: "Credit", orders: s.credit_orders, rev: s.credit_revenue, clr: CLR.danger },
              ].map(pm => (
                <div key={pm.mode} style={{ flex: "1 1 160px", background: "#f8f9fc", borderRadius: 10, padding: "14px 18px", border: `1px solid ${CLR.border}` }}>
                  <p style={{ margin: 0, fontWeight: 700, color: pm.clr, fontSize: 15 }}>{pm.mode}</p>
                  <p style={{ margin: "6px 0 2px", fontSize: 20, fontWeight: 800, color: CLR.text }}>{fmt(pm.rev)}</p>
                  <p style={{ margin: 0, color: CLR.sub, fontSize: 12 }}>{fmtN(pm.orders)} order{pm.orders !== 1 ? "s" : ""}</p>
                  <div style={{ marginTop: 8 }}>
                    <Bar pctVal={+s.total_revenue > 0 ? (+pm.rev / +s.total_revenue) * 100 : 0} color={pm.clr} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* order status */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
            <StatCard label="Completed" value={fmtN(s.completed_orders)} icon="✔️" color={CLR.success} />
            <StatCard label="Pending / Credit" value={fmtN(s.pending_orders)} icon="⏳" color={CLR.warning} />
            <StatCard label="Tax Collected" value={fmt(s.total_tax)} icon="📋" color={CLR.sub} />
          </div>

          {/* hourly activity */}
          <Section title="⏰ Hourly Activity">
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, minWidth: 600, height: 120, padding: "0 4px" }}>
                {hourly.map(h => {
                  const barH = (+h.revenue / maxHourRev) * 100;
                  const label = h.hour < 12 ? `${h.hour}am` : h.hour === 12 ? "12pm" : `${h.hour - 12}pm`;
                  return (
                    <div key={h.hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }} title={`${label}: ${fmt(h.revenue)} (${h.orders} orders)`}>
                      <div style={{ width: "70%", height: `${barH}%`, minHeight: barH > 0 ? 4 : 0, background: CLR.primary, borderRadius: "3px 3px 0 0", opacity: .85, transition: "height .3s" }} />
                      <span style={{ fontSize: 9, color: CLR.sub, marginTop: 3 }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* orders list */}
          <Section title={`📄 All Orders (${orders.length})`}>
            <Tbl
              heads={["Bill#", "Customer", "Items", "Total", "Paid", "Mode", "Status", "Time"]}
              emptyMsg="No orders for this day"
              rows={orders.map(o => [
                <span style={{ fontWeight: 600, color: CLR.primary }}>{o.bill_number}</span>,
                <><span style={{ fontWeight: 600 }}>{o.customer_name || "-"}</span>{o.customer_phone ? <><br /><span style={{ fontSize: 11, color: CLR.sub }}>{o.customer_phone}</span></> : null}</>,
                fmtN(o.item_count),
                <span style={{ fontWeight: 700, color: CLR.text }}>{fmt(o.total_amount)}</span>,
                fmt(o.paid_amount),
                <span style={{ textTransform: "capitalize" }}>{o.payment_mode}</span>,
                <Badge s={o.status} />,
                new Date(o.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
              ])}
            />
          </Section>
        </>
      )}
    </div>
  );
}

// ─── 2. MONTHLY ───────────────────────────────────────────────────────────
function MonthlyTab({ monthlyYear, setMonthlyYear, monthlyMonth, setMonthlyMonth, monthlyData, loading }) {
  if (loading) return <Spinner />;
  const s = monthlyData?.summary;
  const prev = monthlyData?.prev_month;
  const daily = monthlyData?.daily || [];
  const weekly = monthlyData?.weekly || [];

  const revChange = prev && +prev.total_revenue > 0 ? (((+s?.total_revenue - +prev.total_revenue) / +prev.total_revenue) * 100).toFixed(1) : null;
  const ordChange = prev && +prev.total_orders > 0 ? (((+s?.total_orders - +prev.total_orders) / +prev.total_orders) * 100).toFixed(1) : null;

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const curYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => curYear - i);

  return (
    <div>
      {/* month / year pickers */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <label style={{ fontWeight: 600, color: CLR.text }}>📅 Month</label>
        <select value={monthlyMonth} onChange={e => setMonthlyMonth(+e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${CLR.border}`, fontSize: 14, color: CLR.text }}>
          {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select value={monthlyYear} onChange={e => setMonthlyYear(+e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${CLR.border}`, fontSize: 14, color: CLR.text }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {monthlyData && <span style={{ color: CLR.sub, fontSize: 13 }}>{monthlyData.month_name}</span>}
      </div>

      {!s ? null : (
        <>
          {/* summary */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
            <StatCard label="Total Orders" value={fmtN(s.total_orders)} icon="🛒" color={CLR.primary}
              sub={ordChange !== null ? `${ordChange > 0 ? "▲" : "▼"} ${Math.abs(ordChange)}% vs prev month` : undefined} />
            <StatCard label="Total Revenue" value={fmt(s.total_revenue)} icon="💰" color={CLR.success}
              sub={revChange !== null ? `${revChange > 0 ? "▲" : "▼"} ${Math.abs(revChange)}% vs prev month` : undefined} />
            <StatCard label="Collected" value={fmt(s.total_paid)} icon="✅" color={CLR.purple} />
            <StatCard label="Discount" value={fmt(s.total_discount)} icon="🏷️" color={CLR.warning} />
            <StatCard label="Tax" value={fmt(s.total_tax)} icon="📋" color={CLR.sub} />
          </div>

          {/* payment breakdown */}
          <Section title="💳 Revenue by Payment Mode">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {[
                { mode: "Cash", val: s.cash_revenue, clr: CLR.success },
                { mode: "UPI", val: s.upi_revenue, clr: CLR.primary },
                { mode: "Card", val: s.card_revenue, clr: CLR.purple },
                { mode: "Credit", val: s.credit_revenue, clr: CLR.danger },
              ].map(pm => (
                <div key={pm.mode} style={{ flex: "1 1 140px", background: "#f8f9fc", borderRadius: 10, padding: "12px 16px", border: `1px solid ${CLR.border}` }}>
                  <p style={{ margin: 0, color: CLR.sub, fontSize: 12, fontWeight: 600 }}>{pm.mode}</p>
                  <p style={{ margin: "4px 0 4px", fontWeight: 800, fontSize: 18, color: pm.clr }}>{fmt(pm.val)}</p>
                  <Bar pctVal={+s.total_revenue > 0 ? (+pm.val / +s.total_revenue) * 100 : 0} color={pm.clr} />
                  <span style={{ fontSize: 11, color: CLR.sub }}>{pct(+pm.val, +s.total_revenue)}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* week breakdown */}
          {weekly.length > 0 && (
            <Section title="📊 Weekly Breakdown">
              <Tbl
                heads={["Week", "Orders", "Revenue"]}
                rows={weekly.map(w => [
                  `Week ${w.week_num}`,
                  fmtN(w.orders),
                  <span style={{ fontWeight: 700 }}>{fmt(w.revenue)}</span>,
                ])}
              />
            </Section>
          )}

          {/* day-by-day */}
          <Section title="📅 Day-by-Day Breakdown">
            <Tbl
              heads={["Date", "Day", "Orders", "Revenue", "Collected"]}
              rows={daily.map(d => {
                const dateStr = `${monthlyYear}-${String(monthlyMonth).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
                const dayName = new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short" });
                return [
                  <span style={{ fontWeight: 600, color: CLR.primary }}>{dateStr}</span>,
                  dayName,
                  d.orders > 0 ? <span style={{ fontWeight: 600 }}>{fmtN(d.orders)}</span> : <span style={{ color: "#bbb" }}>—</span>,
                  d.revenue > 0 ? <span style={{ fontWeight: 700 }}>{fmt(d.revenue)}</span> : <span style={{ color: "#bbb" }}>—</span>,
                  d.paid > 0 ? fmt(d.paid) : <span style={{ color: "#bbb" }}>—</span>,
                ];
              })}
            />
          </Section>
        </>
      )}
    </div>
  );
}

// ─── 3. BEST PRODUCTS ─────────────────────────────────────────────────────
function BestProductsTab({ bpFrom, setBpFrom, bpTo, setBpTo, bpSortBy, setBpSortBy, bpData, loading }) {
  if (loading) return <Spinner />;
  const ps = bpData?.period_summary;
  const list = bpSortBy === "qty" ? (bpData?.by_qty || []) : (bpData?.by_revenue || []);
  const cats = bpData?.by_category || [];
  const maxRev = Math.max(...list.map(p => +p.total_revenue), 1);

  return (
    <div>
      {/* date range */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <label style={{ fontWeight: 600, color: CLR.text }}>📅 From</label>
        <input type="date" value={bpFrom} onChange={e => setBpFrom(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${CLR.border}`, fontSize: 14 }} />
        <label style={{ fontWeight: 600, color: CLR.text }}>To</label>
        <input type="date" value={bpTo} onChange={e => setBpTo(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${CLR.border}`, fontSize: 14 }} />
        <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${CLR.border}` }}>
          {["qty", "revenue"].map(v => (
            <button key={v} onClick={() => setBpSortBy(v)}
              style={{ padding: "7px 14px", background: bpSortBy === v ? CLR.primary : CLR.white, color: bpSortBy === v ? "#fff" : CLR.sub, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              {v === "qty" ? "By Qty" : "By Revenue"}
            </button>
          ))}
        </div>
      </div>

      {ps && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <StatCard label="Total Orders" value={fmtN(ps.total_orders)} icon="🛒" color={CLR.primary} />
          <StatCard label="Items Sold" value={fmtN(ps.total_items_sold)} icon="📦" color={CLR.success} />
          <StatCard label="Revenue" value={fmt(ps.total_revenue)} icon="💰" color={CLR.purple} />
          <StatCard label="Unique Products" value={fmtN(ps.unique_products_sold)} icon="🔢" color={CLR.warning} />
        </div>
      )}

      {/* top products table */}
      <Section title={`🏆 Top ${list.length} Products — sorted by ${bpSortBy === "qty" ? "Quantity" : "Revenue"}`}>
        <Tbl
          heads={["#", "Product", "Category", "Qty Sold", "Revenue", "Profit", "Avg Price", "Revenue Share"]}
          emptyMsg="No sales data for this period"
          rows={list.map((p, i) => [
            <span style={{ fontWeight: 800, color: i < 3 ? [CLR.warning, CLR.sub, "#cd7f32"][i] : CLR.sub }}>{i + 1}</span>,
            <span style={{ fontWeight: 600 }}>{p.product_name}</span>,
            <span style={{ color: CLR.sub }}>{p.category_name || "—"}</span>,
            <span style={{ fontWeight: 700 }}>{fmtN(p.total_qty)}</span>,
            <span style={{ fontWeight: 700, color: CLR.success }}>{fmt(p.total_revenue)}</span>,
            <span style={{ color: +p.gross_profit >= 0 ? CLR.success : CLR.danger }}>{fmt(p.gross_profit)}</span>,
            fmt(p.avg_price),
            <div style={{ minWidth: 120 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: CLR.sub }}>{pct(+p.total_revenue, maxRev * (bpData?.by_revenue?.length || 1) / (bpData?.by_revenue?.length || 1))}</span>
                <span style={{ fontSize: 11, color: CLR.sub }}>{pct(+p.total_revenue, +(bpData?.period_summary?.total_revenue || 1))}</span>
              </div>
              <Bar pctVal={+ps?.total_revenue > 0 ? (+p.total_revenue / +ps.total_revenue) * 100 : 0} color={CLR.primary} />
            </div>,
          ])}
        />
      </Section>

      {/* category breakdown */}
      {cats.length > 0 && (
        <Section title="📂 Category Breakdown">
          <Tbl
            heads={["Category", "Revenue", "Qty", "Products", "Share"]}
            rows={cats.map(c => [
              <span style={{ fontWeight: 600 }}>{c.category}</span>,
              <span style={{ fontWeight: 700, color: CLR.success }}>{fmt(c.total_revenue)}</span>,
              fmtN(c.total_qty),
              fmtN(c.unique_products),
              <div style={{ minWidth: 100 }}>
                <Bar pctVal={ps?.total_revenue > 0 ? (+c.total_revenue / +ps.total_revenue) * 100 : 0} color={CLR.purple} />
                <span style={{ fontSize: 11, color: CLR.sub }}>{pct(+c.total_revenue, +ps?.total_revenue)}</span>
              </div>,
            ])}
          />
        </Section>
      )}
    </div>
  );
}

// ─── 4. PROFIT ────────────────────────────────────────────────────────────
function ProfitTab({ profitFrom, setProfitFrom, profitTo, setProfitTo, profitData, loading }) {
  if (loading) return <Spinner />;
  const s = profitData?.summary;
  const daily = profitData?.daily || [];
  const byMode = profitData?.by_mode || [];
  const top = profitData?.top_products || [];
  const maxProfit = Math.max(...daily.map(d => +d.profit), 1);

  return (
    <div>
      {/* date range */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <label style={{ fontWeight: 600, color: CLR.text }}>📅 From</label>
        <input type="date" value={profitFrom} onChange={e => setProfitFrom(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${CLR.border}`, fontSize: 14 }} />
        <label style={{ fontWeight: 600, color: CLR.text }}>To</label>
        <input type="date" value={profitTo} onChange={e => setProfitTo(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${CLR.border}`, fontSize: 14 }} />
      </div>

      {s && (
        <>
          {/* summary cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
            <StatCard label="Revenue" value={fmt(s.total_revenue)} icon="💰" color={CLR.primary}
              sub={`Orders: ${fmtN(s.total_orders)}`} />
            <StatCard label="Total Cost" value={fmt(s.total_cost)} icon="🏭" color={CLR.danger} />
            <StatCard label="Gross Profit" value={fmt(s.gross_profit)} icon="📈" color={CLR.success}
              sub={`Margin: ${s.profit_margin}%`} />
            <StatCard label="Collected" value={fmt(s.total_collected)} icon="✅" color={CLR.purple}
              sub={`Pending: ${fmt(s.pending_receivable)}`} />
            <StatCard label="Discount Impact" value={fmt(s.total_discount)} icon="🏷️" color={CLR.warning}
              sub={`Tax: ${fmt(s.total_tax)}`} />
          </div>

          {/* profit margin indicator */}
          <Section title="📊 Profit Margin">
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: CLR.sub }}>Gross Margin</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: +s.profit_margin >= 20 ? CLR.success : +s.profit_margin >= 10 ? CLR.warning : CLR.danger }}>
                    {s.profit_margin}%
                  </span>
                </div>
                <div style={{ height: 16, borderRadius: 8, background: "#eee", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, s.profit_margin)}%`, background: +s.profit_margin >= 20 ? CLR.success : +s.profit_margin >= 10 ? CLR.warning : CLR.danger, borderRadius: 8, transition: "width .5s" }} />
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "10px 20px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #a7f3d0" }}>
                <p style={{ margin: 0, color: CLR.sub, fontSize: 12 }}>Net Profit</p>
                <p style={{ margin: "4px 0 0", fontWeight: 800, fontSize: 22, color: CLR.success }}>{fmt(s.net_profit)}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: CLR.sub }}>(after discounts)</p>
              </div>
            </div>
          </Section>

          {/* payment mode profit */}
          {byMode.length > 0 && (
            <Section title="💳 Profit by Payment Mode">
              <Tbl
                heads={["Mode", "Orders", "Revenue", "Cost", "Profit", "Margin"]}
                rows={byMode.map(m => {
                  const margin = +m.revenue > 0 ? ((+m.profit / +m.revenue) * 100).toFixed(1) : "0.0";
                  return [
                    <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{m.payment_mode}</span>,
                    fmtN(m.orders),
                    <span style={{ fontWeight: 700 }}>{fmt(m.revenue)}</span>,
                    <span style={{ color: CLR.danger }}>{fmt(m.cost)}</span>,
                    <span style={{ fontWeight: 700, color: CLR.success }}>{fmt(m.profit)}</span>,
                    <span style={{ color: +margin >= 20 ? CLR.success : CLR.warning }}>{margin}%</span>,
                  ];
                })}
              />
            </Section>
          )}

          {/* daily profit chart */}
          {daily.length > 0 && (
            <Section title="📅 Daily Profit Trend">
              {/* mini bar chart */}
              <div style={{ overflowX: "auto", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, minWidth: Math.max(600, daily.length * 28), height: 100 }}>
                  {daily.map(d => {
                    const barH = (+d.profit / maxProfit) * 100;
                    return (
                      <div key={d.sale_date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
                        title={`${d.sale_date}: Revenue ${fmt(d.revenue)}, Cost ${fmt(d.cost)}, Profit ${fmt(d.profit)}`}>
                        <div style={{ width: "70%", height: `${Math.max(0, barH)}%`, minHeight: barH > 0 ? 3 : 0, background: +d.profit >= 0 ? CLR.success : CLR.danger, borderRadius: "3px 3px 0 0", opacity: .85 }} />
                        <span style={{ fontSize: 8, color: CLR.sub, marginTop: 2, transform: "rotate(-30deg)", whiteSpace: "nowrap" }}>
                          {d.sale_date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* table */}
              <Tbl
                heads={["Date", "Orders", "Revenue", "Cost", "Profit", "Margin"]}
                rows={daily.map(d => {
                  const margin = +d.revenue > 0 ? ((+d.profit / +d.revenue) * 100).toFixed(1) : "0.0";
                  return [
                    <span style={{ fontWeight: 600, color: CLR.primary }}>{d.sale_date}</span>,
                    fmtN(d.orders),
                    <span style={{ fontWeight: 600 }}>{fmt(d.revenue)}</span>,
                    <span style={{ color: CLR.danger }}>{fmt(d.cost)}</span>,
                    <span style={{ fontWeight: 700, color: +d.profit >= 0 ? CLR.success : CLR.danger }}>{fmt(d.profit)}</span>,
                    <span style={{ color: +margin >= 20 ? CLR.success : CLR.warning }}>{margin}%</span>,
                  ];
                })}
              />
            </Section>
          )}

          {/* top profitable products */}
          {top.length > 0 && (
            <Section title="🏆 Most Profitable Products">
              <Tbl
                heads={["#", "Product", "Qty", "Revenue", "Cost", "Profit", "Margin"]}
                rows={top.map((p, i) => [
                  <span style={{ fontWeight: 800, color: i < 3 ? [CLR.warning, CLR.sub, "#cd7f32"][i] : CLR.sub }}>{i + 1}</span>,
                  <span style={{ fontWeight: 600 }}>{p.product_name}</span>,
                  fmtN(p.total_qty),
                  <span style={{ fontWeight: 600 }}>{fmt(p.revenue)}</span>,
                  <span style={{ color: CLR.danger }}>{fmt(p.cost)}</span>,
                  <span style={{ fontWeight: 700, color: CLR.success }}>{fmt(p.profit)}</span>,
                  <span style={{ fontWeight: 600, color: +p.margin_pct >= 20 ? CLR.success : CLR.warning }}>{p.margin_pct}%</span>,
                ])}
              />
            </Section>
          )}
        </>
      )}
    </div>
  );
}

// ─── spinner ──────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0", color: CLR.sub }}>
      <div style={{ display: "inline-block", width: 36, height: 36, border: `3px solid ${CLR.border}`, borderTopColor: CLR.primary, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: 12, fontSize: 14 }}>Loading report…</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function Reports() {
  const hook = useReports();

  const tabs = [
    { id: "daily",        label: "📅 Daily",          icon: "📅" },
    { id: "monthly",      label: "📆 Monthly",         icon: "📆" },
    { id: "bestProducts", label: "🏆 Best Products",   icon: "🏆" },
    { id: "profit",       label: "📈 Profit",          icon: "📈" },
  ];

  return (
    <div style={{ padding: "24px 28px", background: CLR.bg, minHeight: "100vh" }}>
      {/* page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: CLR.text }}>📊 Reports</h1>
        <p style={{ margin: "4px 0 0", color: CLR.sub, fontSize: 14 }}>Sales analytics and business insights</p>
      </div>

      {/* tab bar */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, background: CLR.white, borderRadius: 12, overflow: "hidden", border: `1px solid ${CLR.border}`, width: "fit-content", boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => hook.setActiveTab(t.id)}
            style={{
              padding: "12px 22px",
              background: hook.activeTab === t.id ? CLR.primary : "transparent",
              color: hook.activeTab === t.id ? "#fff" : CLR.sub,
              border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14,
              transition: "background .2s, color .2s",
              borderRight: `1px solid ${CLR.border}`,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* error banner */}
      {hook.error && (
        <div style={{ background: "#fce4ec", border: "1px solid #ef9a9a", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: CLR.danger, fontWeight: 600 }}>
          ⚠️ {hook.error}
        </div>
      )}

      {/* tab content */}
      {hook.activeTab === "daily" && (
        <DailyTab
          dailyDate={hook.dailyDate} setDailyDate={hook.setDailyDate}
          dailyData={hook.dailyData} loading={hook.loading}
        />
      )}
      {hook.activeTab === "monthly" && (
        <MonthlyTab
          monthlyYear={hook.monthlyYear} setMonthlyYear={hook.setMonthlyYear}
          monthlyMonth={hook.monthlyMonth} setMonthlyMonth={hook.setMonthlyMonth}
          monthlyData={hook.monthlyData} loading={hook.loading}
        />
      )}
      {hook.activeTab === "bestProducts" && (
        <BestProductsTab
          bpFrom={hook.bpFrom} setBpFrom={hook.setBpFrom}
          bpTo={hook.bpTo} setBpTo={hook.setBpTo}
          bpSortBy={hook.bpSortBy} setBpSortBy={hook.setBpSortBy}
          bpData={hook.bpData} loading={hook.loading}
        />
      )}
      {hook.activeTab === "profit" && (
        <ProfitTab
          profitFrom={hook.profitFrom} setProfitFrom={hook.setProfitFrom}
          profitTo={hook.profitTo} setProfitTo={hook.setProfitTo}
          profitData={hook.profitData} loading={hook.loading}
        />
      )}
    </div>
  );
}
