/**
 * accessControl.js — Role-based module authorization utilities
 *
 * Centralized module–to–role mapping that mirrors the backend.
 * Used by ProtectedRoute and the sidebar to enforce access control.
 */

const MODULE_ROLE_MAP = {
  shop_dashboard: ["shop_admin", "manager"],
  products: ["shop_admin", "manager", "stock_manager", "sales_worker", "cashier"],
  categories: ["shop_admin", "manager", "stock_manager"],
  inventory: ["shop_admin", "manager", "stock_manager"],
  accounts: ["shop_admin", "manager", "account_worker", "sales_worker", "cashier"],
  sales: ["shop_admin", "manager", "sales_worker", "cashier"],
  reports: ["shop_admin", "manager"],
  settings: ["shop_admin", "manager"],
  workers: ["shop_admin", "manager"],
};

/**
 * Check if a user role can access a given module
 * @param {string} userRole - The user's role
 * @param {string} module - The module to check
 * @returns {boolean} True if allowed, false otherwise
 */
export const canAccessModule = (userRole, module) => {
  if (!userRole || !module) return false;
  const allowedRoles = MODULE_ROLE_MAP[module];
  return allowedRoles && allowedRoles.includes(userRole);
};

/**
 * Get all modules accessible to a given role
 * @param {string} userRole - The user's role
 * @returns {string[]} Array of accessible module keys
 */
export const getAccessibleModules = (userRole) => {
  if (!userRole) return [];
  return Object.keys(MODULE_ROLE_MAP).filter((mod) =>
    MODULE_ROLE_MAP[mod].includes(userRole)
  );
};

/**
 * Map module name to a friendly route path (e.g., 'products' → '/shop/:id/products')
 */
export const moduleToPath = (module, shopId) => {
  const pathMap = {
    shop_dashboard: `/shop/${shopId}/dashboard`,
    products: `/shop/${shopId}/products`,
    categories: `/shop/${shopId}/categories`,
    inventory: `/shop/${shopId}/inventory`,
    accounts: `/shop/${shopId}/accounts`,
    sales: `/shop/${shopId}/sales`,
    reports: `/shop/${shopId}/reports`,
    settings: `/shop/${shopId}/settings`,
    workers: `/shop/${shopId}/workers`,
  };
  return pathMap[module];
};

/**
 * Get the primary allowed module for a worker (their landing page)
 * Returns the first accessible module, or null if none
 */
export const getPrimaryModule = (userRole) => {
  const modules = getAccessibleModules(userRole);

  // Order of preference for worker types
  if (userRole === "sales_worker") return "sales";
  if (userRole === "account_worker") return "accounts";
  if (userRole === "stock_manager") return "inventory";
  if (userRole === "manager") return "shop_dashboard";
  if (userRole === "shop_admin") return "shop_dashboard";

  return modules[0] || null;
};
