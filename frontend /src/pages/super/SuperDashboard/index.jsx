import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import useSuperDashboard from "../../../hooks/useSuperDashboard";
import styles from "./styles";

const SuperDashboard = () => {
  const { revenue, loading, error } = useSuperDashboard();
  const { user, logout } = useAuth();

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <h1 style={styles.title}>Developer Dashboard</h1>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            {user?.name}
          </span>
          <Link to="/super/shops" style={styles.navBtn}>
            All Shops
          </Link>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Global Total Revenue</p>
          {loading ? (
            <p style={styles.cardValue}>…</p>
          ) : error ? (
            <p style={styles.error}>{error}</p>
          ) : (
            <p style={styles.cardValue}>₹ {Number(revenue).toLocaleString("en-IN")}</p>
          )}
        </div>

        <div style={styles.card}>
          <p style={styles.cardLabel}>Manage</p>
          <Link to="/super/shops" style={{ ...styles.navBtn, display: "inline-block", marginTop: "0.5rem" }}>
            View All Shops →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperDashboard;
