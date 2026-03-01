const s = {
  page: { paddingTop: "1.75rem", paddingRight: "2rem", paddingBottom: "2.5rem", paddingLeft: "2rem", maxWidth: "1240px", fontFamily: "'Segoe UI', system-ui, sans-serif" },

  /* ── Hero banner ── */
  hero: {
    background: "linear-gradient(120deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)",
    borderRadius: "18px",
    padding: "1.75rem 2rem",
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 8px 30px rgba(79,70,229,0.28)",
    position: "relative",
    overflow: "hidden",
  },
  heroTitle: { fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 },
  heroSub:   { fontSize: "0.88rem", color: "rgba(255,255,255,0.72)", marginTop: "0.25rem" },
  heroBadge: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "12px",
    padding: "0.6rem 1.2rem",
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: 700,
    backdropFilter: "blur(6px)",
  },

  /* ── Section label ── */
  sectionLabel: {
    fontSize: "0.68rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#94a3b8",
    marginBottom: "0.8rem",
    marginTop: "0.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  sectionDivider: { flex: 1, height: "1px", background: "#e2e8f0" },

  /* ── Overview stat cards ── */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "1.3rem 1.5rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    border: "1px solid #f1f5f9",
    transition: "box-shadow 0.2s",
  },
  statIcon: {
    fontSize: "1.45rem",
    width: "50px",
    height: "50px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statLabel: { fontSize: "0.73rem", color: "#64748b", margin: 0, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "0.12rem 0 0" },

  /* ── Period cards (Sales / Revenue) ── */
  periodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  periodCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "1.15rem 1.3rem",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },
  periodPeriod: { fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", margin: 0 },
  periodValue:  { fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0.3rem 0 0" },
  periodSub:    { fontSize: "0.73rem", color: "#94a3b8", marginTop: "0.2rem" },

  /* ── Low stock section card ── */
  section: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    marginBottom: "2rem",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #f1f5f9",
    gap: "0.5rem",
  },
  sectionTitle: { fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" },

  table:  { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "0.7rem 1.25rem",
    textAlign: "left",
    fontSize: "0.72rem",
    color: "#94a3b8",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #f1f5f9",
    background: "#f8fafc",
    whiteSpace: "nowrap",
  },
  td: { padding: "0.85rem 1.25rem", fontSize: "0.875rem", color: "#334155", borderBottom: "1px solid #f8fafc" },

  badge: (danger) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.22rem 0.7rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 700,
    background: danger ? "#fee2e2" : "#fef3c7",
    color:      danger ? "#dc2626" : "#d97706",
  }),

  emptyRow: { textAlign: "center", color: "#94a3b8", padding: "3rem", fontSize: "0.9rem" },

  heading: { fontSize: "1.6rem", fontWeight: 700, color: "#1e1b4b", marginBottom: "0.25rem", margin: 0 },
  sub:     { color: "#6b7280", marginTop: "0.3rem", marginBottom: "2rem", fontSize: "0.9rem" },
};

export default s;
