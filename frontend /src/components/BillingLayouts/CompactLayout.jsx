import React from "react";

const CompactLayout = ({ sale, shop }) => {
  const logo = shop?.logo ? `/${shop.logo}` : null;
  const favicon = shop?.favicon ? `/${shop.favicon}` : null;

  const formatCurrency = (amount) => {
    return `${shop?.currency_symbol || "₹"}${parseFloat(amount || 0).toFixed(2)}`;
  };

  const items = sale?.sale_items || [];
  const dueAmount = parseFloat(sale?.total_amount || 0) - parseFloat(sale?.paid_amount || 0);

  return (
    <div className="bg-white p-3 max-w-xs mx-auto text-gray-900 text-xs">
      {/* Compact header */}
      <div className="text-center mb-2 pb-2 border-b border-gray-300">
        {logo && (
          <img src={logo} alt="Logo" className="h-8 mx-auto mb-1" />
        )}
        <p className="font-bold text-sm">{shop?.name}</p>
        <p className="text-gray-600">{shop?.phone}</p>
      </div>

      {/* Invoice info - compact */}
      <div className="text-center text-xs mb-2 pb-2 border-b border-gray-300">
        <p><span className="font-semibold">Bill:</span> {sale?.bill_number}</p>
        <p><span className="font-semibold">Customer:</span> {sale?.customer_name}</p>
        <p><span className="font-semibold">Date:</span> {new Date(sale?.created_at).toLocaleDateString()}</p>
      </div>

      {/* Items - Very condensed */}
      <div className="mb-2 pb-2 border-b border-gray-300">
        <div className="font-bold mb-1 grid grid-cols-4 gap-1">
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amt</span>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-1 mb-1">
            <span className="truncate">{item.product_name}</span>
            <span className="text-right">{item.quantity}</span>
            <span className="text-right">{formatCurrency(item.unit_price)}</span>
            <span className="text-right">{formatCurrency(item.total_price)}</span>
          </div>
        ))}
      </div>

      {/* Minimal totals */}
      <div className="mb-2 pb-2 border-b border-gray-300 space-y-1">
        {sale?.gst_amount > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(sale?.gst_amount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(sale?.total_amount)}</span>
        </div>
      </div>

      {/* Payment summary */}
      <div className="bg-gray-100 p-1 rounded mb-2">
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Paid:</span>
          <span>{formatCurrency(sale?.paid_amount || 0)}</span>
        </div>
        <div className="flex justify-between font-semibold text-red-600">
          <span>Due:</span>
          <span>{formatCurrency(dueAmount)}</span>
        </div>
      </div>

      {/* Minimal footer */}
      <div className="text-center text-gray-500 text-xs">
        <p>Thank you!</p>
      </div>
    </div>
  );
};

export default CompactLayout;
