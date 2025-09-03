import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else if (process.env.NODE_ENV !== 'test') {
  console.warn('SENDGRID_API_KEY is not set. Emails will not be sent.');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@edureach360.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dmdm@iitgroup.in';

// Email template types
export type EmailTemplateType = 'welcome' | 'payment-confirmation' | 'follow-up' | 'ai-summary' | 'admin-notification';

// Email template interface
export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface EmailResponse {
  success: boolean;
  error?: unknown;
  messageId?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  customArgs?: Record<string, unknown>;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition?: string;
    contentId?: string;
  }>;
}

/**
 * Enhanced email sending function with retry logic and better error handling
 * @param params Email parameters
 * @param retries Number of retry attempts (default: 3)
 * @returns Promise with email sending result
 */
export async function sendEmail(params: SendEmailParams, retries = 3): Promise<EmailResponse> {
  // Validate required parameters
  if (!params.to || !params.subject || !params.html) {
    const error = new Error('Missing required email parameters: to, subject, and html are required');
    console.error('Email validation failed:', error);
    return { success: false, error };
  }

  // Skip sending in test environment
  if (process.env.NODE_ENV === 'test') {
    return { success: true, messageId: 'test-message-id' };
  }

  // Check if SendGrid is configured
  if (!process.env.SENDGRID_API_KEY) {
    const error = new Error('SendGrid API key is not configured');
    console.error('Email sending failed:', error);
    return { success: false, error };
  }

  // Prepare the email message
  const msg = {
    ...params,
    to: Array.isArray(params.to) ? params.to : [params.to],
    from: params.from || FROM_EMAIL,
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
      subscriptionTracking: { enable: false },
    },
    mailSettings: {
      sandboxMode: {
        enable: process.env.NODE_ENV === 'development' && !process.env.SEND_EMAILS_IN_DEV,
      },
    },
  };

  try {
    // Send the email
    const [response] = await sgMail.send(msg as any);
    
    // Log success
    console.log(`Email sent successfully to ${params.to}`, {
      messageId: response.headers['x-message-id'],
      template: params.customArgs?.['template'],
    });

    return {
      success: true,
      messageId: response.headers['x-message-id'],
    };
  } catch (error: unknown) {
    // Log the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
    
    console.error('Email sending failed:', {
      to: params.to,
      error: errorMessage,
      code: errorCode,
      stack: error instanceof Error ? error.stack : undefined,
      response: (error as any)?.response?.body,
    });

    // Retry on temporary failures
    const isTemporaryError = (
      errorCode === 429 || // Rate limit
      (typeof errorCode === 'number' && errorCode >= 500) || // Server errors
      errorMessage.includes('socket hang up') ||
      errorMessage.includes('ETIMEDOUT') ||
      errorMessage.includes('ECONNRESET')
    );

    if (retries > 0 && isTemporaryError) {
      const delayMs = 1000 * (4 - retries); // Exponential backoff
      console.log(`Retrying email (${retries} attempts left, waiting ${delayMs}ms)...`);
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return sendEmail(params, retries - 1);
    }

    return {
      success: false,
      error: error instanceof Error ? error : new Error(errorMessage),
    };
  }
}

// Membership plan interface
export interface MembershipPlan {
  id?: string;
  name: string;
  description?: string;
  priceMonthly?: number;
  priceAnnual?: number;
  currency?: string;
  features?: string[];
  isPopular?: boolean;
  maxStudents?: number;
  maxCourses?: number;
  storageGB?: number;
  supportLevel?: 'basic' | 'priority' | 'dedicated';
}

// Lead data interface
export interface LeadData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  plan?: string | null;
  role?: string;
  experience?: string;
  goals?: string;
  quizAnswers?: Record<string, unknown> | null;
  aiScore?: number;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded' | null;
  amount?: number | null;
  currency?: string;
  membershipPlanId?: string | null;
  membershipPlan?: MembershipPlan | null;
  interactions?: Array<{
    id: string;
    type: string;
    content: string | null;
    metadata?: Record<string, unknown>;
    createdAt: Date | string;
    updatedAt?: Date | string;
  }>;
  conversations?: Array<{
    id: string;
    title?: string;
    messages: Array<{
      id: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      createdAt: Date | string;
    }>;
    metadata?: Record<string, unknown>;
    createdAt: Date | string;
    updatedAt: Date | string;
  }>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  metadata?: Record<string, unknown>;
}

// Payment details interface
export interface PaymentDetails {
  amount: number;
  currency: string;
  plan: string;
  transactionId?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  paymentDate?: Date | string;
  nextBillingDate?: Date | string;
  billingPeriod?: {
    start: Date | string;
    end: Date | string;
  };
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total: number;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  receiptUrl?: string;
}

