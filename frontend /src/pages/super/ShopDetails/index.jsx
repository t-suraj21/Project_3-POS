import { Link } from "react-router-dom";
import useShopDetails from "../../../hooks/useShopDetails";
import styles from "./styles";

const ShopDetails = () => {
  const {
    shop,
    loading,
    saving,
    error,
    success,
    logoFile,
    setLogoFile,
    handleChange,
    handleSave,
    handleLogoUpload,
  } = useShopDetails();

  if (loading) return <div style={styles.page}><p>Loading…</p></div>;
  if (!shop)   return <div style={styles.page}><p style={styles.error}>{error || "Shop not found"}</p></div>;

  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <h1 style={styles.title}>Edit Shop — {shop.name}</h1>
        <Link to="/super/shops" style={styles.backBtn}>← All Shops</Link>
      </div>

      {error   && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <div style={styles.layout}>

        {/* ── Left: Info Form ── */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Shop Information</p>

          <form onSubmit={handleSave} style={styles.form}>
            <div style={styles.row}>
              <label style={styles.label}>Shop Name</label>
              <input
                style={styles.input}
                name="name"
                value={shop.name ?? ""}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.row}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                value={shop.email ?? ""}
                onChange={handleChange}
              />
            </div>

            <div style={styles.row}>
              <label style={styles.label}>Phone</label>
              <input
                style={styles.input}
                name="phone"
                value={shop.phone ?? ""}
                onChange={handleChange}
              />
            </div>

            <div style={styles.row}>
              <label style={styles.label}>Address</label>
              <textarea
                style={styles.textarea}
                name="address"
                value={shop.address ?? ""}
                onChange={handleChange}
              />
            </div>

            <div style={styles.checkRow}>
              <input
                type="checkbox"
                id="gst"
                name="gst_enabled"
                checked={shop.gst_enabled == 1}
                onChange={handleChange}
              />
              <label htmlFor="gst" style={styles.label}>GST Enabled</label>
            </div>

            <button style={styles.saveBtn} type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* ── Right: Logo + Revenue ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Logo Upload */}
          <div style={styles.card}>
            <p style={styles.cardTitle}>Company Logo</p>
            <div style={styles.logoBox}>
              {shop.logo ? (
                <img
                  src={`http://localhost:8080${shop.logo}`}
                  alt="Shop logo"
                  style={styles.logo}
                />
              ) : (
                <div style={styles.logoPlaceholder}>No Logo</div>
              )}

              <input
                style={styles.fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setLogoFile(e.target.files[0] ?? null)}
              />

              <button
                style={styles.uploadBtn}
                type="button"
                onClick={handleLogoUpload}
                disabled={!logoFile}
              >
                Upload Logo
              </button>
            </div>
          </div>

          {/* Revenue Summary */}
          <div style={styles.card}>
            <p style={styles.cardTitle}>Revenue Summary</p>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Total Sales Revenue</p>
            <p style={styles.revenueValue}>
              ₹ {Number(shop.total_revenue ?? 0).toLocaleString("en-IN")}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopDetails;
