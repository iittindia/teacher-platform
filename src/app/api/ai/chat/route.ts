import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Website information to enhance the AI's knowledge
const WEBSITE_INFO = `
## About Our Platform:
- Name: Teacher's Education Platform
- Purpose: To empower educators with professional development and career growth opportunities
- Key Features:
  - AI-Powered Career Counseling
  - Professional Development Courses
  - Teaching Resources
  - Community Forums
  - Certification Programs

## Membership Plans:
1. **Basic**: Free access to limited resources
2. **Premium**: Full access to all courses and resources
3. **Institutional**: For schools and educational institutions

## Available Courses:
- Classroom Management
- Innovative Teaching Methods
- Educational Technology
- Student Engagement Strategies
- Special Education
- Leadership in Education

## Contact Information:
- Email: support@teachereducation.example.com
- Phone: +1 (555) 123-4567
- Office Hours: Monday-Friday, 9 AM - 5 PM
`;

// System message that defines the AI's role and behavior
const SYSTEM_PROMPT = `You are EduGenie, an AI education counselor for the Teacher's Education Platform. Your primary role is to assist teachers with their professional development and career growth.

## Your Capabilities:
1. Provide information about our platform's features and services
2. Guide teachers to relevant courses and resources
3. Offer advice on teaching methodologies and classroom strategies
4. Help with career development in education
5. Explain membership plans and benefits
6. Answer questions about our platform

## Important Guidelines:
- Always be professional, supportive, and empathetic
- Keep responses concise and focused on educational topics
- If you don't know an answer, direct them to contact support
- Never provide personal opinions, only factual information
- If asked about sensitive topics, politely steer the conversation back to education
- Always maintain a positive and encouraging tone

${WEBSITE_INFO}`;

export async function POST(req: Request) {
  try {
    const { messages, leadId } = await req.json();

    // Add system prompt to the beginning of messages
    const messagesWithSystemPrompt = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Call OpenAI API with enhanced configuration
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messagesWithSystemPrompt,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
      stop: ['\n###', '\n---', '\n**Note:']
    });
    
    let aiResponse = completion.choices[0].message.content || "I'm sorry, I couldn't process your request. Please try again later.";
    
    // Add disclaimer to every response
    aiResponse += "\n\n*Note: I'm an AI assistant. For specific questions about your account, please contact our support team.*";

    // If we have a leadId, save the conversation to the database
    if (leadId) {
      try {
        await prisma.conversation.create({
          data: {
            leadId,
            messages: [
              ...messages,
              { role: 'assistant', content: aiResponse },
            ],
          },
        });
      } catch (dbError) {
        console.error('Error saving conversation to database:', dbError);
        // Don't fail the request if database save fails
      }
    }

    return NextResponse.json({ content: aiResponse });
  } catch (error) {
    console.error('Error in AI chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process your message' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