// Email template generator for admin notifications about new leads
export function getLeadNotificationTemplate(lead: LeadData): EmailTemplate {
  try {
    const formatDate = (date?: Date | string | null): string => {
      if (!date) return 'N/A';
      const d = new Date(date);
      return isNaN(d.getTime()) 
        ? 'Invalid date' 
        : d.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'medium',
          });
    };

    const submissionTime = formatDate(lead.createdAt || new Date());
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edureach360.com';
    const adminUrl = `${appUrl}/admin/leads${lead.id ? `/${lead.id}` : ''}`;

    // Format payment information if available
    const paymentInfo = (() => {
      if (!lead.paymentStatus && !lead.amount) return '';
      
      const statusMap: Record<string, string> = {
        'completed': '✅ Completed',
        'pending': '⏳ Pending',
        'failed': '❌ Failed',
        'refunded': '↩️ Refunded',
      };

      return `
        <div style="background-color: #eef2ff; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
          <h3 style="color: #4f46e5; margin-top: 0;">Payment Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <div><strong>Status:</strong> ${statusMap[lead.paymentStatus || ''] || lead.paymentStatus || 'N/A'}</div>
            ${lead.amount ? `<div><strong>Amount:</strong> ${lead.currency || 'INR'} ${lead.amount.toLocaleString('en-IN')}</div>` : ''}
            ${lead.membershipPlanId ? `<div><strong>Plan ID:</strong> ${lead.membershipPlanId}</div>` : ''}
          </div>
        </div>
      `;
    })();

    // Format quiz insights if available
    const quizInsights = (() => {
      if (!lead.quizAnswers || Object.keys(lead.quizAnswers).length === 0) return '';
      
      const scoreDisplay = lead.aiScore !== undefined 
        ? `<div style="margin-bottom: 0.5rem;">
             <strong>AI Score:</strong> 
             <span style="display: inline-block; width: 60px; height: 10px; background: #e5e7eb; border-radius: 5px; overflow: hidden; vertical-align: middle; margin: 0 5px;">
               <span style="display: block; height: 100%; width: ${Math.min(lead.aiScore, 100)}%; background: #4f46e5;"></span>
             </span>
             ${lead.aiScore}/100
           </div>`
        : '';
      
      const quizItems = Object.entries(lead.quizAnswers)
        .map(([question, answer]) => {
          const formattedAnswer = typeof answer === 'object' 
            ? JSON.stringify(answer, null, 2) 
            : String(answer);
          return `<li><strong>${question}:</strong> ${formattedAnswer}</li>`;
        })
        .join('\n');
      
      return `
        <div style="margin: 1.5rem 0;">
          <h3 style="color: #4f46e5; margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">
            AI Assessment Results
          </h3>
          ${scoreDisplay}
          <details style="margin-top: 1rem;">
            <summary style="cursor: pointer; color: #4f46e5; font-weight: 500;">
              View Detailed Responses
            </summary>
            <div style="background: white; padding: 1rem; border-radius: 0.5rem; margin-top: 0.5rem; font-size: 0.9em;">
              <ul style="margin: 0; padding-left: 1.25rem;">
                ${quizItems}
              </ul>
            </div>
          </details>
        </div>
      `;
    })();

    // Main template
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lead: ${lead.name || 'New Registration'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #4f46e5; color: white; padding: 1.5rem; text-align: center; border-radius: 0.5rem 0.5rem 0 0; }
          .content { padding: 1.5rem; background-color: #f9fafb; border-radius: 0 0 0.5rem 0.5rem; }
          .card { background: white; padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          .btn { 
            display: inline-block; 
            background-color: #4f46e5; 
            color: white; 
            padding: 0.75rem 1.5rem; 
            text-decoration: none; 
            border-radius: 0.375rem;
            font-weight: 500;
            margin-top: 0.5rem;
          }
          .footer { 
            margin-top: 2rem; 
            padding-top: 1rem; 
            border-top: 1px solid #e5e7eb; 
            color: #6b7280; 
            font-size: 0.875rem; 
            text-align: center; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 120px 1fr; 
            gap: 0.75rem; 
            margin: 0.5rem 0; 
          }
          .info-label { 
            color: #4b5563; 
            font-weight: 500; 
          }
          h1, h2, h3 { margin: 0 0 1rem 0; }
          h1 { font-size: 1.5rem; }
          h2 { font-size: 1.25rem; color: #1f2937; }
          h3 { font-size: 1.125rem; color: #374151; }
          p { margin: 0.5rem 0; color: #4b5563; }
          strong { color: #1f2937; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Lead Alert! 🚀</h1>
            <p>${submissionTime}</p>
          </div>
          
          <div class="content">
            <div class="card">
              <h2>${lead.name || 'New Lead'}</h2>
              
              <div class="info-grid">
                <div class="info-label">📧 Email:</div>
                <div><a href="mailto:${lead.email}" style="color: #4f46e5; text-decoration: none;">${lead.email}</a></div>
                
                ${lead.phone ? `
                  <div class="info-label">📱 Phone:</div>
                  <div><a href="tel:${lead.phone.replace(/[^0-9+]/g, '')}" style="color: #4f46e5; text-decoration: none;">${lead.phone}</a></div>
                ` : ''}
                
                ${lead.role ? `
                  <div class="info-label">👤 Role:</div>
                  <div>${lead.role}</div>
                ` : ''}
                
                ${lead.experience ? `
                  <div class="info-label">💼 Experience:</div>
                  <div>${lead.experience}</div>
                ` : ''}
                
                ${lead.goals ? `
                  <div class="info-label" style="align-self: start;">🎯 Goals:</div>
                  <div>${lead.goals}</div>
                ` : ''}
              </div>
            </div>
            
            ${lead.plan ? `
              <div class="card">
                <h3>Membership Interest</h3>
                <p><strong>Selected Plan:</strong> ${lead.plan}</p>
                ${lead.membershipPlan?.description ? `<p>${lead.membershipPlan.description}</p>` : ''}
                
                ${lead.membershipPlan?.features?.length ? `
                  <div style="margin-top: 0.75rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>Plan Features:</strong></p>
                    <ul style="margin: 0; padding-left: 1.25rem; color: #4b5563;">
                      ${lead.membershipPlan.features.map(feature => `<li>${feature}</li>`).join('\n')}
                    </ul>
                  </div>
                ` : ''}
                
                ${paymentInfo}
              </div>
            ` : ''}
            
            ${quizInsights}
            
            <div style="text-align: center; margin-top: 1.5rem;">
              <a href="${adminUrl}" class="btn">
                View Full Profile in Dashboard
              </a>
              ${lead.phone ? `
                <div style="margin-top: 1rem;">
                  <a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" 
                     style="color: #4f46e5; text-decoration: none; font-size: 0.9em;">
                    💬 Chat on WhatsApp
                  </a>
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>This is an automated message from EduReach 360°</p>
              <p>© ${new Date().getFullYear()} EduReach 360°. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `🎯 New Lead: ${lead.name || 'New Registration'}${lead.plan ? ` - ${lead.plan}` : ''}`,
      html,
    };
  } catch (error) {
    console.error('Error generating lead notification template:', error);
    return {
      subject: 'New Lead Notification',
      html: '<p>Error generating email content. Please check the logs for details.</p>',
    };
  }
}

/**
 * Sends a new lead notification email to the admin
 */
export async function sendNewLeadNotification(lead: LeadData): Promise<EmailResponse> {
  try {
    // Validate required fields
    if (!lead.email) {
      throw new Error('Lead email is required');
    }

    // Generate the email template
    const template = getLeadNotificationTemplate(lead);
    
    // Send the email using the enhanced sendEmail function
    const result = await sendEmail({
      to: ADMIN_EMAIL,
      subject: template.subject,
      html: template.html,
      from: `EduReach 360° <${process.env.FROM_EMAIL || 'noreply@edureach360.com'}>`,
      customArgs: {
        template: 'admin-notification',
        leadId: lead.id || '',
        type: 'new_lead_notification',
        timestamp: new Date().toISOString(),
        source: 'lead-capture-form',
      },
      replyTo: lead.email,
    });

    // Log the result
    if (result.success) {
      console.log(`New lead notification sent to admin for ${lead.email}`, {
        leadId: lead.id,
        messageId: result.messageId,
      });
    } else {
      console.error('Failed to send new lead notification', {
        leadId: lead.id,
        error: result.error,
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error sending new lead notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const msg = {
      to: email,
      from: `EduReach 360° <${FROM_EMAIL}>`,
      subject: 'Welcome to EduReach 360° - Your Journey Starts Here!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; color: white; padding: 2rem; text-align: center; border-radius: 0.5rem 0.5rem 0 0;">
            <h1 style="margin: 0;">Welcome to EduReach 360°!</h1>
          </div>
          
          <div style="padding: 2rem; background-color: #f9fafb; border-radius: 0 0 0.5rem 0.5rem;">
            <p>Hello ${name || 'there'},</p>
            <p>Thank you for joining EduReach 360°! We're excited to have you on board.</p>
            
            <div style="background-color: white; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0;">
              <h3 style="color: #4f46e5; margin-top: 0;">Get Started</h3>
              <p>Here are some quick links to help you get started:</p>
              <ul>
                <li>📚 <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color: #4f46e5;">Access your dashboard</a></li>
                <li>🎓 <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses" style="color: #4f46e5;">Explore our courses</a></li>
                <li>💡 <a href="${process.env.NEXT_PUBLIC_APP_URL}/resources" style="color: #4f46e5;">Helpful resources</a></li>
              </ul>
            </div>
            
            <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
            
            <div style="margin-top: 2rem; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="display: inline-block; background-color: #4f46e5; color: white; 
                        padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem;">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div style="margin-top: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
            <p>This is an automated message from EduReach 360°</p>
            <p>© ${new Date().getFullYear()} EduReach 360°. All rights reserved.</p>
          </div>
        </div>
      `,
      customArgs: {
        email_type: 'welcome',
      },
    };

    const success = await sendEmail(msg);
    return { success, error: success ? null : 'Failed to send welcome email' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

// Send payment confirmation email
export async function sendPaymentConfirmationEmail(email: string, data: LeadData) {
  try {
    const msg = {
      to: email,
      from: `EduReach 360° <${FROM_EMAIL}>`,
      subject: `Payment Confirmation - ${data.plan || 'Your Plan'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; color: white; padding: 2rem; text-align: center; border-radius: 0.5rem 0.5rem 0 0;">
            <h1 style="margin: 0;">Payment Confirmed! 🎉</h1>
          </div>
          
          <div style="padding: 2rem; background-color: #f9fafb; border-radius: 0 0 0.5rem 0.5rem;">
            <p>Hello ${data.name || 'there'},</p>
            <p>Thank you for your payment for the <strong>${data.plan || 'plan'}</strong>.</p>
            
            <div style="background-color: white; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0;">
              <h3 style="color: #4f46e5; margin-top: 0;">Payment Details</h3>
              <p><strong>Amount:</strong> ${data.currency || 'INR'} ${data.amount?.toFixed(2) || '0.00'}</p>
              <p><strong>Plan:</strong> ${data.plan || 'N/A'}</p>
              <p><strong>Status:</strong> ${data.paymentStatus || 'Completed'}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              ${data.paymentStatus === 'completed' ? 
                `<p style="color: #10b981; font-weight: 500;">✓ Payment successfully processed</p>` : ''}
            </div>
            
            <p>You now have full access to all the features of your plan. If you have any questions, feel free to reply to this email.</p>
            
            <div style="margin-top: 2rem; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="display: inline-block; background-color: #4f46e5; color: white; 
                        padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem;">
                Go to Dashboard
              </a>
            </div>
          </div>
          
          <div style="margin-top: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
            <p>This is an automated message from EduReach 360°</p>
            <p>© ${new Date().getFullYear()} EduReach 360°. All rights reserved.</p>
          </div>
        </div>
      `,
      customArgs: {
        email_type: 'payment_confirmation',
        plan: data.plan || '',
        amount: data.amount?.toString() || '0',
        currency: data.currency || 'INR',
      },
    };

    const success = await sendEmail(msg);
    return { success, error: success ? null : 'Failed to send payment confirmation' };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error };
  }
}

// Send AI conversation summary email
export async function sendAISummaryEmail(email: string, data: { name?: string; summary?: string; recommendations?: string }) {
  try {
    const msg = {
      to: email,
      from: `EduReach 360° <${FROM_EMAIL}>`,
      subject: 'Your AI Counseling Session Summary',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4f46e5; color: white; padding: 2rem; text-align: center; border-radius: 0.5rem 0.5rem 0 0;">
            <h1 style="margin: 0;">Your AI Counseling Session Summary</h1>
          </div>
          
          <div style="padding: 2rem; background-color: #f9fafb; border-radius: 0 0 0.5rem 0.5rem;">
            <p>Hello ${data.name || 'there'},</p>
            <p>Here's a summary of your recent AI counseling session:</p>
            
            <div style="background-color: white; padding: 1.5rem; border-radius: 0.5rem; margin: 1.5rem 0;">
              <h3 style="color: #4f46e5; margin-top: 0;">Key Insights</h3>
              <div>${data.summary || 'No summary available'}</div>
              
              ${data.recommendations ? `
                <h4 style="color: #4f46e5; margin-top: 1.5rem;">Recommendations</h4>
                <div>${data.recommendations}</div>
              ` : ''}
            </div>
            
            <p>You can review the full conversation history by logging into your account.</p>
            
            <div style="margin-top: 2rem; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/conversations" 
                 style="display: inline-block; background-color: #4f46e5; color: white; 
                        padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem;">
                View Conversation History
              </a>
            </div>
          </div>
          
          <div style="margin-top: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
            <p>This is an automated message from EduReach 360°</p>
            <p>© ${new Date().getFullYear()} EduReach 360°. All rights reserved.</p>
          </div>
        </div>
      `,
      customArgs: {
        email_type: 'ai_summary',
      },
    };

    const success = await sendEmail(msg);
    return { success, error: success ? null : 'Failed to send AI summary email' };
  } catch (error) {
    console.error('Error sending AI summary email:', error);
    return { success: false, error };
  }
}
