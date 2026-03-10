import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "./useAuth";

const useLogin = () => {
  const [form,          setForm]          = useState({ email: "", password: "" });
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [unverified,    setUnverified]    = useState(false);   // true when account isn't verified
  const [resending,     setResending]     = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Already logged in → skip the login page entirely
  useEffect(() => {
    if (!user) return;
    if (user.role === "superadmin") {
      navigate("/super/dashboard", { replace: true });
    } else {
      navigate(`/shop/${user.shop_id}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear unverified notice when the user edits the form
    if (unverified) { setUnverified(false); setResendSuccess(""); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setResendSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", form);
      login(res.data);

      const { role, shop_id } = res.data.user;
      if (role === "superadmin") {
        navigate("/super/dashboard");
      } else {
        navigate(`/shop/${shop_id}/dashboard`);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.unverified) {
        setUnverified(true);
        setError(data.message);
      } else {
        setError(data?.message ?? "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend verification from the login page
  const handleResend = async () => {
    setResending(true);
    setResendSuccess("");
    try {
      await api.post("/api/auth/resend-verification", { email: form.email });
      setResendSuccess("A new verification link has been sent! Check your inbox.");
    } catch {
      setResendSuccess("Could not resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return {
    form, error, loading, handleChange, handleSubmit,
    unverified, resending, resendSuccess, handleResend,
  };
};

export default useLogin;
