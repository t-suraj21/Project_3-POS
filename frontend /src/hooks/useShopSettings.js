import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "./useAuth";

export const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // UTs
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

export const TIMEZONES_IN = [
  { value: "Asia/Kolkata", label: "IST — India Standard Time (UTC+5:30)" },
];

const EMPTY = {
  name: "", email: "", phone: "", address: "",
  country: "India", state: "", pincode: "", gstin: "",
  currency: "INR", currency_symbol: "₹",
  timezone: "Asia/Kolkata", pagination_limit: "20", gst_enabled: "1",
  billing_layout: "classic",
};

const useShopSettings = () => {
  const { id: shopId } = useParams();
  const navigate       = useNavigate();
  const { setShopName } = useAuth();

  const [form,          setForm]          = useState(EMPTY);
  const [logoFile,      setLogoFile]      = useState(null);
  const [logoPreview,   setLogoPreview]   = useState(null);
  const [existingLogo,  setExistingLogo]  = useState(null);
  const [removeLogo,    setRemoveLogo]    = useState(false);

  const [faviconFile,     setFaviconFile]     = useState(null);
  const [faviconPreview,  setFaviconPreview]  = useState(null);
  const [existingFavicon, setExistingFavicon] = useState(null);
  const [removeFavicon,   setRemoveFavicon]   = useState(false);

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);
  const [layouts,  setLayouts]  = useState([]);

  // ── Load available billing layouts ────────────────────────────────
  const fetchLayouts = useCallback(async () => {
    try {
      const res = await api.get("/api/billing-layouts");
      setLayouts(res.data?.layouts || []);
    } catch (err) {
      console.error("Failed to load billing layouts:", err);
      setLayouts([]);
    }
  }, []);

  // ── Load current settings ─────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/settings");
      const s   = res.data?.shop || {};
      setForm({
        name:             s.name             || "",
        email:            s.email            || "",
        phone:            s.phone            || "",
        address:          s.address          || "",
        country:          s.country          || "India",
        state:            s.state            || "",
        pincode:          s.pincode          || "",
        gstin:            s.gstin            || "",
        currency:         s.currency         || "INR",
        currency_symbol:  s.currency_symbol  || "₹",
        timezone:         s.timezone         || "Asia/Kolkata",
        pagination_limit: String(s.pagination_limit ?? 20),
        gst_enabled:      String(s.gst_enabled ?? 1),
        billing_layout:   s.billing_layout   || "classic",
      });
      if (s.logo)    setExistingLogo(`/${s.logo}`);
      if (s.favicon) setExistingFavicon(`/${s.favicon}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchLayouts();
  }, [fetchSettings, fetchLayouts]);

  // ── Field change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (checked ? "1" : "0") : value }));
  };

  // ── Logo handlers ─────────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveLogo(false);
  };
  const handleRemoveLogo = () => {
    setLogoFile(null); setLogoPreview(null); setExistingLogo(null); setRemoveLogo(true);
  };

  // ── Favicon handlers ──────────────────────────────────────────────
  const handleFaviconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaviconFile(file);
    setFaviconPreview(URL.createObjectURL(file));
    setRemoveFavicon(false);
  };
  const handleRemoveFavicon = () => {
    setFaviconFile(null); setFaviconPreview(null); setExistingFavicon(null); setRemoveFavicon(true);
  };

  // ── Save ───────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!form.name.trim()) { setError("Shop name is required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (logoFile)         fd.append("logo",           logoFile);
      if (removeLogo)       fd.append("remove_logo",    "1");
      if (faviconFile)      fd.append("favicon",        faviconFile);
      if (removeFavicon)    fd.append("remove_favicon", "1");

      const res = await api.post("/api/settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(res.data?.message || "Settings saved.");
      
      // Update shop name in context and localStorage
      localStorage.setItem("shop_name", form.name);
      setShopName(form.name);
      
      // Refresh to get updated paths
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete shop ───────────────────────────────────────────────────
  const handleDeleteShop = async (confirmText) => {
    if (confirmText !== "DELETE") { setError("Type DELETE to confirm."); return; }
    setDeleting(true); setError(null);
    try {
      await api.delete("/api/settings", { data: { confirm: "DELETE" } });
      // Clear session and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("shop_name");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Deletion failed.");
      setDeleting(false);
    }
  };

  return {
    shopId, form, setForm, handleChange,
    logoPreview, existingLogo, handleLogoChange, handleRemoveLogo,
    faviconPreview, existingFavicon, handleFaviconChange, handleRemoveFavicon,
    loading, saving, deleting, error, success, setError, setSuccess,
    layouts,
    handleSave, handleDeleteShop,
  };
};

export default useShopSettings;
