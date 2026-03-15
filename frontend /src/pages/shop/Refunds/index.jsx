import { useEffect, useState } from "react";
import useRefund from "../../hooks/useRefund";

/**
 * Refunds Page
 *
 * Shows history of all refunds processed in the shop
 * - Search by bill number or customer
 * - Filter by refund  status
 * - View refund details and items
 */

const Refunds = () => {
  const {
    refunds,
    loading,
    error,
    fetchRefunds,
    formatRefund,
  } = useRefund();

  const [search, setSearch] = useState("");
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleSearch = async () => {
    if (search.trim()) {
      // Filter refunds locally with search
      // Or could fetch with search param
      await fetchRefunds();
    }
  };

  const filteredRefunds = refunds.filter((r) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      r.bill_number?.toLowerCase().includes(query) ||
      r.customer_name?.toLowerCase().includes(query) ||
      r.customer_phone?.includes(query)
    );
  });

  const pageStyle = {
    padding: "20px",
    background: "#f1f5f9",
    minHeight: "100vh",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  };

  const headerStyle = {
    ...cardStyle,
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const searchBoxStyle = {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  };

  const statsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  };

  const statCardStyle = {
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  const statValueStyle = {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "5px",
  };

  const statLabelStyle = {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const thStyle = {
    padding: "15px",
    background: "#f8fafc",
    fontWeight: "700",
    color: "#64748b",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    borderBottom: "2px solid #e2e8f0",
    textAlign: "left",
  };

  const tdStyle = {
    padding: "15px",
    borderBottom: "1px solid #e2e8f0",
    color: "#1f2937",
    fontSize: "0.9rem",
  };

  const rowStyle = {
    cursor: "pointer",
    transition: "background 0.2s",
    ":hover": {
      background: "#f8fafc",
    },
  };

  const totalRefunded = refunds.reduce((sum, r) => sum + parseFloat(r.refund_amount || 0), 0);
  const totalOriginal = refunds.reduce((sum, r) => sum + parseFloat(r.original_total || 0), 0);

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: "0 0 5px 0", fontSize: "2rem", color: "#1f2937" }}>
            🔙 Refund History
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            Track all product returns and refunds
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={statsStyle}>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{refunds.length}</div>
          <div style={statLabelStyle}>Total Refunds</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>₹{totalRefunded.toFixed(2)}</div>
          <div style={statLabelStyle}>Amount Refunded</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>₹{totalOriginal.toFixed(2)}</div>
          <div style={statLabelStyle}>Original Sales</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>
            {totalOriginal > 0 ? ((totalRefunded / totalOriginal) * 100).toFixed(1) : 0}%
          </div>
          <div style={statLabelStyle}>Refund Rate</div>
        </div>
      </div>

      {/* Search */}
      <div style={searchBoxStyle}>
        <input
          type="text"
          placeholder="🔍 Search by bill number, customer name, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          style={{
            flex: 1,
            padding: "12px 15px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "0.95rem",
            background: "white",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "12px 20px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "15px",
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            color: "#dc2626",
            marginBottom: "20px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "1rem",
          }}
        >
          Loading refunds...
        </div>
      )}

      {/* Table */}
      {!loading && filteredRefunds.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Bill #</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Original</th>
              <th style={thStyle}>Refunded</th>
              <th style={thStyle}>Mode</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRefunds.map((refund) => {
              const formatted = formatRefund(refund);
              return (
                <tr
                  key={refund.id}
                  style={rowStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <td style={tdStyle}>
                    <strong>{refund.bill_number}</strong>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "600" }}>{refund.customer_name || "Walk-in"}</div>
                    {refund.customer_phone && (
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {refund.customer_phone}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>₹{formatted.original_total}</td>
                  <td style={{ ...tdStyle, fontWeight: "700", color: "#dc2626" }}>
                    ₹{formatted.refund_amount}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 10px",
                        background: "#fef3c7",
                        color: "#92400e",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      {refund.refund_mode}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 10px",
                        background: refund.status === "completed" ? "#d1fae5" : "#fde2e4",
                        color: refund.status === "completed" ? "#065f46" : "#9f1239",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      {refund.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div>{formatted.date}</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {formatted.time}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => {
                        setSelectedRefund(refund);
                        setIsViewOpen(true);
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#e0f2fe",
                        color: "#0369a1",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Empty State */}
      {!loading && filteredRefunds.length === 0 && (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📭</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "5px" }}>
            No refunds found
          </div>
          <p>Start accepting and tracking product returns!</p>
        </div>
      )}

      {/* View Refund Details Modal */}
      {isViewOpen && selectedRefund && (
        <RefundDetailsModal
          refund={selectedRefund}
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
        />
      )}
    </div>
  );
};

/**
 * Refund Details Modal
 */
const RefundDetailsModal = ({ refund, isOpen, onClose }) => {
  if (!isOpen) return null;

  const totalItems = (refund.items || []).length;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
          }}
        >
          <h2 style={{ margin: 0, color: "#1f2937" }}>Refund Details</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px" }}>
          {/* Summary */}
          <div
            style={{
              padding: "15px",
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#166534", marginBottom: "5px" }}>
                  BILL NUMBER
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#166534" }}>
                  {refund.bill_number}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#166534", marginBottom: "5px" }}>
                  REFUND AMOUNT
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#dc2626" }}>
                  ₹{parseFloat(refund.refund_amount || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#166534", marginBottom: "5px" }}>
                  STATUS
                </div>
                <div style={{ fontSize: "1rem", fontWeight: "600", color: "#166534" }}>
                  {refund.status?.toUpperCase()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#166534", marginBottom: "5px" }}>
                  REFUND MODE
                </div>
                <div style={{ fontSize: "1rem", fontWeight: "600", color: "#166534" }}>
                  {refund.refund_mode?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Refund Reason */}
          {refund.reason && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "5px", textTransform: "uppercase" }}>
                Reason
              </div>
              <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", color: "#1f2937" }}>
                {refund.reason}
              </div>
            </div>
          )}

          {/* Items */}
          {refund.items && refund.items.length > 0 && (
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "10px", textTransform: "uppercase" }}>
                Refunded Items ({totalItems})
              </div>
              {refund.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "10px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    borderLeft: "4px solid #3b82f6",
                  }}
                >
                  <div style={{ fontWeight: "600", color: "#1f2937", marginBottom: "3px" }}>
                    {item.product_name}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#64748b" }}>
                    <span>{item.quantity} × ₹{parseFloat(item.unit_price || 0).toFixed(2)}</span>
                    <span style={{ fontWeight: "600" }}>₹{parseFloat(item.total_price || 0).toFixed(2)}</span>
                  </div>
                  {item.reason && (
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "3px" }}>
                      Reason: {item.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "12px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Refunds;
