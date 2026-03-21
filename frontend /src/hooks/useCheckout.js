import { useState } from "react";
import api from "../services/api";
import useRazorpay from "./useRazorpay";

/**
 * useCheckout
 * Handles payment processing for cash, UPI, card, credit, and online (Razorpay) payments
 * 
 * Returns:
 * - submitting: Loading state for offline checkout
 * - rzProcessing: Loading state for Razorpay processing
 * - checkoutErr: Error message
 * - receipt: Receipt data after successful payment
 * - setReceipt: Update receipt
 * - handleCheckout: Process offline payment (cash, UPI, card, credit)
 * - handleOnlineCheckout: Process online payment via Razorpay
 */
export const useCheckout = (
  cart = [],
  orderDetails = {},
  activeCustomer = {},
  paymentMode = "cash"
) => {
  const [submitting, setSubmitting] = useState(false);
  const [rzProcessing, setRzProcessing] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState("");
  const [receipt, setReceipt] = useState(null);
  const { openCheckout } = useRazorpay();

  // Build items array for API
  const buildItems = () =>
    cart.map((item) => ({
      product_id: item.id,
      product_name: item.name,
      sku: item.sku || null,
      unit: item.unit || null,
      quantity: item.qty,
      cost_price: parseFloat(item.cost_price) || 0,
      sell_price: parseFloat(item.sell_price),
      discount_amount: 0,
      total: parseFloat(item.sell_price) * item.qty,
    }));

  // Handle offline payment (cash, UPI, card, credit)
  const handleCheckout = async (paymentData = {}) => {
    if (cart.length === 0) {
      setCheckoutErr("Cart is empty.");
      return;
    }

    const {
      paidAmount = 0,
      upiRef = "",
      cardRef = "",
      note = "",
      discountAmt = 0,
      taxTotal = 0,
      grandTotal = 0,
    } = {
      ...orderDetails,
      ...paymentData,
    };

    const paid = parseFloat(paidAmount) || 0;
    const change =
      paymentMode === "cash" ? Math.max(0, paid - grandTotal) : 0;

    // Determine final paid amount based on payment mode
    const finalPaid =
      paymentMode === "credit"
        ? 0
        : paymentMode === "upi" || paymentMode === "card"
        ? grandTotal
        : paid > 0
        ? paid
        : grandTotal;

    // Build note with payment reference
    let finalNote = (note || "").trim();
    if (paymentMode === "upi" && upiRef.trim()) {
      finalNote = `UPI Ref/UTR: ${upiRef.trim()}${
        finalNote ? " | " + finalNote : ""
      }`;
    }
    if (paymentMode === "card" && cardRef.trim()) {
      finalNote = `Card Ref: ${cardRef.trim()}${
        finalNote ? " | " + finalNote : ""
      }`;
    }

    setCheckoutErr("");
    setSubmitting(true);

    try {
      const res = await api.post("/api/sales", {
        items: buildItems(),
        discount: discountAmt,
        tax_amount: taxTotal,
        paid_amount: finalPaid,
        payment_mode: paymentMode,
        customer_id: activeCustomer.id || null,
        customer_name: activeCustomer.name || "",
        customer_phone: activeCustomer.phone || "",
        customer_address: activeCustomer.address || "",
        note: finalNote || null,
      });

      const balanceDue = Math.max(0, grandTotal - finalPaid);
      const saleStatus =
        paymentMode === "credit"
          ? "credit"
          : finalPaid >= grandTotal
          ? "paid"
          : "partial";

      setReceipt({
        ...res.data,
        grandTotal,
        paidAmt: finalPaid,
        balanceDue,
        saleStatus,
        change: paymentMode === "cash" ? change : 0,
        cart: [...cart],
        paymentMode,
        customerName: activeCustomer.name || "",
        customerPhone: activeCustomer.phone || "",
        customerAddress: activeCustomer.address || "",
      });
    } catch (err) {
      setCheckoutErr(
        err.response?.data?.error || "Sale failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle online payment via Razorpay
  const handleOnlineCheckout = async (paymentData = {}) => {
    if (cart.length === 0) {
      setCheckoutErr("Cart is empty.");
      return;
    }

    const { note = "", discountAmt = 0, taxTotal = 0, grandTotal = 0 } = {
      ...orderDetails,
      ...paymentData,
    };

    setCheckoutErr("");
    setRzProcessing(true);

    try {
      const { data: orderData } = await api.post(
        "/api/sales/razorpay/create-order",
        {
          items: buildItems(),
          discount: discountAmt,
          tax_amount: taxTotal,
          customer_id: activeCustomer.id || null,
          customer_name: activeCustomer.name || "",
          customer_phone: activeCustomer.phone || "",
          customer_address: activeCustomer.address || "",
          note: note || null,
        }
      );
      setRzProcessing(false);

      openCheckout(orderData, {
        onSuccess: async (rzResponse) => {
          setRzProcessing(true);
          try {
            const { data: verifyData } = await api.post(
              "/api/sales/razorpay/verify-payment",
              {
                razorpay_order_id: rzResponse.razorpay_order_id,
                razorpay_payment_id: rzResponse.razorpay_payment_id,
                razorpay_signature: rzResponse.razorpay_signature,
              }
            );
            setReceipt({
              ...verifyData,
              grandTotal,
              paidAmt: grandTotal,
              balanceDue: 0,
              saleStatus: "paid",
              change: 0,
              cart: [...cart],
              paymentMode: "online",
              paymentId: rzResponse.razorpay_payment_id,
              customerName: activeCustomer.name || "",
              customerPhone: activeCustomer.phone || "",
              customerAddress: activeCustomer.address || "",
            });
          } catch (err) {
            setCheckoutErr(
              err.response?.data?.error || "Payment verification failed."
            );
          } finally {
            setRzProcessing(false);
          }
        },
        onFailure: (err) => {
          setCheckoutErr(
            `Payment failed: ${err?.description || "Please try again."}`
          );
          setRzProcessing(false);
        },
        onDismiss: () => {
          setCheckoutErr("Payment cancelled.");
          setRzProcessing(false);
        },
      });
    } catch (err) {
      setCheckoutErr(
        err.response?.data?.error || "Failed to initiate payment."
      );
      setRzProcessing(false);
    }
  };

  // Reset checkout state
  const resetCheckout = () => {
    setSubmitting(false);
    setRzProcessing(false);
    setCheckoutErr("");
    setReceipt(null);
  };

  return {
    submitting,
    rzProcessing,
    checkoutErr,
    receipt,
    setReceipt,
    handleCheckout,
    handleOnlineCheckout,
    resetCheckout,
  };
};

export default useCheckout;
