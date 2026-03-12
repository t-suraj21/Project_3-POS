import { useState, useEffect } from "react";
import { NavLink, useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import * as S from "./styles";

// ─── Page metadata map ────────────────────────────────────────────
const PAGE_META = {
  dashboard:        { title: "Dashboard",         icon: "🏠" },
  "add-product":    { title: "Add Product",        icon: "📦" },
  "edit-product":   { title: "Edit Product",       icon: "📦" },
  products:         { title: "Products",           icon: "📦" },
  categories:       { title: "Categories",         icon: "🗂️" },
  "sub-categories": { title: "Sub-Categories",     icon: "🗂️" },
  accounts:         { title: "Account Management", icon: "💳" },
  billing:          { title: "Billing",            icon: "💳" },
  sales:            { title: "New Sale",           icon: "🛒" },
  orders:           { title: "Orders",             icon: "🧾" },
  reports:          { title: "Reports",            icon: "📊" },  inventory:        { title: "Inventory",           icon: "📋" },  settings:         { title: "Settings",           icon: "⚙️" },
};

const getPageMeta = (pathname) => {
  for (const [key, val] of Object.entries(PAGE_META)) {
    if (pathname.includes(`/${key}`)) return val;
  }
  return { title: "POS", icon: "🛒" };
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// ─── Dynamic nav style factories (depend on `collapsed` state) ────
const makeNavLinkStyle = (isActive, collapsed) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: collapsed ? 0 : "0.72rem",
  justifyContent: collapsed ? "center" : "flex-start",
  padding: collapsed ? "0.72rem 0" : "0.65rem 0.9rem",
  borderRadius: "12px",
  color: isActive ? "#fff" : "rgba(255,255,255,0.58)",
  textDecoration: "none",
  fontSize: "0.875rem",
  fontWeight: isActive ? 700 : 500,
  background: isActive
    ? "linear-gradient(135deg, rgba(99,102,241,0.48), rgba(139,92,246,0.32))"
    : "transparent",
  boxShadow: isActive
    ? "inset 0 0 0 1px rgba(255,255,255,0.1), 0 2px 10px rgba(99,102,241,0.22)"
    : "none",
  cursor: "pointer",
  overflow: "hidden",
});

const makeGroupBtnStyle = (isOpen, collapsed) => ({
  ...makeNavLinkStyle(false, collapsed),
  width: "100%",
  border: "none",
  background: isOpen ? "rgba(255,255,255,0.07)" : "transparent",
  color: isOpen ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.58)",
});

// ─── Small reusable sub-components ───────────────────────────────
const ActiveBar = () => <span style={S.activeBar} />;

const SubDot = () => (
  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", opacity: 0.65, flexShrink: 0 }} />
);

const SubMenu = ({ open, children }) => (
  <div className={`sl-submenu-wrap ${open ? "open" : "closed"}`}>{children}</div>
);

const SubItems = ({ children }) => (
  <div style={S.subMenuInner}>{children}</div>
);

