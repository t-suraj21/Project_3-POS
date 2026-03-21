import { useState } from "react";
import useReports from "../../../hooks/useReports";
const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (n) => Number(n || 0).toLocaleString("en-IN");
// Design tokens
const T = {
  bg:      "#f0f2f5",
  white:   "#fff",
  border:  "#e8eaf0",
  text:    "#1a1a2e",
  sub:     "#64748b",
  primary: "#4f46e5",
  green:   "#16a34a",
  amber:   "#d97706",
  red:     "#dc2626",
  blue:    "#2563eb",
  purple:  "#7c3aed",
};
// Reusable sub-components
function Card({ children, style }) {
  return (
    <div style={{
      background: T.white, borderRadius: 14, border: `1px solid ${T.border}`,
      boxShadow: "0 2px 10px rgba(0,0,0,.05)", padding: "20px 24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
        <span>{icon}</span>{title}
      </h2>
      {sub && <p style={{ margin: "3px 0 0", color: T.sub, fontSize: 13 }}>{sub}</p>}
    </div>
  );
}

function MetricCard({ label, value, sub, accent = T.primary, icon }) {
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`, borderRadius: 12,
      borderTop: `3px solid ${accent}`, padding: "16px 18px", flex: "1 1 160px",
      boxShadow: "0 1px 6px rgba(0,0,0,.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p style={{ margin: 0, color: T.sub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: .6 }}>{label}</p>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ margin: "4px 0 0", color: T.sub, fontSize: 12 }}>{sub}</p>}
    </div>
  );
}

function PayModeChip({ label, amount, orders, color, bgColor }) {
  return (
    <div style={{
      background: bgColor, borderRadius: 10, padding: "12px 16px",
      flex: "1 1 130px", border: `1px solid ${T.border}`,
    }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: .5 }}>{label}</p>
      <p style={{ margin: "6px 0 2px", fontSize: 18, fontWeight: 800, color: T.text }}>{money(amount)}</p>
      <p style={{ margin: 0, fontSize: 12, color: T.sub }}>{num(orders)} order{orders !== 1 ? "s" : ""}</p>
    </div>
  );
}

function SimpleTable({ heads, rows, emptyMsg = "No data available" }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: T.sub }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
        <p style={{ margin: 0, fontWeight: 600 }}>{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {heads.map((h, i) => (
              <th key={i} style={{
                padding: "10px 14px", background: "#f8fafc", textAlign: "left",
                color: T.sub, fontWeight: 700, borderBottom: `2px solid ${T.border}`,
                whiteSpace: "nowrap", fontSize: 12, textTransform: "uppercase", letterSpacing: .4,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}
              style={{ background: i % 2 === 0 ? T.white : "#fafbff" }}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}`, color: T.text }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mini bar chart for the current-month daily revenue
function DailyBarChart({ bars }) {
  if (!bars || bars.length === 0) return null;
  const maxRev = Math.max(...bars.map(b => b.revenue), 1);
  const today = new Date().getDate();
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80, padding: "0 4px", marginTop: 12 }}>
      {bars.map((b) => {
        const h = Math.max((b.revenue / maxRev) * 100, b.revenue > 0 ? 5 : 0);
        const isToday = b.day === today;
        return (
          <div key={b.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}
            title={`Day ${b.day}: ${money(b.revenue)} (${b.orders} orders)`}>
            <div style={{
              width: "80%", height: `${h}%`, minHeight: h > 0 ? 3 : 0,
              background: isToday ? T.primary : "#a5b4fc",
              borderRadius: "3px 3px 0 0", opacity: .9,
            }} />
            {(b.day % 5 === 1 || b.day === today) && (
              <span style={{ fontSize: 8, color: T.sub, marginTop: 2, fontWeight: isToday ? 800 : 400 }}>{b.day}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Stock status badge
function StockBadge({ stock, alertStock }) {
  if (stock === 0) return (
    <span style={{ background: "#fef2f2", color: T.red, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
      Out of Stock
    </span>
  );
  if (stock <= alertStock) return (
    <span style={{ background: "#fffbeb", color: T.amber, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
      Low Stock
    </span>
  );
  return (
    <span style={{ background: "#f0fdf4", color: T.green, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
      OK
    </span>
  );
}
// COLLECTION SECTION
const PERIOD_TABS = [
  { key: "today", label: "📅 Today" },
  { key: "week",  label: "📆 This Week" },
  { key: "month", label: "🗓️ This Month" },
  { key: "year",  label: "📊 This Year" },
];

function CollectionSection({ collection, dailyBar }) {
  const [period, setPeriod] = useState("today");
  const d = collection?.[period];

  return (
    <Card style={{ marginBottom: 24 }}>
      <SectionTitle icon="💰" title="Collection Summary" sub="Revenue collected by time period (excluding refunds)" />

      {/* Period tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 22, background: "#f1f5f9", borderRadius: 10, padding: 4, width: "fit-content", flexWrap: "wrap" }}>
        {PERIOD_TABS.map(t => (
          <button key={t.key} onClick={() => setPeriod(t.key)}
            style={{
              padding: "8px 18px", border: "none", borderRadius: 8, cursor: "pointer",
              background: period === t.key ? T.primary : "transparent",
              color: period === t.key ? "#fff" : T.sub,
              fontWeight: 700, fontSize: 13,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {d && (
        <>
          {/* Main metrics */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
            <MetricCard label="Total Orders"   value={num(d.total_orders)}    icon="🛒" accent={T.primary} />
            <MetricCard label="Total Revenue"  value={money(d.total_revenue)}  icon="💵" accent={T.green}
              sub={`Collected: ${money(d.total_collected)}`} />
            <MetricCard label="Balance Due"    value={money(d.total_balance)}  icon="⏳" accent={T.amber}
              sub={`${num(d.pending_orders)} orders pending`} />
            <MetricCard label="Discount Given" value={money(d.total_discount)} icon="🏷️" accent={T.purple} />
            <MetricCard label="Completed"      value={num(d.completed_orders)} icon="✅" accent={T.green} />
          </div>

          {/* Payment mode breakdown */}
          <div style={{ marginBottom: period === "month" ? 0 : 0 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: .5 }}>
              💳 Payment Mode Breakdown
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <PayModeChip label="Cash"   amount={d.cash}   orders={d.cash_orders}   color="#166534" bgColor="#f0fdf4" />
              <PayModeChip label="UPI"    amount={d.upi}    orders={d.upi_orders}    color="#1e40af" bgColor="#eff6ff" />
              <PayModeChip label="Card"   amount={d.card}   orders={d.card_orders}   color="#5b21b6" bgColor="#faf5ff" />
              <PayModeChip label="Credit" amount={d.credit} orders={d.credit_orders} color="#9a3412" bgColor="#fff7ed" />
            </div>
          </div>

          {/* Month chart */}
          {period === "month" && dailyBar && (
            <div style={{ marginTop: 22 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: .5 }}>
                📈 Daily Revenue — {new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}
              </p>
              <DailyBarChart bars={dailyBar} />
            </div>
          )}
        </>
      )}
    </Card>
  );
}
// TOP PRODUCTS SECTION
function TopProductsSection({ topByQty, topByRevenue }) {
  const [sortBy, setSortBy] = useState("qty");
  const list = sortBy === "qty" ? (topByQty || []) : (topByRevenue || []);
  const maxVal = Math.max(...list.map(p => sortBy === "qty" ? p.units_sold : p.total_revenue), 1);

  return (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <SectionTitle icon="🏆" title="Top Selling Products"
          sub="Best performing products by quantity and revenue (all time)" />
        <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button onClick={() => setSortBy("qty")}
            style={{ padding: "7px 16px", border: "none", cursor: "pointer", background: sortBy === "qty" ? T.primary : T.white, color: sortBy === "qty" ? "#fff" : T.sub, fontWeight: 700, fontSize: 13 }}>
            By Units
          </button>
          <button onClick={() => setSortBy("revenue")}
            style={{ padding: "7px 16px", border: "none", cursor: "pointer", background: sortBy === "revenue" ? T.primary : T.white, color: sortBy === "revenue" ? "#fff" : T.sub, fontWeight: 700, fontSize: 13 }}>
            By Revenue
          </button>
        </div>
      </div>

      <SimpleTable
        emptyMsg="No sales recorded yet"
        heads={["#", "Product", "Category", "Price", "Units Sold", "Orders", "Revenue", "Stock", "Bar"]}
        rows={list.slice(0, 15).map((p, i) => {
          const barVal = sortBy === "qty" ? p.units_sold : p.total_revenue;
          const barPct = Math.round((barVal / maxVal) * 100);
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span style={{ color: T.sub, fontWeight: 700 }}>#{i + 1}</span>;
          return [
            medal,
            <span style={{ fontWeight: 700, color: T.text }}>{p.name}</span>,
            <span style={{ color: T.sub, fontSize: 12 }}>{p.category_name}</span>,
            money(p.sell_price),
            <span style={{ fontWeight: 700, color: T.green }}>{num(p.units_sold)}</span>,
            num(p.order_count),
            <span style={{ fontWeight: 700, color: T.primary }}>{money(p.total_revenue)}</span>,
            <span style={{ fontWeight: 600, color: p.stock === 0 ? T.red : p.stock <= 5 ? T.amber : T.green }}>{p.stock}</span>,
            <div style={{ width: 120, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barPct}%`, background: sortBy === "qty" ? T.green : T.primary, borderRadius: 4 }} />
            </div>,
          ];
        })}
      />
    </Card>
  );
}
// LOW STOCK SECTION
function LowStockSection({ lowStock, outOfStockCount, lowStockCount }) {
  const [filter, setFilter] = useState("all");
  const list = (lowStock || []).filter(p =>
    filter === "all"        ? true :
    filter === "out"        ? p.stock === 0 :
    /* low */                 p.stock > 0
  );

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <SectionTitle icon="⚠️" title="Stock Report"
            sub="Products that need restocking" />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ background: "#fef2f2", color: T.red, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              🔴 Out of Stock: {num(outOfStockCount)}
            </span>
            <span style={{ background: "#fffbeb", color: T.amber, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
              🟡 Low Stock: {num(lowStockCount)}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}`, flexShrink: 0 }}>
          {[["all","All"], ["out","Out of Stock"], ["low","Low Stock"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ padding: "7px 14px", border: "none", cursor: "pointer", background: filter === v ? T.red : T.white, color: filter === v ? "#fff" : T.sub, fontWeight: 700, fontSize: 12 }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <SimpleTable
        emptyMsg="✅ All products are well stocked!"
        heads={["Product", "SKU", "Category", "Cost Price", "Sell Price", "Current Stock", "Alert At", "Status"]}
        rows={list.map(p => [
          <span style={{ fontWeight: 700, color: T.text }}>{p.name}</span>,
          <span style={{ color: T.sub, fontSize: 12, fontFamily: "monospace" }}>{p.sku || "—"}</span>,
          <span style={{ color: T.sub, fontSize: 12 }}>{p.category_name}</span>,
          money(p.cost_price),
          money(p.sell_price),
          <span style={{
            fontWeight: 800, fontSize: 16,
            color: p.stock === 0 ? T.red : T.amber,
          }}>{p.stock}</span>,
          <span style={{ color: T.sub }}>{p.alert_stock}</span>,
          <StockBadge stock={p.stock} alertStock={p.alert_stock} />,
        ])}
      />
    </Card>
  );
}
// DATE-RANGE REPORT SECTION
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const PRESETS = [
  { label: "Today",       getDates: () => { const t = localToday(); return [t, t]; } },
  { label: "Yesterday",   getDates: () => { const d = new Date(); d.setDate(d.getDate() - 1); const s = d.toISOString().slice(0,10); return [s, s]; } },
  { label: "Last 7 Days", getDates: () => { const t = localToday(); const d = new Date(); d.setDate(d.getDate() - 6); return [d.toISOString().slice(0,10), t]; } },
  { label: "Last 30 Days",getDates: () => { const t = localToday(); const d = new Date(); d.setDate(d.getDate() - 29); return [d.toISOString().slice(0,10), t]; } },
  { label: "This Month",  getDates: () => { const d = new Date(); return [`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`, localToday()]; } },
  { label: "Last Month",  getDates: () => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-1); const y = d.getFullYear(), m = d.getMonth()+1; const last = new Date(y, m, 0).getDate(); return [`${y}-${String(m).padStart(2,"0")}-01`, `${y}-${String(m).padStart(2,"0")}-${String(last).padStart(2,"0")}`]; } },
];

const STATUS_COLORS = {
  paid:     { bg: "#f0fdf4", color: "#166534" },
  partial:  { bg: "#fefce8", color: "#854d0e" },
  credit:   { bg: "#fff7ed", color: "#9a3412" },
  refunded: { bg: "#fef2f2", color: "#dc2626" },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569" };
  return <span style={{ ...c, padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: "capitalize" }}>{status}</span>;
}

function DateRangeSection({ drFrom, setDrFrom, drTo, setDrTo, drData, drLoading, drError, fetchDateRange }) {
  const [activePreset, setActivePreset] = useState(null);

  const applyPreset = (preset, idx) => {
    const [f, t] = preset.getDates();
    setDrFrom(f);
    setDrTo(t);
    setActivePreset(idx);
  };

  const handleSearch = () => {
    fetchDateRange(drFrom, drTo);
    setActivePreset(null);
  };

  const s = drData?.summary;
  const daily = drData?.daily || [];
  const topProds = drData?.top_products || [];
  const orders = drData?.orders || [];
  const maxBarRev = Math.max(...daily.map(d => d.revenue), 1);
  const maxProdUnits = Math.max(...topProds.map(p => p.units_sold), 1);

  return (
    <Card style={{ marginBottom: 24 }}>
      <SectionTitle icon="📅" title="Custom Date Report"
        sub="Select any date or range to see detailed sales data" />

      {/* Preset chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => applyPreset(p, i)}
            style={{
              padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${activePreset === i ? T.primary : T.border}`,
              background: activePreset === i ? T.primary : T.white,
              color: activePreset === i ? "#fff" : T.sub,
              fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Date pickers + Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: T.sub }}>From</label>
          <input type="date" value={drFrom} max={localToday()}
            onChange={e => { setDrFrom(e.target.value); setActivePreset(null); }}
            style={{ padding: "8px 12px", border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 14, color: T.text, fontWeight: 600, outline: "none" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: T.sub }}>To</label>
          <input type="date" value={drTo} max={localToday()}
            onChange={e => { setDrTo(e.target.value); setActivePreset(null); }}
            style={{ padding: "8px 12px", border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 14, color: T.text, fontWeight: 600, outline: "none" }} />
        </div>
        <button onClick={handleSearch} disabled={drLoading}
          style={{
            padding: "9px 22px", background: T.primary, color: "#fff", border: "none", borderRadius: 8,
            fontWeight: 700, fontSize: 14, cursor: drLoading ? "not-allowed" : "pointer",
            opacity: drLoading ? .7 : 1, boxShadow: "0 2px 8px rgba(79,70,229,.3)",
          }}>
          {drLoading ? "Loading…" : "🔍 Generate Report"}
        </button>
      </div>

      {/* Error */}
      {drError && (
        <div style={{ background: "#fef2f2", border: `1px solid #fecaca`, borderRadius: 8, padding: "10px 14px", color: T.red, fontWeight: 600, marginBottom: 16 }}>
          ⚠️ {drError}
        </div>
      )}

      {/* Loading spinner */}
      {drLoading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: T.sub }}>
          <div style={{ fontSize: "1.5rem" }}>⏳</div>
          <p style={{ marginTop: 10, fontWeight: 600 }}>Fetching report…</p>
        </div>
      )}

      {/* Results */}
      {!drLoading && drData && s && (
        <>
          {/* Range label */}
          <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <span style={{ fontWeight: 700, color: T.primary, fontSize: 14 }}>
              Report for: {drData.from} → {drData.to}
            </span>
            <span style={{ color: T.sub, fontSize: 13 }}>({num(s.total_orders)} orders)</span>
          </div>

          {/* Summary metric cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
            <MetricCard label="Total Orders"    value={num(s.total_orders)}    icon="🛒" accent={T.primary} />
            <MetricCard label="Total Revenue"   value={money(s.total_revenue)}  icon="💵" accent={T.green}
              sub={`Collected: ${money(s.total_collected)}`} />
            <MetricCard label="Balance Due"     value={money(s.total_balance)}  icon="⏳" accent={T.amber}
              sub={`${num(s.pending_orders)} pending`} />
            <MetricCard label="Discount Given"  value={money(s.total_discount)} icon="🏷️" accent={T.purple} />
            <MetricCard label="Tax Collected"   value={money(s.total_tax)}      icon="📋" accent={T.sub} />
          </div>

          {/* Payment mode cards */}
          <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: .5 }}>
            💳 Payment Mode Breakdown
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            <PayModeChip label="Cash"   amount={s.cash}   orders={s.cash_orders}   color="#166534" bgColor="#f0fdf4" />
            <PayModeChip label="UPI"    amount={s.upi}    orders={s.upi_orders}    color="#1e40af" bgColor="#eff6ff" />
            <PayModeChip label="Card"   amount={s.card}   orders={s.card_orders}   color="#5b21b6" bgColor="#faf5ff" />
            <PayModeChip label="Credit" amount={s.credit} orders={s.credit_orders} color="#9a3412" bgColor="#fff7ed" />
          </div>

          {/* Day-by-day bar chart + table */}
          {daily.length > 0 && (
            <>
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: .5 }}>
                📈 Day-by-Day Breakdown
              </p>

              {/* Bar chart */}
              {daily.length > 1 && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, padding: "0 4px", marginBottom: 16, background: "#f8fafc", borderRadius: 10, paddingTop: 10 }}>
                  {daily.map((d, i) => {
                    const h = Math.max((d.revenue / maxBarRev) * 100, d.revenue > 0 ? 5 : 0);
                    const dayLabel = new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}
                        title={`${d.date}: ${money(d.revenue)} (${d.orders} orders)`}>
                        <div style={{ width: "70%", height: `${h}%`, minHeight: h > 0 ? 4 : 0, background: T.primary, borderRadius: "3px 3px 0 0", opacity: .85 }} />
                        {(daily.length <= 10 || i % Math.ceil(daily.length / 10) === 0) && (
                          <span style={{ fontSize: 8, color: T.sub, marginTop: 2, whiteSpace: "nowrap" }}>{dayLabel}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table */}
              <SimpleTable
                heads={["Date", "Day", "Orders", "Revenue", "Collected"]}
                emptyMsg="No orders in this range"
                rows={daily.map(d => {
                  const dateObj = new Date(d.date);
                  return [
                    <span style={{ fontWeight: 700, color: T.primary }}>{d.date}</span>,
                    dateObj.toLocaleDateString("en-IN", { weekday: "short" }),
                    d.orders > 0
                      ? <span style={{ fontWeight: 700 }}>{num(d.orders)}</span>
                      : <span style={{ color: "#cbd5e1" }}>—</span>,
                    d.revenue > 0
                      ? <span style={{ fontWeight: 700, color: T.green }}>{money(d.revenue)}</span>
                      : <span style={{ color: "#cbd5e1" }}>—</span>,
                    d.collected > 0 ? money(d.collected) : <span style={{ color: "#cbd5e1" }}>—</span>,
                  ];
                })}
              />
            </>
          )}

          {/* Top products in range */}
          {topProds.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: .5 }}>
                🏆 Top Products in This Period
              </p>
              <SimpleTable
                heads={["#", "Product", "Category", "Units Sold", "Orders", "Revenue", "Bar"]}
                rows={topProds.map((p, i) => {
                  const pct = Math.round((p.units_sold / maxProdUnits) * 100);
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span style={{ color: T.sub, fontWeight: 700 }}>#{i+1}</span>;
                  return [
                    medal,
                    <span style={{ fontWeight: 700 }}>{p.name}</span>,
                    <span style={{ color: T.sub, fontSize: 12 }}>{p.category_name}</span>,
                    <span style={{ fontWeight: 700, color: T.green }}>{num(p.units_sold)}</span>,
                    num(p.order_count),
                    <span style={{ fontWeight: 700, color: T.primary }}>{money(p.total_revenue)}</span>,
                    <div style={{ width: 100, height: 7, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: T.green, borderRadius: 4 }} />
                    </div>,
                  ];
                })}
              />
            </div>
          )}

          {/* Orders list */}
          {orders.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: T.sub, textTransform: "uppercase", letterSpacing: .5 }}>
                🧾 All Orders ({num(orders.length)}{orders.length === 200 ? "+" : ""})
              </p>
              <SimpleTable
                heads={["Bill #", "Customer", "Items", "Total", "Paid", "Mode", "Status", "Date & Time"]}
                rows={orders.map(o => [
                  <span style={{ fontWeight: 700, color: T.primary, fontSize: 12 }}>{o.bill_number}</span>,
                  <span style={{ fontWeight: 600 }}>{o.customer_name}</span>,
                  num(o.item_count),
                  <span style={{ fontWeight: 700 }}>{money(o.total_amount)}</span>,
                  money(o.paid_amount),
                  <span style={{ textTransform: "capitalize", fontSize: 12, fontWeight: 600 }}>{o.payment_mode}</span>,
                  <StatusBadge status={o.status} />,
                  <span style={{ fontSize: 12, color: T.sub }}>
                    {new Date(o.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>,
                ])}
              />
            </div>
          )}

          {/* No data state */}
          {s.total_orders === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: T.sub }}>
              <div style={{ fontSize: 40 }}>📭</div>
              <p style={{ marginTop: 10, fontWeight: 700 }}>No orders found for this date range</p>
              <p style={{ margin: "4px 0 0", fontSize: 13 }}>Try selecting a different period</p>
            </div>
          )}
        </>
      )}

      {/* Empty state before first search */}
      {!drLoading && !drData && !drError && (
        <div style={{ textAlign: "center", padding: "36px 0", color: T.sub }}>
          <div style={{ fontSize: 40 }}>📅</div>
          <p style={{ marginTop: 10, fontWeight: 700 }}>Select a date range above and click Generate Report</p>
        </div>
      )}
    </Card>
  );
}
// MAIN
export default function Reports() {
  const {
    data, loading, error, refresh,
    drFrom, setDrFrom, drTo, setDrTo,
    drData, drLoading, drError, fetchDateRange,
  } = useReports();

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: T.sub }}>
      <div style={{ fontSize: "2rem" }}>⏳</div>
      <p style={{ marginTop: 14, fontWeight: 600 }}>Loading reports…</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <p style={{ color: T.red, fontWeight: 700, marginBottom: 12 }}>⚠️ {error}</p>
      <button onClick={refresh} style={{ background: T.primary, color: "#fff", border: "none", padding: "9px 24px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
        Retry
      </button>
    </div>
  );

  return (
    <div style={{ padding: "24px 28px", background: T.bg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: T.text }}>📊 Reports</h1>
          <p style={{ margin: "4px 0 0", color: T.sub, fontSize: 14 }}>
            Sales performance, top products &amp; stock status
            {data?.generated_at && (
              <span style={{ marginLeft: 12, fontSize: 12, color: "#94a3b8" }}>
                Last updated: {new Date(data.generated_at).toLocaleTimeString("en-IN")}
              </span>
            )}
          </p>
        </div>
        <button onClick={refresh}
          style={{ background: T.primary, color: "#fff", border: "none", padding: "9px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, boxShadow: "0 2px 8px rgba(79,70,229,.3)" }}>
          ↺ Refresh
        </button>
      </div>

      {/* 1. Custom Date Range Report */}
      <DateRangeSection
        drFrom={drFrom} setDrFrom={setDrFrom}
        drTo={drTo} setDrTo={setDrTo}
        drData={drData} drLoading={drLoading}
        drError={drError} fetchDateRange={fetchDateRange}
      />

      {/* 2. Collection Summary */}
      <CollectionSection collection={data?.collection} dailyBar={data?.daily_bar} />

      {/* 3. Top Selling Products */}
      <TopProductsSection topByQty={data?.top_by_qty} topByRevenue={data?.top_by_revenue} />

      {/* 4. Low Stock / Stock Report */}
      <LowStockSection
        lowStock={data?.low_stock}
        outOfStockCount={data?.out_of_stock_count ?? 0}
        lowStockCount={data?.low_stock_count ?? 0}
      />

    </div>
  );
}
