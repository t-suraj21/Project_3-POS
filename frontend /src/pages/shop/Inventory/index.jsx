import { useEffect } from "react";
import useInventory from "../../../hooks/useInventory";
import { T, S, injectSpinnerStyle } from "./styles";

// Base URL for product images — empty because Vite proxies /uploads/* to PHP.
const IMG_BASE = "";

// ─── Formatting helpers ───────────────────────────────────────────────────────
const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });

const formatDate = (str) => {
  const d = new Date(str);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

// ─── Small reusable UI components ─────────────────────────────────────────────

/** Wraps content in a white rounded card. */
function Card({ children, style }) {
  return <div style={{ ...S.card, ...style }}>{children}</div>;
}

/** KPI summary card with a coloured top border. */
function KpiCard({ icon, label, value, sub, accent = T.primary }) {
  return (
    <div style={S.makeKpiCard(accent)}>
      <div style={S.kpiCardHeader}>
        <p style={S.kpiLabel}>{label}</p>
        <span style={S.kpiIcon}>{icon}</span>
      </div>
      <p style={S.kpiValue}>{value}</p>
      {sub && <p style={S.kpiSub}>{sub}</p>}
    </div>
  );
}

/** Coloured pill badge that reflects the stock status of a product. */
function StockBadge({ status, stock }) {
  const map = {
    in_stock:     { bg: T.greenBg, color: T.green,  label: `${stock} in stock` },
    low_stock:    { bg: T.amberBg, color: T.amber,  label: `Only ${stock} left` },
    out_of_stock: { bg: T.redBg,   color: T.red,    label: "Out of stock" },
  };
  const cfg = map[status] || map.in_stock;
  return (
    <span style={{ ...S.stockBadge, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

/** Coloured pill badge for the type of stock change (restock, sale, etc.). */
function ChangeTypeBadge({ type }) {
  const map = {
    restock:    { bg: "#eff6ff", color: T.blue,   icon: "📥", label: "Restock" },
    manual:     { bg: "#f5f3ff", color: T.purple, icon: "✏️",  label: "Manual" },
    adjustment: { bg: T.amberBg, color: T.amber,  icon: "⚖️",  label: "Adjustment" },
    return:     { bg: T.greenBg, color: T.green,  icon: "↩️",  label: "Return" },
    sale:       { bg: "#fef2f2", color: T.red,    icon: "🛒",  label: "Sale" },
  };
  const cfg = map[type] || { bg: "#f1f5f9", color: T.sub, icon: "•", label: type };
  return (
    <span style={{ ...S.changeTypeBadge, background: cfg.bg, color: cfg.color }}>
      <span>{cfg.icon}</span>{cfg.label}
    </span>
  );
}

/** Centered empty-state placeholder with an emoji and message. */
function EmptyState({ icon = "🔍", message = "Nothing here yet." }) {
  return (
    <div style={S.emptyWrap}>
      <div style={S.emptyIcon}>{icon}</div>
      <p style={S.emptyMessage}>{message}</p>
    </div>
  );
}

/** Animated spinning loader. */
function Spinner() {
  useEffect(() => { injectSpinnerStyle(); }, []);
  return (
    <div style={S.spinnerWrap}>
      <div style={S.spinnerWheel} />
      <p style={S.spinnerLabel}>Loading…</p>
    </div>
  );
}

/** Labelled field wrapper used inside the stock update form. */
function InputRow({ label, children }) {
  return (
    <div style={S.inputRowWrap}>
      <label style={S.inputRowLabel}>{label}</label>
      {children}
    </div>
  );
}

// ─── Tab: Stock List ──────────────────────────────────────────────────────────

function StockListTab({ hook }) {
  const {
    stockList, stockListLoading, stockListError,
    stockSearch, setStockSearch,
    stockCategory, setStockCategory,
    stockStatusFilter, setStockStatusFilter,
    stockSort, setStockSort,
    categories,
  } = hook;

  return (
    <div>
      {/* Filters bar */}
      <div style={S.filtersBar}>
        <input
          style={{ ...S.input, flex: "1 1 200px", maxWidth: 280 }}
          placeholder="🔍  Search product, SKU, barcode…"
          value={stockSearch}
          onChange={(e) => setStockSearch(e.target.value)}
        />
        <select
          style={{ ...S.select, flex: "1 1 150px", maxWidth: 200 }}
          value={stockCategory}
          onChange={(e) => setStockCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          style={{ ...S.select, flex: "1 1 130px", maxWidth: 170 }}
          value={stockStatusFilter}
          onChange={(e) => setStockStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <select
          style={{ ...S.select, flex: "1 1 120px", maxWidth: 150 }}
          value={stockSort}
          onChange={(e) => setStockSort(e.target.value)}
        >
          <option value="name">Sort: Name</option>
          <option value="stock">Sort: Stock ↑</option>
          <option value="value">Sort: Value ↓</option>
        </select>
      </div>

      {/* Body */}
      {stockListLoading ? (
        <Spinner />
      ) : stockListError ? (
        <p style={{ color: T.red, fontWeight: 600 }}>⚠️ {stockListError}</p>
      ) : stockList.length === 0 ? (
        <EmptyState icon="📦" message="No products match your filters." />
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Product", "SKU", "Category", "Stock", "Alert Level", "Sell Price", "Stock Value", "Status"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stockList.map((p, i) => (
                <tr key={p.id} style={S.makeTrBg(i)}>
                  <td style={S.td}>
                    <div style={S.productCellInner}>
                      {p.image
                        ? <img src={`${IMG_BASE}/${p.image}`} alt={p.name} style={S.productImg} />
                        : <div style={S.productImgPlaceholder}>📦</div>
                      }
                      <span style={S.productName}>{p.name}</span>
                    </div>
                  </td>
                  <td style={S.tdSub}>{p.sku || "—"}</td>
                  <td style={S.tdSub}>{p.category_name || "—"}</td>
                  <td style={S.tdBold}>{p.stock}</td>
                  <td style={S.tdSub}>{p.alert_stock}</td>
                  <td style={S.td}>{money(p.sell_price)}</td>
                  <td style={S.tdBold}>{money(p.stock_value)}</td>
                  <td style={S.td}>
                    <StockBadge status={p.stock_status} stock={p.stock} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={S.tableCount}>
            Showing {stockList.length} product{stockList.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Low Stock Warning ───────────────────────────────────────────────────

function LowStockTab({ hook }) {
  const { lowStockItems, lowStockLoading, lowStockError, setActiveTab, setUpdateField } = hook;

  // Jump to the update tab with this product pre-selected
  const handleRestock = (product) => {
    setUpdateField("productId",  String(product.id));
    setUpdateField("changeType", "restock");
    setActiveTab("stock-update");
  };

  return (
    <div>
      {lowStockLoading ? (
        <Spinner />
      ) : lowStockError ? (
        <p style={{ color: T.red, fontWeight: 600 }}>⚠️ {lowStockError}</p>
      ) : lowStockItems.length === 0 ? (
        <EmptyState icon="✅" message="All products are adequately stocked. Great job!" />
      ) : (
        <>
          {/* Amber warning banner */}
          <div style={S.warningBanner}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <p style={S.warningBannerText}>
              {lowStockItems.length} product{lowStockItems.length !== 1 ? "s" : ""} need restocking.
              Click "Restock" on any item to update its stock level.
            </p>
          </div>

          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {["Product", "SKU", "Category", "Current Stock", "Alert Level", "Urgency", "Action"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((p, i) => (
                  <tr key={p.id} style={S.makeTrBg(i, p.stock_status === "out_of_stock")}>
                    <td style={S.td}>
                      <div style={S.productCellInner}>
                        {p.image
                          ? <img src={`${IMG_BASE}/${p.image}`} alt={p.name} style={S.productImg} />
                          : <div style={S.productImgPlaceholder}>📦</div>
                        }
                        <span style={S.productName}>{p.name}</span>
                      </div>
                    </td>
                    <td style={S.tdSub}>{p.sku || "—"}</td>
                    <td style={S.tdSub}>{p.category_name || "—"}</td>
                    <td style={S.td}>
                      <span style={S.makeLowStockQty(p.stock_status === "out_of_stock")}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={S.tdSub}>{p.alert_stock}</td>
                    <td style={S.td}>
                      <StockBadge status={p.stock_status} stock={p.stock} />
                    </td>
                    <td style={S.td}>
                      <button style={S.restockBtn} onClick={() => handleRestock(p)}>
                        📥 Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Tab: Stock Update ────────────────────────────────────────────────────────

function StockUpdateTab({ hook }) {
  const {
    updateForm, setUpdateField,
    productSearch, setProductSearch,
    productOptions, setProductOptions,
    updateLoading, updateError, updateSuccess,
    submitStockUpdate,
  } = hook;

  const selectedProduct = productOptions.find((p) => String(p.id) === String(updateForm.productId));
  const isAdding        = Number(updateForm.quantity) > 0;

  const CHANGE_TYPES = [
    { value: "restock",    label: "📥 Restock",      desc: "Received new stock from supplier" },
    { value: "manual",     label: "✏️  Manual Update", desc: "Manual quantity correction" },
    { value: "adjustment", label: "⚖️  Adjustment",    desc: "Stock count adjustment after audit" },
    { value: "return",     label: "↩️  Return",        desc: "Items returned by customer" },
  ];

  return (
    <div style={S.updateFormWrap}>
      <Card>
        <h3 style={S.updateFormTitle}>🔄 Update Stock Level</h3>

        {/* Product search */}
        <InputRow label="Select Product">
          <input
            style={S.input}
            placeholder="Type product name to search…"
            value={
              productSearch || updateForm.productId
                ? (productSearch || selectedProduct?.name || "")
                : ""
            }
            onChange={(e) => {
              setProductSearch(e.target.value);
              setUpdateField("productId", "");
            }}
          />

          {/* Autocomplete suggestions */}
          {productOptions.length > 0 && !updateForm.productId && (
            <div style={S.suggestionsDropdown}>
              {productOptions.map((p) => (
                <div
                  key={p.id}
                  style={S.suggestionItem}
                  onClick={() => {
                    setUpdateField("productId", String(p.id));
                    setProductSearch(p.name);
                    setProductOptions([]);
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = T.white)}
                >
                  <div>
                    <p style={S.suggestionName}>{p.name}</p>
                    <p style={S.suggestionMeta}>
                      SKU: {p.sku || "—"} · Current stock: {p.stock}
                    </p>
                  </div>
                  <StockBadge
                    status={p.stock === 0 ? "out_of_stock" : p.stock <= p.alert_stock ? "low_stock" : "in_stock"}
                    stock={p.stock}
                  />
                </div>
              ))}
            </div>
          )}
        </InputRow>

        {/* Selected product info chip */}
        {updateForm.productId && selectedProduct && (
          <div style={S.selectedProductChip}>
            <div>
              <p style={S.selectedProductName}>{selectedProduct.name}</p>
              <p style={S.selectedProductMeta}>
                Current stock: <strong>{selectedProduct.stock}</strong> units
              </p>
            </div>
            <button
              style={S.clearProductBtn}
              onClick={() => { setUpdateField("productId", ""); setProductSearch(""); }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Change type selector */}
        <InputRow label="Change Type">
          <div style={S.changeTypeGrid}>
            {CHANGE_TYPES.map((t) => (
              <button
                key={t.value}
                title={t.desc}
                style={S.makeChangeTypeBtn(updateForm.changeType === t.value)}
                onClick={() => setUpdateField("changeType", t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </InputRow>

        {/* Quantity */}
        <InputRow label="Quantity (use negative to subtract)">
          <input
            type="number"
            style={S.makeQtyInput(updateForm.quantity, T.border)}
            placeholder="e.g. 50 to add, -10 to remove"
            value={updateForm.quantity}
            onChange={(e) => setUpdateField("quantity", e.target.value)}
          />
          {updateForm.quantity && !isNaN(Number(updateForm.quantity)) && (
            <p style={isAdding ? S.qtyHintAdd : S.qtyHintRemove}>
              {isAdding ? "➕" : "➖"} This will {isAdding ? "add" : "remove"}&nbsp;
              {Math.abs(Number(updateForm.quantity))} unit{Math.abs(Number(updateForm.quantity)) !== 1 ? "s" : ""}
              {selectedProduct
                ? ` (new stock: ${selectedProduct.stock + Number(updateForm.quantity)})`
                : ""}
            </p>
          )}
        </InputRow>

        {/* Note */}
        <InputRow label="Note (optional)">
          <textarea
            style={{ ...S.input, height: 72, resize: "vertical" }}
            placeholder="e.g. Received from supplier ABC, invoice #1234"
            value={updateForm.note}
            onChange={(e) => setUpdateField("note", e.target.value)}
          />
        </InputRow>

        {/* Error / success feedback */}
        {updateError && (
          <div style={S.errorBanner}>⚠️ {updateError}</div>
        )}
        {updateSuccess && (
          <div style={S.successBanner}>
            <p style={S.successBannerTitle}>✅ Stock updated successfully!</p>
            <p style={S.successBannerSub}>
              {updateSuccess.product_name}: {updateSuccess.quantity_before} →{" "}
              <strong>{updateSuccess.quantity_after}</strong> units
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          style={S.makeSubmitBtn(updateLoading)}
          disabled={updateLoading}
          onClick={submitStockUpdate}
        >
          {updateLoading ? "Updating…" : "🔄 Update Stock"}
        </button>
      </Card>
    </div>
  );
}

// ─── Tab: Stock History ───────────────────────────────────────────────────────

function HistoryTab({ hook }) {
  const {
    history, historyLoading, historyError,
    historyFilter, setHistoryFilter,
    stockList,
  } = hook;

  const CHANGE_TYPES = ["restock", "manual", "adjustment", "return", "sale"];

  return (
    <div>
      {/* Filters */}
      <div style={S.filtersBar}>
        <select
          style={{ ...S.select, flex: "1 1 180px", maxWidth: 250 }}
          value={historyFilter.productId}
          onChange={(e) => setHistoryFilter((f) => ({ ...f, productId: e.target.value }))}
        >
          <option value="">All Products</option>
          {stockList.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          style={{ ...S.select, flex: "1 1 140px", maxWidth: 180 }}
          value={historyFilter.changeType}
          onChange={(e) => setHistoryFilter((f) => ({ ...f, changeType: e.target.value }))}
        >
          <option value="">All Types</option>
          {CHANGE_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <select
          style={{ ...S.select, flex: "1 1 110px", maxWidth: 140 }}
          value={historyFilter.limit}
          onChange={(e) => setHistoryFilter((f) => ({ ...f, limit: Number(e.target.value) }))}
        >
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
          <option value={250}>Last 250</option>
          <option value={500}>Last 500</option>
        </select>
      </div>

      {/* Body */}
      {historyLoading ? (
        <Spinner />
      ) : historyError ? (
        <p style={{ color: T.red, fontWeight: 600 }}>⚠️ {historyError}</p>
      ) : history.length === 0 ? (
        <EmptyState icon="📋" message="No stock history yet. Updates will appear here." />
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Date & Time", "Product", "Type", "Change", "Before", "After", "Note", "Updated By"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={row.id} style={S.makeTrBg(i)}>
                  <td style={S.tdNowrap}>{formatDate(row.created_at)}</td>
                  <td style={S.td}>
                    <div style={S.historyProductCell}>
                      {row.product_image
                        ? <img src={`${IMG_BASE}/${row.product_image}`} alt="" style={S.historyImg} />
                        : <div style={S.historyImgPlaceholder}>📦</div>
                      }
                      <div>
                        <p style={S.historyProductName}>{row.product_name}</p>
                        {row.product_sku && (
                          <p style={S.historyProductSku}>{row.product_sku}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={S.td}>
                    <ChangeTypeBadge type={row.change_type} />
                  </td>
                  <td style={S.makeQtyChangeTd}>
                    <span style={S.makeQtyChangeSpan(row.quantity_change)}>
                      {row.quantity_change >= 0 ? "+" : ""}{row.quantity_change}
                    </span>
                  </td>
                  <td style={S.tdSub}>{row.quantity_before}</td>
                  <td style={S.tdBold}>{row.quantity_after}</td>
                  <td style={{ ...S.tdSub, fontSize: 12, maxWidth: 200 }}>{row.note || "—"}</td>
                  <td style={{ ...S.tdSub, fontSize: 12 }}>{row.updated_by || "System"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={S.tableCount}>
            Showing {history.length} record{history.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { key: "stock-list",   icon: "📦", label: "Stock List"    },
  { key: "low-stock",    icon: "⚠️",  label: "Low Stock"     },
  { key: "stock-update", icon: "🔄", label: "Stock Update"  },
  { key: "history",      icon: "📋", label: "Stock History" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Inventory() {
  const hook = useInventory();
  const { activeTab, setActiveTab, summary, summaryLoading, lowStockItems } = hook;

  return (
    <div style={S.page}>

      {/* Page header */}
      <div style={S.pageHeader}>
        <h1 style={S.pageTitle}>📦 Inventory Management</h1>
        <p style={S.pageSubtitle}>
          Monitor your stock levels, get low-stock alerts, update quantities, and track every change.
        </p>
      </div>

      {/* KPI summary cards */}
      <div style={S.kpiGrid}>
        <KpiCard icon="🏷️" label="Total Products"
          value={summaryLoading ? "…" : summary.total_products}
          accent={T.primary} />
        <KpiCard icon="📊" label="Total Units In Stock"
          value={summaryLoading ? "…" : summary.total_stock_units.toLocaleString("en-IN")}
          accent={T.blue} />
        <KpiCard icon="⚠️" label="Low Stock Items"
          value={summaryLoading ? "…" : summary.low_stock_count}
          sub="At or below alert level"
          accent={T.amber} />
        <KpiCard icon="❌" label="Out of Stock"
          value={summaryLoading ? "…" : summary.out_of_stock}
          accent={T.red} />
        <KpiCard icon="💰" label="Stock Value (Cost)"
          value={summaryLoading ? "…" : money(summary.stock_value)}
          sub="At cost price"
          accent={T.green} />
        <KpiCard icon="💎" label="Retail Value"
          value={summaryLoading ? "…" : money(summary.retail_value)}
          sub="At sell price"
          accent={T.purple} />
      </div>

      {/* Tab bar */}
      <div style={S.tabBar}>
        {TABS.map((tab) => {
          const isActive  = activeTab === tab.key;
          const showBadge = tab.key === "low-stock" && lowStockItems.length > 0;
          return (
            <button
              key={tab.key}
              style={S.makeTabBtn(isActive)}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {showBadge && (
                <span style={S.tabBadge}>{lowStockItems.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active tab panel */}
      <div style={S.tabPanel}>
        {activeTab === "stock-list"   && <StockListTab   hook={hook} />}
        {activeTab === "low-stock"    && <LowStockTab    hook={hook} />}
        {activeTab === "stock-update" && <StockUpdateTab hook={hook} />}
        {activeTab === "history"      && <HistoryTab     hook={hook} />}
      </div>

    </div>
  );
}
