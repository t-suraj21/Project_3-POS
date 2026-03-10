/* ─────────────────────────────────────────────────────────────────
   ShopLayout — styles.js
   All static style objects and global CSS live here.
   Dynamic styles (those that depend on the `collapsed` state) are
   built via helper functions in index.jsx.
───────────────────────────────────────────────────────────────── */

// ── Design tokens ────────────────────────────────────────────────
export const SIDEBAR_BG  = "linear-gradient(165deg, #0e0c26 0%, #1e1b4b 40%, #2d2462 72%, #1a1730 100%)";
export const ACCENT      = "#6366f1";
export const ACCENT_DARK = "#4f46e5";

// ── Shell / layout ───────────────────────────────────────────────
export const shell = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  backgroundColor: "#f1f5f9",
};

// ── Sidebar ──────────────────────────────────────────────────────
export const sidebar = {
  minHeight: "100vh",
  flexShrink: 0,
  background: SIDEBAR_BG,
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: 0,
  height: "100vh",
  boxShadow: "3px 0 28px rgba(0,0,0,0.32)",
  zIndex: 100,
  overflow: "hidden",
};

export const sidebarMobileDrawer = {
  position: "fixed",
  top: 0,
  width: 260,
  height: "100vh",
  background: SIDEBAR_BG,
  display: "flex",
  flexDirection: "column",
  boxShadow: "4px 0 32px rgba(0,0,0,0.45)",
  zIndex: 200,
  overflow: "hidden",
};

export const mobileBackdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.52)",
  zIndex: 199,
  backdropFilter: "blur(3px)",
};

// ── Sidebar brand area ───────────────────────────────────────────
export const brandLogoBox = {
  width: 40,
  height: 40,
  borderRadius: 12,
  flexShrink: 0,
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 14px rgba(99,102,241,0.45)",
};

export const brandTitle = {
  color: "#fff",
  fontWeight: 800,
  fontSize: "1.05rem",
  lineHeight: 1.2,
};

export const brandSubtitle = {
  color: "rgba(255,255,255,0.35)",
  fontSize: "0.67rem",
  fontWeight: 500,
  marginTop: 2,
};

export const collapseBtn = {
  width: 28,
  height: 28,
  borderRadius: 8,
  flexShrink: 0,
  border: "1px solid rgba(255,255,255,0.13)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.5)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.72rem",
};

// ── Nav section label ────────────────────────────────────────────
export const navSectionLabel = {
  fontSize: "0.6rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  color: "rgba(255,255,255,0.28)",
  padding: "0.9rem 1.35rem 0.3rem",
  margin: 0,
  textTransform: "uppercase",
};

// ── Sub-menu ─────────────────────────────────────────────────────
export const subMenuInner = {
  marginLeft: "1.85rem",
  paddingLeft: "0.75rem",
  borderLeft: "1px solid rgba(255,255,255,0.1)",
  marginTop: "0.08rem",
  marginBottom: "0.08rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.05rem",
};

export const subLinkBase = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.42rem 0.65rem",
  borderRadius: "8px",
  color: "rgba(255,255,255,0.48)",
  textDecoration: "none",
  fontSize: "0.82rem",
  fontWeight: 500,
};

export const subLinkActive = {
  background: "rgba(129,140,248,0.18)",
  color: "#a5b4fc",
  fontWeight: 700,
};

// ── Active indicator bar inside nav links ─────────────────────────
export const activeBar = {
  position: "absolute",
  left: 0,
  top: "50%",
  transform: "translateY(-50%)",
  width: 3.5,
  height: "55%",
  borderRadius: "0 4px 4px 0",
  background: "linear-gradient(180deg, #818cf8, #a78bfa)",
  boxShadow: "0 0 8px rgba(129,140,248,0.7)",
};

// ── Sidebar footer ───────────────────────────────────────────────
export const userAvatar = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: 800,
  fontSize: "0.88rem",
  boxShadow: "0 2px 10px rgba(99,102,241,0.42)",
};

