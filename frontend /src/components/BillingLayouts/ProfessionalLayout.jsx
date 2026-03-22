import React from "react";

const ProfessionalLayout = ({ sale, shop }) => {
  const logo = shop?.logo ? `/${shop.logo}` : null;
  const favicon = shop?.favicon ? `/${shop.favicon}` : null;

  const formatCurrency = (amount) => {
    return `${shop?.currency_symbol || "₹"}${parseFloat(amount || 0).toFixed(2)}`;
  };

  const items = sale?.sale_items || [];
  const dueAmount = parseFloat(sale?.total_amount || 0) - parseFloat(sale?.paid_amount || 0);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 max-w-2xl mx-auto text-gray-900">
      {/* Professional header with color accent */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {logo && (
              <img src={logo} alt="Logo" className="h-16" />
            )}
            <div className="border-l-4 border-blue-600 pl-4">
              <h1 className="text-3xl font-bold text-gray-900">{shop?.name}</h1>
              <p className="text-sm text-blue-600 font-semibold">Professional Invoice</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-blue-600">#</p>
            <p className="text-sm text-gray-600">{sale?.bill_number}</p>
          </div>
        </div>

        {/* Shop details */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-t-2 border-gray-200 pt-4">
          <div>
            <p className="font-semibold text-gray-900">Business Details</p>
            <p>{shop?.address}</p>
            <p>{shop?.phone}</p>
            {shop?.email && <p>{shop?.email}</p>}
            {shop?.gstin && <p>GSTIN: {shop?.gstin}</p>}
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">Invoice Details</p>
            <p>Date: {new Date(sale?.created_at).toLocaleDateString()}</p>
            <p>Time: {new Date(sale?.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                sale?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {sale?.status?.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Bill to section */}
      <div className="bg-white p-4 rounded mb-4">
        <p className="text-sm font-bold text-blue-600 uppercase mb-2">Bill To:</p>
        <p className="text-xl font-bold text-gray-900">{sale?.customer_name}</p>
      </div>

      {/* Items table with professional styling */}
      <div className="bg-white rounded overflow-hidden shadow-md mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <th className="px-4 py-3 text-left font-bold">Description</th>
              <th className="px-4 py-3 text-right font-bold">Qty</th>
              <th className="px-4 py-3 text-right font-bold">Unit Price</th>
              {shop?.gst_enabled && <th className="px-4 py-3 text-right font-bold">GST</th>}
              <th className="px-4 py-3 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-3 text-gray-900">{item.product_name}</td>
                <td className="px-4 py-3 text-right text-gray-900">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.unit_price)}</td>
                {shop?.gst_enabled && (
                  <td className="px-4 py-3 text-right text-gray-900">{item.gst_percentage || '-'}%</td>
                )}
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Left: Notes */}
        <div className="bg-white p-4 rounded">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">Notes</p>
          <p className="text-xs text-gray-600">Thank you for your business. Please retain this invoice for your records.</p>
        </div>

        {/* Middle: Totals */}
        <div className="bg-white p-4 rounded">
          {sale?.gst_amount > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(sale?.subtotal || sale?.total_amount)}</span>
            </div>
          )}
          {sale?.gst_amount > 0 && (
            <div className="flex justify-between text-sm mb-2 border-b border-gray-200 pb-2">
              <span className="text-gray-700">GST:</span>
              <span className="font-semibold">{formatCurrency(sale?.gst_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-blue-600">{formatCurrency(sale?.total_amount)}</span>
          </div>
        </div>

        {/* Right: Payment */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded border-2 border-blue-300">
          <p className="text-xs font-bold text-blue-900 uppercase mb-3">Payment Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-800">Paid:</span>
              <span className="font-bold text-green-600">{formatCurrency(sale?.paid_amount || 0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200">
              <span className="text-blue-800 font-bold">Outstanding:</span>
              <span className={`font-bold ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(dueAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 bg-white p-3 rounded">
        <p>For inquiries, contact: {shop?.phone} | {shop?.email}</p>
        <p className="mt-1">This is an electronically generated invoice</p>
      </div>
    </div>
  );
};

export default ProfessionalLayout;
