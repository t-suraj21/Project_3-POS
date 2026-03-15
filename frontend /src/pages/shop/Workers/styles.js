/**
 * Workers page styles
 */

const page = {
  padding: "2rem",
  background: "#f8fafc",
  minHeight: "100vh",
};

const heading = {
  fontSize: "1.875rem",
  fontWeight: 800,
  color: "#111827",
  margin: "0 0 0.25rem",
};

const subheading = {
  fontSize: "0.95rem",
  color: "#6b7280",
  margin: 0,
};

const toolbar = {
  display: "flex",
  gap: "0.75rem",
  marginBottom: "1.5rem",
  flexWrap: "wrap",
};

const addBtn = {
  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  color: "#fff",
  border: "none",
  padding: "0.65rem 1.2rem",
  borderRadius: "10px",
  fontSize: "0.9rem",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
  transition: "all 0.2s",
};

const tableCard = {
  background: "#fff",
  borderRadius: "14px",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
};

const tableHead = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1.1rem 1.5rem",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
};

const tableTitle = {
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "#111827",
};

const countBadge = {
  background: "#e5e7eb",
  color: "#374151",
  fontSize: "0.75rem",
  fontWeight: 700,
  padding: "0.3rem 0.65rem",
  borderRadius: "999px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: "0.85rem 1rem",
  borderBottom: "2px solid #e5e7eb",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#6b7280",
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const td = {
  padding: "1rem",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "0.9rem",
  color: "#374151",
};

const actionWrap = {
  display: "flex",
  gap: "0.5rem",
};

const editBtn = {
  background: "#dbeafe",
  color: "#1e40af",
  border: "none",
  padding: "0.35rem 0.65rem",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "0.85rem",
  transition: "all 0.2s",
};

const deleteBtn = {
  background: "#fee2e2",
  color: "#991b1b",
  border: "none",
  padding: "0.35rem 0.65rem",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "0.85rem",
  transition: "all 0.2s",
};

const empty = {
  padding: "3rem 2rem",
  textAlign: "center",
  color: "#6b7280",
};

const loadingWrap = {
  padding: "2rem",
  textAlign: "center",
  color: "#9ca3af",
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  borderRadius: "14px",
  padding: "2rem",
  width: "90%",
  maxWidth: 420,
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
};

const modalTitle = {
  fontSize: "1.3rem",
  fontWeight: 800,
  color: "#111827",
  margin: "0 0 1.5rem",
};

const formGroup = {
  marginBottom: "1.2rem",
};

const label = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#374151",
  marginBottom: "0.4rem",
};

const input = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "0.9rem",
  fontFamily: "inherit",
  outline: "none",
  transition: "all 0.2s",
};

const errorMsg = {
  color: "#dc2626",
  fontSize: "0.85rem",
  marginBottom: "1rem",
  padding: "0.65rem",
  background: "#fef2f2",
  borderRadius: "6px",
  margin: "1rem 0",
};

const modalActions = {
  display: "flex",
  gap: "0.75rem",
  justifyContent: "flex-end",
  marginTop: "1.5rem",
};

const cancelBtn = {
  background: "#f3f4f6",
  color: "#374151",
  border: "1px solid #e5e7eb",
  padding: "0.6rem 1.2rem",
  borderRadius: "8px",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const submitBtn = {
  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  color: "#fff",
  border: "none",
  padding: "0.6rem 1.5rem",
  borderRadius: "8px",
  fontSize: "0.9rem",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s",
};

const formCard = {
  background: "#fff",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  padding: "2rem",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

export default {
  page,
  heading,
  subheading,
  toolbar,
  addBtn,
  tableCard,
  tableHead,
  tableTitle,
  countBadge,
  table,
  th,
  td,
  actionWrap,
  editBtn,
  deleteBtn,
  empty,
  loadingWrap,
  overlay,
  modal,
  modalTitle,
  formGroup,
  label,
  input,
  errorMsg,
  modalActions,
  cancelBtn,
  submitBtn,
  formCard,
};
