import { NextResponse } from 'next/server';
import { sendEmail, sendWelcomeEmail, sendNewLeadNotification } from '@/lib/resend-email';

export async function GET() {
  try {
    // Test basic email
    const testEmail = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email from EduReach 360°',
      html: '<p>This is a test email from EduReach 360°</p>',
    });

    // Test welcome email
    const welcomeEmail = await sendWelcomeEmail('test@example.com', 'Test User');

    // Test new lead notification
    const leadNotification = await sendNewLeadNotification({
      name: 'Test Lead',
      email: 'lead@example.com',
      phone: '+1234567890',
    });

    return NextResponse.json({
      success: true,
      testEmail,
      welcomeEmail,
      leadNotification,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test emails' },
      { status: 500 }
    );
  }
}
