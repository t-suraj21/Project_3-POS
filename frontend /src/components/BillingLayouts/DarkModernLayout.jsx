import React from "react";

/**
 * Dark Modern Layout
 * Contemporary dark-themed invoice with signature section
 * Modern and sleek design for tech-savvy businesses
 */
const DarkModernLayout = ({ sale, shop }) => {
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
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      background: "#0f172a",
      color: "#e2e8f0",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      borderRadius: "16px",
      overflow: "hidden",
    }}>
      {/* Colorful Top Border */}
      <div style={{
        height: "6px",
        background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 33%, #ec4899 66%, #ef4444 100%)",
      }} />

      {/* Header Section */}
      <div style={{
        padding: "45px 50px",
        background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
        borderBottom: "1px solid #334155",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {logo ? (
              <img src={logo} alt="Logo" style={{
                height: "70px",
                marginBottom: "20px",
                filter: "brightness(0) invert(1)",
              }} />
            ) : (
              <h1 style={{
                margin: "0 0 15px 0",
                fontSize: "36px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {shop?.name || "Business Name"}
              </h1>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
                📧 {shop?.email || "email@example.com"}
              </p>
              <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
                📱 {shop?.phone || "Phone Number"}
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              padding: "18px 30px",
              borderRadius: "12px",
              marginBottom: "18px",
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
            }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "white", letterSpacing: "2px" }}>
                INVOICE
              </h2>
            </div>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#94a3b8" }}>
              <span style={{ color: "#64748b" }}>No.</span> <span style={{ fontWeight: "700",color: "#e2e8f0" }}>{sale?.bill_number || "INV-001"}</span>
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              {formatDate(sale?.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div style={{ padding: "35px 50px 25px" }}>
        <div style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          padding: "25px 30px",
          borderRadius: "12px",
          border: "1px solid #334155",
          marginBottom: "35px",
        }}>
          <p style={{
            margin: "0 0 12px 0",
            fontSize: "11px",
            fontWeight: "700",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}>
            Billed To
          </p>
          <p style={{ margin: "0 0 10px 0", fontSize: "22px", fontWeight: "700", color: "#f1f5f9" }}>
            {sale?.customer_name || "Customer Name"}
          </p>
          {sale?.customer_phone && (
            <p style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#94a3b8" }}>
              📞 {sale.customer_phone}
            </p>
          )}
          {sale?.customer_address && (
            <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>
              📍 {sale.customer_address}
            </p>
          )}
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: "30px" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" }}>
            <thead>
              <tr>
                <th style={{
                  padding: "16px 15px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  background: "#1e293b",
                  borderTopLeftRadius: "8px",
                  borderBottomLeftRadius: "8px",
                }}>Item</th>
                <th style={{
                  padding: "16px 15px",
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  background: "#1e293b",
                  width: "80px",
                }}>Qty</th>
                <th style={{
                  padding: "16px 15px",
                  textAlign: "right",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  background: "#1e293b",
                  width: "120px",
                }}>Price</th>
                <th style={{
                  padding: "16px 15px",
                  textAlign: "right",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  background: "#1e293b",
                  borderTopRightRadius: "8px",
                  borderBottomRightRadius: "8px",
                  width: "130px",
                }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{
                    padding: "18px 15px",
                    fontSize: "15px",
                    color: "#e2e8f0",
                    background: "#1e293b",
                    borderTopLeftRadius: "8px",
                    borderBottomLeftRadius: "8px",
                  }}>
                    {item.product_name}
                  </td>
                  <td style={{
                    padding: "18px 15px",
                    textAlign: "center",
                    fontSize: "15px",
                    color: "#94a3b8",
                    background: "#1e293b",
                  }}>
                    {item.quantity}
                  </td>
                  <td style={{
                    padding: "18px 15px",
                    textAlign: "right",
                    fontSize: "15px",
                    color: "#94a3b8",
                    background: "#1e293b",
                  }}>
                    {formatCurrency(item.sell_price || item.unit_price)}
                  </td>
                  <td style={{
                    padding: "18px 15px",
                    textAlign: "right",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#f1f5f9",
                    background: "#1e293b",
                    borderTopRightRadius: "8px",
                    borderBottomRightRadius: "8px",
                  }}>
                    {formatCurrency(item.total || item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
          <div style={{ width: "350px" }}>
            {subtotal > 0 && subtotal !== total && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 20px",
                background: "#1e293b",
                borderRadius: "8px",
                marginBottom: "8px",
              }}>
                <span style={{ fontSize: "15px", color: "#94a3b8" }}>Subtotal</span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0" }}>{formatCurrency(subtotal)}</span>
              </div>
            )}
            {discount > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 20px",
                background: "#1e293b",
                borderRadius: "8px",
                marginBottom: "8px",
              }}>
                <span style={{ fontSize: "15px", color: "#94a3b8" }}>Discount</span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#f87171" }}>-{formatCurrency(discount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 20px",
                background: "#1e293b",
                borderRadius: "8px",
                marginBottom: "8px",
              }}>
                <span style={{ fontSize: "15px", color: "#94a3b8" }}>Tax/GST</span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#e2e8f0" }}>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "22px 25px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              borderRadius: "12px",
              marginTop: "15px",
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)",
            }}>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "white", textTransform: "uppercase", letterSpacing: "1px" }}>
                Total
              </span>
              <span style={{ fontSize: "26px", fontWeight: "800", color: "white" }}>
                {formatCurrency(total)}
              </span>
            </div>
            {dueAmount > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px 25px",
                background: "#7f1d1d",
                borderRadius: "8px",
                marginTop: "12px",
                border: "2px solid #dc2626",
              }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#fca5a5", textTransform: "uppercase" }}>
                  Balance Due
                </span>
                <span style={{ fontSize: "19px", fontWeight: "800", color: "#fef2f2" }}>
                  {formatCurrency(dueAmount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Signature */}
        {signature && (
          <div style={{
            marginTop: "50px",
            paddingTop: "35px",
            borderTop: "2px dashed #334155",
          }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{
                textAlign: "center",
                padding: "25px 35px",
                background: "#1e293b",
                borderRadius: "12px",
                border: "1px solid #334155",
              }}>
                <p style={{
                  margin: "0 0 15px 0",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}>
                  Authorized By
                </p>
                <img src={signature} alt="Signature" style={{
                  height: "65px",
                  marginBottom: "15px",
                  filter: "brightness(0) invert(1)",
                }} />
                <div style={{
                  borderTop: "2px solid #3b82f6",
                  paddingTop: "15px",
                  minWidth: "220px",
                }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#60a5fa" }}>
                    Authorized Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "45px",
          padding: "30px",
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #334155",
        }}>
          <p style={{
            margin: "0 0 10px 0",
            fontSize: "19px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Thank You for Your Business! 🙏
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Questions? Reach out at {shop?.email || "email"} or {shop?.phone || "phone"}
          </p>
        </div>
      </div>

      {/* Bottom Colorful Border */}
      <div style={{
        height: "6px",
        background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 33%, #ec4899 66%, #ef4444 100%)",
      }} />
    </div>
  );
};

export default DarkModernLayout;
