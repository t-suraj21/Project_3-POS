const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
  },
  card: {
    background: "#fff",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    marginBottom: "1rem",
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  hint: { fontSize: "0.9rem", color: "#6b7280", marginBottom: "1rem" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  label: { fontWeight: 600, fontSize: "0.875rem" },
  input: {
    padding: "0.65rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    marginTop: "0.25rem",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  success: { color: "#059669", textAlign: "center", marginBottom: "1rem" },
  footer:  { marginTop: "1rem", textAlign: "center", fontSize: "0.875rem" },
};

export default styles;
