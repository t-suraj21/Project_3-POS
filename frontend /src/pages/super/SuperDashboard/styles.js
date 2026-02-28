const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: { fontSize: "1.75rem", fontWeight: 700, color: "#1e1b4b" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },
  cardLabel: { fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" },
  cardValue: { fontSize: "2rem", fontWeight: 700, color: "#4f46e5" },
  navBtn: {
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
  logoutBtn: {
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    border: "1px solid #dc2626",
    background: "transparent",
    color: "#dc2626",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  error: { color: "#dc2626" },
};

export default styles;
