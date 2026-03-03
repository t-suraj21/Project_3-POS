import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login          from "./Auth/Login";
import RegisterShop   from "./Auth/RegisterShop";
import ForgotPassword from "./Auth/ForgotPassword";
import ResetPassword  from "./Auth/ResetPassword";

// SuperAdmin pages
import SuperDashboard from "./pages/super/SuperDashboard";
import ShopsList      from "./pages/super/ShopsList";
import ShopDetails    from "./pages/super/ShopDetails";

// Shop Admin pages
import ShopDashboard  from "./pages/shop/ShopDashboard";
import Products       from "./pages/shop/Products";
import AddEditProduct from "./pages/shop/AddEditProduct";
import Categories        from "./pages/shop/Categories";
import SubCategories     from "./pages/shop/SubCategories";
import AccountManagement from "./pages/shop/AccountManagement";
import CustomerDetail    from "./pages/shop/CustomerDetail";
import Sales             from "./pages/shop/Sales";
import Orders            from "./pages/shop/Orders";
import ShopSettings    from "./pages/shop/ShopSettings";
import Reports         from "./pages/shop/Reports";
import ShopLayout     from "./components/ShopLayout";

/** Redirects to the user's dashboard if already logged in, otherwise /login */
const SmartRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "superadmin") return <Navigate to="/super/dashboard" replace />;
  return <Navigate to={`/shop/${user.shop_id}/dashboard`} replace />;
};

/** Layout route: protects all /shop/:id/* paths and injects the sidebar */
const ShopAdminLayout = () => (
  <ProtectedRoute role="shop_admin">
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

          {/* ── Shop Admin routes (sidebar layout) ───────────────────────── */}
          <Route element={<ShopAdminLayout />}>
            <Route path="/shop/:id/dashboard"              element={<ShopDashboard />} />
            <Route path="/shop/:id/products"               element={<Products />} />
            <Route path="/shop/:id/add-product"            element={<AddEditProduct />} />
            <Route path="/shop/:id/edit-product/:productId" element={<AddEditProduct />} />
            <Route path="/shop/:id/categories"                      element={<Categories />} />
            <Route path="/shop/:id/sub-categories"                  element={<SubCategories />} />
            <Route path="/shop/:id/accounts"                        element={<AccountManagement />} />
            <Route path="/shop/:id/accounts/:customerId"            element={<CustomerDetail />} />
            <Route path="/shop/:id/sales"                           element={<Sales />} />
            <Route path="/shop/:id/orders"           element={<Orders filter="all" />} />
            <Route path="/shop/:id/orders/completed" element={<Orders filter="completed" />} />
            <Route path="/shop/:id/orders/pending"   element={<Orders filter="pending" />} />
            <Route path="/shop/:id/orders/refunded"  element={<Orders filter="refunded" />} />
            <Route path="/shop/:id/reports"           element={<Reports />} />
            <Route path="/shop/:id/settings"             element={<ShopSettings />} />

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

// Quick placeholder dashboard style
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
