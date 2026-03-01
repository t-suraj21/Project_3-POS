import { Link, useParams } from "react-router-dom";
import { useShopDashboard } from "../../../hooks/useShopDashboard";
import s from "./styles";

// ── Quick‑stat cards (Overview row) ──────────────────────────────────────────
const OVERVIEW_CARDS = [
  { key: "total_products",   label: "Total Products",   icon: "📦", bg: "#ede9fe", color: "#7c3aed" },
  { key: "total_categories", label: "Categories",       icon: "🗂️", bg: "#dbeafe", color: "#2563eb" },
  { key: "total_customers",  label: "Total Customers",  icon: "👥", bg: "#d1fae5", color: "#059669" },
  { key: "low_stock",        label: "Low Stock Alerts", icon: "⚠️", bg: "#fef3c7", color: "#d97706" },
];

// ── Sales period cards ────────────────────────────────────────────────────────
const SALES_PERIODS = [
  { key: "sales_today", label: "Today",       suffix: "orders" },
  { key: "sales_week",  label: "This Week",   suffix: "orders" },
  { key: "sales_month", label: "This Month",  suffix: "orders" },
];

// ── Revenue period cards ──────────────────────────────────────────────────────
const REVENUE_PERIODS = [
  { key: "revenue_today", label: "Today" },
  { key: "revenue_week",  label: "This Week" },
  { key: "revenue_month", label: "This Month" },
  { key: "revenue_year",  label: "This Year" },
];

const fmt  = (n) => `₹ ${Number(n ?? 0).toLocaleString("en-IN")}`;
const num  = (n) => Number(n ?? 0).toLocaleString("en-IN");

const ShopDashboard = () => {
  const { stats, loading, error } = useShopDashboard();
  const { id } = useParams();

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) return (
    <div style={{ ...s.page, paddingTop: "3rem", textAlign: "center" }}>
      <div style={{ color: "#6366f1", fontSize: "2rem", marginBottom: "0.75rem" }}>⏳</div>
      <p style={{ color: "#94a3b8", fontWeight: 500 }}>Loading dashboard…</p>
    </div>
  );
  if (error) return (
    <div style={{ ...s.page, paddingTop: "3rem", textAlign: "center" }}>
      <p style={{ color: "#dc2626" }}>{error}</p>
    </div>
  );

  return (
    <div style={s.page}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={s.hero}>
        <div>
          <h1 style={s.heroTitle}>Welcome back! 👋</h1>
          <p style={s.heroSub}>Here's what's happening in your shop today.</p>
        </div>
        <div style={s.heroBadge}>📅 {today}</div>
        {/* decorative circles */}
        <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "60px", bottom: "-50px", width: "110px", height: "110px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      </div>

      {/* ── Overview row ── */}
      <div style={s.sectionLabel}>
        <span>Overview</span>
        <span style={s.sectionDivider} />
      </div>
      <div style={s.statsGrid}>
        {OVERVIEW_CARDS.map(({ key, label, icon, bg, color }) => (
          <div key={key} style={s.statCard}>
            <div style={{ ...s.statIcon, background: bg, color }}>{icon}</div>
            <div>
              <p style={s.statLabel}>{label}</p>
              <p style={s.statValue}>{num(stats?.[key])}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sales row ── */}
      <div style={s.sectionLabel}>
        <span>Total Sales</span>
        <span style={s.sectionDivider} />
      </div>
      <div style={s.periodGrid}>
        {SALES_PERIODS.map(({ key, label, suffix }) => (
          <div key={key} style={{ ...s.periodCard, borderTop: "3px solid #10b981" }}>
            <p style={s.periodPeriod}>{label}</p>
            <p style={{ ...s.periodValue, color: "#059669" }}>{num(stats?.[key])}</p>
            <p style={s.periodSub}>{suffix}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue row ── */}
      <div style={s.sectionLabel}>
        <span>Revenue</span>
        <span style={s.sectionDivider} />
      </div>
      <div style={s.periodGrid}>
        {REVENUE_PERIODS.map(({ key, label }) => (
          <div key={key} style={{ ...s.periodCard, borderTop: "3px solid #4f46e5" }}>
            <p style={s.periodPeriod}>{label}</p>
            <p style={{ ...s.periodValue, color: "#4f46e5" }}>{fmt(stats?.[key])}</p>
          </div>
        ))}
      </div>

      {/* ── Low Stock table ── */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTitle}><span>⚠️</span> Low Stock Alerts</span>
          <Link
            to={`/shop/${id}/products?low_stock=1`}
            style={{ fontSize: "0.8rem", color: "#4f46e5", textDecoration: "none", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            View all →
          </Link>
        </div>

        {!stats?.low_stock_items?.length ? (
          <p style={s.emptyRow}>🎉 All products are well stocked!</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Product</th>
                <th style={s.th}>Category</th>
                <th style={s.th}>Sell Price</th>
                <th style={s.th}>Stock</th>
                <th style={s.th}>Alert Level</th>
              </tr>
            </thead>
            <tbody>
              {stats.low_stock_items.map((item) => (
                <tr key={item.id}>
                  <td style={s.td}><strong>{item.name}</strong>{item.sku ? <span style={{ color: "#9ca3af", fontSize: "0.78rem", marginLeft: "0.4rem" }}>#{item.sku}</span> : null}</td>
                  <td style={s.td}>{item.category_name || "—"}</td>
                  <td style={s.td}>{fmt(item.sell_price)}</td>
                  <td style={s.td}>
                    <span style={s.badge(item.stock === 0)}>
                      {item.stock === 0 ? "Out of stock" : item.stock}
                    </span>
                  </td>
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
