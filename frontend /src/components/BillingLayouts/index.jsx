import TealAdventureLayout from "./TealAdventureLayout";
import PurpleGradientLayout from "./PurpleGradientLayout";
import CorporateBlueLayout from "./CorporateBlueLayout";
import DarkModernLayout from "./DarkModernLayout";

// Map of layout codes to components
export const BILLING_LAYOUTS = {
  "teal-adventure": TealAdventureLayout,
  "purple-gradient": PurpleGradientLayout,
  "corporate-blue": CorporateBlueLayout,
  "dark-modern": DarkModernLayout,
};

// Get layout component by code
export const getBillingLayout = (code) => {
  return BILLING_LAYOUTS[code] || TealAdventureLayout;
};

// Billing Layout Renderer
export const BillingLayoutRenderer = ({ sale, shop, layoutCode = "teal-adventure" }) => {
  const LayoutComponent = getBillingLayout(layoutCode);
  return <LayoutComponent sale={sale} shop={shop} />;
};

export default BillingLayoutRenderer;
