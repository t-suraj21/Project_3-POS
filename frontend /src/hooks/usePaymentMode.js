import { useState } from "react";

/**
 * usePaymentMode
 * Manages payment mode selection and payment-related state
 * 
 * Returns:
 * - paymentMode: Current payment mode (cash, upi, card, credit, online)
 * - paidAmount: Amount paid by customer (for cash mode)
 * - upiRef: UPI transaction reference
 * - cardRef: Card transaction reference
 * - handlePaymentModeChange: Switch payment mode
 * - setPaidAmount: Set amount paid
 * - setUpiRef: Set UPI reference
 * - setCardRef: Set card reference
 * - setFullPaid: Set paid amount to full bill amount (function)
 * - setRoundedUp: Set paid amount to rounded up amount (function)
 * - resetPaymentState: Reset all payment state
 */
export const usePaymentMode = (grandTotal = 0) => {
  const [paymentMode, setPaymentMode] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [cardRef, setCardRef] = useState("");

  // Handle payment mode change
  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
    setUpiRef("");
    setCardRef("");
    if (mode !== "cash") {
      setPaidAmount("");
    }
  };

  // Quick amount setters for cash mode
  const setFullPaid = () => {
    setPaidAmount(grandTotal.toFixed(2));
  };

  const setRoundedUp = () => {
    const rounded = Math.ceil(grandTotal / 50) * 50;
    setPaidAmount(rounded.toFixed(2));
  };

  // Set quick cash amounts
  const setQuickAmount = (amount) => {
    setPaidAmount(String(amount));
  };

  // Calculate derived values
  const paid = parseFloat(paidAmount) || 0;
  const change =
    paymentMode === "cash" ? Math.max(0, paid - grandTotal) : 0;
  const balanceDue =
    paymentMode === "credit"
      ? grandTotal
      : paymentMode === "upi" || paymentMode === "card"
      ? 0
      : paymentMode === "cash"
      ? Math.max(0, grandTotal - paid)
      : 0;

  // Reset payment state
  const resetPaymentState = () => {
    setPaymentMode("cash");
    setPaidAmount("");
    setUpiRef("");
    setCardRef("");
  };

  return {
    paymentMode,
    paidAmount,
    upiRef,
    cardRef,
    handlePaymentModeChange,
    setPaidAmount,
    setUpiRef,
    setCardRef,
    setFullPaid,
    setRoundedUp,
    setQuickAmount,
    paid,
    change,
    balanceDue,
    resetPaymentState,
  };
};

export default usePaymentMode;
