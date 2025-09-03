'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: new (options: any) => any;
  }
}

export default function RazorpayScript() {
  useEffect(() => {
    // This will run on the client side after the script loads
    if (window.Razorpay) {
      // Suppress web-share warning
      window.Razorpay.prototype._registerServiceWorker = function() {};
    }
  }, []);

  return (
    <Script 
      src="https://checkout.razorpay.com/v1/checkout.js" 
      strategy="afterInteractive"
      id="razorpay-script"
    />
  );
}
