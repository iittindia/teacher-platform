import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
      amount,
      planId,
      planName,
    } = await request.json();

    // Verify the payment signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get the lead data from the order notes or request body
    // This assumes you've already captured the lead data in the previous step
    // and stored it in your database with a pending status
    
    // Update the lead in the database with payment details
    const updatedLead = await prisma.lead.update({
      where: {
        id: orderId, // Assuming orderId is the lead ID
      },
      data: {
        paymentStatus: 'completed',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: amount,
        planType: planName,
        // Remove isTrialUsed as it's not in the Lead model
        // isTrialUsed: true, // Remove this line as it's causing the TypeScript error
      },
    });

    // TODO: Send confirmation email to the user
    // TODO: Send notification to admin/sales team

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
