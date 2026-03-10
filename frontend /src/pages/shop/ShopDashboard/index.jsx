import { Link, useParams } from "react-router-dom";
import { useShopDashboard } from "../../../hooks/useShopDashboard";
import s from "./styles";

// ── formatters ────────────────────────────────────────────────────────────────
const fmtShort = (n) => `₹ ${Number(n ?? 0).toLocaleString("en-IN")}`;
const num      = (n) => Number(n ?? 0).toLocaleString("en-IN");
const fmtDT    = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

// ── Overview cards ────────────────────────────────────────────────────────────
const OVERVIEW_CARDS = [
  { key: "total_products",   label: "Total Products",   icon: "📦", bg: "#ede9fe", color: "#7c3aed", path: "products"              },
  { key: "total_categories", label: "Categories",       icon: "🗂️", bg: "#dbeafe", color: "#2563eb", path: "categories"            },
  { key: "total_customers",  label: "Customers Served", icon: "👥", bg: "#d1fae5", color: "#059669", path: "orders"                },
  { key: "credit_customers", label: "Credit Accounts",  icon: "💳", bg: "#fce7f3", color: "#be185d", path: "accounts"              },
  { key: "low_stock",        label: "Low Stock Alerts", icon: "⚠️", bg: "#fef3c7", color: "#d97706", path: "products?low_stock=1"  },
];

// ── Business summary cards ────────────────────────────────────────────────────
const SUMMARY_CARDS = [
  { key: "sales_all_time",    label: "Total Orders (All Time)",  icon: "🧾", bg: "#f0fdf4", iconBg: "#bbf7d0", color: "#15803d", path: "orders",          isMoney: false },
  { key: "revenue_all_time",  label: "Total Revenue (All Time)", icon: "💰", bg: "#fffbeb", iconBg: "#fde68a", color: "#b45309", path: "reports", isMoney: true  },
  { key: "refunded_count",    label: "Refunded Orders",          icon: "↩️", bg: "#fff1f2", iconBg: "#fecdd3", color: "#be123c", path: "orders",          isMoney: false },
  { key: "outstanding_credit",label: "Outstanding Credit",       icon: "📋", bg: "#fff7ed", iconBg: "#fed7aa", color: "#c2410c", path: "accounts",         isMoney: true  },
];

// ── Sales period cards ────────────────────────────────────────────────────────
const SALES_PERIODS = [
  { key: "sales_today", label: "Today"      },
  { key: "sales_week",  label: "This Week"  },
  { key: "sales_month", label: "This Month" },
];

// ── Revenue period cards ──────────────────────────────────────────────────────
const REVENUE_PERIODS = [
  { key: "revenue_today", label: "Today"      },
  { key: "revenue_week",  label: "This Week"  },
  { key: "revenue_month", label: "This Month" },
  { key: "revenue_year",  label: "This Year"  },
];

// ── Payment mode styling ──────────────────────────────────────────────────────
const MODE_STYLE = {
  cash:   { bg: "#d1fae5", color: "#065f46", bar: "#10b981" },
  upi:    { bg: "#dbeafe", color: "#1e40af", bar: "#3b82f6" },
  card:   { bg: "#ede9fe", color: "#5b21b6", bar: "#8b5cf6" },
  credit: { bg: "#fff7ed", color: "#c2410c", bar: "#f97316" },
  online: { bg: "#e0f2fe", color: "#0369a1", bar: "#0ea5e9" },
};

const STATUS_MAP = {
  paid:     { bg: "#d1fae5", color: "#065f46", label: "Paid"     },
  partial:  { bg: "#fef9c3", color: "#854d0e", label: "Partial"  },
  credit:   { bg: "#fff7ed", color: "#c2410c", label: "Credit"   },
  refunded: { bg: "#fee2e2", color: "#991b1b", label: "Refunded" },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_MAP[status] || { bg: "#f1f5f9", color: "#475569", label: status };
  return <span style={{ background: c.bg, color: c.color, fontSize: "0.68rem", fontWeight: 700, padding: "0.18rem 0.55rem", borderRadius: "999px" }}>{c.label}</span>;
};
const ModeBadge = ({ mode }) => {
  const c = MODE_STYLE[mode] || { bg: "#f1f5f9", color: "#475569" };
  return <span style={{ background: c.bg, color: c.color, fontSize: "0.68rem", fontWeight: 700, padding: "0.18rem 0.55rem", borderRadius: "999px", textTransform: "uppercase" }}>{mode || "cash"}</span>;
};

