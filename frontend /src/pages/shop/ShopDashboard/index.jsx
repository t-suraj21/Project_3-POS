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

  if (loading) return <div style={s.page}><p style={{ color: "#6b7280" }}>Loading dashboard…</p></div>;
  if (error)   return <div style={s.page}><p style={{ color: "#dc2626" }}>{error}</p></div>;

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Dashboard</h1>
      <p  style={s.sub}>Welcome back! Here's your shop overview.</p>

      {/* ── Overview row ── */}
      <p style={s.sectionLabel}>Overview</p>
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
      <p style={s.sectionLabel}>Total Sales</p>
      <div style={s.periodGrid}>
        {SALES_PERIODS.map(({ key, label, suffix }) => (
          <div key={key} style={s.periodCard}>
            <p style={s.periodPeriod}>{label}</p>
            <p style={s.periodValue}>{num(stats?.[key])}</p>
            <p style={s.periodSub}>{suffix}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue row ── */}
      <p style={s.sectionLabel}>Revenue</p>
      <div style={s.periodGrid}>
        {REVENUE_PERIODS.map(({ key, label }) => (
          <div key={key} style={{ ...s.periodCard, borderBottom: `3px solid #4f46e5` }}>
            <p style={s.periodPeriod}>{label}</p>
            <p style={{ ...s.periodValue, color: "#4f46e5" }}>{fmt(stats?.[key])}</p>
          </div>
        ))}
      </div>

      {/* ── Low Stock table ── */}
      <div style={s.section}>
        <p style={s.sectionTitle}>
          <span>⚠️</span> Low Stock Alerts
          <Link
            to={`/shop/${id}/products?low_stock=1`}
            style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}
          >
            View all →
          </Link>
        </p>

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
