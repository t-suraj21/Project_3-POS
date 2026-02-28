const s = {
  page:    { padding: "2rem", maxWidth: "1200px", fontFamily: "'Segoe UI', sans-serif" },
  heading: { fontSize: "1.6rem", fontWeight: 700, color: "#1e1b4b", marginBottom: "0.25rem", margin: 0 },
  sub:     { color: "#6b7280", marginTop: "0.3rem", marginBottom: "2rem", fontSize: "0.9rem" },

  // Section label
  sectionLabel: {
    fontSize: "0.72rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#9ca3af",
    marginBottom: "0.75rem",
    marginTop: "0.25rem",
  },

  // Stat cards grid
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "1.25rem 1.5rem",
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    border: "1px solid #f1f5f9",
  },
  statIcon: {
    fontSize: "1.5rem",
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statLabel: { fontSize: "0.78rem", color: "#6b7280", margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
  statValue: { fontSize: "1.65rem", fontWeight: 700, color: "#1e1b4b", margin: "0.15rem 0 0" },

  // Period group (Sales / Revenue cards with today/week/month/year)
  periodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  periodCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "1.1rem 1.25rem",
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },
  periodPeriod: { fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", margin: 0 },
  periodValue:  { fontSize: "1.45rem", fontWeight: 700, color: "#1e1b4b", margin: "0.25rem 0 0" },
  periodSub:    { fontSize: "0.75rem", color: "#6b7280", marginTop: "0.15rem" },

  // Low stock section
  section:      { background: "#fff", borderRadius: "14px", padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  sectionTitle: { fontSize: "1rem", fontWeight: 700, color: "#1e1b4b", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" },

  table:  { width: "100%", borderCollapse: "collapse" },
  th:     { padding: "0.65rem 1rem", textAlign: "left", fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #f3f4f6", background: "#f9fafb" },
  td:     { padding: "0.8rem 1rem", fontSize: "0.875rem", color: "#374151", borderBottom: "1px solid #f9fafb" },

  badge: (danger) => ({
    display: "inline-block",
    padding: "0.2rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 700,
    background: danger ? "#fee2e2" : "#fef3c7",
    color:      danger ? "#dc2626" : "#d97706",
  }),

  emptyRow: { textAlign: "center", color: "#9ca3af", padding: "2.5rem", fontSize: "0.9rem" },
};

export default s;
