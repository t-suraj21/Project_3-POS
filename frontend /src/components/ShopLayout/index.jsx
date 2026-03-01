import { useState } from "react";
import { NavLink, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/* ─── helper: derive page title from pathname ─── */
const getPageTitle = (pathname) => {
  if (pathname.includes("/dashboard"))    return "Dashboard";
  if (pathname.includes("/add-product"))  return "Add Product";
  if (pathname.includes("/edit-product")) return "Edit Product";
  if (pathname.includes("/products"))     return "Products";
  if (pathname.includes("/categories"))   return "Categories";
  if (pathname.includes("/sub-categories")) return "Sub-Categories";
  if (pathname.includes("/accounts"))     return "Account Management";
  if (pathname.includes("/sales"))         return "New Sale";
  if (pathname.includes("/orders"))        return "Orders";
  if (pathname.includes("/reports"))       return "Reports";
  if (pathname.includes("/settings"))      return "Settings";
  return "POS";
};

const ShopLayout = ({ children }) => {
  const { id }           = useParams();
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const base             = `/shop/${id}`;

  const productsOpen   = pathname.includes("/products") || pathname.includes("/add-product") || pathname.includes("/edit-product");
  const categoriesOpen = pathname.includes("/categories") || pathname.includes("/sub-categories");
  const accountsOpen   = pathname.includes("/accounts");
  const ordersOpen     = pathname.includes("/orders") || pathname.includes("/orders/pending");
  const settingsOpen   = pathname.includes("/settings");

  const [prodOpen, setProdOpen] = useState(productsOpen);
  const [catOpen, setCatOpen]   = useState(categoriesOpen);
  const [acctOpen, setAcctOpen] = useState(accountsOpen);
  const [ordOpen,  setOrdOpen]  = useState(ordersOpen);

  const pageTitle = getPageTitle(pathname);

  return (
    <div style={s.shell}>
      {/* ══ Sidebar ══════════════════════════════════════════════════ */}
      <aside style={s.sidebar}>

        {/* Brand */}
        <div style={s.brand}>
          <div style={s.brandLogoWrap}>
            <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>🛒</span>
          </div>
          <div>
            <div style={s.brandText}>ShopPOS</div>
            <div style={s.brandSub}>Admin Panel</div>
          </div>
        </div>

        {/* Nav label */}
        <p style={s.navSection}>MAIN MENU</p>

        <nav style={s.nav}>
          {/* Dashboard */}
          <NavLink
            to={`${base}/dashboard`}
            style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}
          >
            {({ isActive }) => (
              <>
                {isActive && <span style={s.activeBar} />}
                <span style={s.navIcon}>🏠</span>
                <span>Dashboard</span>
              </>
            )}
          </NavLink>

          {/* Products */}
          <div>
            <button
              style={{ ...s.navLink, ...s.navBtn, ...(prodOpen ? s.navGroupOpen : {}) }}
              onClick={() => setProdOpen((v) => !v)}
            >
              <span style={s.navIcon}>📦</span>
              <span style={{ flex: 1, textAlign: "left" }}>Products</span>
              <span style={s.chevron}>{prodOpen ? "▾" : "▸"}</span>
            </button>
            {prodOpen && (
              <div style={s.subMenu}>
                <NavLink to={`${base}/add-product`} style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}>
                  <span style={s.subDot} /> Add New
                </NavLink>
                <NavLink to={`${base}/products`} end style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}>
                  <span style={s.subDot} /> All Products
                </NavLink>
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <button
              style={{ ...s.navLink, ...s.navBtn, ...(catOpen ? s.navGroupOpen : {}) }}
              onClick={() => setCatOpen((v) => !v)}
            >
              <span style={s.navIcon}>🗂️</span>
              <span style={{ flex: 1, textAlign: "left" }}>Categories</span>
              <span style={s.chevron}>{catOpen ? "▾" : "▸"}</span>
            </button>
            {catOpen && (
              <div style={s.subMenu}>
                <NavLink to={`${base}/categories`} end style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}>
                  <span style={s.subDot} /> Categories
                </NavLink>
                <NavLink to={`${base}/sub-categories`} end style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}>
                  <span style={s.subDot} /> Sub-Categories
                </NavLink>
              </div>
            )}
          </div>

          {/* New Sale */}
          <NavLink
            to={`${base}/sales`}
            style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}
          >
            {({ isActive }) => (
              <>
                {isActive && <span style={s.activeBar} />}
                <span style={s.navIcon}>🛒</span>
                <span>New Sale</span>
              </>
            )}
          </NavLink>

          {/* Orders */}
          <div>
            <button
              style={{ ...s.navLink, ...s.navBtn, ...(ordOpen ? s.navGroupOpen : {}) }}
              onClick={() => setOrdOpen((v) => !v)}
            >
              <span style={s.navIcon}>🧾</span>
              <span style={{ flex: 1, textAlign: "left" }}>Orders</span>
              <span style={s.chevron}>{ordOpen ? "▾" : "▸"}</span>
            </button>
            {ordOpen && (
              <div style={s.subMenu}>
                <NavLink to={`${base}/orders`} end style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}>
                  <span style={s.subDot} /> All
                </NavLink>
                <NavLink to={`${base}/orders/completed`} end style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}>
                  <span style={s.subDot} /> Completed
                </NavLink>
                <NavLink to={`${base}/orders/pending`} end style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}>
                  <span style={s.subDot} /> Pending / Balance
                </NavLink>
                <NavLink to={`${base}/orders/refunded`} end style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}>
                  <span style={s.subDot} /> Refunded
                </NavLink>
              </div>
            )}
          </div>

          {/* Account Management */}
          <div>
            <button
              style={{ ...s.navLink, ...s.navBtn, ...(acctOpen ? s.navGroupOpen : {}) }}
              onClick={() => setAcctOpen((v) => !v)}
            >
              <span style={s.navIcon}>💳</span>
              <span style={{ flex: 1, textAlign: "left" }}>Accounts</span>
              <span style={s.chevron}>{acctOpen ? "▾" : "▸"}</span>
            </button>
            {acctOpen && (
              <div style={s.subMenu}>
                <NavLink to={`${base}/accounts`} end style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}>
                  <span style={s.subDot} /> Customers
                </NavLink>
              </div>
            )}
          </div>

          {/* Settings */}
          <NavLink
            to={`${base}/settings`}
            style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}
          >
            {({ isActive }) => (
              <>
                {isActive && <span style={s.activeBar} />}
                <span style={s.navIcon}>⚙️</span>
                <span>Settings</span>
              </>
            )}
          </NavLink>

          {/* Reports */}
          <NavLink
            to={`${base}/reports`}
            style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}
          >
            {({ isActive }) => (
              <>
                {isActive && <span style={s.activeBar} />}
                <span style={s.navIcon}>📊</span>
                <span>Reports</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Footer */}
        <div style={s.sidebarFooter}>
          <div style={s.userCard}>
            <div style={s.userAvatar}>{(user?.name ?? "U")[0].toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <p style={s.userName}>{user?.name}</p>
              <p style={s.userRole}>Shop Owner</p>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={logout}>⎋ Logout</button>
        </div>
      </aside>

      {/* ══ Main area ═══════════════════════════════════════════════ */}
      <div style={s.mainWrap}>
        {/* Top header bar */}
        <header style={s.topBar}>
          <div>
            <span style={s.topBarTitle}>{pageTitle}</span>
          </div>
          <div style={s.topBarRight}>
            <div style={s.topBarAvatar}>{(user?.name ?? "U")[0].toUpperCase()}</div>
            <span style={s.topBarName}>{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main style={s.main}>{children}</main>
      </div>
    </div>
  );
};

const s = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    backgroundColor: "#f1f5f9",
  },

  /* ── Sidebar ── */
  sidebar: {
    width: "252px",
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0f0c29 0%, #302b63 60%, #24243e 100%)",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    flexShrink: 0,
    boxShadow: "2px 0 20px rgba(0,0,0,0.25)",
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1.4rem 1.25rem 1.2rem",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  brandLogoWrap: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
  },
  brandText: { color: "#fff", fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2 },
  brandSub:  { color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", fontWeight: 500, marginTop: "2px" },

  navSection: {
    fontSize: "0.62rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.3)",
    padding: "1.1rem 1.25rem 0.4rem",
    margin: 0,
    textTransform: "uppercase",
  },
  nav: {
    flex: 1,
    padding: "0.3rem 0.75rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.15rem",
    overflowY: "auto",
  },
  navLink: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    padding: "0.62rem 0.85rem",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.58)",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "all 0.18s ease",
  },
  navLinkActive: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    fontWeight: 600,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
  },
  navBtn: {
    width: "100%",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  navGroupOpen: {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.85)",
  },
  activeBar: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "3px",
    height: "60%",
    borderRadius: "0 3px 3px 0",
    background: "#818cf8",
    marginLeft: "-0.85rem",
  },
  navIcon:  { fontSize: "1.05rem", width: "22px", flexShrink: 0, textAlign: "center" },
  chevron:  { fontSize: "0.7rem", opacity: 0.5 },

  subMenu: {
    marginLeft: "2rem",
    marginTop: "0.1rem",
    marginBottom: "0.1rem",
    paddingLeft: "0.65rem",
    borderLeft: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "0.1rem",
  },
  subLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.42rem 0.65rem",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.48)",
    textDecoration: "none",
    fontSize: "0.83rem",
    fontWeight: 500,
    transition: "all 0.15s ease",
  },
  subLinkActive: {
    background: "rgba(129,140,248,0.15)",
    color: "#a5b4fc",
    fontWeight: 600,
  },
  subDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "currentColor",
    opacity: 0.6,
    flexShrink: 0,
  },

  sidebarFooter: {
    padding: "0.9rem 1.1rem",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    padding: "0.5rem 0.65rem",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.06)",
  },
  userAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.85rem",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
  },
  userName: { color: "#fff", fontWeight: 600, fontSize: "0.82rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  userRole: { color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", margin: 0 },
  logoutBtn: {
    padding: "0.48rem 1rem",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 600,
    textAlign: "center",
    transition: "all 0.15s",
  },

  /* ── Main wrap ── */
  mainWrap: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" },

  topBar: {
    height: "60px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 1.75rem",
    flexShrink: 0,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  topBarTitle: { fontSize: "1rem", fontWeight: 700, color: "#1e293b" },
  topBarRight: { display: "flex", alignItems: "center", gap: "0.65rem" },
  topBarAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.82rem",
  },
  topBarName: { fontSize: "0.875rem", fontWeight: 600, color: "#475569" },

  main: { flex: 1, overflowY: "auto", overflowX: "hidden" },
};

export default ShopLayout;
