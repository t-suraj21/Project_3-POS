import React from "react";

const ClassicLayout = ({ sale, shop }) => {
  const logo = shop?.logo ? `/${shop.logo}` : null;
  const favicon = shop?.favicon ? `/${shop.favicon}` : null;

  const formatCurrency = (amount) => {
    return `${shop?.currency_symbol || "₹"}${parseFloat(amount || 0).toFixed(2)}`;
  };

  const items = sale?.sale_items || [];
  const dueAmount = parseFloat(sale?.total_amount || 0) - parseFloat(sale?.paid_amount || 0);

  return (
    <div className="bg-white p-8 max-w-md mx-auto text-gray-900">
      {/* Header with logo */}
      <div className="text-center mb-6 border-b-2 border-gray-200 pb-4">
        {logo && (
          <img src={logo} alt="Logo" className="h-16 mx-auto mb-3" />
        )}
        <h1 className="text-2xl font-bold">{shop?.name || "Shop Name"}</h1>
        <p className="text-sm text-gray-600">{shop?.address}</p>
        <p className="text-sm text-gray-600">{shop?.phone}</p>
      </div>

      {/* Invoice details */}
      <div className="mb-4 text-sm">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Bill Number:</span>
          <span>{sale?.bill_number}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="font-semibold">Date:</span>
          <span>{new Date(sale?.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Customer:</span>
          <span>{sale?.customer_name}</span>
        </div>
      </div>

      {/* Items */}
      <div className="mb-4 border-t-2 border-b-2 border-gray-200 py-3">
        <div className="text-sm font-semibold mb-2 grid grid-cols-4 gap-2">
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="text-sm grid grid-cols-4 gap-2 mb-1">
            <span className="truncate">{item.product_name}</span>
            <span className="text-right">{item.quantity}</span>
            <span className="text-right">{formatCurrency(item.unit_price)}</span>
            <span className="text-right">{formatCurrency(item.total_price)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(sale?.subtotal || sale?.total_amount)}</span>
        </div>
        {sale?.gst_amount > 0 && (
          <div className="flex justify-between">
            <span>GST ({sale?.gst_percentage}%):</span>
            <span>{formatCurrency(sale?.gst_amount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t-2 border-gray-200 pt-2">
          <span>Total:</span>
          <span>{formatCurrency(sale?.total_amount)}</span>
        </div>
      </div>

      {/* Payment status */}
      <div className="space-y-2 text-sm bg-gray-100 p-3 rounded">
        <div className="flex justify-between">
          <span className="font-semibold">Paid:</span>
          <span>{formatCurrency(sale?.paid_amount || 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Due:</span>
          <span className="text-red-600 font-bold">{formatCurrency(dueAmount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 pt-4 border-t-2 border-gray-200 text-xs text-gray-600">
        <p>Thank you for your business!</p>
        <p>Please keep this receipt for your records</p>
      </div>
    </div>
  );
};

export default ClassicLayout;
