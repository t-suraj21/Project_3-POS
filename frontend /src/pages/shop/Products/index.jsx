import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts, IMG_BASE } from "../../../hooks/useProducts";
import s from "./styles";

const PAGE_SIZE = 12;

// ── Status toggle (local UI only) ─────────────────────────────────────
const StatusToggle = ({ id }) => {
  const [on, setOn] = useState(true);
  return (
    <button
      type="button"
      style={s.toggleTrack(on)}
      onClick={() => setOn((v) => !v)}
      title={on ? "Active — click to deactivate" : "Inactive — click to activate"}
    >
      <span style={s.toggleThumb(on)} />
    </button>
  );
};

const Products = () => {
  const {
    shopId, products, categories,
    loading, error,
    search, setSearch,
    categoryId, setCategoryId,
    lowStock, setLowStock,
    deleteProduct,
  } = useProducts();

  const [page, setPage] = useState(1);

  // Client-side pagination
  const total  = products.length;
  const pages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePg = Math.min(page, pages);
  const slice  = products.slice((safePg - 1) * PAGE_SIZE, safePg * PAGE_SIZE);

  const confirmDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) deleteProduct(id);
  };

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.titleRow}>
          <h1 style={s.heading}>Product List</h1>
          {!loading && <span style={s.countChip}>{total}</span>}
        </div>
        <Link to={`/shop/${shopId}/add-product`} style={s.addBtn}>
          ⊕ Add New Product
        </Link>
      </div>

      {/* ── Toolbar ── */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <input
            style={s.searchInput}
            type="text"
            placeholder="Search by product…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button style={s.searchBtn}>Search</button>
        </div>

        <select
          style={s.categorySelect}
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parent_name ? `↳ ${c.name}` : c.name}
            </option>
          ))}
        </select>

        <div style={s.toolRight}>
          <button
            style={s.lowStockBtn(lowStock)}
            onClick={() => { setLowStock((v) => !v); setPage(1); }}
          >
            ⚠ Low Stock{lowStock ? " ✓" : ""}
          </button>

          <button style={s.iconToolBtn(false)} title="Export">⬇</button>
          <button style={s.iconToolBtn(false)} title="Filter">⚙</button>
          <button style={s.iconToolBtn(false)} title="Refresh" onClick={() => window.location.reload()}>↻</button>
        </div>
      </div>

      {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}

      {/* ── Table ── */}
      <div style={s.card}>
        {loading ? (
          <div style={s.empty}>Loading products…</div>
        ) : (
          <>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.thCenter}>SL</th>
                  <th style={s.th}>Product Name</th>
                  <th style={s.th}>Description</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Purchase Price</th>
                  <th style={s.th}>Selling Price</th>
                  <th style={s.thCenter}>Quantity</th>
                  <th style={s.thCenter}>GST</th>
                  <th style={s.thCenter}>Status</th>
                  <th style={s.thCenter}>Action</th>
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={s.empty}>
                      No products found.{" "}
                      <Link to={`/shop/${shopId}/add-product`} style={{ color: "#1a56db" }}>
                        Add your first product →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  slice.map((p, idx) => {
                    const isLow    = p.stock !== null && p.stock <= (p.alert_stock ?? 5);
                    const globalSl = (safePg - 1) * PAGE_SIZE + idx + 1;

                    return (
                      <tr key={p.id} style={s.tr(isLow)}>
                        {/* SL */}
                        <td style={s.tdCenter}>
                          <span style={s.slNum}>{globalSl}</span>
                        </td>

                        {/* Product Name + image + ID */}
                        <td style={s.td}>
                          <div style={s.nameCell}>
                            {p.image ? (
                              <img
                                src={`${IMG_BASE}/${p.image}`}
                                alt={p.name}
                                style={s.imgThumb}
                              />
                            ) : (
                              <div style={s.imgPlaceholder}>📦</div>
                            )}
                            <div>
                              <div style={s.namePrimary}>{p.name}</div>
                              <div style={s.nameId}>ID # {p.id}{p.sku ? ` · ${p.sku}` : ""}</div>
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td style={s.td}>
                          <span style={s.descText}>
                            {p.description || "N/A"}
                          </span>
                        </td>

                        {/* Category */}
                        <td style={s.td}>
                          {p.category_name ? (
                            <span style={s.catChip}>{p.category_name}</span>
                          ) : "—"}
                        </td>

                        {/* Purchase Price */}
                        <td style={s.td}>
                          <div style={s.price}>
                            ₹ {Number(p.cost_price || 0).toLocaleString("en-IN")}
                          </div>
                        </td>

                        {/* Selling Price */}
                        <td style={s.td}>
                          <div style={s.price}>
                            ₹ {Number(p.sell_price).toLocaleString("en-IN")}
                          </div>
                          <div style={s.priceLabel}>
                            {p.price_type === "inclusive" ? "incl. GST" : "excl. GST"}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td style={s.tdCenter}>
                          <span style={s.stockBadge(isLow)}>
                            {p.stock ?? 0}{isLow ? " ⚠" : ""}
                          </span>
                        </td>

                        {/* GST */}
                        <td style={s.tdCenter}>
                          {Number(p.gst_percent) > 0 ? (
                            <span style={s.gstBadge}>{p.gst_percent}%</span>
                          ) : (
                            <span style={{ color: "#d1d5db" }}>—</span>
                          )}
                        </td>

                        {/* Status toggle */}
                        <td style={s.tdCenter}>
                          <StatusToggle id={p.id} />
                        </td>

                        {/* Actions */}
                        <td style={s.tdCenter}>
                          <div style={{ ...s.actions, justifyContent: "center" }}>
                            <Link
                              to={`/shop/${shopId}/edit-product/${p.id}`}
                              style={s.actionBtn("#1d4ed8", "#dbeafe")}
                              title="View / Edit"
                            >
                              ✏
                            </Link>
                            <button
                              style={s.actionBtn("#b91c1c", "#fee2e2")}
                              onClick={() => confirmDelete(p.id, p.name)}
                              title="Delete"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* ── Pagination ── */}
            {pages > 1 && (
              <div style={s.pagination}>
                <button
                  style={s.pageBtn(false, safePg === 1)}
                  disabled={safePg === 1}
                  onClick={() => setPage((p) => p - 1)}
                >‹</button>

                {Array.from({ length: pages }, (_, i) => i + 1)
                  .filter((pg) => Math.abs(pg - safePg) <= 2)
                  .map((pg) => (
                    <button
                      key={pg}
                      style={s.pageBtn(pg === safePg, false)}
                      onClick={() => setPage(pg)}
                    >
                      {pg}
                    </button>
                  ))}

                <button
                  style={s.pageBtn(false, safePg === pages)}
                  disabled={safePg === pages}
                  onClick={() => setPage((p) => p + 1)}
                >›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
