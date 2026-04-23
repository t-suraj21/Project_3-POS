import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import s from "./styles";

const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const SuppliersList = () => {
  const { id: shopId } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await api.get("/api/suppliers");
        setSuppliers(res.data?.suppliers || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load suppliers");
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  return (
    <div style={s.tableCard}>
      <div style={s.tableHead}>
        <div>
          <span style={s.tableTitle}>All Suppliers</span>
          <span style={s.countBadge}>{suppliers.length}</span>
        </div>
      </div>

      {error && <p style={{ color: "#dc2626", padding: "1rem" }}>{error}</p>}
      {loading ? (
        <p style={{ padding: "2rem", textAlign: "center" }}>Loading suppliers…</p>
      ) : suppliers.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
          No suppliers found. Add suppliers when creating products.
        </div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>SL</th>
              <th style={s.th}>Supplier Details</th>
              <th style={s.th}>Total Purchase</th>
              <th style={s.th}>Total Paid</th>
              <th style={s.th}>Remaining Due</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((sup, idx) => {
              const balance = parseFloat(sup.remaining_balance || 0);
              return (
                <tr key={sup.id} style={{ cursor: "pointer" }}>
                  <td style={s.td}>{idx + 1}</td>
                  <td style={s.td}>
                    <div style={s.nameCell}>
                      <div style={s.avatar}>{sup.name[0].toUpperCase()}</div>
                      <div>
                        <div style={s.custName}>{sup.name}</div>
                        {sup.phone && <div style={s.custPhone}>📞 {sup.phone}</div>}
                        {sup.address && <div style={{ ...s.custPhone, marginTop: "1px" }}>📍 {sup.address}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>{fmt(sup.total_purchased)}</td>
                  <td style={s.td}>{fmt(sup.total_paid)}</td>
                  <td style={balance > 0 ? s.tdRed : s.td}>{fmt(sup.remaining_balance)}</td>
                  <td style={s.td}>
                    <span style={s.statusBadge(sup.status === "cleared")}>
                      {sup.status === "cleared" ? "✓ Cleared" : "⚠ Pending"}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button
                      style={{ ...s.viewBtn, padding: "0.4rem 0.8rem" }}
                      title="View Details"
                      onClick={() => navigate(`/shop/${shopId}/suppliers/${sup.id}`)}
                    >
                      👁 View More
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SuppliersList;
