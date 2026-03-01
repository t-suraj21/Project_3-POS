import { useState } from "react";
import { Link } from "react-router-dom";
import useResetPassword from "./useResetPassword";

/* ── Inject CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .auth-input {
    width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 0.95rem; font-family: Inter, sans-serif;
    background: #f9fafb; color: #111827;
    transition: border-color .2s, box-shadow .2s, background .2s;
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
    transition: opacity .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 4px 14px rgba(79,70,229,0.35);
  }
  .auth-btn:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); }
  .auth-btn:disabled { opacity: .65; cursor: not-allowed; }
  .eye-btn { background: none; border: none; cursor: pointer; padding: 0; color: #9ca3af; transition: color .2s; line-height: 1; }
  .eye-btn:hover { color: #4f46e5; }
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

/* ── Icons ── */
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

const ResetPassword = () => {
  const { token, form, loading, error, success, handleChange, handleSubmit } = useResetPassword();
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Invalid / missing token guard ── */
  if (!token) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "Inter, sans-serif", padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "3rem 2.5rem", maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: "1rem" }}>🔗</div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#111827", marginBottom: "0.75rem" }}>Invalid Reset Link</h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              This password reset link is missing or invalid. Please request a new one.
            </p>
            <Link to="/forgot-password" style={{ display: "inline-block", padding: "0.7rem 1.75rem", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", textDecoration: "none", borderRadius: 10, fontWeight: 700 }}>
              Request New Link
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontFamily: "Inter, sans-serif", padding: "1rem" }}>
        <div className="auth-split" style={{ display: "flex", width: "100%", maxWidth: 880, borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>

          {/* ── Left brand panel ── */}
          <div className="brand-panel" style={{ flex: "0 0 42%", minHeight: 500 }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 1.5rem", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)" }}>🏪</div>
              <h1 style={{ fontSize: "1.9rem", fontWeight: 800, margin: "0 0 0.5rem", letterSpacing: "-0.5px" }}>POS System</h1>
              <p style={{ opacity: 0.85, fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 2.5rem" }}>Smart point-of-sale for growing businesses</p>

              <div className="brand-hide" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  ["🔐", "Secure password update"],
                  ["✅", "One-time link, expires in 30 min"],
                  ["🚀", "Back to work instantly"],
                ].map(([icon, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "0.65rem 1rem", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right form panel ── */}
          <div className="form-panel" style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", padding: "3rem 2.5rem" }}>

            {success ? (
              /* ── Success state ── */
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 1.5rem" }}>✅</div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 0.75rem" }}>Password Updated!</h2>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 2rem" }}>
                  Your password has been changed successfully.<br />
                  Redirecting you to sign-in in a moment…
                </p>
                <Link to="/login" style={{ display: "inline-block", padding: "0.75rem 2rem", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", textDecoration: "none", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", boxShadow: "0 4px 14px rgba(79,70,229,0.35)" }}>
                  Go to Sign In →
                </Link>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#eef2ff", border: "1px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: "1.5rem" }}>🔑</div>

                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: "0 0 0.4rem", letterSpacing: "-0.4px" }}>
                  Set new password
                </h2>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 2rem", lineHeight: 1.6 }}>
                  Choose a strong password — at least 6 characters.
                </p>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
                    <p style={{ margin: 0, color: "#dc2626", fontSize: "0.875rem" }}>⛔ {error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                  {/* New password */}
                  <div>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: "0.4rem" }}>
                      New password
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                        <IconLock />
                      </span>
                      <input
                        className={`auth-input${error ? " error-input" : ""}`}
                        type={showPwd ? "text" : "password"}
                        name="password"
                        placeholder="Min 6 characters"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        style={{ paddingRight: "2.8rem" }}
                      />
                      <button type="button" className="eye-btn" onClick={() => setShowPwd(p => !p)}
                        style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)" }}>
                        {showPwd ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: "0.4rem" }}>
                      Confirm password
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                        <IconLock />
                      </span>
                      <input
                        className={`auth-input${error && form.confirm ? " error-input" : ""}`}
                        type={showConfirm ? "text" : "password"}
                        name="confirm"
                        placeholder="Re-enter your password"
                        value={form.confirm}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        style={{ paddingRight: "2.8rem" }}
                      />
                      <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)}
                        style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)" }}>
                        {showConfirm ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>

                  {/* Strength hint */}
                  {form.password && (
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      {[1, 2, 3, 4].map((bar) => {
                        const len = form.password.length;
                        const strength = len >= 12 ? 4 : len >= 9 ? 3 : len >= 6 ? 2 : 1;
                        const colors = ["", "#ef4444", "#f59e0b", "#22c55e", "#4f46e5"];
                        return (
                          <div key={bar} style={{ flex: 1, height: 4, borderRadius: 9999, background: bar <= strength ? colors[strength] : "#e5e7eb", transition: "background 0.3s" }} />
                        );
                      })}
                    </div>
                  )}

                  <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: "0.25rem" }}>
                    {loading ? "Updating…" : "Update Password →"}
                  </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
                  <Link to="/login" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>
                    ← Back to Sign In
                  </Link>
                </p>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default ResetPassword;
