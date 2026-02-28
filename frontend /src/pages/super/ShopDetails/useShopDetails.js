import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../services/api";

const useShopDetails = () => {
  const { id } = useParams();
  const [shop, setShop]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  // ── Fetch shop on mount ──────────────────────────────────────────────────
  useEffect(() => {
    api.get(`/api/super/shops/${id}`)
      .then((res) => setShop(res.data))
      .catch(() => setError("Failed to load shop details"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Handle text field changes ────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShop((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  // ── Save shop info ───────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.put(`/api/super/shops/${id}`, {
        name:        shop.name,
        email:       shop.email,
        phone:       shop.phone,
        address:     shop.address,
        gst_enabled: shop.gst_enabled,
      });
      setSuccess("Shop updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Upload logo ──────────────────────────────────────────────────────────
  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      const res = await api.post(`/api/super/shops/${id}/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShop((prev) => ({ ...prev, logo: res.data.logo }));
      setSuccess("Logo uploaded!");
      setLogoFile(null);
    } catch (err) {
      setError(err.response?.data?.message ?? "Logo upload failed");
    }
  };

  return {
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
  };
};

export default useShopDetails;
