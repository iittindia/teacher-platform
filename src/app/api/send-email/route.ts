import { NextResponse } from 'next/server';
import { sendEmail, type LeadData } from '@/lib/email';
import { prisma } from '@/lib/prisma';

// Define the shape of the request body
interface EmailRequest {
  to: string;
  template: 'welcome' | 'payment-confirmation' | 'follow-up' | 'ai-summary' | 'admin-notification';
  lead?: LeadData;
  paymentDetails?: {
    amount: number;
    currency: string;
    plan: string;
    transactionId?: string;
  };
  metadata?: Record<string, unknown>;
}

// Helper function to get email subject based on template and context
function getEmailSubject(
  template: string,
  lead?: LeadData,
  paymentDetails?: { plan?: string; amount?: number; currency?: string }
): string {
  const prefix = '[EduReach360]';
  
  switch (template) {
    case 'welcome':
      return `${prefix} Welcome to EduReach360!`;
    case 'payment-confirmation':
      return `${prefix} Payment Confirmed for ${paymentDetails?.plan || 'Your Plan'}`;
    case 'follow-up':
      return `${prefix} Let's Continue Your Teaching Journey`;
    case 'ai-summary':
      return `${prefix} Your AI Counseling Summary`;
    case 'admin-notification':
      return `${prefix} New Lead: ${lead?.name || 'New Signup'}`;
    default:
      return `${prefix} Message from EduReach360`;
  }
}

