import ClassicLayout from "./ClassicLayout";
import ModernLayout from "./ModernLayout";
import DetailedLayout from "./DetailedLayout";
import CompactLayout from "./CompactLayout";
import ProfessionalLayout from "./ProfessionalLayout";

// Map of layout codes to components
export const BILLING_LAYOUTS = {
  classic: ClassicLayout,
  modern: ModernLayout,
  detailed: DetailedLayout,
  compact: CompactLayout,
  professional: ProfessionalLayout,
};

// Get layout component by code
export const getBillingLayout = (code) => {
  return BILLING_LAYOUTS[code] || ClassicLayout;
};

// Billing Layout Renderer
export const BillingLayoutRenderer = ({ sale, shop, layoutCode = "classic" }) => {
  const LayoutComponent = getBillingLayout(layoutCode);
  return <LayoutComponent sale={sale} shop={shop} />;
};

export default BillingLayoutRenderer;