// ─── Main layout component ────────────────────────────────────────
const ShopLayout = ({ children }) => {
  const { id }           = useParams();
  const { user, logout } = useAuth();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();
  const base             = `/shop/${id}`;

  // Sidebar group open/close — seeded from current route
  const [ordOpen,  setOrdOpen]  = useState(pathname.includes("/orders"));
  const [prodOpen, setProdOpen] = useState(
    pathname.includes("/products") || pathname.includes("/add-product") || pathname.includes("/edit-product")
  );
  const [catOpen,  setCatOpen]  = useState(
    pathname.includes("/categories") || pathname.includes("/sub-categories")
  );
  const [acctOpen, setAcctOpen] = useState(pathname.includes("/accounts"));
  const [invOpen,  setInvOpen]  = useState(pathname.includes("/inventory"));

  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { S.injectGlobalStyles(); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const meta        = getPageMeta(pathname);
  const greeting    = getGreeting();
  const userInitial = (user?.name ?? "U")[0].toUpperCase();
  const dateStr     = new Date().toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });

  // Bind factories to current collapsed state
  const navStyle   = (isActive) => makeNavLinkStyle(isActive, collapsed);
  const groupStyle = (isOpen)   => makeGroupBtnStyle(isOpen, collapsed);

  const NavIcon = ({ emoji }) => (
    <span style={{ fontSize: "1.12rem", flexShrink: 0, lineHeight: 1, width: collapsed ? "auto" : 22, textAlign: "center" }}>
      {emoji}
    </span>
  );

  // ── Sidebar content (shared between desktop + mobile drawer) ──
  const SidebarInner = () => (
    <>
      {/* Brand row */}
      <div style={{
        display: "flex", alignItems: "center", flexShrink: 0,
        justifyContent: collapsed ? "center" : "space-between",
        gap: collapsed ? 0 : "0.75rem",
        padding: collapsed ? "1.25rem 0" : "1.2rem 0.9rem 1.2rem 1.2rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={S.brandLogoBox}>
            <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>🛒</span>
          </div>
          {!collapsed && (
            <div>
              <div style={S.brandTitle}>ShopPOS</div>
              <div style={S.brandSubtitle}>Admin Panel</div>
            </div>
          )}
        </div>
        
      </div>

      {/* Section label */}
      {!collapsed
        ? <p style={S.navSectionLabel}>Main Menu</p>
        : <div style={{ height: "0.7rem" }} />
      }

      {/* Navigation links */}
      <nav
        className="sl-nav"
        style={{
          flex: 1, overflowY: "auto",
          padding: collapsed ? "0 0.5rem 1rem" : "0.15rem 0.8rem 1rem",
          display: "flex", flexDirection: "column", gap: "0.16rem",
        }}
      >
        {/* Dashboard */}
        <NavLink
          to={`${base}/dashboard`}
          className="sl-nav-link sl-tip"
          data-tip="Dashboard"
          style={({ isActive }) => navStyle(isActive)}
        >
          {({ isActive }) => (
            <>{isActive && <ActiveBar />}<NavIcon emoji="🏠" />{!collapsed && <span>Dashboard</span>}</>
          )}
        </NavLink>

        {/* New Sale */}
        <NavLink
          to={`${base}/sales`}
          className="sl-nav-link sl-tip"
          data-tip="New Sale"
          style={({ isActive }) => navStyle(isActive)}
        >
          {({ isActive }) => (
            <>{isActive && <ActiveBar />}<NavIcon emoji="🛒" />{!collapsed && <span>New Sale</span>}</>
          )}
        </NavLink>

        {/* Orders group */}
        <div className={collapsed ? "sl-tip" : ""} data-tip="Orders">
          <button className="sl-nav-link" style={groupStyle(ordOpen)} onClick={() => !collapsed && setOrdOpen(v => !v)}>
            <NavIcon emoji="🧾" />
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: "left" }}>Orders</span>
                <span className={`sl-chevron ${ordOpen ? "open" : ""}`}>▶</span>
              </>
            )}
          </button>
          {!collapsed && (
            <SubMenu open={ordOpen}>
              <SubItems>
                <NavLink end to={`${base}/orders`}           className="sl-sub-link" style={({ isActive }) => ({ ...S.subLinkBase, ...(isActive ? S.subLinkActive : {}) })}><SubDot /><span>All Orders</span></NavLink>
                <NavLink end to={`${base}/orders/completed`} className="sl-sub-link" style={({ isActive }) => ({ ...S.subLinkBase, ...(isActive ? S.subLinkActive : {}) })}><SubDot /><span>Completed</span></NavLink>
                <NavLink end to={`${base}/orders/pending`}   className="sl-sub-link" style={({ isActive }) => ({ ...S.subLinkBase, ...(isActive ? S.subLinkActive : {}) })}><SubDot /><span>Pending / Balance</span></NavLink>
                <NavLink end to={`${base}/orders/refunded`}  className="sl-sub-link" style={({ isActive }) => ({ ...S.subLinkBase, ...(isActive ? S.subLinkActive : {}) })}><SubDot /><span>Refunded</span></NavLink>
              </SubItems>
            </SubMenu>
          )}
        </div>

        {/* Products group */}
        <div className={collapsed ? "sl-tip" : ""} data-tip="Products">
          <button className="sl-nav-link" style={groupStyle(prodOpen)} onClick={() => !collapsed && setProdOpen(v => !v)}>
            <NavIcon emoji="📦" />
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: "left" }}>Products</span>
                <span className={`sl-chevron ${prodOpen ? "open" : ""}`}>▶</span>
              </>
            )}
          </button>
          {!collapsed && (
            <SubMenu open={prodOpen}>
              <SubItems>
                <NavLink to={`${base}/add-product`} className="sl-sub-link" style={({ isActive }) => ({ ...S.subLinkBase, ...(isActive ? S.subLinkActive : {}) })}><SubDot /><span>Add New</span></NavLink>
                <NavLink end to={`${base}/products`} className="sl-sub-link" style={({ isActive }) => ({ ...S.subLinkBase, ...(isActive ? S.subLinkActive : {}) })}><SubDot /><span>All Products</span></NavLink>
              </SubItems>
            </SubMenu>
          )}
        </div>

        {/* Categories group */}
        <div className={collapsed ? "sl-tip" : ""} data-tip="Categories">
          <button className="sl-nav-link" style={groupStyle(catOpen)} onClick={() => !collapsed && setCatOpen(v => !v)}>
            <NavIcon emoji="🗂️" />
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: "left" }}>Categories</span>
                <span className={`sl-chevron ${catOpen ? "open" : ""}`}>▶</span>
              </>
            )}
          </button>
          {!collapsed && (
            <SubMenu open={catOpen}>
              <SubItems>
                <NavLink end to={`${base}/categories`}     className="sl-sub-link" style={({ isActive }) => ({ ...S.subLinkBase, ...(isActive ? S.subLinkActive : {}) })}><SubDot /><span>Categories</span></NavLink>
                <NavLink end to={`${base}/sub-categories`} className="sl-sub-link" style={({ isActive }) => ({ ...S.subLinkBase, ...(isActive ? S.subLinkActive : {}) })}><SubDot /><span>Sub-Categories</span></NavLink>
              </SubItems>
            </SubMenu>
          )}
        </div>

        {/* Accounts group */}
        <div className={collapsed ? "sl-tip" : ""} data-tip="Accounts">
          <button className="sl-nav-link" style={groupStyle(acctOpen)} onClick={() => !collapsed && setAcctOpen(v => !v)}>
            <NavIcon emoji="💳" />
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: "left" }}>Accounts</span>
                <span className={`sl-chevron ${acctOpen ? "open" : ""}`}>▶</span>
              </>
            )}
          </button>
          {!collapsed && (
            <SubMenu open={acctOpen}>
              <SubItems>
                <NavLink end to={`${base}/accounts`} className="sl-sub-link" style={({ isActive }) => ({ ...S.subLinkBase, ...(isActive ? S.subLinkActive : {}) })}><SubDot /><span>Customers</span></NavLink>
              </SubItems>
            </SubMenu>
          )}
        </div>

        {/* Reports */}
        <NavLink
          to={`${base}/reports`}
          className="sl-nav-link sl-tip"
          data-tip="Reports"
          style={({ isActive }) => navStyle(isActive)}
        >
          {({ isActive }) => (
            <>{isActive && <ActiveBar />}<NavIcon emoji="📊" />{!collapsed && <span>Reports</span>}</>
          )}
        </NavLink>

        {/* Inventory */}
        <NavLink
          to={`${base}/inventory`}
          className="sl-nav-link sl-tip"
          data-tip="Inventory"
          style={({ isActive }) => navStyle(isActive)}
        >
          {({ isActive }) => (
            <>{isActive && <ActiveBar />}<NavIcon emoji="📋" />{!collapsed && <span>Inventory</span>}</>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink
          to={`${base}/settings`}
          className="sl-nav-link sl-tip"
          data-tip="Settings"
          style={({ isActive }) => navStyle(isActive)}
        >
          {({ isActive }) => (
            <>{isActive && <ActiveBar />}<NavIcon emoji="⚙️" />{!collapsed && <span>Settings</span>}</>
          )}
        </NavLink>
      </nav>

      {/* Footer: user info + logout */}
      <div style={{
        padding: collapsed ? "0.85rem 0.5rem" : "0.85rem 1rem",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column", gap: "0.55rem", flexShrink: 0,
      }}>
        {/* User card */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: "0.65rem", justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0.5rem 0" : "0.5rem 0.7rem",
          borderRadius: 12,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={S.userAvatar}>{userInitial}</div>
            <span className="sl-online-dot" style={S.onlineDot} />
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={S.userNameText}>{user?.name}</p>
              <p style={S.userRoleText}>Shop Owner · Online</p>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          className={`sl-logout${collapsed ? " sl-tip" : ""}`}
          data-tip="Logout"
          onClick={logout}
          style={{
            ...S.logoutBtn,
            padding: collapsed ? "0.55rem 0" : "0.5rem 1rem",
            fontSize: collapsed ? "1.05rem" : "0.82rem",
          }}
        >
          <span>⎋</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  // ── Render shell ─────────────────────────────────────────────────
  return (
    <div style={S.shell}>

      {/* Mobile overlay backdrop */}
      {mobileOpen && <div style={S.mobileBackdrop} onClick={() => setMobileOpen(false)} />}

      {/* Desktop sticky sidebar */}
      <aside style={{ ...S.sidebar, width: collapsed ? 68 : 260 }}>
        <SidebarInner />
      </aside>

      {/* Mobile slide-in drawer */}
      <aside style={{ ...S.sidebarMobileDrawer, left: mobileOpen ? 0 : -280 }}>
        <SidebarInner />
      </aside>

      {/* Right panel: top bar + page content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Top bar */}
        <header style={S.topBar}>

          {/* Left side: page icon + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", minWidth: 0 }}>
            <div style={S.pageIconBadge}>{meta.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={S.pageTitleText}>{meta.title}</div>
              <div style={S.greetingText}>{greeting}, {user?.name?.split(" ")[0] || "there"} 👋</div>
            </div>
          </div>

          {/* Right side: date + quick-sale + user chip */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexShrink: 0 }}>
            <div style={S.dateBadge}>📅 {dateStr}</div>

            {!pathname.includes("/sales") && !pathname.includes("/billing") && (
              <button
                className="sl-topbar-sale"
                style={S.newSaleBtn}
                onClick={() => navigate(`${base}/sales`)}
              >
                🛒 New Sale
              </button>
            )}

            <div style={S.topBarDivider} />

            <div style={S.userChip}>
              <div style={S.userChipAvatar}>{userInitial}</div>
              <span style={S.userChipName}>{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="sl-main" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ShopLayout;
