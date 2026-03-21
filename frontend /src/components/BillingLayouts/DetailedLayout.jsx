import React from "react";

const DetailedLayout = ({ sale, shop }) => {
  const logo = shop?.logo ? `/${shop.logo}` : null;
  const favicon = shop?.favicon ? `/${shop.favicon}` : null;

  const formatCurrency = (amount) => {
    return `${shop?.currency_symbol || "₹"}${parseFloat(amount || 0).toFixed(2)}`;
  };

  const items = sale?.sale_items || [];
  const dueAmount = parseFloat(sale?.total_amount || 0) - parseFloat(sale?.paid_amount || 0);

  return (
    <div className="bg-white p-6 max-w-2xl mx-auto text-gray-900 text-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-blue-500">
        <div>
          {logo && (
            <img src={logo} alt="Logo" className="h-12 mb-2" />
          )}
          <div>
            <h1 className="text-xl font-bold">{shop?.name}</h1>
            <p className="text-gray-600">{shop?.address}</p>
            <p className="text-gray-600">{shop?.phone}</p>
            {shop?.email && <p className="text-gray-600">{shop?.email}</p>}
            {shop?.gstin && <p className="text-gray-600">GSTIN: {shop?.gstin}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">INVOICE</p>
          <p className="text-gray-600">#{sale?.bill_number}</p>
        </div>
      </div>

      {/* Document details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="font-semibold text-gray-700">BILL TO:</p>
          <p className="font-bold text-gray-900">{sale?.customer_name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm"><span className="font-semibold">Date:</span> {new Date(sale?.created_at).toLocaleDateString()}</p>
          <p className="text-sm"><span className="font-semibold">Time:</span> {new Date(sale?.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          <p className="text-sm"><span className="font-semibold">Status:</span> <span className={sale?.status === 'completed' ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>{sale?.status}</span></p>
        </div>
      </div>

      {/* Items table */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300 text-left">
              <th className="pb-2 font-bold">Item</th>
              <th className="text-right pb-2 font-bold">Qty</th>
              <th className="text-right pb-2 font-bold">Rate</th>
              {shop?.gst_enabled && <th className="text-right pb-2 font-bold">Tax</th>}
              <th className="text-right pb-2 font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-2">{item.product_name}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{formatCurrency(item.unit_price)}</td>
                {shop?.gst_enabled && (
                  <td className="text-right">{item.gst_percentage || '-'}%</td>
                )}
                <td className="text-right font-semibold">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals section */}
      <div className="flex justify-end mb-6">
        <div className="w-72">
          <div className="flex justify-between mb-2 border-b border-gray-300 pb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(sale?.subtotal || sale?.total_amount)}</span>
          </div>
          {sale?.gst_amount > 0 && (
            <div className="flex justify-between mb-2 border-b border-gray-300 pb-2">
              <span>GST ({sale?.gst_percentage}%):</span>
              <span>{formatCurrency(sale?.gst_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold py-2 bg-blue-50 px-2">
            <span>Total Amount:</span>
            <span className="text-blue-600">{formatCurrency(sale?.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
        <p className="font-bold mb-2">PAYMENT DETAILS</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Amount Due</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(sale?.total_amount)}</p>
          </div>
          <div>
            <p className="text-gray-600">Amount Paid</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(sale?.paid_amount || 0)}</p>
          </div>
          <div>
            <p className="text-gray-600">Outstanding</p>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(dueAmount)}</p>
          </div>
          <div>
            <p className="text-gray-600">Payment Mode</p>
            <p className="font-semibold">{sale?.payment_mode || 'Cash'}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-300">
        <p>This is a computer-generated invoice. No signature required.</p>
        <p>For support: {shop?.phone}</p>
      </div>
    </div>
  );
};

export default DetailedLayout;
