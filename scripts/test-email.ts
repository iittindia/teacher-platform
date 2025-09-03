const { Resend } = require('resend');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    console.log('Sending test email...');
    
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.ADMIN_EMAIL!,
      subject: 'Test Email from EduReach 360°',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email Successful! 🎉</h2>
          <p>Hello there,</p>
          <p>This is a test email from your EduReach 360° application.</p>
          <p>If you're seeing this, your Resend email integration is working correctly!</p>
          <p>Best regards,<br/>The EduReach Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Email sent successfully!', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
sendTestEmail();
