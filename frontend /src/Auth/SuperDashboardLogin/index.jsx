import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

/* ── Inject CSS ──────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .super-input {
    width: 100%; padding: 0.75rem 1rem 0.75rem 2.8rem;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 0.95rem; font-family: Inter, sans-serif;
    background: #f9fafb; color: #111827;
    outline: none;
  }
  .super-input:focus {
    border-color: #7c3aed; background: #fff;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }
  .super-input.error-input { border-color: #ef4444; background: #fff5f5; }
  .super-btn {
    width: 100%; padding: 0.85rem;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: #fff; border: none; border-radius: 10px;
    font-size: 1rem; font-weight: 700; font-family: Inter, sans-serif;
    cursor: pointer; letter-spacing: 0.3px;
    box-shadow: 0 4px 14px rgba(124,58,237,0.35);
  }
  .super-btn:disabled { opacity: .65; cursor: not-allowed; }
  .super-btn.secondary {
    background: linear-gradient(135deg, #e9d5ff, #f3e8ff);
    color: #7c3aed;
    box-shadow: 0 2px 8px rgba(124,58,237,0.15);
  }
  .eye-btn { background: none; border: none; cursor: pointer; padding: 0; color: #9ca3af; line-height: 1; }
  .super-brand {
    background: linear-gradient(150deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 3rem 2.5rem; color: #fff; text-align: center;
    position: relative; overflow: hidden;
  }
  .super-brand::before {
    content: ''; position: absolute; width: 320px; height: 320px;
    background: rgba(255,255,255,0.07); border-radius: 50%;
    top: -80px; right: -80px;
  }
  .super-brand::after {
    content: ''; position: absolute; width: 200px; height: 200px;
    background: rgba(255,255,255,0.05); border-radius: 50%;
    bottom: -60px; left: -60px;
  }
  @media (max-width: 768px) {
    .super-split { flex-direction: column !important; }
    .super-brand { padding: 2rem 1.5rem !important; min-height: auto !important; }
    .super-brand .brand-hide { display: none; }
    .super-form-panel { padding: 2rem 1.5rem !important; }
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
const IconUser = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
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

/* ── Main Component ──────────────────────────────────────────────────────── */
const SuperDashboardLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Tab state: "login" or "register"
  const [tab, setTab] = useState("login");

  // Login state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Register state
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // ── Login handlers ────────────────────────────────────────────────────
  const handleLoginChange = (e) => {
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLoginError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await api.post("/api/auth/login", loginForm);
      if (res.data.user.role !== "superadmin") {
        setLoginError("Only superadmin users can access this dashboard.");
        setLoginLoading(false);
        return;
      }

      login(res.data);
      navigate("/super/dashboard");
    } catch (err) {
      const data = err.response?.data;
      setLoginError(data?.message ?? "Login failed. Please try again.");
      setLoginLoading(false);
    }
  };

  // ── Register handlers ────────────────────────────────────────────────────
  const handleRegChange = (e) => {
    setRegForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setRegError("");
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    setRegLoading(true);

    if (regForm.password !== regForm.confirmPassword) {
      setRegError("Passwords do not match.");
      setRegLoading(false);
      return;
    }

    if (regForm.password.length < 8) {
      setRegError("Password must be at least 8 characters.");
      setRegLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/register-superadmin", {
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
      });

      setRegSuccess(res.data.message ?? "Registration successful! Please check your email to verify your account.");
      setRegForm({ name: "", email: "", password: "", confirmPassword: "" });

      // Switch to login after 2 seconds
      setTimeout(() => {
        setTab("login");
        setRegSuccess("");
      }, 2000);
    } catch (err) {
      const data = err.response?.data;
      setRegError(data?.message ?? "Registration failed. Please try again.");
      setRegLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f1f5f9",
          fontFamily: "Inter, sans-serif",
          padding: "1rem",
        }}
      >
        <div
          className="super-split"
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 880,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          }}
        >
          {/* ── Left brand panel ──────────────────────────────────────── */}
          <div className="super-brand" style={{ flex: "0 0 42%", minHeight: 560 }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  margin: "0 auto 1.5rem",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                👑
              </div>

              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  margin: "0 0 0.5rem",
                  letterSpacing: "-0.5px",
                }}
              >
                Developer Hub
              </h1>
              <p
                style={{
                  opacity: 0.85,
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  margin: "0 0 2.5rem",
                }}
              >
                Manage all shops and monitor platform performance
              </p>

              <div className="brand-hide" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  ["🛍️", "Manage Shops"],
                  ["📊", "Global Analytics"],
                  ["👥", "User Management"],
                ].map(([icon, label]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      background: "rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      padding: "0.65rem 1rem",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right form panel ──────────────────────────────────────── */}
          <div
            className="super-form-panel"
            style={{
              flex: 1,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "3rem 2.5rem",
            }}
          >
            {/* ── Tab Selector ────────────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "2rem",
                background: "#f3f4f6",
                padding: "0.35rem",
                borderRadius: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => setTab("login")}
                style={{
                  flex: 1,
                  padding: "0.65rem 1rem",
                  border: "none",
                  background: tab === "login" ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "transparent",
                  color: tab === "login" ? "#fff" : "#6b7280",
                  fontWeight: tab === "login" ? 700 : 600,
                  fontSize: "0.9rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                🔐 Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                style={{
                  flex: 1,
                  padding: "0.65rem 1rem",
                  border: "none",
                  background: tab === "register" ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "transparent",
                  color: tab === "register" ? "#fff" : "#6b7280",
                  fontWeight: tab === "register" ? 700 : 600,
                  fontSize: "0.9rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                ✍️ Register
              </button>
            </div>

            {/* ── LOGIN TAB ────────────────────────────────────────────────── */}
            {tab === "login" && (
              <>
                <h2
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: "#111827",
                    margin: "0 0 0.4rem",
                    letterSpacing: "-0.4px",
                  }}
                >
                  Welcome back 👋
                </h2>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
                  Sign in to your developer account
                </p>

                {loginError && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      padding: "0.75rem 1rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <p style={{ margin: 0, color: "#dc2626", fontSize: "0.875rem" }}>⛔ {loginError}</p>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  {/* Email */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#374151",
                        marginBottom: "0.4rem",
                      }}
                    >
                      Email address
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.85rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          pointerEvents: "none",
                        }}
                      >
                        <IconMail />
                      </span>
                      <input
                        className="super-input"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      style={{
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#374151",
                        marginBottom: "0.4rem",
                        display: "block",
                      }}
                    >
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.85rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          pointerEvents: "none",
                        }}
                      >
                        <IconLock />
                      </span>
                      <input
                        className="super-input"
                        type={showPwd ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        required
                        autoComplete="current-password"
                        style={{ paddingRight: "2.8rem" }}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPwd((p) => !p)}
                        style={{
                          position: "absolute",
                          right: "0.8rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        {showPwd ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    className="super-btn"
                    type="submit"
                    disabled={loginLoading}
                    style={{ marginTop: "0.25rem" }}
                  >
                    {loginLoading ? "Signing in…" : "Sign In →"}
                  </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setTab("register")}
                    style={{
                      color: "#7c3aed",
                      fontWeight: 700,
                      textDecoration: "none",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "inherit",
                    }}
                  >
                    Register here
                  </button>
                </p>
              </>
            )}

            {/* ── REGISTER TAB ─────────────────────────────────────────────── */}
            {tab === "register" && (
              <>
                <h2
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: "#111827",
                    margin: "0 0 0.4rem",
                    letterSpacing: "-0.4px",
                  }}
                >
                  Create Account 🚀
                </h2>
                <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
                  Register as a developer to manage shops
                </p>

                {regError && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      padding: "0.75rem 1rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <p style={{ margin: 0, color: "#dc2626", fontSize: "0.875rem" }}>⛔ {regError}</p>
                  </div>
                )}

                {regSuccess && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: 10,
                      padding: "0.75rem 1rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <p style={{ margin: 0, color: "#166534", fontSize: "0.875rem" }}>✅ {regSuccess}</p>
                  </div>
                )}

                <form onSubmit={handleRegSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  {/* Name */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#374151",
                        marginBottom: "0.4rem",
                      }}
                    >
                      Full Name
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.85rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          pointerEvents: "none",
                        }}
                      >
                        <IconUser />
                      </span>
                      <input
                        className="super-input"
                        type="text"
                        name="name"
                        placeholder="John Developer"
                        value={regForm.name}
                        onChange={handleRegChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#374151",
                        marginBottom: "0.4rem",
                      }}
                    >
                      Email address
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.85rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          pointerEvents: "none",
                        }}
                      >
                        <IconMail />
                      </span>
                      <input
                        className="super-input"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={regForm.email}
                        onChange={handleRegChange}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      style={{
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#374151",
                        marginBottom: "0.4rem",
                        display: "block",
                      }}
                    >
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.85rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          pointerEvents: "none",
                        }}
                      >
                        <IconLock />
                      </span>
                      <input
                        className="super-input"
                        type={showRegPwd ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={regForm.password}
                        onChange={handleRegChange}
                        required
                        style={{ paddingRight: "2.8rem" }}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowRegPwd((p) => !p)}
                        style={{
                          position: "absolute",
                          right: "0.8rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        {showRegPwd ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      style={{
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#374151",
                        marginBottom: "0.4rem",
                        display: "block",
                      }}
                    >
                      Confirm Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "0.85rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          pointerEvents: "none",
                        }}
                      >
                        <IconLock />
                      </span>
                      <input
                        className="super-input"
                        type={showRegConfirm ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={regForm.confirmPassword}
                        onChange={handleRegChange}
                        required
                        style={{ paddingRight: "2.8rem" }}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowRegConfirm((p) => !p)}
                        style={{
                          position: "absolute",
                          right: "0.8rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      >
                        {showRegConfirm ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    className="super-btn"
                    type="submit"
                    disabled={regLoading}
                    style={{ marginTop: "0.25rem" }}
                  >
                    {regLoading ? "Creating account…" : "Create Account →"}
                  </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
                  Already have an account?{" "}
                  <button
                    onClick={() => setTab("login")}
                    style={{
                      color: "#7c3aed",
                      fontWeight: 700,
                      textDecoration: "none",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "inherit",
                    }}
                  >
                    Sign in here
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperDashboardLogin;
