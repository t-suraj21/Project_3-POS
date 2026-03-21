import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * useOrderData
 * Initializes order data from router state (passed from inventory/cart page)
 * Also manages order-level calculations like discount, tax, and grand total
 * 
 * Returns:
 * - cart: Array of items in the order
 * - customerName: Customer name from order
 * - discountType: 'amount' or 'percentage'
 * - discountValue: Discount value
 * - discountAmt: Calculated discount amount
 * - setDiscountAmt: Update discount amount
 * - taxPercentage: Tax percentage (typically GST)
 * - taxTotal: Calculated tax amount
 * - setTaxTotal: Update tax total
 * - grandTotal: Final total after discount and tax
 * - resetOrderData: Reset order to initial state
 */
export const useOrderData = () => {
  const location = useLocation();
  const orderState = location.state || {};

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [discountType, setDiscountType] = useState("amount");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountAmt, setDiscountAmt] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);

  // Initialize cart from route state
  useEffect(() => {
    if (orderState.cart && Array.isArray(orderState.cart)) {
      setCart(orderState.cart);
    }
    if (orderState.customerName) {
      setCustomerName(orderState.customerName);
    }
  }, [orderState]);

  // Calculate subtotal (sum of all item totals)
  const subtotal = cart.reduce((sum, item) => {
    return sum + parseFloat(item.sell_price || 0) * item.qty;
  }, 0);

  // Calculate actual discount amount
  const actualDiscountAmt =
    discountType === "percentage"
      ? (subtotal * parseFloat(discountValue)) / 100
      : parseFloat(discountValue) || 0;

  // Calculate tax on subtotal minus discount
  const taxableAmount = Math.max(0, subtotal - actualDiscountAmt);
  const calculatedTax = (taxableAmount * parseFloat(taxPercentage)) / 100;

  // Calculate grand total
  const grandTotal = Math.round(
    (taxableAmount + calculatedTax) * 100
  ) / 100;

  // Update discount amount when calculation changes
  useEffect(() => {
    setDiscountAmt(actualDiscountAmt);
  }, [subtotal, discountType, discountValue]);

  // Update tax total when calculation changes
  useEffect(() => {
    setTaxTotal(calculatedTax);
  }, [taxableAmount, taxPercentage]);

  // Update discount value
  const setDiscount = (type, value) => {
    setDiscountType(type);
    setDiscountValue(value);
  };

  // Update tax percentage
  const setTax = (percentage) => {
    setTaxPercentage(percentage);
  };

  // Reset order data
  const resetOrderData = () => {
    setCart([]);
    setCustomerName("");
    setDiscountType("amount");
    setDiscountValue(0);
    setDiscountAmt(0);
    setTaxPercentage(0);
    setTaxTotal(0);
  };

  return {
    cart,
    setCart,
    customerName,
    setCustomerName,
    discountType,
    discountValue,
    discountAmt,
    setDiscount,
    setDiscountAmt,
    taxPercentage,
    taxTotal,
    setTax,
    setTaxTotal,
    subtotal,
    grandTotal,
    resetOrderData,
  };
};

export default useOrderData;