export const onlineDot = {
  position: "absolute",
  bottom: 1,
  right: 0,
  width: 9,
  height: 9,
  borderRadius: "50%",
  background: "#22c55e",
  border: "2px solid #1e1b4b",
};

export const userNameText = {
  color: "#fff",
  fontWeight: 700,
  fontSize: "0.83rem",
  margin: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const userRoleText = {
  color: "rgba(255,255,255,0.36)",
  fontSize: "0.67rem",
  margin: 0,
};

export const logoutBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.52)",
  cursor: "pointer",
  fontWeight: 600,
  width: "100%",
};

// ── Top bar ──────────────────────────────────────────────────────
export const topBar = {
  height: 64,
  flexShrink: 0,
  background: "rgba(255,255,255,0.97)",
  backdropFilter: "blur(8px)",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 1.5rem",
  gap: "1rem",
  boxShadow: "0 1px 10px rgba(0,0,0,0.06)",
  position: "sticky",
  top: 0,
  zIndex: 50,
};

export const hamburgerBtn = {
  width: 36,
  height: 36,
  borderRadius: 9,
  border: "1.5px solid #e2e8f0",
  background: "#f8fafc",
  cursor: "pointer",
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "#64748b",
};

export const pageIconBadge = {
  width: 38,
  height: 38,
  borderRadius: 11,
  flexShrink: 0,
  background: "linear-gradient(135deg, #eef2ff, #ede9fe)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.15rem",
  boxShadow: "0 2px 8px rgba(99,102,241,0.14)",
};

export const pageTitleText = {
  fontSize: "1.02rem",
  fontWeight: 800,
  color: "#1e293b",
  lineHeight: 1.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const greetingText = {
  fontSize: "0.69rem",
  color: "#94a3b8",
  fontWeight: 500,
  lineHeight: 1,
  marginTop: 1,
};

export const dateBadge = {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.38rem 0.8rem",
  borderRadius: 99,
  background: "#f1f5f9",
  border: "1px solid #e2e8f0",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#64748b",
  whiteSpace: "nowrap",
};

export const newSaleBtn = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.45rem 1.05rem",
  borderRadius: 99,
  background: ACCENT,
  color: "#fff",
  border: "none",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: 700,
  boxShadow: "0 4px 14px rgba(99,102,241,0.38)",
  whiteSpace: "nowrap",
};

export const topBarDivider = {
  width: 1,
  height: 28,
  background: "#e2e8f0",
  flexShrink: 0,
};

export const userChip = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.32rem 0.75rem 0.32rem 0.3rem",
  borderRadius: 99,
  background: "#f8fafc",
  border: "1.5px solid #e2e8f0",
};

export const userChipAvatar = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: 800,
  fontSize: "0.8rem",
  boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
  flexShrink: 0,
};

export const userChipName = {
  fontSize: "0.82rem",
  fontWeight: 700,
  color: "#334155",
  maxWidth: 120,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

// ── Global CSS (injected once as a <style> tag) ──────────────────
export const STYLE_ID = "shop-layout-styles";

export const injectGlobalStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    /* Sidebar nav scrollbar */
    .sl-nav::-webkit-scrollbar           { width: 4px; }
    .sl-nav::-webkit-scrollbar-track     { background: transparent; }
    .sl-nav::-webkit-scrollbar-thumb     { background: rgba(255,255,255,0.12); border-radius: 4px; }

    /* Main content scrollbar */
    .sl-main::-webkit-scrollbar           { width: 6px; }
    .sl-main::-webkit-scrollbar-track     { background: #f1f5f9; }
    .sl-main::-webkit-scrollbar-thumb     { background: #cbd5e1; border-radius: 6px; }

    /* Sub-menu expand/collapse */
    .sl-submenu-wrap { overflow: hidden; }
    .sl-submenu-wrap.open   { max-height: 320px; opacity: 1; }
    .sl-submenu-wrap.closed { max-height: 0;     opacity: 0; }

    /* Chevron when group is open */
    .sl-chevron { display: inline-block; font-size: 0.68rem; opacity: 0.5; }
    .sl-chevron.open { transform: rotate(90deg); }
  `;
  document.head.appendChild(el);
};
