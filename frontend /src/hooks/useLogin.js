import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "./useAuth";
import { getPrimaryModule, moduleToPath } from "../utils/accessControl";

const useLogin = () => {
  const [form,          setForm]          = useState({ email: "", password: "" });
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [unverified,    setUnverified]    = useState(false);   // true when account isn't verified
  const [resending,     setResending]     = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Already logged in from a previous session → skip the login page entirely
  useEffect(() => {
    if (!user) return;
    console.log("[useLogin] User already logged in, redirecting away from login page");

    // Small delay to prevent navigation conflicts
    const timer = setTimeout(() => {
      if (user.role === "superadmin") {
        navigate("/super/dashboard", { replace: true });
      } else {
        // Route workers to their primary allowed module
        const primaryModule = getPrimaryModule(user.role);
        const targetPath = primaryModule
          ? moduleToPath(primaryModule, user.shop_id)
          : `/shop/${user.shop_id}/dashboard`;
        console.log("[useLogin] Redirect from auth context:", targetPath);
        navigate(targetPath, { replace: true });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Empty dependency - only run on mount for existing session

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
      console.log("Attempting login with:", form.email);
      const res = await api.post("/api/auth/login", form);
      console.log("Login successful:", res.data.user);
      login(res.data);

      const { role, shop_id } = res.data.user;
      if (role === "superadmin") {
        navigate("/super/dashboard");
      } else {
        // Route workers to their primary allowed module
        const primaryModule = getPrimaryModule(role);
        const targetPath = primaryModule
          ? moduleToPath(primaryModule, shop_id)
          : `/shop/${shop_id}/dashboard`;
        console.log("Navigating worker to:", targetPath);
        navigate(targetPath);
      }
    } catch (err) {
      const data = err.response?.data;
      console.error("Login failed:", data || err.message);
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
