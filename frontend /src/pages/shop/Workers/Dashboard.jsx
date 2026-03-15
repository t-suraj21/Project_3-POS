import { useParams, useNavigate } from "react-router-dom";
import { useWorkers } from "../../../hooks/useWorkers";

const WorkersDashboard = () => {
  const { id: shopId } = useParams();
  const navigate = useNavigate();
  const { workers, loading } = useWorkers();

  return (
    <div
      style={{
        padding: "2rem",
        background: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0 0 0.5rem" }}>
          Worker Management
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#6b7280", margin: 0 }}>
          Create, view, and manage your shop workers
        </p>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👥</div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.25rem" }}>
            Total Workers
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#4f46e5" }}>
            {loading ? "-" : workers.length}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📊</div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.25rem" }}>
            Sales Workers
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#3b82f6" }}>
            {loading ? "-" : workers.filter((w) => w.role === "sales_worker").length}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💼</div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.25rem" }}>
            Account Workers
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f59e0b" }}>
            {loading ? "-" : workers.filter((w) => w.role === "account_worker").length}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
          <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.25rem" }}>
            Stock Managers
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981" }}>
            {loading ? "-" : workers.filter((w) => w.role === "stock_manager").length}
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Add Worker Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            borderRadius: "16px",
            padding: "2.5rem",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 30px rgba(79, 70, 229, 0.2)",
          }}
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/shop/${shopId}/workers/add`)}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(`/shop/${shopId}/workers/add`);
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>➕</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
            Add New Worker
          </h2>
          <p style={{ fontSize: "0.95rem", margin: "0 0 1.5rem", opacity: 0.9 }}>
            Create a new worker account with specific roles and permissions
          </p>
          <button
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
            }}
          >
            Create Worker →
          </button>
        </div>

        {/* View All Workers Card */}
        <div
          style={{
            background: "#fff",
            border: "2px solid #e5e7eb",
            borderRadius: "16px",
            padding: "2.5rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/shop/${shopId}/workers/all`)}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(`/shop/${shopId}/workers/all`);
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 0.5rem" }}>
            View All Workers
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#6b7280", margin: "0 0 1.5rem" }}>
            Manage existing workers, update roles, and delete accounts
          </p>
          <button
            style={{
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              color: "#374151",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#e5e7eb";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#f3f4f6";
            }}
          >
            View Workers →
          </button>
        </div>
      </div>

      {/* Worker Types Info */}
      <div style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#111827", marginBottom: "1.5rem" }}>
          Available Worker Roles
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              title: "Sales Worker",
              icon: "💰",
              desc: "Handle sales transactions, orders, and billing",
              color: "#dbeafe",
              textColor: "#1e40af",
            },
            {
              title: "Account Worker",
              icon: "💼",
              desc: "Manage customer accounts and profiles",
              color: "#fef3c7",
              textColor: "#b45309",
            },
            {
              title: "Stock Manager",
              icon: "📦",
              desc: "Control inventory and product management",
              color: "#d1fae5",
              textColor: "#065f46",
            },
            {
              title: "Manager",
              icon: "⭐",
              desc: "Full access to all shop features",
              color: "#ede9fe",
              textColor: "#5b21b6",
            },
          ].map((role) => (
            <div
              key={role.title}
              style={{
                background: role.color,
                border: `2px solid ${role.textColor}20`,
                borderRadius: "12px",
                padding: "1.5rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{role.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: role.textColor, margin: "0 0 0.5rem" }}>
                {role.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: role.textColor, margin: 0, opacity: 0.8 }}>
                {role.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkersDashboard;
