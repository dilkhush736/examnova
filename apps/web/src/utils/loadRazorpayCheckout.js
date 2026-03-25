let loadingPromise = null;

export function loadRazorpayCheckout() {
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }
      reject(new Error("Razorpay checkout failed to load."));
    };
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout script."));
    document.body.appendChild(script);
  });

  return loadingPromise;
}
