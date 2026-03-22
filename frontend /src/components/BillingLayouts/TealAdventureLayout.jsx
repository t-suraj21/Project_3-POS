import React from "react";

/**
 * Teal Adventure Layout
 * Modern teal-themed invoice design with gradient header
 * Similar to adventure/service business invoices
 */
const TealAdventureLayout = ({ sale, shop }) => {
  const logo = shop?.logo ? `/${shop.logo}` : null;
  const signature = shop?.signature ? `/${shop.signature}` : null;

  const formatCurrency = (amount) => {
    return `${shop?.currency_symbol || "₹"}${parseFloat(amount || 0).toFixed(2)}`;
  };

  const items = sale?.sale_items || [];
  const subtotal = parseFloat(sale?.subtotal || sale?.total_amount || 0);
  const taxAmount = parseFloat(sale?.tax_amount || sale?.gst_amount || 0);
  const discount = parseFloat(sale?.discount || 0);
  const total = parseFloat(sale?.total_amount || 0);
  const paid = parseFloat(sale?.paid_amount || 0);
  const dueAmount = total - paid;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div style={{
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      background: "white",
      boxShadow: "0 0 30px rgba(0,0,0,0.1)",
    }}>
      {/* Teal Gradient Header */}
      <div style={{
        background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
        padding: "40px 50px",
        color: "white",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {logo ? (
              <img src={logo} alt="Logo" style={{ height: "60px", marginBottom: "15px", filter: "brightness(0) invert(1)" }} />
            ) : (
              <h1 style={{ margin: "0 0 10px 0", fontSize: "32px", fontWeight: "700" }}>{shop?.name || "Business Name"}</h1>
            )}
            <p style={{ margin: "0", fontSize: "14px", opacity: 0.9 }}>{shop?.phone || "Contact"}</p>
            <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.9 }}>{shop?.email || "Email"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h1 style={{ margin: "0", fontSize: "48px", fontWeight: "300", letterSpacing: "2px" }}>INVOICE</h1>
            <p style={{ margin: "10px 0 0 0", fontSize: "16px", opacity: 0.9 }}>#{sale?.bill_number || "INV-001"}</p>
          </div>
        </div>
      </div>

      {/* Invoice Details Section */}
      <div style={{ padding: "40px 50px" }}>
        {/* Date and Customer Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
          <div>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Bill To</h3>
            <p style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>{sale?.customer_name || "Customer Name"}</p>
            {sale?.customer_phone && (
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#64748b" }}>📞 {sale.customer_phone}</p>
            )}
            {sale?.customer_address && (
              <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>📍 {sale.customer_address}</p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>Invoice Date</h3>
            <p style={{ margin: "0", fontSize: "16px", color: "#1e293b" }}>{formatDate(sale?.created_at)}</p>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #14b8a6" }}>
              <th style={{ padding: "15px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>Item</th>
              <th style={{ padding: "15px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>Qty</th>
              <th style={{ padding: "15px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>Price</th>
              <th style={{ padding: "15px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "15px", fontSize: "14px", color: "#1e293b" }}>{item.product_name}</td>
                <td style={{ padding: "15px", textAlign: "right", fontSize: "14px", color: "#1e293b" }}>{item.quantity}</td>
                <td style={{ padding: "15px", textAlign: "right", fontSize: "14px", color: "#64748b" }}>{formatCurrency(item.sell_price || item.unit_price)}</td>
                <td style={{ padding: "15px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{formatCurrency(item.total || item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
          <div style={{ width: "300px" }}>
            {subtotal > 0 && subtotal !== total && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "14px", color: "#64748b" }}>Subtotal</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{formatCurrency(subtotal)}</span>
              </div>
            )}
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "14px", color: "#64748b" }}>Discount</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#ef4444" }}>-{formatCurrency(discount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "14px", color: "#64748b" }}>Tax/GST</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", background: "#f1f5f9", marginTop: "10px", paddingLeft: "15px", paddingRight: "15px", borderRadius: "8px" }}>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>TOTAL</span>
              <span style={{ fontSize: "20px", fontWeight: "700", color: "#14b8a6" }}>{formatCurrency(total)}</span>
            </div>
            {dueAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 15px", marginTop: "10px", background: "#fef2f2", borderRadius: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#dc2626" }}>Amount Due</span>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#dc2626" }}>{formatCurrency(dueAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Signature Section */}
        {signature && (
          <div style={{ marginTop: "50px", paddingTop: "30px", borderTop: "2px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ textAlign: "center" }}>
                <img src={signature} alt="Signature" style={{ height: "60px", marginBottom: "10px" }} />
                <div style={{ borderTop: "2px solid #1e293b", paddingTop: "10px", minWidth: "200px" }}>
                  <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "600", color: "#14b8a6" }}>Thank You for Your Business!</p>
          <p style={{ margin: "0", fontSize: "12px", color: "#94a3b8" }}>
            For any queries, please contact us at {shop?.phone || "contact number"} or {shop?.email || "email"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TealAdventureLayout;
