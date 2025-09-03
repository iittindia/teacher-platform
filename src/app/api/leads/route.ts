import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNewLeadNotification, sendWelcomeEmail } from '@/lib/email';
import { Prisma } from '@prisma/client';
import { calculateLeadScore } from '@/lib/leadScoring';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';

type LeadFormData = {
  name: string;
  email: string;
  phone: string;
  role?: string;
  experience?: string;
  goals?: string;
  interests?: string[];
  learningStyle?: string;
  budget?: string;
  international?: string;
  preferredContact?: 'email' | 'phone' | 'whatsapp';
  hearAboutUs?: string;
  planInterest?: string;
  quizAnswers?: Record<string, any>;
  aiScore?: number;
  paymentStatus?: string;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  membershipPlanId?: string;
};

const LEAD_STATUS: Record<string, LeadStatus> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  CONVERTED: 'converted',
  LOST: 'lost',
} as const;

export async function POST(request: Request) {
  try {
    const data: LeadFormData = await request.json();
    
    // Validate required fields
    if (!data.name?.trim() || !data.email?.trim()) {
      return NextResponse.json(
        { error: 'Name and email are required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check for existing lead with same email
    const existingLead = await prisma.lead.findFirst({
      where: { email: data.email },
      include: {
        membershipPlan: true
      }
    });

    if (existingLead) {
      // Prepare update data with explicit types
      const updateData: any = {
        name: data.name,
        phone: data.phone || null,
        role: data.role || null,
        experience: data.experience || null,
        goals: data.goals || null,
        interests: data.interests || [],
        learningStyle: data.learningStyle || null,
        budget: data.budget || null,
        international: data.international || null,
        preferredContact: data.preferredContact || 'email',
        hearAboutUs: data.hearAboutUs || null,
        planInterest: data.planInterest || null,
        quizAnswers: data.quizAnswers || null,
        aiScore: data.aiScore || null,
        status: existingLead.status === 'lost' ? LEAD_STATUS.NEW : existingLead.status,
        paymentStatus: data.paymentStatus || null,
        paymentId: data.paymentId || null,
        orderId: data.orderId || null,
        amount: data.amount || null,
        currency: data.currency || 'INR',
        updatedAt: new Date(),
      };

      // Handle membership plan relationship
      if (data.membershipPlanId) {
        updateData.membershipPlanId = data.membershipPlanId;
      } else if (existingLead.membershipPlanId) {
        updateData.membershipPlanId = null;
      }

      // Update existing lead
      let lead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: updateData,
        include: {
          membershipPlan: {
            select: {
              name: true,
              priceMonthly: true,
              priceAnnual: true,
              currency: true,
            },
          },
        },
      });

      // Recalculate and update lead score
      try {
        const score = await calculateLeadScore({
          ...lead,
          // Include related data needed for scoring
          interactions: await prisma.interaction.findMany({
            where: { leadId: lead.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
          }),
          conversations: await prisma.conversation.findMany({
            where: { leadId: lead.id },
            orderBy: { updatedAt: 'desc' },
          }),
        });
        
        // Only update if score changed significantly
        if (Math.abs((lead.aiScore || 0) - score) >= 5) {
          lead = await prisma.lead.update({
            where: { id: lead.id },
            data: { aiScore: score },
            include: {
              membershipPlan: {
                select: {
                  name: true,
                  priceMonthly: true,
                  priceAnnual: true,
                  currency: true,
                },
              },
            },
          });
        }
      } catch (error) {
        console.error('Error updating lead score:', error);
        // Continue even if score calculation fails
      }

      // Prepare updated lead data for notification
      const updatedLeadNotificationData = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        role: lead.role || undefined,
        experience: lead.experience || undefined,
        goals: lead.goals || undefined,
        plan: lead.planInterest,
        quizAnswers: lead.quizAnswers as Record<string, any> || {},
        aiScore: lead.aiScore || 0,
        paymentStatus: lead.paymentStatus,
        amount: lead.amount,
        currency: lead.currency || 'INR'
      };

      // Send notification for updated lead
      sendNewLeadNotification(updatedLeadNotificationData).catch(console.error);

      return NextResponse.json(lead);
    }

    // Create new lead with required fields
    const leadData: Prisma.LeadCreateInput = {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone || '', // Ensure phone is not undefined
      role: data.role || undefined,
      experience: data.experience || undefined,
      goals: data.goals || undefined,
      interests: data.interests || [],
      learningStyle: data.learningStyle || undefined,
      budget: data.budget || undefined,
      international: data.international || undefined,
      preferredContact: data.preferredContact || 'email',
      hearAboutUs: data.hearAboutUs || undefined,
      planInterest: data.planInterest || undefined,
      quizAnswers: data.quizAnswers as Prisma.JsonObject || undefined,
      // Calculate initial lead score (will be updated after creation with full context)
      aiScore: 0,
      status: LEAD_STATUS.NEW,
      source: 'website',
      paymentStatus: data.paymentStatus || undefined,
      paymentId: data.paymentId || undefined,
      orderId: data.orderId || undefined,
      amount: data.amount || undefined,
      currency: data.currency || 'INR',
      membershipPlan: data.membershipPlanId ? {
        connect: { id: data.membershipPlanId }
      } : undefined,
    };

    // Create lead first without the score
    let lead = await prisma.lead.create({
      data: leadData,
      include: {
        membershipPlan: {
          select: {
            name: true,
            priceMonthly: true,
            priceAnnual: true,
            currency: true,
          },
        },
      },
    });

    // Calculate and update lead score with full context
    try {
      const score = await calculateLeadScore({
        ...lead,
        // Include related data needed for scoring
        interactions: [],
        conversations: []
      });
      
      // Update lead with calculated score
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: { aiScore: score },
        include: {
          membershipPlan: {
            select: {
              name: true,
              priceMonthly: true,
              priceAnnual: true,
              currency: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error calculating lead score:', error);
      // Continue even if score calculation fails
    }

    // Send welcome email to lead
    sendWelcomeEmail(lead.email, lead.name).catch(console.error);

    // Prepare lead data for notification
    const leadNotificationData = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      role: lead.role || undefined,
      experience: lead.experience || undefined,
      goals: lead.goals || undefined,
      plan: lead.planInterest,
      quizAnswers: lead.quizAnswers as Record<string, any> || {},
      aiScore: lead.aiScore || 0,
      paymentStatus: lead.paymentStatus,
      amount: lead.amount,
      currency: lead.currency || 'INR'
    };

    // Send notification to admin
    sendNewLeadNotification(leadNotificationData).catch(console.error);

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error processing lead:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A lead with this email already exists' },
          { status: 409 }
        );
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your request',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as LeadStatus | null;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { role: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Define the select fields for the query
    const selectFields = {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      planInterest: true,
      paymentStatus: true,
      amount: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
      membershipPlan: {
        select: {
          name: true,
          priceMonthly: true,
          priceAnnual: true,
          currency: true,
        },
      },
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        select: selectFields,
        orderBy: { createdAt: 'desc' } as const,
        take: limit,
        skip,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      data: leads,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch leads',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