const ShopDashboard = () => {
  const { stats, loading, error, refresh } = useShopDashboard();
  const { id } = useParams();
  const base = `/shop/${id}`;

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) return (
    <div style={{ ...s.page, paddingTop: "3rem", textAlign: "center" }}>
      <div style={{ color: "#6366f1", fontSize: "2rem", marginBottom: "0.75rem" }}>⏳</div>
      <p style={{ color: "#94a3b8", fontWeight: 500 }}>Loading dashboard…</p>
    </div>
  );
  if (error) return (
    <div style={{ ...s.page, paddingTop: "3rem", textAlign: "center" }}>
      <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>
      <button onClick={refresh} style={{ background: "#4f46e5", color: "#fff", border: "none", padding: "0.5rem 1.5rem", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Retry</button>
    </div>
  );

  const maxPayRevenue = Math.max(1, ...(stats?.payment_breakdown || []).map(p => parseFloat(p.total_revenue || 0)));

  return (
    <div style={s.page}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={s.hero}>
        <div>
          <h1 style={s.heroTitle}>Welcome back! 👋</h1>
          <p style={s.heroSub}>Here's what's happening in your shop today.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={refresh} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", padding: "0.45rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>↺ Refresh</button>
          <div style={s.heroBadge}>📅 {today}</div>
        </div>
        <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "60px", bottom: "-50px", width: "110px", height: "110px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      </div>

      {/* ── Overview ─────────────────────────────────────────── */}
      <div style={s.sectionLabel}><span>Overview</span><span style={s.sectionDivider} /></div>
      <div style={{ ...s.statsGrid, gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", marginBottom: "2rem" }}>
        {OVERVIEW_CARDS.map(({ key, label, icon, bg, color, path }) => (
          <Link key={key} to={`${base}/${path}`} style={{ textDecoration: "none" }}>
            <div style={{ ...s.statCard, cursor: "pointer" }}>
              <div style={{ ...s.statIcon, background: bg, color }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <p style={s.statLabel}>{label}</p>
                <p style={s.statValue}>{num(stats?.[key])}</p>
              </div>
              <span style={{ fontSize: "0.7rem", color: "#9ca3af" }}>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Business Summary ──────────────────────────────────── */}
      <div style={s.sectionLabel}><span>Business Summary</span><span style={s.sectionDivider} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {SUMMARY_CARDS.map(({ key, label, icon, bg, iconBg, color, path, isMoney }) => (
          <Link key={key} to={`${base}/${path}`} style={{ textDecoration: "none" }}>
            <div style={{ background: bg, borderRadius: "14px", padding: "1.1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem", border: "1.5px solid rgba(0,0,0,0.06)", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ background: iconBg, borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{icon}</span>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              </div>
              <p style={{ margin: 0, fontSize: "1.55rem", fontWeight: 800, color, letterSpacing: "-0.02em" }}>
                {isMoney ? fmtShort(stats?.[key]) : num(stats?.[key])}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Total Sales ───────────────────────────────────────── */}
      <div style={s.sectionLabel}>
        <span>Total Sales</span><span style={s.sectionDivider} />
        <Link to={`${base}/orders`} style={{ fontSize: "0.7rem", color: "#4f46e5", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>View all →</Link>
      </div>
      <div style={s.periodGrid}>
        {SALES_PERIODS.map(({ key, label }) => (
          <Link key={key} to={`${base}/orders`} style={{ textDecoration: "none" }}>
            <div style={{ ...s.periodCard, borderTop: "3px solid #10b981", cursor: "pointer" }}>
              <p style={s.periodPeriod}>{label}</p>
              <p style={{ ...s.periodValue, color: "#059669" }}>{num(stats?.[key])}</p>
              <p style={s.periodSub}>orders</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Revenue ───────────────────────────────────────────── */}
      <div style={s.sectionLabel}>
        <span>Revenue</span><span style={s.sectionDivider} />
        <Link to={`${base}/reports`} style={{ fontSize: "0.7rem", color: "#4f46e5", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>View reports →</Link>
      </div>
      <div style={s.periodGrid}>
        {REVENUE_PERIODS.map(({ key, label }) => (
          <Link key={key} to={`${base}/reports`} style={{ textDecoration: "none" }}>
            <div style={{ ...s.periodCard, borderTop: "3px solid #4f46e5", cursor: "pointer" }}>
              <p style={s.periodPeriod}>{label}</p>
              <p style={{ ...s.periodValue, color: "#4f46e5" }}>{fmtShort(stats?.[key])}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Payment Breakdown ────────────────────────────────── */}
      {stats?.payment_breakdown?.length > 0 && (
        <>
          <div style={s.sectionLabel}>
            <span>Payment Breakdown</span><span style={s.sectionDivider} />
            <span style={{ fontSize: "0.68rem", color: "#9ca3af" }}>all-time · excl. refunds</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "0.85rem", marginBottom: "2rem" }}>
            {stats.payment_breakdown.map((row) => {
              const ms  = MODE_STYLE[row.payment_mode] || { bg: "#f1f5f9", color: "#475569", bar: "#94a3b8" };
              const pct = Math.round((parseFloat(row.total_revenue) / maxPayRevenue) * 100);
              return (
                <div key={row.payment_mode} style={{ background: ms.bg, borderRadius: "12px", padding: "0.9rem 1rem", border: `1.5px solid ${ms.bar}40` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.83rem", color: ms.color, textTransform: "uppercase" }}>{row.payment_mode}</span>
                    <span style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600 }}>{num(row.order_count)} orders</span>
                  </div>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "1.15rem", fontWeight: 800, color: ms.color }}>{fmtShort(row.total_revenue)}</p>
                  <div style={{ background: "rgba(0,0,0,0.08)", borderRadius: "999px", height: "5px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: ms.bar, borderRadius: "999px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Top Selling Products ─────────────────────────────── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTitle}>🏆 Top Selling Products</span>
          <Link to={`${base}/products`} style={{ fontSize: "0.8rem", color: "#4f46e5", textDecoration: "none", fontWeight: 700 }}>All products →</Link>
        </div>
        {!stats?.top_products?.length ? (
          <p style={s.emptyRow}>No sales recorded yet.</p>
        ) : (
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>#</th>
              <th style={s.th}>Product</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Sell Price</th>
              <th style={s.th}>Units Sold</th>
              <th style={s.th}>Revenue</th>
              <th style={s.th}>Stock</th>
            </tr></thead>
            <tbody>
              {stats.top_products.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ ...s.td, color: "#9ca3af", fontWeight: 700, fontSize: "0.8rem" }}>#{i + 1}</td>
                  <td style={s.td}>
                    <Link to={`${base}/edit-product/${p.id}`} style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>{p.name}</Link>
                    {p.sku ? <span style={{ color: "#9ca3af", fontSize: "0.75rem", marginLeft: "0.3rem" }}>#{p.sku}</span> : null}
                  </td>
                  <td style={s.td}>{p.category_name || "—"}</td>
                  <td style={s.td}>{fmtShort(p.sell_price)}</td>
                  <td style={{ ...s.td, fontWeight: 700, color: "#059669" }}>{num(p.units_sold)}</td>
                  <td style={{ ...s.td, fontWeight: 700 }}>{fmtShort(p.total_revenue)}</td>
                  <td style={s.td}><span style={s.badge(parseInt(p.stock) === 0)}>{parseInt(p.stock) === 0 ? "Out of stock" : p.stock}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Recent Transactions ──────────────────────────────── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTitle}>🕐 Recent Transactions</span>
          <Link to={`${base}/orders`} style={{ fontSize: "0.8rem", color: "#4f46e5", textDecoration: "none", fontWeight: 700 }}>View all →</Link>
        </div>
        {!stats?.recent_sales?.length ? (
          <p style={s.emptyRow}>No transactions yet.</p>
        ) : (
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>Bill No.</th>
              <th style={s.th}>Customer</th>
              <th style={s.th}>Amount</th>
              <th style={s.th}>Paid</th>
              <th style={s.th}>Mode</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Date &amp; Time</th>
            </tr></thead>
            <tbody>
              {stats.recent_sales.map((sale) => (
                <tr key={sale.id}>
                  <td style={s.td}>
                    <Link to={`${base}/orders`} style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none", fontSize: "0.82rem" }}>
                      {sale.bill_number || `#${sale.id}`}
                    </Link>
                  </td>
                  <td style={s.td}>{sale.customer_name || "Walk-in"}</td>
                  <td style={{ ...s.td, fontWeight: 700 }}>{fmtShort(sale.total_amount)}</td>
                  <td style={s.td}>{fmtShort(sale.paid_amount)}</td>
                  <td style={s.td}><ModeBadge mode={sale.payment_mode} /></td>
                  <td style={s.td}><StatusBadge status={sale.status} /></td>
                  <td style={{ ...s.td, color: "#6b7280", fontSize: "0.78rem" }}>{fmtDT(sale.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Low Stock Alerts ─────────────────────────────────── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTitle}>⚠️ Low Stock Alerts</span>
          <Link to={`${base}/products?low_stock=1`} style={{ fontSize: "0.8rem", color: "#4f46e5", textDecoration: "none", fontWeight: 700 }}>View all →</Link>
        </div>
        {!stats?.low_stock_items?.length ? (
          <p style={s.emptyRow}>🎉 All products are well stocked!</p>
        ) : (
          <table style={s.table}>
            <thead><tr>
              <th style={s.th}>Product</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Sell Price</th>
              <th style={s.th}>Stock</th>
              <th style={s.th}>Alert Level</th>
            </tr></thead>
            <tbody>
              {stats.low_stock_items.map((item) => (
                <tr key={item.id}>
                  <td style={s.td}>
                    <Link to={`${base}/edit-product/${item.id}`} style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>{item.name}</Link>
                    {item.sku ? <span style={{ color: "#9ca3af", fontSize: "0.75rem", marginLeft: "0.3rem" }}>#{item.sku}</span> : null}
                  </td>
                  <td style={s.td}>{item.category_name || "—"}</td>
                  <td style={s.td}>{fmtShort(item.sell_price)}</td>
                  <td style={s.td}><span style={s.badge(parseInt(item.stock) === 0)}>{parseInt(item.stock) === 0 ? "Out of stock" : item.stock}</span></td>
                  <td style={s.td}>{item.alert_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default ShopDashboard;
