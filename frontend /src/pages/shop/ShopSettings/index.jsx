import { useRef, useState } from "react";
import s from "./styles";
import useShopSettings, { INDIA_STATES } from "../../../hooks/useShopSettings";

const ShopSettings = () => {
  const {
    form, setForm,
    logoPreview, existingLogo,
    handleLogoChange, handleRemoveLogo,
    faviconPreview, existingFavicon,
    handleFaviconChange, handleRemoveFavicon,
    loading, saving, deleting, error, success,
    layouts,
    handleSave, handleDeleteShop,
  } = useShopSettings();

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const logoInputRef    = useRef();
  const faviconInputRef = useRef();

  const currentLogo    = logoPreview    || existingLogo    || null;
  const currentFavicon = faviconPreview || existingFavicon || null;

  if (loading) return <div style={s.loading}>Loading settings…</div>;

  return (
    <div style={s.page}>
      <p style={s.pageTitle}>⚙️ Shop Settings</p>

      {error   && <div style={s.alertError}>⚠️ {error}</div>}
      {success && <div style={s.alertSuccess}>✅ {success}</div>}

      {/* ── Basic Information ─────────────────────────────────────── */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <p style={s.cardTitle}>🏪 Basic Information</p>
          <p style={s.cardSubtitle}>Core shop details shown on receipts and invoices</p>
        </div>
        <div style={s.cardBody}>
          <div style={s.formGrid}>
            {/* Shop Name */}
            <div style={s.formGroup}>
              <label style={s.label}>Shop Name <span style={s.required}>*</span></label>
              <input style={s.input} name="name" placeholder="e.g. Krishna General Store"
                value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>

            {/* Email */}
            <div style={s.formGroup}>
              <label style={s.label}>Email Address <span style={s.required}>*</span></label>
              <input style={s.input} type="email" name="email" placeholder="shop@example.com"
                value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>

            {/* Phone */}
            <div style={s.formGroup}>
              <label style={s.label}>Phone Number <span style={s.required}>*</span></label>
              <input style={s.input} name="phone" placeholder="+91 98765 43210"
                value={form.phone ?? ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>

            {/* Country — fixed India */}
            <div style={s.formGroup}>
              <label style={s.label}>Country</label>
              <input style={{ ...s.input, background: "#f3f4f6", color: "#6b7280" }} value="India 🇮🇳" readOnly />
            </div>

            {/* State */}
            <div style={s.formGroup}>
              <label style={s.label}>State / UT</label>
              <select style={s.select} value={form.state ?? ""} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}>
                <option value="">— Select State —</option>
                {INDIA_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Pincode */}
            <div style={s.formGroup}>
              <label style={s.label}>Pincode</label>
              <input style={s.input} maxLength={6} name="pincode" placeholder="400001"
                value={form.pincode ?? ""} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))} />
            </div>

            {/* Address */}
            <div style={{ ...s.formGroup, ...s.formGridFull }}>
              <label style={s.label}>Shop Address <span style={s.required}>*</span></label>
              <textarea style={s.textarea} name="address" placeholder="Street, Area, City…"
                value={form.address ?? ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>

            {/* GSTIN */}
            <div style={s.formGroup}>
              <label style={s.label}>GSTIN <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
              <input style={s.input} maxLength={15} name="gstin" placeholder="22AAAAA0000A1Z5"
                value={form.gstin ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value.toUpperCase() }))} />
            </div>

            {/* GST Enabled toggle */}
            <div style={s.formGroup}>
              <label style={s.label}>GST Enabled</label>
              <div style={s.checkRow}>
                <input
                  type="checkbox"
                  id="gstEnabled"
                  style={s.checkbox}
                  checked={form.gst_enabled === "1" || form.gst_enabled === 1}
                  onChange={(e) => setForm((f) => ({ ...f, gst_enabled: e.target.checked ? "1" : "0" }))}
                />
                <label htmlFor="gstEnabled" style={s.checkLabel}>
                  Apply GST on sales &amp; invoices
                </label>
              </div>
            </div>

            {/* Currency */}
            <div style={s.formGroup}>
              <label style={s.label}>Currency</label>
              <input style={{ ...s.input, background: "#f3f4f6", color: "#6b7280" }} value="INR — Indian Rupee (₹)" readOnly />
            </div>

            {/* Timezone */}
            <div style={s.formGroup}>
              <label style={s.label}>Timezone</label>
              <input style={{ ...s.input, background: "#f3f4f6", color: "#6b7280" }} value="Asia/Kolkata (IST UTC+5:30)" readOnly />
            </div>

            {/* Pagination Limit */}
            <div style={s.formGroup}>
              <label style={s.label}>Records per Page <span style={s.required}>*</span></label>
              <select
                style={s.select}
                value={form.pagination_limit ?? 25}
                onChange={(e) => setForm((f) => ({ ...f, pagination_limit: Number(e.target.value) }))}
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Images ────────────────────────────────────────────────── */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <p style={s.cardTitle}>🖼️ Shop Branding</p>
          <p style={s.cardSubtitle}>Logo used on receipts; favicon shown in browser tab</p>
        </div>
        <div style={s.cardBody}>
          <div style={s.uploadGrid}>
            {/* LOGO */}
            <div style={s.uploadBox}>
              <p style={s.uploadLabel}>Shop Logo</p>
              <p style={s.uploadHint}>Recommended 3:1 ratio (e.g. 300×100 px)<br />PNG / JPG / WEBP · Max 2 MB</p>

              {currentLogo ? (
                <div style={s.uploadImgWrap}>
                  <img src={currentLogo} alt="Logo" style={s.uploadImg} />
                  <span style={s.editBadge} onClick={() => logoInputRef.current?.click()}>✎</span>
                </div>
              ) : null}

              <div style={s.uploadBtns}>
                <button type="button" style={s.uploadPickBtn} onClick={() => logoInputRef.current?.click()}>
                  {currentLogo ? "Change" : "📁 Upload Logo"}
                </button>
                {currentLogo && (
                  <button type="button" style={s.uploadRemoveBtn} onClick={handleRemoveLogo}>Remove</button>
                )}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
            </div>

            {/* FAVICON */}
            <div style={s.uploadBox}>
              <p style={s.uploadLabel}>Favicon</p>
              <p style={s.uploadHint}>Square image (e.g. 32×32 or 64×64 px)<br />PNG / ICO · Max 512 KB</p>

              {currentFavicon ? (
                <div style={s.uploadImgWrap}>
                  <img src={currentFavicon} alt="Favicon" style={s.faviconImg} />
                  <span style={s.editBadge} onClick={() => faviconInputRef.current?.click()}>✎</span>
                </div>
              ) : null}

              <div style={s.uploadBtns}>
                <button type="button" style={s.uploadPickBtn} onClick={() => faviconInputRef.current?.click()}>
                  {currentFavicon ? "Change" : "📁 Upload Favicon"}
                </button>
                {currentFavicon && (
                  <button type="button" style={s.uploadRemoveBtn} onClick={handleRemoveFavicon}>Remove</button>
                )}
              </div>
              <input ref={faviconInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFaviconChange} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Billing Layout Selection ─────────────────────────────── */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <p style={s.cardTitle}>📄 Billing Layout</p>
          <p style={s.cardSubtitle}>Choose how your billing receipts and invoices appear</p>
        </div>
        <div style={s.cardBody}>
          <div style={s.formGrid}>
            {/* Layout selector */}
            <div style={s.formGroup}>
              <label style={s.label}>Select Layout <span style={s.required}>*</span></label>
              <select
                style={s.select}
                value={form.billing_layout ?? "classic"}
                onChange={(e) => setForm((f) => ({ ...f, billing_layout: e.target.value }))}
              >
                {layouts.length > 0 ? (
                  layouts.map((layout) => (
                    <option key={layout.code} value={layout.code}>
                      {layout.name} — {layout.description}
                    </option>
                  ))
                ) : (
                  <option value="classic">Classic (Default)</option>
                )}
              </select>
            </div>
          </div>

          {/* Layout descriptions */}
          {layouts.length > 0 && (
            <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: "600", marginBottom: "0.75rem" }}>
                Layout Options:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                {layouts.map((layout) => (
                  <div
                    key={layout.code}
                    style={{
                      padding: "1rem",
                      border: form.billing_layout === layout.code ? "2px solid #3b82f6" : "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      backgroundColor: form.billing_layout === layout.code ? "#eff6ff" : "white",
                      cursor: "pointer",
                      transition: "all 200ms",
                    }}
                    onClick={() => setForm((f) => ({ ...f, billing_layout: layout.code }))}
                  >
                    <p style={{ fontWeight: "600", color: form.billing_layout === layout.code ? "#3b82f6" : "#1f2937", marginBottom: "0.25rem" }}>
                      {layout.name}
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                      {layout.description}
                    </p>
                    {form.billing_layout === layout.code && (
                      <p style={{ fontSize: "0.75rem", color: "#3b82f6", fontWeight: "600" }}>✓ Currently selected</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Save button ───────────────────────────────────────────── */}
      <div style={s.footerBar}>
        <button
          style={{ ...s.saveBtn, ...(saving ? s.saveBtnDisabled : {}) }}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "💾 Save Changes"}
        </button>
      </div>

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <div style={s.dangerCard}>
        <div style={s.dangerHeader}>
          <p style={s.dangerTitle}>⚠️ Danger Zone</p>
        </div>
        <div style={s.dangerBody}>
          <p style={s.dangerDesc}>
            Permanently delete this shop and <strong>all associated data</strong> — products, categories, sales,
            orders, customers and user accounts. This action <strong>cannot be undone</strong>.
            <br /><br />
            To confirm, type <strong>DELETE</strong> in the box below.
          </p>
          <div style={s.dangerInputRow}>
            <input
              style={s.dangerInput}
              placeholder='Type "DELETE" to confirm'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            <button
              style={s.deleteBtn(deleteConfirm === "DELETE" && !deleting)}
              disabled={deleteConfirm !== "DELETE" || deleting}
              onClick={() => handleDeleteShop(deleteConfirm)}
            >
              {deleting ? "Deleting…" : "🗑 Delete Shop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;
