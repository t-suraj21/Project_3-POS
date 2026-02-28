import { useState } from "react";
import { NavLink, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ShopLayout = ({ children }) => {
  const { id }           = useParams();
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const base             = `/shop/${id}`;

  const productsOpen =
    pathname.includes("/products") ||
    pathname.includes("/add-product") ||
    pathname.includes("/edit-product");

  const categoriesOpen =
    pathname.includes("/categories") ||
    pathname.includes("/sub-categories");

  const accountsOpen = pathname.includes("/accounts");

  const [prodOpen, setProdOpen]   = useState(productsOpen);
  const [catOpen, setCatOpen]     = useState(categoriesOpen);
  const [acctOpen, setAcctOpen]   = useState(accountsOpen);

  return (
    <div style={s.shell}>
      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <span style={s.brandIcon}>🛒</span>
          <span style={s.brandText}>Shop Owner</span>
        </div>

        <nav style={s.nav}>
          {/* Dashboard */}
          <NavLink
            to={`${base}/dashboard`}
            style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navLinkActive : {}) })}
          >
            <span style={s.navIcon}>🏠</span>
            Dashboard
          </NavLink>

          {/* Products – expandable */}
          <div>
            <button
              style={{
                ...s.navLink,
                width: "100%",
                border: "none",
                background: prodOpen ? "rgba(255,255,255,0.08)" : "transparent",
                color: prodOpen ? "#fff" : "rgba(255,255,255,0.65)",
                cursor: "pointer",
                justifyContent: "space-between",
              }}
              onClick={() => setProdOpen((v) => !v)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={s.navIcon}>📦</span>
                Product
              </span>
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{prodOpen ? "▾" : "▸"}</span>
            </button>

            {prodOpen && (
              <div style={s.subMenu}>
                <NavLink
                  to={`${base}/add-product`}
                  style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}
                >
                  <span style={s.bullet}>•</span> Add New
                </NavLink>
                <NavLink
                  to={`${base}/products`}
                  end
                  style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}
                >
                  <span style={s.bullet}>•</span> List
                </NavLink>
              </div>
            )}
          </div>

          {/* Categories – expandable */}
          <div>
            <button
              style={{
                ...s.navLink,
                width: "100%",
                border: "none",
                background: catOpen ? "rgba(255,255,255,0.08)" : "transparent",
                color: catOpen ? "#fff" : "rgba(255,255,255,0.65)",
                cursor: "pointer",
                justifyContent: "space-between",
              }}
              onClick={() => setCatOpen((v) => !v)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={s.navIcon}>🗂️</span>
                Category
              </span>
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{catOpen ? "▾" : "▸"}</span>
            </button>

            {catOpen && (
              <div style={s.subMenu}>
                <NavLink
                  to={`${base}/categories`}
                  end
                  style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}
                >
                  <span style={s.bullet}>•</span> Category
                </NavLink>
                <NavLink
                  to={`${base}/sub-categories`}
                  end
                  style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}
                >
                  <span style={s.bullet}>•</span> Sub Category
                </NavLink>
              </div>
            )}
          </div>
          {/* Account Management – expandable */}
          <div>
            <button
              style={{
                ...s.navLink,
                width: "100%",
                border: "none",
                background: acctOpen ? "rgba(255,255,255,0.08)" : "transparent",
                color: acctOpen ? "#fff" : "rgba(255,255,255,0.65)",
                cursor: "pointer",
                justifyContent: "space-between",
              }}
              onClick={() => setAcctOpen((v) => !v)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={s.navIcon}>💳</span>
                Account Mgmt
              </span>
              <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{acctOpen ? "▾" : "▸"}</span>
            </button>

            {acctOpen && (
              <div style={s.subMenu}>
                <NavLink
                  to={`${base}/accounts`}
                  end
                  style={({ isActive }) => ({ ...s.subLink, ...(isActive ? s.subLinkActive : {}) })}
                >
                  <span style={s.bullet}>•</span> Customers
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.userInfo}>
            <div style={s.userAvatar}>
              {(user?.name ?? "U")[0].toUpperCase()}
            </div>
            <div>
              <p style={s.userName}>{user?.name}</p>
              <p style={s.userRole}>Shop Owner</p>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={s.main}>{children}</main>
    </div>
  );
};

const s = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    backgroundColor: "#f4f6fb",
  },
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    flexShrink: 0,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "1.5rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  brandIcon: { fontSize: "1.5rem" },
  brandText: { color: "#fff", fontWeight: 700, fontSize: "1.1rem" },
  nav: {
    flex: 1,
    padding: "1rem 0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.65rem 0.9rem",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.65)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.15s",
  },
  navLinkActive: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
  },
  navIcon: { fontSize: "1rem", width: "20px", textAlign: "center" },

  subMenu: {
    marginLeft: "1.75rem",
    marginTop: "0.15rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.1rem",
    borderLeft: "1px solid rgba(255,255,255,0.12)",
    paddingLeft: "0.6rem",
  },
  subLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.45rem 0.6rem",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.55)",
    textDecoration: "none",
    fontSize: "0.85rem",
    fontWeight: 500,
    transition: "all 0.15s",
  },
  subLinkActive: {
    background: "rgba(255,255,255,0.10)",
    color: "#fff",
  },
  bullet: { fontSize: "0.6rem", opacity: 0.7 },
  sidebarFooter: {
    padding: "1rem 1.25rem",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  userInfo: { display: "flex", alignItems: "center", gap: "0.6rem" },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.9rem",
    flexShrink: 0,
  },
  userName:  { color: "#fff", fontWeight: 600, fontSize: "0.85rem", margin: 0 },
  userRole:  { color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", margin: 0 },
  logoutBtn: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  main: { flex: 1, overflowY: "auto" },
};

export default ShopLayout;
