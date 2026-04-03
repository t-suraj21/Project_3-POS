import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login                  from "./Auth/Login";
import RegisterShop           from "./Auth/RegisterShop";
import ForgotPassword         from "./Auth/ForgotPassword";
import ResetPassword          from "./Auth/ResetPassword";
import SuperDashboardLogin    from "./Auth/SuperDashboardLogin";

// SuperAdmin pages
import SuperDashboard from "./pages/super/SuperDashboard";
import ShopsList      from "./pages/super/ShopsList";
import ShopDetails    from "./pages/super/ShopDetails";
import Subscriptions  from "./pages/super/Subscriptions";

// Shop Admin pages
import ShopDashboard  from "./pages/shop/ShopDashboard";
import Products       from "./pages/shop/Products";
import AddEditProduct from "./pages/shop/AddEditProduct";
import Categories        from "./pages/shop/Categories";
import SubCategories     from "./pages/shop/SubCategories";
import AccountManagement from "./pages/shop/AccountManagement";
import CustomerDetail    from "./pages/shop/CustomerDetail";
import Sales             from "./pages/shop/Sales";
import Billing           from "./pages/shop/Billing";
import Orders            from "./pages/shop/Orders";
import ShopSettings    from "./pages/shop/ShopSettings";
import Reports         from "./pages/shop/Reports";
import Inventory       from "./pages/shop/Inventory";
import WorkersDashboard from "./pages/shop/Workers/Dashboard";
import AllWorkers      from "./pages/shop/Workers/AllWorkers";
import AddWorker       from "./pages/shop/Workers/AddWorker";
import ShopLayout     from "./components/ShopLayout";

/**
 * SmartRedirect — intelligent default redirect
 *
 * Handles the root path ("/") and any unmatched routes ("*").
 * Instead of always going to /login, we check if the user is already
 * logged in and send them straight to their role-appropriate dashboard.
 */
const SmartRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "superadmin") return <Navigate to="/super/dashboard" replace />;
  return <Navigate to={`/shop/${user.shop_id}/dashboard`} replace />;
};

/**
 * ShopAdminLayout — layout + auth guard for all shop-admin pages
 *
 * Wraps every /shop/:id/* route with:
 *   1. The ShopLayout sidebar + topbar
 *   2. Basic auth check for non-superadmin users
 * <Outlet /> renders the matched child route inside the layout.
 *
 * Individual routes handle module-specific access via ProtectedRoute with module prop.
 */
const ShopAdminLayout = () => (
  <ProtectedRoute>
    <ShopLayout>
      <Outlet />
    </ShopLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public routes ───────────────────────────────────────────── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<RegisterShop />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/superdashlogin"  element={<SuperDashboardLogin />} />

          {/* ── SuperAdmin routes ────────────────────────────────────────── */}
          <Route
            path="/super/dashboard"
            element={
              <ProtectedRoute role="superadmin">
                <SuperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super/shops"
            element={
              <ProtectedRoute role="superadmin">
                <ShopsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super/shops/:id"
            element={
              <ProtectedRoute role="superadmin">
                <ShopDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super/subscriptions"
            element={
              <ProtectedRoute role="superadmin">
                <Subscriptions />
              </ProtectedRoute>
            }
          />

          {/* ── Shop Admin & Worker routes (sidebar layout) ───────────────────────── */}
          <Route element={<ShopAdminLayout />}>
            <Route path="/shop/:id/dashboard"              element={<ProtectedRoute module="shop_dashboard"><ShopDashboard /></ProtectedRoute>} />
            <Route path="/shop/:id/products"               element={<ProtectedRoute module="products"><Products /></ProtectedRoute>} />
            <Route path="/shop/:id/add-product"            element={<ProtectedRoute module="products"><AddEditProduct /></ProtectedRoute>} />
            <Route path="/shop/:id/edit-product/:productId" element={<ProtectedRoute module="products"><AddEditProduct /></ProtectedRoute>} />
            <Route path="/shop/:id/categories"                      element={<ProtectedRoute module="categories"><Categories /></ProtectedRoute>} />
            <Route path="/shop/:id/sub-categories"                  element={<ProtectedRoute module="categories"><SubCategories /></ProtectedRoute>} />
            <Route path="/shop/:id/accounts"                        element={<ProtectedRoute module="accounts"><AccountManagement /></ProtectedRoute>} />
            <Route path="/shop/:id/accounts/:customerId"            element={<ProtectedRoute module="accounts"><CustomerDetail /></ProtectedRoute>} />
            <Route path="/shop/:id/sales"                           element={<ProtectedRoute module="sales"><Sales /></ProtectedRoute>} />
            <Route path="/shop/:id/billing"                         element={<ProtectedRoute module="sales"><Billing /></ProtectedRoute>} />
            <Route path="/shop/:id/orders"           element={<ProtectedRoute module="sales"><Orders filter="all" /></ProtectedRoute>} />
            <Route path="/shop/:id/orders/completed" element={<ProtectedRoute module="sales"><Orders filter="completed" /></ProtectedRoute>} />
            <Route path="/shop/:id/orders/pending"   element={<ProtectedRoute module="sales"><Orders filter="pending" /></ProtectedRoute>} />
            <Route path="/shop/:id/orders/refunded"  element={<ProtectedRoute module="sales"><Orders filter="refunded" /></ProtectedRoute>} />
            <Route path="/shop/:id/reports"           element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
            <Route path="/shop/:id/inventory"            element={<ProtectedRoute module="inventory"><Inventory /></ProtectedRoute>} />
            <Route path="/shop/:id/settings"             element={<ProtectedRoute module="settings"><ShopSettings /></ProtectedRoute>} />

            {/* Workers routes - nested */}
            <Route path="/shop/:id/workers"              element={<ProtectedRoute module="workers"><WorkersDashboard /></ProtectedRoute>} />
            <Route path="/shop/:id/workers/add"          element={<ProtectedRoute module="workers"><AddWorker /></ProtectedRoute>} />
            <Route path="/shop/:id/workers/all"          element={<ProtectedRoute module="workers"><AllWorkers /></ProtectedRoute>} />
          </Route>

          {/* ── Cashier routes ───────────────────────────────────────────── */}
          <Route
            path="/shop/:id/pos"
            element={
              <ProtectedRoute role="cashier">
                <div style={dashStyle("#059669")}>
                  <h1>POS Terminal</h1>
                  <p>Process sales here.</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* ── Default redirect ─────────────────────────────────────────── */}
          <Route path="/" element={<SmartRedirect />} />
          <Route path="*" element={<SmartRedirect />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Temporary placeholder style used by the Cashier POS page stub
const dashStyle = (accent) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#f0f2f5",
  color: accent,
  fontFamily: "sans-serif",
});

export default App;