// Email template rendering with responsive design
function renderEmailTemplate(
  template: string,
  lead?: LeadData,
  paymentDetails?: { plan?: string; amount?: number; currency?: string; transactionId?: string }
): string {
  const formatCurrency = (amount?: number, currency: string = 'INR') => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const baseStyles = `
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `;

  const buttonStyle = `
    display: inline-block;
    padding: 12px 24px;
    background-color: #4F46E5;
    color: white !important;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 16px 0;
  `;

  const footer = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
      <p> 2024 EduReach360. All rights reserved.</p>
      <p>If you didn't request this email, please ignore it or contact support.</p>
    </div>
  `;

  // Welcome email template
  const welcomeTemplate = () => `
    <div style="${baseStyles}">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1F2937; margin-bottom: 8px;">Welcome to EduReach360, ${lead?.name?.split(' ')[0] || 'there'}! </h1>
        <p style="color: #4B5563;">We're thrilled to have you join our community of educators.</p>
      </div>
      
      <div style="background-color: #F9FAFB; padding: 24px; border-radius: 8px; margin: 24px 0;">
        <h2 style="color: #111827; margin-top: 0;">Getting Started</h2>
        <ol style="padding-left: 20px; margin: 16px 0;">
          <li style="margin-bottom: 8px;">Complete your profile to get personalized recommendations</li>
          <li style="margin-bottom: 8px;">Explore our teaching resources and courses</li>
          <li style="margin-bottom: 8px;">Connect with other educators in our community</li>
        </ol>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="${buttonStyle}">Go to Dashboard</a>
      </div>
      
      ${footer}
    </div>
  `;

  // Payment confirmation template
  const paymentConfirmationTemplate = () => {
    if (!paymentDetails) return '';
    
    return `
      <div style="${baseStyles}">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1F2937; margin-bottom: 8px;">Payment Confirmed! </h1>
          <p style="color: #4B5563;">Thank you for your purchase. Here's your receipt:</p>
        </div>
        
        <div style="background-color: #F9FAFB; padding: 24px; border-radius: 8px; margin: 24px 0;">
          <h2 style="color: #111827; margin-top: 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Order Summary</h2>
          
          <div style="display: flex; justify-content: space-between; margin: 16px 0;">
            <span>Plan:</span>
            <span style="font-weight: 600;">${paymentDetails.plan || 'Premium Plan'}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin: 16px 0;">
            <span>Amount Paid:</span>
            <span style="font-weight: 600;">${formatCurrency(paymentDetails.amount, paymentDetails.currency)}</span>
          </div>
          
          ${paymentDetails.transactionId ? `
            <div style="margin-top: 8px; font-size: 14px; color: #6B7280;">
              Transaction ID: ${paymentDetails.transactionId}
            </div>
          ` : ''}
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="${buttonStyle}">Access Your Account</a>
        </div>
        
        <div style="margin: 32px 0;">
          <h3 style="color: #111827;">What's Next?</h3>
          <p>You can now access all premium features. If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        
        ${footer}
      </div>
    `;
  };

  // Admin notification template
  const adminNotificationTemplate = () => {
    if (!lead) return '';
    
    const leadDetails = [
      ['Name', lead.name],
      ['Email', `<a href="mailto:${lead.email}">${lead.email}</a>`],
      ['Phone', lead.phone || 'Not provided'],
      ['Plan', lead.plan || 'Not specified'],
      ['Experience', lead.experience || 'Not specified'],
      ['Goals', lead.goals || 'Not specified'],
      ['AI Score', lead.aiScore ? `${lead.aiScore}%` : 'N/A'],
      ['Signup Date', lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'Unknown']
    ];
    
    return `
      <div style="${baseStyles}">
        <h1 style="color: #1F2937; margin-bottom: 24px;">New Lead: ${lead.name}</h1>
        
        <div style="background-color: #F9FAFB; padding: 24px; border-radius: 8px;">
          <h2 style="color: #111827; margin-top: 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Lead Details</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tbody>
              ${leadDetails.map(([label, value]) => `
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 12px 0; font-weight: 500; color: #4B5563; width: 150px;">${label}</td>
                  <td style="padding: 12px 0; color: #111827;">${value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leads/${lead.id}" style="${buttonStyle}">View Full Profile</a>
          </div>
        </div>
        
        ${footer}
      </div>
    `;
  };

  // Main template switch
  switch (template) {
    case 'welcome':
      return welcomeTemplate();
    case 'payment-confirmation':
      return paymentConfirmationTemplate();
    case 'admin-notification':
      return adminNotificationTemplate();
    case 'follow-up':
      return welcomeTemplate().replace('Welcome to', 'Following up from');
    case 'ai-summary':
      return welcomeTemplate(); // Similar structure, different content
    default:
      return `
        <div style="${baseStyles}">
          <h1>EduReach360</h1>
          <p>This is an automated message from EduReach360.</p>
          ${footer}
        </div>
      `;
  }
}

export async function POST(request: Request) {
  try {
    const requestBody: EmailRequest = await request.json();
    
    // Validate required fields
    if (!requestBody.to || !requestBody.template) {
      return NextResponse.json(
        { error: 'Missing required fields: to and template are required' },
        { status: 400 }
      );
    }

    // Log the email sending attempt
    if (requestBody.lead?.id) {
      await prisma.interaction.create({
        data: {
          type: 'email_attempt',
          content: `Attempting to send ${requestBody.template} email to ${requestBody.to}`,
          lead: { connect: { id: requestBody.lead.id } },
          metadata: {
            template: requestBody.template,
            to: requestBody.to,
            timestamp: new Date().toISOString()
          }
        }
      }).catch(e => console.error('Failed to log email attempt:', e));
    }

    // Get the email subject and content based on template
    const subject = getEmailSubject(
      requestBody.template,
      requestBody.lead,
      requestBody.paymentDetails
    );
    
    const html = renderEmailTemplate(
      requestBody.template,
      requestBody.lead,
      requestBody.paymentDetails
    );

    // Send the email
    const emailSent = await sendEmail({
      to: requestBody.to,
      subject,
      html,
      customArgs: {
        template: requestBody.template,
        leadId: requestBody.lead?.id || '',
        ...(requestBody.metadata || {})
      }
    });

    if (!emailSent) {
      throw new Error('Email service returned failure');
    }

    // Log successful email
    if (requestBody.lead?.id) {
      await prisma.interaction.create({
        data: {
          type: 'email_sent',
          content: `Successfully sent ${requestBody.template} email to ${requestBody.to}`,
          lead: { connect: { id: requestBody.lead.id } },
          metadata: {
            template: requestBody.template,
            to: requestBody.to,
            timestamp: new Date().toISOString(),
            ...(requestBody.paymentDetails?.transactionId ? { 
              transactionId: requestBody.paymentDetails.transactionId 
            } : {})
          }
        }
      }).catch(e => console.error('Failed to log successful email:', e));
    }

    return NextResponse.json({ 
      success: true,
      message: `Email sent successfully to ${requestBody.to}`
    });
  } catch (error: unknown) {
    console.error('Error in send-email API route:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send email',
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
