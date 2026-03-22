import React from "react";

/**
 * Purple Gradient Layout
 * Elegant purple to red gradient design for creative studios
 * Modern and vibrant invoice template
 */
const PurpleGradientLayout = ({ sale, shop }) => {
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
      fontFamily: "'Poppins', 'Inter', 'Segoe UI', sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      background: "white",
      boxShadow: "0 4px 50px rgba(0,0,0,0.15)",
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      {/* Purple to Red Gradient Header */}
      <div style={{
        background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #ef4444 100%)",
        padding: "50px",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 50%)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            {logo ? (
              <img src={logo} alt="Logo" style={{ height: "70px", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.2))" }} />
            ) : (
              <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "700", color: "white", textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                {shop?.name || "Business Name"}
              </h1>
            )}
            <div style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              padding: "15px 25px",
              borderRadius: "50px",
              border: "2px solid rgba(255,255,255,0.3)",
            }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "white", textTransform: "uppercase", letterSpacing: "2px" }}>
                Invoice
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", color: "white" }}>
            <div>
              <p style={{ margin: "0 0 5px 0", fontSize: "13px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>
                {shop?.name || "Company"}
              </p>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", opacity: 0.9 }}>{shop?.email || "Email"}</p>
              <p style={{ margin: "0", fontSize: "14px", opacity: 0.9 }}>{shop?.phone || "Phone"}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>Invoice #</p>
              <p style={{ margin: "0 0 15px 0", fontSize: "24px", fontWeight: "700" }}>{sale?.bill_number || "INV-001"}</p>
              <p style={{ margin: "0", fontSize: "14px", opacity: 0.9 }}>{formatDate(sale?.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: "40px 50px" }}>
        {/* Client Info */}
        <div style={{
          background: "linear-gradient(135deg, #faf5ff 0%, #fce7f3 100%)",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "35px",
          border: "1px solid #f3e8ff",
        }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "13px", fontWeight: "700", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "1.5px" }}>
            Billed To
          </h3>
          <p style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "600", color: "#1f2937" }}>
            {sale?.customer_name || "Customer Name"}
          </p>
          {sale?.customer_phone && (
            <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#6b7280" }}>📞 {sale.customer_phone}</p>
          )}
          {sale?.customer_address && (
            <p style={{ margin: "0", fontSize: "14px", color: "#6b7280" }}>📍 {sale.customer_address}</p>
          )}
        </div>

        {/* Items */}
        <div style={{ marginBottom: "30px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{
                  padding: "15px 10px",
                  textAlign: "left",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#8b5cf6",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderBottom: "3px solid #8b5cf6",
                }}>Description</th>
                <th style={{
                  padding: "15px 10px",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#8b5cf6",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderBottom: "3px solid #8b5cf6",
                }}>Qty</th>
                <th style={{
                  padding: "15px 10px",
                  textAlign: "right",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#8b5cf6",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderBottom: "3px solid #8b5cf6",
                }}>Price</th>
                <th style={{
                  padding: "15px 10px",
                  textAlign: "right",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#8b5cf6",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderBottom: "3px solid #8b5cf6",
                }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f3e8ff" }}>
                  <td style={{ padding: "18px 10px", fontSize: "15px", color: "#1f2937", fontWeight: "500" }}>
                    {item.product_name}
                  </td>
                  <td style={{ padding: "18px 10px", textAlign: "center", fontSize: "15px", color: "#6b7280" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "18px 10px", textAlign: "right", fontSize: "15px", color: "#6b7280" }}>
                    {formatCurrency(item.sell_price || item.unit_price)}
                  </td>
                  <td style={{ padding: "18px 10px", textAlign: "right", fontSize: "15px", fontWeight: "600", color: "#1f2937" }}>
                    {formatCurrency(item.total || item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "320px" }}>
            {subtotal > 0 && subtotal !== total && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3e8ff" }}>
                <span style={{ fontSize: "15px", color: "#6b7280" }}>Subtotal</span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#1f2937" }}>{formatCurrency(subtotal)}</span>
              </div>
            )}
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3e8ff" }}>
                <span style={{ fontSize: "15px", color: "#6b7280" }}>Discount</span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#ef4444" }}>-{formatCurrency(discount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3e8ff" }}>
                <span style={{ fontSize: "15px", color: "#6b7280" }}>Tax/GST</span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#1f2937" }}>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "20px",
              marginTop: "15px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
              borderRadius: "12px",
              color: "white",
            }}>
              <span style={{ fontSize: "18px", fontWeight: "700" }}>TOTAL</span>
              <span style={{ fontSize: "24px", fontWeight: "800" }}>{formatCurrency(total)}</span>
            </div>
            {dueAmount > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px 20px",
                marginTop: "10px",
                background: "#fef2f2",
                borderRadius: "8px",
                border: "2px solid #fecaca",
              }}>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#dc2626" }}>Balance Due</span>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#dc2626" }}>{formatCurrency(dueAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Signature */}
        {signature && (
          <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: "2px dashed #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div />
              <div style={{ textAlign: "center" }}>
                <img src={signature} alt="Signature" style={{ height: "70px", marginBottom: "15px" }} />
                <div style={{
                  borderTop: "3px solid #8b5cf6",
                  paddingTop: "12px",
                  minWidth: "220px",
                }}>
                  <p style={{ margin: "0", fontSize: "15px", fontWeight: "700", color: "#8b5cf6" }}>
                    Authorized Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "50px",
          padding: "25px",
          background: "linear-gradient(135deg, #faf5ff 0%, #fce7f3 100%)",
          borderRadius: "12px",
          textAlign: "center",
        }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700", color: "#8b5cf6" }}>
            Thank You! 💜
          </p>
          <p style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}>
            Questions? Contact us at {shop?.phone || "contact"} or {shop?.email || "email"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurpleGradientLayout;
