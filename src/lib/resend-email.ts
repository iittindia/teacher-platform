import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Define email templates
const TEMPLATES = {
  WELCOME: (name: string) => ({
    subject: `Welcome to EduReach 360°, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to EduReach 360°!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for joining EduReach 360°. We're excited to help you grow your teaching career!</p>
        <p>Best regards,<br/>The EduReach Team</p>
      </div>
    `
  }),
  
  NEW_LEAD: (lead: { name: string; email: string; phone?: string }) => ({
    subject: `New Lead: ${lead.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Lead Alert!</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        ${lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ''}
        <p>Please follow up with this lead as soon as possible.</p>
      </div>
    `
  })
};

// Main email sending function
export async function sendEmail({
  to,
  subject,
  html,
  from = 'EduReach 360° <onboarding@resend.dev>',
  replyTo,
  cc,
  bcc,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
      cc,
      bcc,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error sending email:', error);
    return { success: false, error };
  }
}

// Specific email functions
export async function sendWelcomeEmail(email: string, name: string) {
  const template = TEMPLATES.WELCOME(name);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendNewLeadNotification(lead: { name: string; email: string; phone?: string }) {
  const template = TEMPLATES.NEW_LEAD(lead);
  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'dmdm@iitgroup.in',
    subject: template.subject,
    html: template.html,
    replyTo: lead.email,
  });
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendNewLeadNotification,
};
