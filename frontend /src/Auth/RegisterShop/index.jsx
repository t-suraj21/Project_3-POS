import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useRegisterShop from "./useRegisterShop";

/* ── Inject CSS ──────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .reg-input {
    width: 100%; padding: 0.72rem 1rem 0.72rem 2.75rem;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 0.93rem; font-family: Inter, sans-serif;
    background: #f9fafb; color: #111827;
    transition: border-color .2s, box-shadow .2s, background .2s;
    outline: none;
  }
  .reg-input:focus {
    border-color: #059669; background: #fff;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
  }
  .reg-input.err { border-color: #ef4444; background: #fff5f5; }
  .reg-input.no-icon { padding-left: 1rem; }
  .reg-btn {
    width: 100%; padding: 0.85rem;
    background: linear-gradient(135deg, #059669, #047857);
    color: #fff; border: none; border-radius: 10px;
    font-size: 1rem; font-weight: 700; font-family: Inter, sans-serif;
    cursor: pointer; letter-spacing: 0.3px;
    transition: opacity .2s, transform .15s, box-shadow .2s;
    box-shadow: 0 4px 14px rgba(5,150,105,0.35);
  }
  .reg-btn:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(5,150,105,0.42); }
  .reg-btn:active:not(:disabled) { transform: translateY(0); }
  .reg-btn:disabled { opacity: .6; cursor: not-allowed; }
  .reg-btn.indigo {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    box-shadow: 0 4px 14px rgba(79,70,229,0.35);
  }
  .reg-btn.indigo:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(79,70,229,0.42); }
  .eye-btn2 { background: none; border: none; cursor: pointer; padding: 0; color: #9ca3af; transition: color .2s; line-height: 1; }
  .eye-btn2:hover { color: #059669; }
  .reg-brand {
    background: linear-gradient(150deg, #059669 0%, #047857 45%, #065f46 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 3rem 2.5rem; color: #fff; text-align: center;
    position: relative; overflow: hidden;
  }
  .reg-brand::before {
    content: ''; position: absolute; width: 320px; height: 320px;
    background: rgba(255,255,255,0.07); border-radius: 50%;
    top: -80px; right: -80px;
  }
  .reg-brand::after {
    content: ''; position: absolute; width: 200px; height: 200px;
    background: rgba(255,255,255,0.05); border-radius: 50%;
    bottom: -60px; left: -60px;
  }
  .reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.1rem; }
  @media (max-width: 860px) {
    .reg-split { flex-direction: column !important; }
    .reg-brand { padding: 2rem 1.5rem !important; min-height: auto !important; }
    .reg-brand .brand-hide2 { display: none; }
    .reg-form-panel { padding: 2rem 1.5rem !important; }
    .reg-grid { grid-template-columns: 1fr !important; }
  }
`;

/* ── SVG icons ───────────────────────────────────────────────────────────── */
const Ic = {
  shop:  () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  user:  () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail:  () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 7.27 7.27l1.18-1.18a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 23 17z"/></svg>,
  lock:  () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  eye:   () => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:() => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
};

