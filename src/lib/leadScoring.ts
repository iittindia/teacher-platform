import { PrismaClient, Lead, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type InteractionForScoring = {
  type: string;
  content: string | null;
  createdAt: Date;
};

type ConversationForScoring = {
  messages: Prisma.JsonValue;
  updatedAt: Date;
};

type LeadWithRelations = Lead & {
  interactions?: InteractionForScoring[];
  conversations?: ConversationForScoring[];
};

export async function calculateLeadScore(lead: LeadWithRelations): Promise<number> {
  let score = 0;
  const maxScore = 100;
  const weights = {
    // Base information
    hasPhone: 5,
    hasRole: 3,
    hasExperience: 3,
    hasGoals: 5,
    hasInterests: 2,
    hasLearningStyle: 2,
    hasBudget: 4,
    hasInternational: 1,
    hasPlanInterest: 8,
    hasQuizAnswers: 10,
    
    // Engagement
    hasMultipleInteractions: 15,
    hasRecentInteraction: 10,
    hasConversation: 12,
    hasMultipleConversations: 8,
    
    // Payment
    hasPaymentInfo: 20,
    hasCompletedPayment: 25,
  };

  // Base information scoring
  if (lead.phone && lead.phone.trim() !== '') score += weights.hasPhone;
  if (lead.role) score += weights.hasRole;
  if (lead.experience) score += weights.hasExperience;
  if (lead.goals) score += weights.hasGoals;
  if (lead.interests && lead.interests.length > 0) score += weights.hasInterests;
  if (lead.learningStyle) score += weights.hasLearningStyle;
  if (lead.budget) score += weights.hasBudget;
  if (lead.international) score += weights.hasInternational;
  if (lead.planInterest) score += weights.hasPlanInterest;
  if (lead.quizAnswers) score += weights.hasQuizAnswers;

  // Load interactions if not provided
  const interactions = lead.interactions || await prisma.interaction.findMany({
    where: { leadId: lead.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Engagement scoring
  if (interactions.length > 1) score += weights.hasMultipleInteractions;
  
  const recentInteraction = interactions[0];
  if (recentInteraction) {
    const daysSinceInteraction = (Date.now() - recentInteraction.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceInteraction < 7) score += weights.hasRecentInteraction;
  }

  // Load conversations if not provided
  const conversations = lead.conversations || await prisma.conversation.findMany({
    where: { leadId: lead.id },
    orderBy: { updatedAt: 'desc' },
  });

  if (conversations.length > 0) {
    score += weights.hasConversation;
    if (conversations.length > 1) score += weights.hasMultipleConversations;
    
    // Analyze conversation engagement
    const totalMessages = conversations.reduce((sum, conv) => {
      const messages = conv.messages ? (Array.isArray(conv.messages) ? conv.messages : []) : [];
      return sum + messages.length;
    }, 0);
    
    // Add score based on message count (capped at 10% of total score)
    score += Math.min(Math.floor(totalMessages / 2), 10);
  }

  // Payment scoring
  if (lead.paymentId) score += weights.hasPaymentInfo;
  if (lead.paymentStatus === 'completed') score += weights.hasCompletedPayment;

  // Ensure score doesn't exceed max
  return Math.min(Math.max(0, score), maxScore);
}

export async function updateLeadScore(leadId: string): Promise<number> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      interactions: {
        select: { type: true, content: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      conversations: {
        select: { messages: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  const score = await calculateLeadScore(lead);
  
  // Update lead with new score
  await prisma.lead.update({
    where: { id: leadId },
    data: { 
      aiScore: score,
      // Auto-update status based on score
      status: getStatusFromScore(score, lead.status as any)
    },
  });

  return score;
}

function getStatusFromScore(score: number, currentStatus: string): string {
  if (score >= 80) return 'qualified';
  if (score >= 50) return 'contacted';
  if (score >= 30) return 'new';
  return currentStatus; // Don't auto-downgrade status below 'new'
}

// Update scores for all leads (for batch processing)
export async function updateAllLeadScores(): Promise<{ total: number; updated: number }> {
  const leads = await prisma.lead.findMany({
    select: { id: true },
  });

  let updated = 0;
  
  for (const lead of leads) {
    try {
      await updateLeadScore(lead.id);
      updated++;
    } catch (error) {
      console.error(`Error updating score for lead ${lead.id}:`, error);
    }
  }

  return { total: leads.length, updated };
}
