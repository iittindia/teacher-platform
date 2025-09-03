'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PaymentButtonProps = {
  planId: string;
  planName: string;
  amount: number;
  currency?: string;
  className?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
};

export function PaymentButton({
  planId,
  planName,
  amount,
  currency = 'INR',
  className = '',
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handlePayment = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setStatus('processing');

    try {
      // 1. Create order on the server
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to paise
          currency,
          receipt: `order_${Date.now()}`,
          notes: {
            planId,
            planName,
          },
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      // 2. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'EduReach 360°',
        description: planName,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify payment on the server
          try {
            const verificationResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.id,
                amount: amount,
                planId,
                planName,
              }),
            });

            if (!verificationResponse.ok) {
              throw new Error('Payment verification failed');
            }

            setStatus('success');
            onSuccess?.(response.razorpay_payment_id);
            
            // Redirect to thank you page or dashboard
            setTimeout(() => {
              router.push('/thank-you');
            }, 2000);
          } catch (error) {
            setStatus('error');
            onError?.(error as Error);
          }
        },
        prefill: {
          name: '', // Will be filled from the lead form
          email: '', // Will be filled from the lead form
          contact: '', // Will be filled from the lead form
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            setStatus('idle');
            setIsLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('error');
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Button states
  const getButtonContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Payment Successful!
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Payment Failed
          </>
        );
      default:
        return `Pay ₹${amount.toLocaleString()}`;
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePayment}
      disabled={isLoading || status === 'processing' || status === 'success'}
      className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
        status === 'success'
          ? 'bg-green-600 text-white'
          : status === 'error'
          ? 'bg-red-600 text-white'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      } ${className}`}
    >
      <div className="flex items-center justify-center">
        {getButtonContent()}
      </div>
    </motion.button>
  );
}

export default PaymentButton;