/* ── Field helper ────────────────────────────────────────────────────────── */
const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label style={{ display: "block", fontWeight: 600, fontSize: "0.83rem", color: "#374151", marginBottom: "0.38rem" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {Icon && (
        <span style={{ position: "absolute", left: "0.82rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
          <Icon />
        </span>
      )}
      {children}
    </div>
  </div>
);

/* ── Main component ──────────────────────────────────────────────────────── */
const RegisterShop = () => {
  const navigate = useNavigate();
  const {
    form, error, loading, handleChange, handleSubmit,
    sentTo,
    otp, setOtp, verifying, otpError, otpSuccess, handleVerifyOtp,
    resending, resendMsg, handleResend,
  } = useRegisterShop();

  const [showPwd, setShowPwd]   = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  /* shared page wrapper */
  const Page = ({ children, narrow }) => (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f1f5f9", fontFamily: "Inter, sans-serif", padding: "1.25rem",
      }}>
        <div className="reg-split" style={{
          display: "flex", width: "100%", maxWidth: narrow ? 480 : 960,
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}>
          {children}
        </div>
      </div>
    </>
  );

  /* ── OTP success ────────────────────────────────────────────────────────── */
  if (otpSuccess) {
    return (
      <Page narrow>
        <div style={{
          flex: 1, background: "#fff", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "3.5rem 2.5rem", textAlign: "center",
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg,#059669,#047857)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, boxShadow: "0 8px 24px rgba(5,150,105,0.35)", marginBottom: "1.5rem",
          }}>✅</div>
          <h2 style={{ fontSize: "1.55rem", fontWeight: 800, color: "#111827", margin: "0 0 0.5rem" }}>
            Account Verified!
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "2rem" }}>
            Your email has been verified successfully.<br />You can now sign in to your POS account.
          </p>
          <button className="reg-btn" style={{ maxWidth: 260 }} onClick={() => navigate("/login")}>
            Go to Sign In →
          </button>
        </div>
      </Page>
    );
  }

  /* ── OTP entry ──────────────────────────────────────────────────────────── */
  if (sentTo) {
    return (
      <Page narrow>
        <div style={{
          flex: 1, background: "#fff",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "3rem 2.5rem",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, boxShadow: "0 8px 24px rgba(79,70,229,0.3)",
              margin: "0 auto 1.25rem",
            }}>🔐</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 0.4rem" }}>
              Check your email
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
              We sent a <strong>6-digit code</strong> to{" "}
              <strong style={{ color: "#4f46e5" }}>{sentTo}</strong>
            </p>
          </div>

          {/* OTP form */}
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <input
                type="text" inputMode="numeric" maxLength={6}
                placeholder="_ _ _ _ _ _"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus
                style={{
                  width: "100%", maxWidth: 220, fontSize: "2.2rem", fontWeight: 700,
                  letterSpacing: "0.6rem", textAlign: "center",
                  padding: "0.6rem 0.5rem", border: "2px solid #d1d5db",
                  borderRadius: 12, outline: "none",
                  transition: "border-color .2s, box-shadow .2s",
                  fontFamily: "Inter, monospace",
                }}
                onFocus={e => { e.target.style.borderColor = "#4f46e5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {otpError && (
              <p style={{ textAlign: "center", color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>⛔ {otpError}</p>
            )}

            <button className="reg-btn indigo" type="submit" disabled={verifying || otp.length !== 6}>
              {verifying ? "Verifying…" : "Verify Account →"}
            </button>
          </form>

          {/* Hint + resend */}
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
            <div style={{
              width: "100%", background: "#fef9c3", border: "1px solid #fde68a",
              borderRadius: 10, padding: "0.7rem 1rem",
              fontSize: "0.82rem", color: "#92400e", lineHeight: 1.6, textAlign: "center",
            }}>
              💡 Didn't receive it? Check your <strong>Spam/Junk</strong> folder.
            </div>

            {resendMsg && (
              <p style={{
                color: resendMsg.toLowerCase().includes("new") ? "#059669" : "#dc2626",
                fontSize: "0.875rem", margin: 0, textAlign: "center",
              }}>{resendMsg}</p>
            )}

            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: "none", border: "1.5px solid #e5e7eb", borderRadius: 8,
                padding: "0.5rem 1.25rem", fontSize: "0.875rem",
                cursor: resending ? "not-allowed" : "pointer",
                color: "#374151", fontWeight: 600,
                transition: "border-color .2s",
              }}
            >
              {resending ? "Sending…" : "🔄 Resend OTP"}
            </button>

            <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
              Already verified?{" "}
              <Link to="/login" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
            </p>
          </div>
        </div>
      </Page>
    );
  }

  /* ── Registration form ──────────────────────────────────────────────────── */
  return (
    <>
      <style>{CSS}</style>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f1f5f9", fontFamily: "Inter, sans-serif", padding: "1.25rem",
      }}>
        <div className="reg-split" style={{
          display: "flex", width: "100%", maxWidth: 960,
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}>

          {/* ── Brand panel ─────────────────────────────────────────────── */}
          <div className="reg-brand" style={{ flex: "0 0 38%", minHeight: 580 }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 1.5rem",
              }}>🏪</div>

              <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: "0 0 0.5rem", letterSpacing: "-0.5px" }}>
                Join POS
              </h1>
              <p style={{ opacity: 0.85, fontSize: "0.92rem", lineHeight: 1.65, margin: "0 0 2.25rem" }}>
                Set up your shop in minutes and start selling smarter
              </p>

              <div className="brand-hide2" style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                {[
                  ["🚀", "Quick Setup", "Live in under 5 minutes"],
                  ["🔒", "Secure", "Your data, encrypted & safe"],
                  ["📧", "OTP Verified", "Email-verified accounts only"],
                ].map(([icon, title, sub]) => (
                  <div key={title} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    background: "rgba(255,255,255,0.12)", borderRadius: 10,
                    padding: "0.6rem 1rem", backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.15)", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{title}</div>
                      <div style={{ opacity: 0.8, fontSize: "0.78rem" }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Form panel ──────────────────────────────────────────────── */}
          <div className="reg-form-panel" style={{
            flex: 1, background: "#fff",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "2.75rem 2.5rem",
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", margin: "0 0 0.35rem", letterSpacing: "-0.3px" }}>
              Create your account
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.88rem", margin: "0 0 1.8rem" }}>
              Register your shop and verify with a one-time code
            </p>

            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem",
              }}>
                <p style={{ margin: 0, color: "#dc2626", fontSize: "0.875rem" }}>⛔ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* Row 1: Shop name + Owner name */}
              <div className="reg-grid">
                <Field label="Shop Name" icon={Ic.shop}>
                  <input className="reg-input" name="shop_name" placeholder="My Awesome Store"
                    value={form.shop_name} onChange={handleChange} required />
                </Field>
                <Field label="Owner Name" icon={Ic.user}>
                  <input className="reg-input" name="owner_name" placeholder="John Doe"
                    value={form.owner_name} onChange={handleChange} required />
                </Field>
              </div>

              {/* Row 2: Email + Phone */}
              <div className="reg-grid">
                <Field label="Email address" icon={Ic.mail}>
                  <input className="reg-input" type="email" name="email" placeholder="owner@example.com"
                    value={form.email} onChange={handleChange} required autoComplete="email" />
                </Field>
                <Field label="Phone (optional)" icon={Ic.phone}>
                  <input className="reg-input" type="tel" name="phone" placeholder="+91 98765 43210"
                    value={form.phone} onChange={handleChange} />
                </Field>
              </div>

              {/* Row 3: Password + Confirm */}
              <div className="reg-grid">
                <Field label="Password" icon={Ic.lock}>
                  <input
                    className="reg-input"
                    type={showPwd ? "text" : "password"} name="password"
                    placeholder="Min 6 characters" value={form.password}
                    onChange={handleChange} required minLength={6}
                    autoComplete="new-password" style={{ paddingRight: "2.8rem" }}
                  />
                  <button type="button" className="eye-btn2"
                    onClick={() => setShowPwd(p => !p)}
                    style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}>
                    {showPwd ? <Ic.eyeOff /> : <Ic.eye />}
                  </button>
                </Field>
                <Field label="Confirm Password" icon={Ic.lock}>
                  <input
                    className="reg-input"
                    type={showCPwd ? "text" : "password"} name="confirm_password"
                    placeholder="Repeat password" value={form.confirm_password}
                    onChange={handleChange} required minLength={6}
                    autoComplete="new-password" style={{ paddingRight: "2.8rem" }}
                  />
                  <button type="button" className="eye-btn2"
                    onClick={() => setShowCPwd(p => !p)}
                    style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}>
                    {showCPwd ? <Ic.eyeOff /> : <Ic.eye />}
                  </button>
                </Field>
              </div>

              <button className="reg-btn" type="submit" disabled={loading} style={{ marginTop: "0.25rem" }}>
                {loading ? "Creating account…" : "Create Account →"}
              </button>
            </form>

            <p style={{ marginTop: "1.4rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#059669", fontWeight: 700, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default RegisterShop;
