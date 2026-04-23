import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export const IMG_BASE = "";

const EMPTY_FORM = {
  name:        "",
  sku:         "",
  barcode:     "",
  category_id: "",
  supplier_id: "",
  brand:       "",
  description: "",
  cost_price:  "",
  sell_price:  "",
  stock:       "0",
  alert_stock: "5",
  gst_percent: "0",
  price_type:  "exclusive",
  unit_type:   "pcs",
};

/**
 * Hook for the Add / Edit Product page.
 * Handles form state, two-level category selection, image upload/removal,
 * live GST breakdown, and form submission.
 *
 * Reads :id (shopId) and optional :productId from the URL.
 * Must be used inside a route that has a :id segment.
 */
export const useAddEditProduct = () => {
  const { id: shopId, productId } = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(productId);

  const [form,          setForm]          = useState(EMPTY_FORM);
  const [allCategories, setAllCategories] = useState([]);
  const [parentCatId,   setParentCatId]   = useState("");
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [removeImage,   setRemoveImage]   = useState(false);
  const [imageFiles,    setImageFiles]    = useState([]); // Multiple images array
  const [imagePreviews, setImagePreviews] = useState([]); // Preview URLs for multiple images
  const [loading,       setLoading]       = useState(isEdit);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState(null);

  // ── Inline category creation modal ────────────────────────────────
  const [catModal,     setCatModal]     = useState(false);         // open/close
  const [catModalMode, setCatModalMode] = useState("parent");      // 'parent' | 'sub'
  const [newCatName,   setNewCatName]   = useState("");
  const [newCatSaving, setNewCatSaving] = useState(false);
  const [newCatError,  setNewCatError]  = useState(null);

  // ── Inline supplier creation modal ────────────────────────────────
  const [allSuppliers,   setAllSuppliers]   = useState([]);
  const [supplierModal,  setSupplierModal]  = useState(false);
  const [newSupplierName,setNewSupplierName]= useState("");
  const [newSupplierSaving, setNewSupplierSaving] = useState(false);
  const [newSupplierError, setNewSupplierError] = useState(null);

  // ── Derived category lists ─────────────────────────────────────────
  const parentCats = allCategories.filter((c) => !c.parent_id || c.parent_id === "0");
  const subCats    = allCategories.filter((c) => String(c.parent_id) === String(parentCatId));

  // ── Fetch flat category list ───────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/api/categories/flat");
      setAllCategories(res.data?.categories || []);
    } catch { /* silent */ }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await api.get("/api/suppliers");
      setAllSuppliers(res.data?.suppliers || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { 
    fetchCategories(); 
    fetchSuppliers();
  }, [fetchCategories, fetchSuppliers]);

  // ── Load existing product when editing ────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.get(`/api/products/${productId}`)
      .then((res) => {
        const p = res.data?.product || res.data;
        if (!p) return;

        setForm({
          name:        p.name        || "",
          sku:         p.sku         || "",
          barcode:     p.barcode     || "",
          category_id: p.category_id || "",
          supplier_id: p.supplier_id || "",
          brand:       p.brand       || "",
          description: p.description || "",
          cost_price:  p.cost_price  || "",
          sell_price:  p.sell_price  || "",
          stock:       String(p.stock       ?? "0"),
          alert_stock: String(p.alert_stock ?? "5"),
          gst_percent: String(p.gst_percent ?? "0"),
          price_type:  p.price_type  || "exclusive",
          unit_type:   p.unit_type   || "pcs",
        });

        if (p.category_parent_id) {
          setParentCatId(String(p.category_parent_id));
        } else if (p.category_id) {
          setParentCatId(String(p.category_id));
        }

        if (p.image) setExistingImage(`${IMG_BASE}/${p.image}`);
      })
      .catch(() => setError("Failed to load product."))
      .finally(() => setLoading(false));
  }, [isEdit, productId]);

  // ── Field change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Two-level category handlers ───────────────────────────────────
  const handleParentCatChange = (e) => {
    const val = e.target.value;
    setParentCatId(val);
    setForm((prev) => ({ ...prev, category_id: val }));
  };

  const handleSubCatChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, category_id: val || parentCatId }));
  };

  // ── Inline category creation ──────────────────────────────────────
  const openCatModal = (mode) => {
    setCatModalMode(mode);
    setNewCatName("");
    setNewCatError(null);
    setCatModal(true);
  };
  const closeCatModal = () => { setCatModal(false); setNewCatError(null); };

  const createCategory = async () => {
    if (!newCatName.trim()) { setNewCatError("Category name is required."); return; }
    setNewCatSaving(true);
    setNewCatError(null);
    try {
      const body = { name: newCatName.trim() };
      if (catModalMode === "sub" && parentCatId) body.parent_id = parentCatId;

      const res = await api.post("/api/categories", body);
      const created = res.data?.category;

      // Re-fetch full category list so the new entry appears
      const listRes = await api.get("/api/categories/flat");
      const updated = listRes.data?.categories || [];
      setAllCategories(updated);

      // Auto-select newly created category
      if (created) {
        if (catModalMode === "parent") {
          setParentCatId(String(created.id));
          setForm((prev) => ({ ...prev, category_id: String(created.id) }));
        } else {
          // sub: parent already set, just pick the sub
          setForm((prev) => ({ ...prev, category_id: String(created.id) }));
        }
      }
      setCatModal(false);
    } catch (err) {
      setNewCatError(err.response?.data?.error || "Failed to create category.");
    } finally {
      setNewCatSaving(false);
    }
  };

  // ── Inline supplier creation ──────────────────────────────────────
  const openSupplierModal = () => {
    setNewSupplierName("");
    setNewSupplierError(null);
    setSupplierModal(true);
  };
  const closeSupplierModal = () => { setSupplierModal(false); setNewSupplierError(null); };

  const createSupplier = async () => {
    if (!newSupplierName.trim()) { setNewSupplierError("Supplier name is required."); return; }
    setNewSupplierSaving(true);
    setNewSupplierError(null);
    try {
      const body = { name: newSupplierName.trim() };
      const res = await api.post("/api/suppliers", body);
      const created = res.data?.supplier;

      // Re-fetch suppliers
      const listRes = await api.get("/api/suppliers");
      const updated = listRes.data?.suppliers || [];
      setAllSuppliers(updated);

      if (created) {
        setForm((prev) => ({ ...prev, supplier_id: String(created.id) }));
      }
      setSupplierModal(false);
    } catch (err) {
      setNewSupplierError(err.response?.data?.error || "Failed to create supplier.");
    } finally {
      setNewSupplierSaving(false);
    }
  };

  // ── Image handlers ────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };
  // Handle multiple image uploads
  const handleMultipleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove a single image from multiple images
  const removeMultipleImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    setRemoveImage(true);
  };

  // ── Live GST breakdown ─────────────────────────────────────────────
  const sellPrice = parseFloat(form.sell_price) || 0;
  const gstRate   = parseFloat(form.gst_percent) || 0;
  const priceExcl = form.price_type === "inclusive"
    ? sellPrice / (1 + gstRate / 100) : sellPrice;
  const priceIncl = form.price_type === "exclusive"
    ? sellPrice * (1 + gstRate / 100) : sellPrice;
  const gstAmount = priceIncl - priceExcl;

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) { setError("Product name is required."); return; }
    if (!form.sell_price)  { setError("Sell price is required.");   return; }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (imageFile)   fd.append("image",        imageFile);
      if (removeImage) fd.append("remove_image", "1");
      
      // Handle multiple images
      imageFiles.forEach((file) => {
        fd.append(`images[]`, file);
      });

      if (isEdit) {
        // PHP does not populate $_POST/$_FILES for PUT multipart requests.
        // Use POST with a _method override instead.
        fd.append("_method", "PUT");
        await api.post(`/api/products/${productId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate(`/shop/${shopId}/products`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return {
    shopId, isEdit, form, setForm,
    parentCats, subCats, parentCatId,
    imagePreview, existingImage,
    imageFiles, imagePreviews,
    loading, saving, error,
    priceExcl, priceIncl, gstAmount, gstRate,
    handleChange, handleParentCatChange, handleSubCatChange,
    handleImageChange, handleRemoveImage, handleSubmit,
    handleMultipleImageChange, removeMultipleImage,
    // inline category creation
    catModal, catModalMode, newCatName, setNewCatName,
    newCatSaving, newCatError,
    openCatModal, closeCatModal, createCategory,
    // inline supplier creation
    allSuppliers, supplierModal, newSupplierName, setNewSupplierName,
    newSupplierSaving, newSupplierError,
    openSupplierModal, closeSupplierModal, createSupplier,
  };
};
