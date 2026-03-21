import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";

/* ── Inject CSS once ──────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .auth-input {
    width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 0.95rem; font-family: Inter, sans-serif;
    background: #f9fafb; color: #111827;
    outline: none;
  }
  .auth-input:focus {
    border-color: #4f46e5; background: #fff;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
  }
  .auth-input.error-input { border-color: #ef4444; background: #fff5f5; }
  .auth-btn {
    width: 100%; padding: 0.85rem;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: #fff; border: none; border-radius: 10px;
    font-size: 1rem; font-weight: 700; font-family: Inter, sans-serif;
    cursor: pointer; letter-spacing: 0.3px;
    box-shadow: 0 4px 14px rgba(79,70,229,0.35);
  }
  .auth-btn:disabled { opacity: .65; cursor: not-allowed; }
  .eye-btn { background: none; border: none; cursor: pointer; padding: 0; color: #9ca3af; line-height: 1; }
  .brand-panel {
    background: linear-gradient(150deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 3rem 2.5rem; color: #fff; text-align: center;
    position: relative; overflow: hidden;
  }
  .brand-panel::before {
    content: ''; position: absolute; width: 320px; height: 320px;
    background: rgba(255,255,255,0.07); border-radius: 50%;
    top: -80px; right: -80px;
  }
  .brand-panel::after {
    content: ''; position: absolute; width: 200px; height: 200px;
    background: rgba(255,255,255,0.05); border-radius: 50%;
    bottom: -60px; left: -60px;
  }
  @media (max-width: 768px) {
    .auth-split { flex-direction: column !important; }
    .brand-panel { padding: 2rem 1.5rem !important; min-height: auto !important; }
    .brand-panel .brand-hide { display: none; }
    .form-panel { padding: 2rem 1.5rem !important; }
  }
`;

/* ── SVG Icons ────────────────────────────────────────────────────────────── */
const IconMail = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ── Component ────────────────────────────────────────────────────────────── */
const Login = () => {
  const {
    form, error, loading, handleChange, handleSubmit,
    unverified, resending, resendSuccess, handleResend,
  } = useLogin();

  const [showPwd, setShowPwd] = useState(false);
  const [loginType, setLoginType] = useState("owner"); // "owner" or "worker"

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#f1f5f9",
        fontFamily: "Inter, sans-serif", padding: "1rem",
      }}>
        <div className="auth-split" style={{
          display: "flex", width: "100%", maxWidth: 880,
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}>

          {/* ── Left brand panel ──────────────────────────────────────── */}
          <div className="brand-panel" style={{ flex: "0 0 42%", minHeight: 560 }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 1.5rem",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>🏪</div>

              <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.5rem", letterSpacing: "-0.5px" }}>
                POS System
              </h1>
              <p style={{ opacity: 0.85, fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 2.5rem" }}>
                Smart point-of-sale for growing businesses
              </p>

              <div className="brand-hide" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  ["📦", "Manage Inventory"],
                  ["📊", "Real-time Analytics"],
                  ["🧾", "Fast Billing"],
                ].map(([icon, label]) => (
                  <div key={label} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    background: "rgba(255,255,255,0.12)", borderRadius: 10,
                    padding: "0.65rem 1rem", backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right form panel ──────────────────────────────────────── */}
          <div className="form-panel" style={{
            flex: 1, background: "#fff",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "3rem 2.5rem",
          }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: "0 0 0.4rem", letterSpacing: "-0.4px" }}>
              Welcome back 👋
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
              Sign in to your POS account
            </p>

            {/* Login Type Selector */}
            <div style={{
              display: "flex",
              gap: "0.75rem",
              marginBottom: "2rem",
              background: "#f3f4f6",
              padding: "0.35rem",
              borderRadius: "8px",
            }}>
              <button
                type="button"
                onClick={() => setLoginType("owner")}
                style={{
                  flex: 1,
                  padding: "0.65rem 1rem",
                  border: loginType === "owner" ? "none" : "none",
                  background: loginType === "owner" ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "transparent",
                  color: loginType === "owner" ? "#fff" : "#6b7280",
                  fontWeight: loginType === "owner" ? 700 : 600,
                  fontSize: "0.9rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                👨‍💼 Shop Owner
              </button>
              <button
                type="button"
                onClick={() => setLoginType("worker")}
                style={{
                  flex: 1,
                  padding: "0.65rem 1rem",
                  border: loginType === "worker" ? "none" : "none",
                  background: loginType === "worker" ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "transparent",
                  color: loginType === "worker" ? "#fff" : "#6b7280",
                  fontWeight: loginType === "worker" ? 700 : 600,
                  fontSize: "0.9rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                👷 Worker
              </button>
            </div>

            {/* Helper text */}
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
              {loginType === "owner"
                ? "👨‍💼 Shop owners and managers with account management access"
                : "👷 Workers with specific role-based permissions"}
            </p>
            {unverified && (
              <div style={{
                background: "#fffbeb", border: "1px solid #fcd34d",
                borderRadius: 10, padding: "0.9rem 1rem", marginBottom: "1.25rem",
                display: "flex", flexDirection: "column", gap: "0.5rem",
              }}>
                <p style={{ margin: 0, color: "#92400e", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  ⚠️ {error}
                </p>
                {resendSuccess ? (
                  <p style={{ margin: 0, color: "#059669", fontWeight: 600, fontSize: "0.82rem" }}>{resendSuccess}</p>
                ) : (
                  <button onClick={handleResend} disabled={resending} style={{
                    alignSelf: "flex-start", background: "#4f46e5", color: "#fff",
                    border: "none", borderRadius: 6, padding: "0.35rem 0.85rem",
                    fontSize: "0.82rem", fontWeight: 600, cursor: resending ? "not-allowed" : "pointer",
                    opacity: resending ? 0.7 : 1,
                  }}>
                    {resending ? "Sending…" : "🔄 Resend OTP"}
                  </button>
                )}
              </div>
            )}

            {/* General error */}
            {error && !unverified && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem",
              }}>
                <p style={{ margin: 0, color: "#dc2626", fontSize: "0.875rem" }}>⛔ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: "0.4rem" }}>
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                    <IconMail />
                  </span>
                  <input
                    className={`auth-input${error && !unverified ? " error-input" : ""}`}
                    type="email" name="email" placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    required autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: "0.8rem", color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                    <IconLock />
                  </span>
                  <input
                    className="auth-input"
                    type={showPwd ? "text" : "password"} name="password"
                    placeholder="••••••••" value={form.password}
                    onChange={handleChange} required autoComplete="current-password"
                    style={{ paddingRight: "2.8rem" }}
                  />
                  <button type="button" className="eye-btn"
                    onClick={() => setShowPwd(p => !p)}
                    style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)" }}>
                    {showPwd ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: "0.25rem" }}>
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </form>

            <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
              New to POS?{" "}
              <Link to="/register" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>
                Register your shop
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;
