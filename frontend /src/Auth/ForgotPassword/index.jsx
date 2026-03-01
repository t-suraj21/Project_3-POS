import { Link } from "react-router-dom";
import useForgotPassword from "./useForgotPassword";

/* ── Inject CSS (same design system as Login) ── */
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

const IconMail = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const ForgotPassword = () => {
  const { email, submitted, loading, error, handleChange, handleSubmit } = useForgotPassword();

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

          {/* ── Left brand panel ── */}
          <div className="brand-panel" style={{ flex: "0 0 42%", minHeight: 500 }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 1.5rem",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>🏪</div>

              <h1 style={{ fontSize: "1.9rem", fontWeight: 800, margin: "0 0 0.5rem", letterSpacing: "-0.5px" }}>
                POS System
              </h1>
              <p style={{ opacity: 0.85, fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 2.5rem" }}>
                Smart point-of-sale for growing businesses
              </p>

              <div className="brand-hide" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  ["🔒", "Secure password recovery"],
                  ["📧", "Link sent to your email"],
                  ["⚡", "Back in seconds"],
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

          {/* ── Right form panel ── */}
          <div className="form-panel" style={{
            flex: 1, background: "#fff",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "3rem 2.5rem",
          }}>

            {submitted ? (
              /* ── Success state ── */
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "#f0fdf4", border: "2px solid #86efac",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, margin: "0 auto 1.5rem",
                }}>✉️</div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 0.75rem" }}>
                  Check your inbox
                </h2>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 2rem" }}>
                  If <strong>{email}</strong> is registered, we've sent a password reset link.
                  Check your spam folder if you don't see it within a minute.
                </p>
                <Link to="/login" style={{
                  display: "inline-block",
                  padding: "0.75rem 2rem",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  color: "#fff", textDecoration: "none",
                  borderRadius: 10, fontWeight: 700, fontSize: "0.95rem",
                  boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                }}>
                  ← Back to Sign In
                </Link>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "#eef2ff", border: "1px solid #c7d2fe",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: "1.5rem",
                }}>🔑</div>

                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", margin: "0 0 0.4rem", letterSpacing: "-0.4px" }}>
                  Forgot password?
                </h2>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 2rem", lineHeight: 1.6 }}>
                  No worries! Enter your registered email and we'll send you a reset link.
                </p>

                {error && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem",
                  }}>
                    <p style={{ margin: 0, color: "#dc2626", fontSize: "0.875rem" }}>⛔ {error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", color: "#374151", marginBottom: "0.4rem" }}>
                      Email address
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                        <IconMail />
                      </span>
                      <input
                        className="auth-input"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: "0.25rem" }}>
                    {loading ? "Sending link…" : "Send Reset Link →"}
                  </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
                  Remember your password?{" "}
                  <Link to="/login" style={{ color: "#4f46e5", fontWeight: 700, textDecoration: "none" }}>
                    Sign in
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

export default ForgotPassword;
