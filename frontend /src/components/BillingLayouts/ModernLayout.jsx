import React from "react";

const ModernLayout = ({ sale, shop }) => {
  const logo = shop?.logo ? `/${shop.logo}` : null;
  const favicon = shop?.favicon ? `/${shop.favicon}` : null;

  const formatCurrency = (amount) => {
    return `${shop?.currency_symbol || "₹"}${parseFloat(amount || 0).toFixed(2)}`;
  };

  const items = sale?.sale_items || [];
  const dueAmount = parseFloat(sale?.total_amount || 0) - parseFloat(sale?.paid_amount || 0);

  return (
    <div className="bg-white p-6 max-w-md mx-auto text-gray-800 font-light">
      {/* Minimal header */}
      <div className="text-center mb-8">
        {logo && (
          <img src={logo} alt="Logo" className="h-14 mx-auto mb-4" />
        )}
        <h1 className="text-xl font-light tracking-wider">{shop?.name}</h1>
        <p className="text-xs text-gray-500 mt-1">{shop?.phone}</p>
      </div>

      {/* Invoice reference */}
      <div className="text-center mb-6 pb-4 border-b border-gray-300">
        <p className="text-xs text-gray-600">Invoice #{sale?.bill_number}</p>
        <p className="text-xs text-gray-600">{new Date(sale?.created_at).toLocaleDateString()}</p>
      </div>

      {/* Customer */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">Bill To</p>
        <p className="text-base font-medium">{sale?.customer_name}</p>
      </div>

      {/* Items - Minimalist */}
      <div className="mb-6 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start text-sm">
            <div className="flex-1">
              <p className="font-medium">{item.product_name}</p>
              <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.unit_price)}</p>
            </div>
            <p className="font-medium ml-4">{formatCurrency(item.total_price)}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-b border-gray-300 py-4 mb-4">
        {/* Subtotal section */}
        {sale?.gst_amount > 0 && (
          <div className="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>{formatCurrency(sale?.subtotal || sale?.total_amount)}</span>
          </div>
        )}
        {sale?.gst_amount > 0 && (
          <div className="flex justify-between text-sm mb-2">
            <span>Tax</span>
            <span>{formatCurrency(sale?.gst_amount)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="text-center mb-6">
        <p className="text-xs text-gray-600 mb-1">TOTAL</p>
        <p className="text-2xl font-light">{formatCurrency(sale?.total_amount)}</p>
      </div>

      {/* Payment info */}
      <div className="bg-gray-50 p-3 rounded text-center text-sm mb-4">
        <p className="text-xs text-gray-600 mb-1">Status</p>
        {dueAmount > 0 ? (
          <p className="text-red-600 font-medium">Due: {formatCurrency(dueAmount)}</p>
        ) : (
          <p className="text-green-600 font-medium">Paid</p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-300">
        <p>Thank You</p>
      </div>
    </div>
  );
};

export default ModernLayout;
