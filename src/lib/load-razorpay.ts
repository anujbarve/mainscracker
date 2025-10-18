const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

let promise: Promise<void> | null = null;

export const loadRazorpayScript = (): Promise<void> => {
  if (promise) {
    return promise;
  }

  promise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Cannot load script on server"));
      return;
    }

    // Check if script is already loaded
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve();
    script.onerror = () => {
      promise = null; // Reset promise on error
      reject(new Error("Failed to load Razorpay script"));
    };
    document.body.appendChild(script);
  });

  return promise;
};