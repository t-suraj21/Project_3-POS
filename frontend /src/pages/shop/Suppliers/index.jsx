import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../services/api";
import s from "../AccountManagement/styles";

const fmt = (v) => `₹${parseFloat(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ── All units grouped by category ──────────────────────────────────
const UNIT_GROUPS = [
  {
    label: "⚖️ Weight",
    units: ["kg","g","mg","quintal","ton"],
  },
  {
    label: "🧴 Volume / Liquid",
    units: ["liter","ml","cl"],
  },
  {
    label: "📦 Count / Pack",
    units: ["pcs","dozen","pack","box","carton","bundle","pair","set","roll","sheet","bag","bottle","can","sachet","strip","tablet","capsule","vial"],
  },
  {
    label: "📏 Length",
    units: ["meter","cm","mm","feet","inch","yard"],
  },
  {
    label: "🔌 Electronics",
    units: ["unit","watt","kwh","ampere","volt"],
  },
];

const ALL_UNITS = UNIT_GROUPS.flatMap(g => g.units);

const EMPTY_PRODUCT = { product_name: "", quantity: "", unit: "pcs", cost_price: "", note: "" };
const EMPTY_INFO    = { name: "", email: "", phone: "", address: "" };
const EMPTY_PAY     = { paid_amount: "", payment_mode: "cash", payment_note: "" };

const inp = {
  padding: "0.5rem 0.7rem", borderRadius: "8px",
  border: "1.5px solid #e2e8f0", fontSize: "0.855rem",
  outline: "none", color: "#0f172a", width: "100%", boxSizing: "border-box",
};
const secHead = {
  fontSize: "0.7rem", fontWeight: 800, color: "#6366f1",
  textTransform: "uppercase", letterSpacing: "0.08em",
  borderBottom: "2px solid #eef2ff", paddingBottom: "0.4rem",
  marginBottom: "0.9rem", marginTop: "1.3rem",
};

export default function Suppliers() {
  const { id: shopId } = useParams();
  const navigate = useNavigate();

  const [suppliers, setSuppliers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [info, setInfo]             = useState(EMPTY_INFO);
  const [products, setProducts]     = useState([{ ...EMPTY_PRODUCT }]);
  const [pay, setPay]               = useState(EMPTY_PAY);
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState(null);

  // ── derived totals ───────────────────────────────────────────────
  const totalAmt = products.reduce((sum, p) => {
    return sum + (parseFloat(p.quantity) || 0) * (parseFloat(p.cost_price) || 0);
  }, 0);
  const paidAmt      = parseFloat(pay.paid_amount) || 0;
  const remainingAmt = Math.max(0, totalAmt - paidAmt);

  // ── fetch ────────────────────────────────────────────────────────
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res  = await api.get("/api/suppliers");
      setSuppliers(Array.isArray(res.data?.suppliers) ? res.data.suppliers : []);
    } catch (err) {
      const st  = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to load suppliers";
      setError(st === 401 ? "Session expired. Please log in again."
             : st === 403 ? "You don't have permission to view suppliers."
             : `Server error: ${msg}`);
      setSuppliers([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  // ── modal helpers ────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setInfo(EMPTY_INFO);
    setProducts([{ ...EMPTY_PRODUCT }]);
    setPay(EMPTY_PAY);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (sup) => {
    setEditingId(sup.id);
    setInfo({ name: sup.name||"", email: sup.email||"", phone: sup.phone||"", address: sup.address||"" });
    setProducts([{ ...EMPTY_PRODUCT }]);
    setPay(EMPTY_PAY);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditingId(null); };

  // ── product row helpers ──────────────────────────────────────────
  const updProd = (idx, field, val) =>
    setProducts(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  const addRow    = () => setProducts(prev => [...prev, { ...EMPTY_PRODUCT }]);
  const removeRow = (idx) => setProducts(prev => prev.filter((_, i) => i !== idx));

  // ── submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!info.name.trim()) { setFormError("Supplier name is required."); return; }

    const filled = products.filter(p => p.product_name.trim());
    const bad    = filled.find(p => !parseFloat(p.cost_price));
    if (bad) { setFormError(`Cost price required for "${bad.product_name}".`); return; }
    if (paidAmt > totalAmt && totalAmt > 0) { setFormError("Paid amount cannot exceed total purchase amount."); return; }

    setSaving(true); setFormError(null);
    try {
      if (editingId) {
        await api.put(`/api/suppliers/${editingId}`, { ...info });
      } else {
        await api.post("/api/suppliers", {
          ...info,
          products: filled,
          paid_amount: paidAmt,
          payment_mode: pay.payment_mode,
          payment_note: pay.payment_note,
        });
      }
      closeModal();
      await fetchSuppliers();
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save supplier");
    } finally { setSaving(false); }
  };

  // ── delete ───────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier? This cannot be undone.")) return;
    setDeletingId(id);
    try { await api.delete(`/api/suppliers/${id}`); await fetchSuppliers(); }
    catch (err) { alert(err.response?.data?.error || "Failed to delete supplier"); }
    finally { setDeletingId(null); }
  };

  // ── stats ────────────────────────────────────────────────────────
  const filtered      = suppliers.filter(sup => {
    const q = search.toLowerCase();
    return !q || sup.name?.toLowerCase().includes(q) || sup.phone?.toLowerCase().includes(q) || sup.email?.toLowerCase().includes(q);
  });
  const totalPurchased = suppliers.reduce((a, x) => a + parseFloat(x.total_purchased||0), 0);
  const totalPaid2     = suppliers.reduce((a, x) => a + parseFloat(x.total_paid||0), 0);
  const totalDue       = suppliers.reduce((a, x) => a + parseFloat(x.remaining_balance||0), 0);
  const pendingCount   = suppliers.filter(x => parseFloat(x.remaining_balance||0) > 0).length;

  // ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <h1 style={s.heading}>Suppliers Directory</h1>
          <p style={s.subheading}>Manage suppliers, purchases &amp; payment balances.</p>
        </div>
        <button style={s.addBtn} onClick={openAdd} id="add-supplier-btn">＋ Add Supplier</button>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statCard("","#6366f1")}><div style={s.statLabel}>Total Suppliers</div><div style={s.statValue("#6366f1")}>{suppliers.length}</div></div>
        <div style={s.statCard("","#0ea5e9")}><div style={s.statLabel}>Total Purchased</div><div style={s.statValue("#0ea5e9")}>{fmt(totalPurchased)}</div></div>
        <div style={s.statCard("","#16a34a")}><div style={s.statLabel}>Total Paid</div><div style={s.statValue("#16a34a")}>{fmt(totalPaid2)}</div></div>
        <div style={s.statCard("","#dc2626")}>
          <div style={s.statLabel}>Total Outstanding</div>
          <div style={s.statValue("#dc2626")}>{fmt(totalDue)}</div>
          {pendingCount > 0 && <div style={{ fontSize:"0.72rem", color:"#dc2626", fontWeight:600 }}>{pendingCount} supplier{pendingCount>1?"s":""} pending</div>}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"12px", padding:"1rem 1.25rem", marginBottom:"1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#dc2626", fontWeight:600, fontSize:"0.875rem" }}>⚠️ {error}</span>
          <button onClick={fetchSuppliers} style={{ background:"#dc2626", color:"#fff", border:"none", borderRadius:"8px", padding:"0.4rem 1rem", cursor:"pointer", fontWeight:700, fontSize:"0.8rem" }}>Retry</button>
        </div>
      )}

      {/* Table */}
      <div style={s.tableCard}>
        <div style={s.tableHead}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", flex:1 }}>
            <span style={s.tableTitle}>All Suppliers</span>
            <span style={s.countBadge}>{filtered.length}</span>
            <div style={{ ...s.searchWrap, marginLeft:"1rem" }}>
              <input style={s.searchInput} placeholder="Search name, phone, email…" value={search} onChange={e=>setSearch(e.target.value)} />
              {search && <button style={{ ...s.searchBtn, background:"#94a3b8" }} onClick={()=>setSearch("")}>✕</button>}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={s.loadingWrap}><div style={{ fontSize:"1.5rem" }}>⏳</div> Loading suppliers…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={{ fontSize:"2.5rem" }}>🏭</div>
            {search ? `No suppliers match "${search}"` : 'No suppliers yet. Click "Add Supplier" to get started.'}
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["SL","Supplier","Contact","Total Purchase","Total Paid","Remaining Due","Status","Actions"].map(h=>(
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sup, idx) => {
                const bal = parseFloat(sup.remaining_balance||0);
                return (
                  <tr key={sup.id} onMouseEnter={e=>e.currentTarget.style.background="#f8faff"} onMouseLeave={e=>e.currentTarget.style.background=""} style={{ transition:"background 0.15s" }}>
                    <td style={s.td}>{idx+1}</td>
                    <td style={s.td}>
                      <div style={s.nameCell}>
                        <div style={s.avatar}>{sup.name?.[0]?.toUpperCase()||"?"}</div>
                        <div>
                          <div style={s.custName}>{sup.name}</div>
                          {sup.address && <div style={s.custPhone}>📍 {sup.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      {sup.phone && <div style={s.custPhone}>📞 {sup.phone}</div>}
                      {sup.email && <div style={s.custPhone}>✉️ {sup.email}</div>}
                      {!sup.phone && !sup.email && <span style={{ color:"#cbd5e1" }}>—</span>}
                    </td>
                    <td style={s.td}>{fmt(sup.total_purchased)}</td>
                    <td style={s.td}>{fmt(sup.total_paid)}</td>
                    <td style={bal>0?s.tdRed:s.td}>{fmt(sup.remaining_balance)}</td>
                    <td style={s.td}><span style={s.statusBadge(sup.status==="cleared")}>{sup.status==="cleared"?"✓ Cleared":"⚠ Pending"}</span></td>
                    <td style={s.td}>
                      <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
                        <button style={s.viewBtn} onClick={()=>navigate(`/shop/${shopId}/suppliers/${sup.id}`)}>👁 View</button>
                        <button style={{ ...s.viewBtn, background:"#fefce8", color:"#ca8a04" }} onClick={()=>openEdit(sup)}>✏️ Edit</button>
                        <button style={{ ...s.viewBtn, background:"#fef2f2", color:"#ef4444" }} onClick={()=>handleDelete(sup.id)} disabled={deletingId===sup.id}>
                          {deletingId===sup.id?"…":"🗑️ Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ═══ MODAL ═══════════════════════════════════════════════════ */}
      {modalOpen && (
        <div style={{ ...s.overlay, alignItems:"flex-start", paddingTop:"1.5rem", paddingBottom:"1.5rem", overflowY:"auto" }} onClick={closeModal}>
          <div style={{ ...s.modal, width:"min(720px, 97vw)", maxHeight:"none" }} onClick={e=>e.stopPropagation()}>
            <h2 style={s.modalTitle}>{editingId ? "✏️ Edit Supplier" : "➕ Add New Supplier"}</h2>

            <form onSubmit={handleSubmit} noValidate>

              {/* ── 1. Basic Info ─────────────────────────────── */}
              <div style={secHead}>📋 Supplier Information</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem" }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={s.label}>Supplier Name <span style={{ color:"#ef4444" }}>*</span></label>
                  <input style={inp} autoFocus value={info.name} onChange={e=>setInfo({...info,name:e.target.value})} placeholder="e.g. ABC Distributors Pvt. Ltd." />
                </div>
                <div>
                  <label style={s.label}>Mobile Number</label>
                  <input style={inp} type="tel" value={info.phone} onChange={e=>setInfo({...info,phone:e.target.value})} placeholder="9876543210" />
                </div>
                <div>
                  <label style={s.label}>Email Address</label>
                  <input style={inp} type="email" value={info.email} onChange={e=>setInfo({...info,email:e.target.value})} placeholder="supplier@example.com" />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={s.label}>Address</label>
                  <textarea style={{ ...inp, minHeight:"55px", resize:"vertical", fontFamily:"inherit" }} value={info.address} onChange={e=>setInfo({...info,address:e.target.value})} placeholder="Full address of the supplier" />
                </div>
              </div>

              {/* ── 2. Products (Add only) ─────────────────────── */}
              {!editingId && (
                <>
                  <div style={secHead}>📦 Products Purchased</div>

                  {/* Column headers */}
                  <div style={{ display:"grid", gridTemplateColumns:"2fr 0.9fr 1fr 1fr 1fr 36px", gap:"0.4rem", marginBottom:"0.4rem", padding:"0 2px" }}>
                    {["Product Name","Qty","Unit","Rate/Unit (₹)","Amount",""].map((h,i)=>(
                      <div key={i} style={{ fontSize:"0.68rem", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.04em" }}>{h}</div>
                    ))}
                  </div>

                  {/* Product rows */}
                  {products.map((p, idx) => {
                    const rowAmt = (parseFloat(p.quantity)||0) * (parseFloat(p.cost_price)||0);
                    return (
                      <div key={idx} style={{ display:"grid", gridTemplateColumns:"2fr 0.9fr 1fr 1fr 1fr 36px", gap:"0.4rem", marginBottom:"0.45rem", alignItems:"center" }}>
                        {/* Product name */}
                        <input style={inp} value={p.product_name} onChange={e=>updProd(idx,"product_name",e.target.value)} placeholder="Product name" />

                        {/* Quantity — decimal allowed */}
                        <input style={{ ...inp, textAlign:"right" }} type="number" min="0" step="any" value={p.quantity} onChange={e=>updProd(idx,"quantity",e.target.value)} placeholder="0" />

                        {/* Unit dropdown */}
                        <select
                          style={{ ...inp, background:"#fff", cursor:"pointer", paddingRight:"0.3rem" }}
                          value={p.unit}
                          onChange={e=>updProd(idx,"unit",e.target.value)}
                        >
                          {UNIT_GROUPS.map(grp => (
                            <optgroup key={grp.label} label={grp.label}>
                              {grp.units.map(u => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>

                        {/* Cost price per unit */}
                        <input style={{ ...inp, textAlign:"right" }} type="number" min="0" step="0.01" value={p.cost_price} onChange={e=>updProd(idx,"cost_price",e.target.value)} placeholder="0.00" />

                        {/* Row total — read-only */}
                        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"8px", padding:"0.5rem 0.6rem", fontSize:"0.855rem", fontWeight:700, color:"#16a34a", textAlign:"right" }}>
                          {fmt(rowAmt)}
                        </div>

                        {/* Remove */}
                        <button type="button" onClick={()=>removeRow(idx)} disabled={products.length===1}
                          style={{ background:"#fef2f2", border:"none", borderRadius:"8px", height:"36px", width:"36px", cursor:"pointer", color:"#ef4444", fontWeight:700, fontSize:"1rem", opacity:products.length===1?0.3:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          ✕
                        </button>
                      </div>
                    );
                  })}

                  {/* Add row */}
                  <button type="button" onClick={addRow}
                    style={{ marginTop:"0.35rem", background:"#eef2ff", border:"1.5px dashed #a5b4fc", borderRadius:"8px", padding:"0.5rem 1rem", color:"#4f46e5", fontWeight:700, fontSize:"0.82rem", cursor:"pointer", width:"100%" }}>
                    ＋ Add Another Product
                  </button>

                  {/* ── 3. Payment ─────────────────────────────── */}
                  <div style={secHead}>💳 Payment Details</div>

                  {/* Summary box */}
                  <div style={{ background:"#f8fafc", borderRadius:"12px", border:"1px solid #e2e8f0", padding:"0.9rem 1.1rem", marginBottom:"0.9rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.45rem" }}>
                      <span style={{ fontSize:"0.875rem", color:"#475569" }}>Total Purchase Amount</span>
                      <span style={{ fontWeight:800, color:"#0f172a" }}>{fmt(totalAmt)}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.45rem" }}>
                      <span style={{ fontSize:"0.875rem", color:"#475569" }}>Amount Paid Now</span>
                      <span style={{ fontWeight:800, color:"#16a34a" }}>{fmt(paidAmt)}</span>
                    </div>
                    <div style={{ borderTop:"1.5px dashed #e2e8f0", paddingTop:"0.45rem", display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"0.875rem", fontWeight:700, color:"#dc2626" }}>Remaining Balance</span>
                      <span style={{ fontWeight:800, fontSize:"1.05rem", color:remainingAmt>0?"#dc2626":"#16a34a" }}>{fmt(remainingAmt)}</span>
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.8rem" }}>
                    <div>
                      <label style={s.label}>Amount Paid (₹)</label>
                      <input style={inp} type="number" min="0" step="0.01" value={pay.paid_amount} onChange={e=>setPay({...pay,paid_amount:e.target.value})} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={s.label}>Payment Mode</label>
                      <select style={{ ...inp, background:"#fff" }} value={pay.payment_mode} onChange={e=>setPay({...pay,payment_mode:e.target.value})}>
                        <option value="cash">💵 Cash</option>
                        <option value="upi">📱 UPI</option>
                        <option value="card">💳 Card</option>
                        <option value="bank_transfer">🏦 Bank Transfer</option>
                      </select>
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <label style={s.label}>Payment Note (optional)</label>
                      <input style={inp} value={pay.payment_note} onChange={e=>setPay({...pay,payment_note:e.target.value})} placeholder="e.g. Advance payment" />
                    </div>
                  </div>
                </>
              )}

              {formError && <p style={s.errorMsg}>⚠️ {formError}</p>}

              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" style={{ ...s.submitBtn, opacity:saving?0.7:1 }} disabled={saving}>
                  {saving?(editingId?"Updating…":"Saving…"):(editingId?"Update Supplier":"Add Supplier")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
