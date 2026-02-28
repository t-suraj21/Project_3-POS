import { Link } from "react-router-dom";
import useShopsList from "./useShopsList";
import styles from "./styles";

const ShopsList = () => {
  const { shops, loading, error } = useShopsList();

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <h1 style={styles.title}>All Shops</h1>
        <Link to="/super/dashboard" style={styles.backBtn}>
          ← Dashboard
        </Link>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading…</p>}
      {error   && <p style={styles.error}>{error}</p>}

      {!loading && !error && shops.length === 0 && (
        <p style={styles.empty}>No shops registered yet.</p>
      )}

      {!loading && shops.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Shop Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>GST</th>
              <th style={styles.th}>Revenue (₹)</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop, i) => (
              <tr key={shop.id} style={i % 2 === 1 ? styles.trEven : {}}>
                <td style={styles.td}>{shop.id}</td>
                <td style={styles.td}>{shop.name}</td>
                <td style={styles.td}>{shop.email ?? "—"}</td>
                <td style={styles.td}>{shop.phone ?? "—"}</td>
                <td style={styles.td}>
                  <span style={shop.gst_enabled ? styles.gstOn : styles.gstOff}>
                    {shop.gst_enabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td style={styles.td}>
                  {Number(shop.total_revenue).toLocaleString("en-IN")}
                </td>
                <td style={styles.td}>
                  <Link to={`/super/shops/${shop.id}`} style={styles.viewBtn}>
                    View / Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ShopsList;
