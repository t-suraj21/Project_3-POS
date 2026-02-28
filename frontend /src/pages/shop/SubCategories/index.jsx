import { useSubCategories } from "../../../hooks/useSubCategories";
import s from "./styles";

const IMG_BASE = "http://localhost:8080";

const SubCategories = () => {
  const {
    categories, totalPages, page, setPage,
    loading, error,
    parentList,
    search, setSearch, handleSearch,
    form, handleFormChange,
    imageFile, imagePreview, fileRef,
    handleImageChange, handleRemoveImage, handleReset, handleAdd,
    saving, formError,
    editCat, editForm, editImagePrev, editFileRef,
    handleEditFormChange, handleEditImageChange, handleEditRemoveImage,
    openEdit, closeEdit, handleUpdate,
    editSaving, editError,
    handleDelete,
  } = useSubCategories();

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Sub Category Setup</h1>

      {/* ── Add Form Card ───────────────────────────────────────────── */}
      <div style={s.formCard}>
        <p style={s.formCardTitle}>Add New Sub Category</p>
        <form onSubmit={handleAdd}>
          <div style={s.formGrid}>
            {/* Left: parent + name + description */}
            <div style={s.formLeft}>
              <div style={s.formGroup}>
                <label style={s.label}>Parent Category <span style={{color:"#ef4444"}}>*</span></label>
                <select
                  style={{ ...s.input, background: "#fff" }} name="parent_id"
                  value={form.parent_id} onChange={handleFormChange}
                >
                  <option value="">— Select parent category —</option>
                  {parentList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Sub Category Name <span style={{color:"#ef4444"}}>*</span></label>
                <input
                  style={s.input} name="name" value={form.name}
                  onChange={handleFormChange} placeholder="Enter sub-category name…" autoComplete="off"
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Description</label>
                <textarea
                  style={s.textarea} name="description" value={form.description}
                  onChange={handleFormChange} placeholder="Short description…"
                />
              </div>
            </div>

            {/* Right: image upload */}
            <div style={s.formGroup}>
              <label style={s.label}>Image</label>
              <div style={s.imgPanel} onClick={() => fileRef.current?.click()}>
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="preview" style={s.imgPreview} />
                    <button type="button" style={s.removeImgBtn}
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}>✕</button>
                  </>
                ) : (
                  <>
                    <span style={s.imgIcon}>📷</span>
                    <span style={s.imgHint}>Click to add image<br />(JPG, PNG, WEBP · max 1MB)</span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleImageChange} />
            </div>
          </div>

          {formError && <p style={s.errorMsg}>{formError}</p>}
          <div style={s.formActions}>
            <button type="button" style={s.resetBtn} onClick={handleReset}>Reset</button>
            <button type="submit"  style={s.submitBtn} disabled={saving}>
              {saving ? "Saving…" : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Sub-Category Table ──────────────────────────────────────── */}
      <div style={s.tableCard}>
        <div style={s.tableHead}>
          <div>
            <span style={s.tableTitle}>Sub Category List</span>
            <span style={s.badge}>{categories.length}</span>
          </div>
          <div style={s.toolbar}>
            <div style={s.searchWrap}>
              <input
                style={s.searchInput} placeholder="Search…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button style={s.searchBtn} onClick={handleSearch}>Search</button>
            </div>
            <button style={s.iconBtn} title="Refresh" onClick={handleSearch}>↻</button>
          </div>
        </div>

        {error   && <p style={{ color:"#dc2626", padding:"1rem" }}>{error}</p>}
        {loading ? (
          <p style={{ padding:"2rem", textAlign:"center", color:"#9ca3af" }}>Loading…</p>
        ) : categories.length === 0 ? (
          <div style={s.empty}>No sub-categories found. Add one above!</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>SL</th>
                <th style={s.th}>Sub Category Name</th>
                <th style={s.th}>Parent Category</th>
                <th style={s.th}>Description</th>
                <th style={s.th}>Total Product</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={cat.id}>
                  <td style={s.td}>{(page - 1) * 10 + idx + 1}</td>

                  <td style={s.td}>
                    <div style={s.nameCellWrap}>
                      {cat.image
                        ? <img src={`${IMG_BASE}/${cat.image}`} alt={cat.name} style={s.catThumb} />
                        : <div style={s.catThumbPlaceholder}>📂</div>
                      }
                      <div>
                        <div style={s.catName}>{cat.name}</div>
                        <div style={s.catId}>ID #{cat.id}</div>
                      </div>
                    </div>
                  </td>

                  <td style={s.td}>
                    <span style={{ fontSize: "0.82rem", color: "#4f46e5", fontWeight: 600 }}>
                      {cat.parent_name || "—"}
                    </span>
                  </td>

                  <td style={s.td}>
                    <div style={s.descTrunc} title={cat.description || ""}>
                      {cat.description || <span style={{color:"#d1d5db"}}>—</span>}
                    </div>
                  </td>

                  <td style={s.td}>
                    <span style={s.countBadge}>{cat.product_count ?? 0}</span>
                  </td>

                  <td style={s.td}>
                    <div style={s.toggleWrap}>
                      <button style={s.toggleTrack(true)} onClick={() => {}}>
                        <div style={s.toggleThumb(true)} />
                      </button>
                      <span style={{ fontSize: "0.75rem", color: "#16a34a" }}>Active</span>
                    </div>
                  </td>

                  <td style={s.td}>
                    <div style={s.actionWrap}>
                      <button style={s.viewBtn} title="View">👁</button>
                      <button style={s.editBtn} title="Edit" onClick={() => openEdit(cat)}>✏</button>
                      <button style={s.deleteBtn} title="Delete" onClick={() => handleDelete(cat.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={s.paginationWrap}>
            <button style={s.pageBtn(false)} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} style={s.pageBtn(n === page)} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button style={s.pageBtn(false)} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────── */}
      {editCat && (
        <div style={s.overlay} onClick={closeEdit}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={s.modalTitle}>Edit Sub Category</h2>
            <div style={s.formGroup}>
              <label style={s.label}>Sub Category Name <span style={{color:"#ef4444"}}>*</span></label>
              <input style={s.input} name="name" value={editForm.name} onChange={handleEditFormChange} />
            </div>
            <div style={{ marginTop: "1rem", ...s.formGroup }}>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} name="description" value={editForm.description} onChange={handleEditFormChange} />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={s.label}>Image</label>
              <div style={s.imgPanel} onClick={() => editFileRef.current?.click()}>
                {editImagePrev ? (
                  <>
                    <img src={editImagePrev} alt="preview" style={s.imgPreview} />
                    <button type="button" style={s.removeImgBtn}
                      onClick={(e) => { e.stopPropagation(); handleEditRemoveImage(); }}>✕</button>
                  </>
                ) : (
                  <><span style={s.imgIcon}>📷</span><span style={s.imgHint}>Click to change image</span></>
                )}
              </div>
              <input ref={editFileRef} type="file" accept="image/*"
                style={{ display:"none" }} onChange={handleEditImageChange} />
            </div>
            {editError && <p style={s.errorMsg}>{editError}</p>}
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={closeEdit}>Cancel</button>
              <button style={s.updateBtn} onClick={handleUpdate} disabled={editSaving}>
                {editSaving ? "Saving…" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategories;
