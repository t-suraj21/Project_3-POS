import { useNavigate } from "react-router-dom";

/**
 * useBillingNavigation
 * Handles navigation in the billing workflow
 * Provides functions to navigate back to inventory/cart and to order history
 * 
 * Returns:
 * - goToInventory: Navigate back to inventory page
 * - goToCart: Navigate back to cart page
 * - goToOrderHistory: Navigate to order history/sales page
 * - goToDashboard: Navigate to shop dashboard
 * - goToLogin: Navigate to login page
 */
export const useBillingNavigation = () => {
  const navigate = useNavigate();

  const goToInventory = () => {
    navigate("/shop/inventory");
  };

  const goToCart = () => {
    navigate("/shop/inventory");
  };

  const goToOrderHistory = () => {
    navigate("/shop/sales");
  };

  const goToDashboard = () => {
    navigate("/shop/dashboard");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  // Navigate with state (useful for passing data)
  const navigateWithState = (path, state) => {
    navigate(path, { state });
  };

  return {
    goToInventory,
    goToCart,
    goToOrderHistory,
    goToDashboard,
    goToLogin,
    navigateWithState,
  };
};

export default useBillingNavigation;
