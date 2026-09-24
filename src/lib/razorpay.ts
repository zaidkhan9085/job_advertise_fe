// Thin wrapper around Razorpay's own hosted checkout widget. This is the
// ONLY thing that ever collects payment details -- card/UPI data never
// touches our own frontend code, let alone our backend, matching Razorpay's
// standard (non-PCI-scope) integration.

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  orderId: string;
  onSuccess: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let scriptPromise: Promise<void> | null = null;

// Loads https://checkout.razorpay.com/v1/checkout.js once and caches the
// promise -- every buy button on the billing page can call this freely
// without racing to inject the script tag twice.
function loadRazorpayScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load the payment widget. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function openRazorpayCheckout(opts: RazorpayCheckoutOptions): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Failed to load the payment widget. Check your connection and try again.");
  }

  const rzp = new window.Razorpay({
    key: opts.key,
    amount: opts.amount,
    currency: opts.currency,
    name: opts.name,
    description: opts.description,
    order_id: opts.orderId,
    theme: { color: "#C8422C" },
    handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      opts.onSuccess(response);
    },
    modal: {
      ondismiss: opts.onDismiss,
    },
  });
  rzp.open();
}
