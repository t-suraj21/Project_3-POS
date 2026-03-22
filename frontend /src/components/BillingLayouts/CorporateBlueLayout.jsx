import React from "react";

/**
 * Corporate Blue Layout
 * Professional blue-themed invoice with clean structure
 * Perfect for corporate and formal businesses
 */
const CorporateBlueLayout = ({ sale, shop }) => {
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
      fontFamily: "'Roboto', 'Arial', sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      background: "white",
      border: "1px solid #e0e0e0",
    }}>
      {/* Blue Top Bar */}
      <div style={{
        height: "8px",
        background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
      }} />

      {/* Header */}
      <div style={{
        padding: "40px 50px 30px",
        borderBottom: "3px solid #1e40af",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {logo ? (
              <img src={logo} alt="Logo" style={{ height: "65px", marginBottom: "15px" }} />
            ) : (
              <h1 style={{
                margin: "0 0 10px 0",
                fontSize: "32px",
                fontWeight: "700",
                color: "# 1e40af",
                letterSpacing: "-0.5px",
              }}>
                {shop?.name || "Company Name"}
              </h1>
            )}
            <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#64748b" }}>{shop?.address || "Address"}</p>
            <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#64748b" }}>Phone: {shop?.phone || "Contact"}</p>
            <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>Email: {shop?.email || "Email"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              background: "#1e40af",
              color: "white",
              padding: "12px 25px",
              borderRadius: "4px",
              marginBottom: "15px",
            }}>
              <h2 style={{ margin: "0", fontSize: "28px", fontWeight: "700", letterSpacing: "1px" }}>INVOICE</h2>
            </div>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#64748b" }}>
              <strong style={{ color: "#1f2937" }}>Invoice #:</strong> {sale?.bill_number || "INV-001"}
            </p>
            <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>
              <strong style={{ color: "#1f2937" }}>Date:</strong> {formatDate(sale?.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div style={{ padding: "30px 50px" }}>
        <div style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderLeft: "4px solid #3b82f6",
          padding: "20px 25px",
          borderRadius: "4px",
          marginBottom: "35px",
        }}>
          <h3 style={{
            margin: "0 0 12px 0",
            fontSize: "12px",
            fontWeight: "700",
            color: "#1e40af",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
          }}>
            Bill To
          </h3>
          <p style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700", color: "#1f2937" }}>
            {sale?.customer_name || "Customer Name"}
          </p>
          {sale?.customer_phone && (
            <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#64748b" }}>
              Phone: {sale.customer_phone}
            </p>
          )}
          {sale?.customer_address && (
            <p style={{ margin: "0", fontSize: "14px", color: "#64748b" }}>
              Address: {sale.customer_address}
            </p>
          )}
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "25px" }}>
          <thead>
            <tr style={{ background: "#1e40af", color: "white" }}>
              <th style={{
                padding: "14px 15px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>Description</th>
              <th style={{
                padding: "14px 15px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                width: "100px",
              }}>Quantity</th>
              <th style={{
                padding: "14px 15px",
                textAlign: "right",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                width: "120px",
              }}>Unit Price</th>
              <th style={{
                padding: "14px 15px",
                textAlign: "right",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                width: "120px",
              }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? "white" : "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}>
                <td style={{ padding: "16px 15px", fontSize: "14px", color: "#1f2937" }}>
                  {item.product_name}
                </td>
                <td style={{ padding: "16px 15px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "16px 15px", textAlign: "right", fontSize: "14px", color: "#64748b" }}>
                  {formatCurrency(item.sell_price || item.unit_price)}
                </td>
                <td style={{ padding: "16px 15px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                  {formatCurrency(item.total || item.total_price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "40px" }}>
          <div style={{ width: "350px" }}>
            {subtotal > 0 && subtotal !== total && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}>
                <span style={{ fontSize: "15px", color: "#64748b" }}>Subtotal:</span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#1f2937" }}>{formatCurrency(subtotal)}</span>
              </div>
            )}
            {discount > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}>
                <span style={{ fontSize: "15px", color: "#64748b" }}>Discount:</span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#dc2626" }}>-{formatCurrency(discount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom: "1px solid #e2e8f0",
              }}>
                <span style={{ fontSize: "15px", color: "#64748b" }}>Tax/GST:</span>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#1f2937" }}>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "18px 20px",
              background: "#1e40af",
              color: "white",
              marginTop: "2px",
            }}>
              <span style={{ fontSize: "17px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>
                Total:
              </span>
              <span style={{ fontSize: "22px", fontWeight: "700" }}>{formatCurrency(total)}</span>
            </div>
            {dueAmount > 0 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "15px 20px",
                background: "#fef2f2",
                border: "2px solid #fca5a5",
                marginTop: "10px",
              }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#dc2626", textTransform: "uppercase" }}>
                  Amount Due:
                </span>
                <span style={{ fontSize: "18px", fontWeight: "700", color: "#dc2626" }}>{formatCurrency(dueAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Signature Section */}
        {signature && (
          <div style={{
            marginTop: "50px",
            paddingTop: "30px",
            borderTop: "2px solid #e2e8f0",
          }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{
                  margin: "0 0 15px 0",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}>
                  Authorized By
                </p>
                <img src={signature} alt="Signature" style={{ height: "65px", marginBottom: "10px" }} />
                <div style={{
                  borderTop: "2px solid #1e40af",
                  paddingTop: "10px",
                  minWidth: "200px",
                }}>
                  <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
                    Authorized Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "40px",
          paddingTop: "25px",
          borderTop: "1px solid #e2e8f0",
          textAlign: "center",
        }}>
          <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#1e40af" }}>
            Thank You For Your Business
          </p>
          <p style={{ margin: "0", fontSize: "13px", color: "#94a3b8" }}>
            If you have any questions about this invoice, please contact {shop?.email || "us"}
          </p>
        </div>
      </div>

      {/* Bottom Blue Bar */}
      <div style={{
        height: "8px",
        background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
        marginTop: "10px",
      }} />
    </div>
  );
};

export default CorporateBlueLayout;
