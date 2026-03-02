import { useCallback, useRef } from "react";

/**
 * useRazorpay
 *
 * Loads the Razorpay checkout script once and exposes `openCheckout()`.
 * Handles all Razorpay lifecycle events (success / failure / dismiss).
 */
export default function useRazorpay() {
  const scriptLoaded = useRef(false);

  /** Dynamically load checkout.js from Razorpay CDN (only once) */
  const loadScript = useCallback(() => {
    return new Promise((resolve) => {
      if (scriptLoaded.current || window.Razorpay) {
        scriptLoaded.current = true;
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload  = () => { scriptLoaded.current = true; resolve(true);  };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  /**
   * openCheckout – opens the Razorpay payment modal.
   *
   * @param {object} orderData  – Response from POST /api/sales/razorpay/create-order
   * @param {object} handlers
   *   handlers.onSuccess(response)  – called with Razorpay payment response
   *   handlers.onFailure(error)     – called on payment failure
   *   handlers.onDismiss()          – called when user closes the modal
   */
  const openCheckout = useCallback(async (orderData, handlers = {}) => {
    const ok = await loadScript();
    if (!ok || !window.Razorpay) {
      handlers.onFailure?.({ description: "Failed to load Razorpay SDK. Check your internet connection." });
      return;
    }

    const options = {
      key:         orderData.key_id,
      amount:      orderData.amount,          // paise
      currency:    orderData.currency || "INR",
      name:        "ShopPOS",
      description: orderData.description,
      order_id:    orderData.razorpay_order_id,
      prefill: {
        name:    orderData.prefill?.name    || "",
        contact: orderData.prefill?.contact || "",
        email:   orderData.prefill?.email   || "",
      },
      notes: orderData.notes || {},
      theme: { color: "#2563eb" },

      // ── Supported payment methods ─────────────────────────────────────────
      method: {
        upi:       true,   // Google Pay, PhonePe, Paytm, BHIM
        card:      true,   // Credit / Debit cards
        netbanking: true,  // Net banking
        wallet:    true,   // Paytm wallet, Mobikwik, etc.
      },

      handler: function (response) {
        // Called ONLY on successful payment
        handlers.onSuccess?.(response);
      },

      modal: {
        ondismiss: function () {
          handlers.onDismiss?.();
        },
        escape: true,
        animation: true,
      },
    };

    const rzp = new window.Razorpay(options);

    // Payment failure event (network error, insufficient funds, etc.)
    rzp.on("payment.failed", function (resp) {
      handlers.onFailure?.(resp.error);
    });

    rzp.open();
  }, [loadScript]);

  return { openCheckout };
}
