import { useState } from "react";
import api from "../../services/api";

const useRegisterShop = () => {
  const [form, setForm] = useState({
    shop_name:        "",
    owner_name:       "",
    email:            "",
    phone:            "",
    password:         "",
    confirm_password: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // ── OTP screen ────────────────────────────────────────────────────────────
  const [sentTo,     setSentTo]     = useState(null); // switches view to OTP screen
  const [otp,        setOtp]        = useState("");
  const [verifying,  setVerifying]  = useState(false);
  const [otpError,   setOtpError]   = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);

  // ── Resend state ──────────────────────────────────────────────────────────
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Submit registration form ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { confirm_password, ...payload } = form;
      await api.post("/api/auth/register-shop", payload);
      setSentTo(form.email);   // switch to OTP entry screen
    } catch (err) {
      setError(err.response?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");

    if (otp.trim().length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }

    setVerifying(true);
    try {
      await api.post("/api/auth/verify-otp", { email: sentTo, otp: otp.trim() });
      setOtpSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      setOtpError(data?.message ?? "Incorrect OTP. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!sentTo) return;
    setResending(true);
    setResendMsg("");
    setOtpError("");
    try {
      await api.post("/api/auth/resend-verification", { email: sentTo });
      setResendMsg("A new OTP has been sent to your inbox.");
    } catch {
      setResendMsg("Could not resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return {
    form, error, loading, handleChange, handleSubmit,
    sentTo,
    otp, setOtp, verifying, otpError, otpSuccess, handleVerifyOtp,
    resending, resendMsg, handleResend,
  };
};

export default useRegisterShop;
