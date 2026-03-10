import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";

const EMPTY_FORM = { name: "", description: "", parent_id: "" };
const PER_PAGE   = 10;

/**
 * Hook for the Sub-Categories page.
 * Provides the sub-category list (with parent name) along with search,
 * pagination, an inline add form, and an edit/delete modal.
 * Also fetches the parent category list for the dropdown.
 *
 * Must be used inside a route protected by <ProtectedRoute role="shop_admin">.
 */
export const useSubCategories = () => {
  const [categories, setCategories] = useState([]);
  const [parentList, setParentList] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  // ── Add form ──────────────────────────────────────────────────────
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [formError,    setFormError]    = useState(null);

  // ── Edit modal ────────────────────────────────────────────────────
  const [editCat,       setEditCat]       = useState(null);
  const [editForm,      setEditForm]      = useState(EMPTY_FORM);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePrev, setEditImagePrev] = useState(null);
  const [editSaving,    setEditSaving]    = useState(false);
  const [editError,     setEditError]     = useState(null);

  // ── Table / pagination ────────────────────────────────────────────
  const [search,  setSearch]  = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [page,    setPage]    = useState(1);

  const fileRef     = useRef();
  const editFileRef = useRef();

  // ── Fetch sub-categories ──────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ sub_only: "1" });
      if (searchQ) params.append("search", searchQ);
      const res = await api.get(`/api/categories?${params}`);
      setCategories(res.data?.categories || []);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load sub-categories.");
    } finally { setLoading(false); }
  }, [searchQ]);

  // ── Fetch parent list for dropdown ────────────────────────────────
  const fetchParents = useCallback(async () => {
    try {
      const res = await api.get("/api/categories?parent_only=1");
      setParentList(res.data?.categories || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchCategories(); fetchParents(); }, [fetchCategories, fetchParents]);

  // ── Add form helpers ──────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    handleRemoveImage();
    setFormError(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Sub-category name is required."); return; }
    if (!form.parent_id)   { setFormError("Please select a parent category."); return; }
    setSaving(true); setFormError(null);
    try {
      const fd = new FormData();
      fd.append("name",        form.name.trim());
      fd.append("description", form.description || "");
      fd.append("parent_id",   form.parent_id);
      if (imageFile) fd.append("image", imageFile);
      await api.post("/api/categories", fd);
      handleReset();
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to add sub-category.");
    } finally { setSaving(false); }
  };

  // ── Edit modal helpers ────────────────────────────────────────────
  const openEdit = (cat) => {
    setEditCat(cat);
    setEditForm({ name: cat.name, description: cat.description || "", parent_id: cat.parent_id ?? "" });
    setEditImageFile(null);
    setEditImagePrev(cat.image ? `http://localhost:8080/${cat.image}` : null);
    setEditError(null);
  };

  const closeEdit = () => {
    setEditCat(null);
    setEditImageFile(null);
    setEditImagePrev(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditImagePrev(URL.createObjectURL(file));
  };

  const handleEditRemoveImage = () => {
    setEditImageFile(null);
    setEditImagePrev(null);
    if (editFileRef.current) editFileRef.current.value = "";
  };

  const handleUpdate = async () => {
    if (!editForm.name.trim()) { setEditError("Sub-category name is required."); return; }
    setEditSaving(true); setEditError(null);
    try {
      const fd = new FormData();
      fd.append("name",        editForm.name.trim());
      fd.append("description", editForm.description || "");
      if (editImageFile)                    fd.append("image",        editImageFile);
      if (!editImagePrev && !editImageFile) fd.append("remove_image", "1");
      await api.put(`/api/categories/${editCat.id}`, fd);
      closeEdit();
      fetchCategories();
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update sub-category.");
    } finally { setEditSaving(false); }
  };

  // ── Toggle status ──────────────────────────────────────────────────
  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/api/categories/${id}/status`);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: res.data.status } : c))
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status.");
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sub-category?")) return;
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete sub-category.");
    }
  };

  // ── Pagination ────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(categories.length / PER_PAGE));
  const paged      = categories.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = () => { setSearchQ(search); };

  return {
    categories: paged, totalPages, page, setPage,
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
    // status toggle
    handleToggleStatus,
  };
};
