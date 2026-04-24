import { useRef } from "react";
import { Link } from "react-router-dom";
import { useAddEditProduct } from "../../../hooks/useAddEditProduct";
import s from "./styles";

// Reusable field wrapper
const Field = ({ label, required, children, style }) => (
  <div style={{ ...s.fieldGroup, ...style }}>
    <label style={s.label}>
      {label}{required && <span style={s.required}>*</span>}
    </label>
    {children}
  </div>
);

// Generate a random SKU code
const genSku = () =>
  "SKU-" + Math.random().toString(36).slice(2, 8).toUpperCase();

// Generate a 12-digit numeric barcode
const genBarcode = () =>
  Math.floor(Math.random() * 1e12).toString().padStart(12, "0");

const AddEditProduct = () => {
  const fileRef = useRef(null);
  const multiImageRef = useRef(null);

  const {
    shopId, isEdit, form, setForm,
    parentCats, subCats, parentCatId,
    imagePreview, existingImage,
    imageFiles, imagePreviews,
    loading, saving, error,
    priceExcl, priceIncl, gstAmount, gstRate,
    handleChange, handleParentCatChange, handleSubCatChange,
    handleImageChange, handleRemoveImage, handleSubmit,
    handleMultipleImageChange, removeMultipleImage,
    catModal, catModalMode, newCatName, setNewCatName,
    newCatSaving, newCatError,
    openCatModal, closeCatModal, createCategory,
    allSuppliers, supplierModal, newSupplierName, setNewSupplierName,
    newSupplierSaving, newSupplierError,
    openSupplierModal, closeSupplierModal, createSupplier,
  } = useAddEditProduct();

  if (loading) return <div style={s.page}><p style={{ color: "#6b7280" }}>Loading…</p></div>;

  const displayImage = imagePreview || existingImage;

  const handleBarcodePrint = () => {
    if (!form.barcode) return;

    const printWindow = window.open("", "_blank", "width=480,height=420");
    if (!printWindow) return;

    const safeName = JSON.stringify(form.name || "Product").replace(/</g, "\\u003c");
    const safeCode = JSON.stringify(form.barcode).replace(/</g, "\\u003c");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Barcode</title>
          <style>
            body {
              margin: 0;
              padding: 24px;
              font-family: "Segoe UI", system-ui, sans-serif;
              color: #111827;
            }
            .label {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
            }
            .product-name {
              font-size: 16px;
              font-weight: 700;
              text-align: center;
            }
            .barcode-text {
              font-family: monospace;
              letter-spacing: 0.18em;
              font-size: 12px;
              color: #374151;
            }
            @media print {
              body { padding: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div id="barcode-product" class="product-name"></div>
            <svg id="barcode"></svg>
            <div id="barcode-text" class="barcode-text"></div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            (function() {
              var name = ${safeName};
              var code = ${safeCode};
              var nameEl = document.getElementById("barcode-product");
              var textEl = document.getElementById("barcode-text");
              if (nameEl) nameEl.textContent = name;
              if (textEl) textEl.textContent = code;
              if (window.JsBarcode) {
                JsBarcode("#barcode", code, {
                  format: "CODE128",
                  width: 2,
                  height: 80,
                  displayValue: true,
                  fontSize: 14,
                  margin: 10,
                });
              }
              setTimeout(function() {
                window.focus();
                window.print();
              }, 250);
            })();
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={s.page}>

      {/* ── Page header ── */}
      <div style={s.pageHeader}>
        <Link to={`/shop/${shopId}/products`} style={s.backBtn}>← Back</Link>
        <h1 style={s.heading}>{isEdit ? "Edit Product" : "Add New Product"}</h1>
      </div>

      {error && <div style={s.error}>{error}</div>}

      <form onSubmit={handleSubmit}>

        {/* ══ 1. Basic Setup ══════════════════════════════════════ */}
        <div style={s.section}>
          <div style={s.sectionHead}>Basic Setup</div>
          <div style={s.sectionBody}>
            <div style={s.basicRow}>

              {/* Left: name + description + SKU */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <Field label="Product name" required>
                  <input
                    style={s.input}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Product name"
                    autoFocus
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    style={s.textarea}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Type description"
                    rows={3}
                  />
                </Field>

                <Field label="Product code SKU">
                  <div style={s.skuRow}>
                    <input
                      style={s.skuInput}
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      placeholder="Product code"
                    />
                    <button
                      type="button"
                      style={s.generateBtn}
                      onClick={() => setForm((prev) => ({ ...prev, sku: genSku() }))}
                    >
                      Generate code
                    </button>
                  </div>
                </Field>

                <Field label="Barcode">
                  <div style={s.skuRow}>
                    <input
                      style={{ ...s.skuInput, letterSpacing: "0.07em" }}
                      name="barcode"
                      value={form.barcode}
                      onChange={handleChange}
                      placeholder="Scan or enter barcode"
                    />
                    <button
                      type="button"
                      style={s.generateBtn}
                      onClick={() => setForm((prev) => ({ ...prev, barcode: genBarcode() }))}
                    >
                      Generate barcode
                    </button>
                  </div>
                  <div style={s.barcodeActions}>
                    <button
                      type="button"
                      style={s.printBtn(!form.barcode)}
                      onClick={handleBarcodePrint}
                      disabled={!form.barcode}
                    >
                      🖨️ Print barcode
                    </button>
                  </div>
                </Field>
              </div>

              {/* Right: image upload */}
              <div style={s.imageCard}>
                <div style={s.imageCardHead}>Upload image</div>

                <div
                  style={s.imagePreviewBox}
                  onClick={() => fileRef.current?.click()}
                  title="Click to upload"
                >
                  {displayImage ? (
                    <img src={displayImage} alt="Product" style={s.previewImg} />
                  ) : (
                    <div style={s.imagePlaceholder}>
                      <div style={s.cameraIcon}>📷</div>
                      <span style={{ fontSize: "0.78rem" }}>Add image</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />

                {displayImage ? (
                  <button type="button" style={s.removeBtn} onClick={handleRemoveImage}>
                    ✕ Remove image
                  </button>
                ) : (
                  <button type="button" style={s.uploadBtn} onClick={() => fileRef.current?.click()}>
                    📁 Choose file
                  </button>
                )}

                <div style={s.imageCardFooter}>
                  File format: .png, .jpg, .jpeg, .webp, .gif<br />
                  File size: Maximum 2MB (1:1)
                </div>
              </div>

            </div>

            {/* ── Multiple Images Gallery ── */}
            {(imageFiles.length > 0 || imagePreviews.length > 0) && (
              <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e7eb" }}>
                <div style={{ marginBottom: "0.8rem", fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>
                  📸 Additional Images ({imageFiles.length})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "0.8rem" }}>
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", aspectRatio: "1" }}>
                      <img src={preview} alt={`Gallery ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => removeMultipleImage(idx)}
                        style={{
                          position: "absolute",
                          top: 4, right: 4,
                          width: 20, height: 20,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.6)",
                          border: "none",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => multiImageRef.current?.click()}
                  style={{
                    marginTop: "0.8rem",
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.8rem",
                    background: "#f3f4f6",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  + Add more images
                </button>
              </div>
            )}

            {imageFiles.length === 0 && imagePreviews.length === 0 && (
              <button
                type="button"
                onClick={() => multiImageRef.current?.click()}
                style={{
                  marginTop: "0.8rem",
                  padding: "0.6rem 1rem",
                  fontSize: "0.85rem",
                  background: "#f0f9ff",
                  border: "1px dashed #0284c7",
                  borderRadius: "6px",
                  color: "#0284c7",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                📁 Add Multiple Images (Optional)
              </button>
            )}

            <input
              ref={multiImageRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: "none" }}
              onChange={handleMultipleImageChange}
            />
          </div>
        </div>

        {/* ══ 2. General Setup ════════════════════════════════════ */}
        <div style={s.section}>
          <div style={s.sectionHead}>General Setup</div>
          <div style={s.sectionBody}>

            <div style={s.grid3}>
              {/* ── Category (parent) ── */}
              <Field label="Category" required>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <select
                    style={{ ...s.select, flex: 1 }}
                    value={parentCatId}
                    onChange={handleParentCatChange}
                  >
                    <option value="">
                      {parentCats.length === 0 ? "No categories yet — click + New" : "Select category"}
                    </option>
                    {parentCats.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    style={s.addCatBtn}
                    onClick={() => openCatModal("parent")}
                    title="Create a new category"
                  >
                    + New
                  </button>
                </div>
                {parentCatId && (
                  <div style={s.catPath}>
                    📂{" "}
                    {parentCats.find((c) => String(c.id) === String(parentCatId))?.name}
                    {subCats.some((c) => String(c.id) === String(form.category_id)) && (
                      <> &rsaquo; {subCats.find((c) => String(c.id) === String(form.category_id))?.name}</>
                    )}
                  </div>
                )}
              </Field>

              {/* ── Sub category ── */}
              <Field label="Sub category">
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <select
                    style={{
                      ...s.select,
                      flex: 1,
                      opacity: !parentCatId ? 0.5 : 1,
                      cursor: !parentCatId ? "not-allowed" : "pointer",
                    }}
                    disabled={!parentCatId}
                    value={subCats.some((c) => String(c.id) === String(form.category_id))
                      ? form.category_id : ""}
                    onChange={handleSubCatChange}
                  >
                    <option value="">
                      {!parentCatId
                        ? "Select category first"
                        : subCats.length === 0
                        ? "No sub-categories yet"
                        : "Select sub category"}
                    </option>
                    {subCats.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {parentCatId && (
                    <button
                      type="button"
                      style={s.addCatBtn}
                      onClick={() => openCatModal("sub")}
                      title="Create sub-category under selected category"
                    >
                      + New
                    </button>
                  )}
                </div>
              </Field>

              {/* Brand — free text */}
              <Field label="Brand">
                <input
                  style={s.input}
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="e.g. Amul, Samsung, Nike"
                />
              </Field>
            </div>

            <div style={s.grid3Last}>
              <Field label="Quantity" required>
                <div style={s.stockRow}>
                  <button
                    type="button"
                    style={{ ...s.stockBtn, ...s.stockBtnLeft }}
                    onClick={() => setForm((p) => ({ ...p, stock: String(Math.max(0, (parseInt(p.stock) || 0) - 1)) }))}
                  >−</button>
                  <input
                    style={s.stockInput}
                    type="number"
                    min="0"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  <button
                    type="button"
                    style={{ ...s.stockBtn, ...s.stockBtnRight }}
                    onClick={() => setForm((p) => ({ ...p, stock: String((parseInt(p.stock) || 0) + 1) }))}
                  >+</button>
                </div>
              </Field>

              <Field label="Reorder Level" required>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  name="alert_stock"
                  value={form.alert_stock}
                  onChange={handleChange}
                  placeholder="Ex: 5"
                />
              </Field>

              <Field label="Unit type">
                <select 
                  style={s.select} 
                  name="unit_type"
                  value={form.unit_type}
                  onChange={handleChange}
                >
                  <option value="pcs">Pieces</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="litre">Litre (L)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="box">Box</option>
                  <option value="dozen">Dozen</option>
                  <option value="meter">Meter (m)</option>
                  <option value="cm">Centimeter (cm)</option>
                </select>
              </Field>
            </div>

          </div>
        </div>

        {/* ══ 3. Price & Discount ══════════════════════════════════ */}
        <div style={s.section}>
          <div style={s.sectionHead}>Price &amp; discount</div>
          <div style={s.sectionBody}>

            <div style={s.priceRow}>
              <Field label="Selling Price" required>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  step="0.01"
                  name="sell_price"
                  value={form.sell_price}
                  onChange={handleChange}
                  placeholder="Selling price"
                />
              </Field>

              <Field label="Purchase price" required>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  step="0.01"
                  name="cost_price"
                  value={form.cost_price}
                  onChange={handleChange}
                  placeholder="Purchase price"
                />
              </Field>

              <Field label="GST Rate">
                <select
                  style={s.select}
                  name="gst_percent"
                  value={form.gst_percent}
                  onChange={handleChange}
                >
                  {[0, 3, 5, 12, 18, 28].map((r) => (
                    <option key={r} value={r}>{r}%</option>
                  ))}
                </select>
              </Field>
            </div>

            <div style={s.priceRow2}>
              <Field label="GST in percent (%)">
                <div style={s.gstToggle}>
                  <button
                    type="button"
                    style={s.gstBtn(form.price_type === "exclusive")}
                    onClick={() => setForm((p) => ({ ...p, price_type: "exclusive" }))}
                  >
                    Excl. GST
                  </button>
                  <button
                    type="button"
                    style={s.gstBtn(form.price_type === "inclusive")}
                    onClick={() => setForm((p) => ({ ...p, price_type: "inclusive" }))}
                  >
                    Incl. GST
                  </button>
                </div>

                {gstRate > 0 && form.sell_price > 0 && (
                  <div style={s.gstBreakdown}>
                    <span style={s.gstLabel}>Excl. GST</span>
                    <span style={s.gstValue}>₹ {priceExcl.toFixed(2)}</span>
                    <span style={s.gstLabel}>GST ({gstRate}%)</span>
                    <span style={s.gstValue}>₹ {gstAmount.toFixed(2)}</span>
                    <span style={{ ...s.gstLabel, borderTop: "1px solid #e0e7ef", paddingTop: "0.35rem" }}>Incl. GST</span>
                    <span style={{ ...s.gstValue, borderTop: "1px solid #e0e7ef", paddingTop: "0.35rem", color: "#1a56db" }}>₹ {priceIncl.toFixed(2)}</span>
                  </div>
                )}
              </Field>

              <Field label="Supplier">
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <select
                    style={{ ...s.select, flex: 1 }}
                    name="supplier_id"
                    value={form.supplier_id}
                    onChange={handleChange}
                  >
                    <option value="">
                      {allSuppliers.length === 0 ? "No suppliers yet — click + New" : "Select supplier"}
                    </option>
                    {allSuppliers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    style={s.addCatBtn}
                    onClick={openSupplierModal}
                    title="Create a new supplier"
                  >
                    + New
                  </button>
                </div>
              </Field>
            </div>

          </div>
        </div>

        {/* ══ Actions ════════════════════════════════════════════ */}
        <div style={s.actionsBar}>
          <Link to={`/shop/${shopId}/products`} style={s.cancelBtn}>
            Cancel
          </Link>
          <button type="submit" style={s.submitBtn(saving)} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update Product" : "Save Product"}
          </button>
        </div>

      </form>

      {/* ══ Inline Category Creation Modal ═══════════════════════════ */}
      {catModal && (
        <div style={s.modalOverlay} onClick={closeCatModal}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>

            <div style={s.modalHead}>
              {catModalMode === "parent" ? "🗂 Add New Category" : "📁 Add New Sub-Category"}
            </div>

            {catModalMode === "sub" && parentCatId && (
              <div style={s.modalSub}>
                Under parent:{" "}
                <strong>{parentCats.find((c) => String(c.id) === String(parentCatId))?.name}</strong>
              </div>
            )}

            <input
              style={s.input}
              autoFocus
              placeholder={
                catModalMode === "parent"
                  ? "e.g. Electronics, Grocery, Clothing…"
                  : "e.g. Mobiles, Snacks, T-Shirts…"
              }
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")  { e.preventDefault(); createCategory(); }
                if (e.key === "Escape") closeCatModal();
              }}
            />

            {newCatError && <div style={s.modalError}>{newCatError}</div>}

            <div style={s.modalActions}>
              <button
                type="button"
                style={s.modalCancelBtn}
                onClick={closeCatModal}
                disabled={newCatSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                style={s.modalSaveBtn(newCatSaving)}
                onClick={createCategory}
                disabled={newCatSaving}
              >
                {newCatSaving ? "Creating…" : "Create"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══ Inline Supplier Creation Modal ═══════════════════════════ */}
      {supplierModal && (
        <div style={s.modalOverlay} onClick={closeSupplierModal}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>

            <div style={s.modalHead}>
              📦 Add New Supplier
            </div>

            <input
              style={s.input}
              autoFocus
              placeholder="Supplier name (e.g. ABC Distributors)"
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")  { e.preventDefault(); createSupplier(); }
                if (e.key === "Escape") closeSupplierModal();
              }}
            />

            {newSupplierError && <div style={s.modalError}>{newSupplierError}</div>}

            <div style={s.modalActions}>
              <button
                type="button"
                style={s.modalCancelBtn}
                onClick={closeSupplierModal}
                disabled={newSupplierSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                style={s.modalSaveBtn(newSupplierSaving)}
                onClick={createSupplier}
                disabled={newSupplierSaving}
              >
                {newSupplierSaving ? "Creating…" : "Create"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AddEditProduct;
