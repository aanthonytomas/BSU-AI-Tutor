import { Response } from 'express';
import { PrismaClient, AIInteractionType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import OpenAI from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Real AI response function using OpenAI
const generateAIResponse = async (userMessage: string, context?: string): Promise<string> => {
  try {
    const systemPrompt = `You are an AI tutor for an inclusive learning platform. 
Your role is to help students understand concepts, provide clear explanations, and guide them through problems.
Be encouraging, patient, and adapt your explanations to different learning styles.
Keep responses concise (under 200 words) and educational.

IMPORTANT: Format your responses using Markdown for better readability:
- Use **bold** for key terms and important concepts
- Use numbered lists (1. 2. 3.) for steps or ordered information
- Use bullet points (- or *) for unordered lists
- Use headings (##) for sections if needed
- Keep paragraphs short and clear
- Add line breaks between sections for readability

${context ? `\n\nContext: ${context}` : ''}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      temperature: 0.7,
    });

    return completion.choices[0].message.content || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific errors
    if (error.code === 'insufficient_quota') {
      return 'AI service quota exceeded. Please contact support or try again later.';
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    // Fallback response
    return 'I\'m having trouble connecting to the AI service right now. Please try again in a moment.';
  }
};

export const askAITutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { message, courseId, lessonId, type } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Build context from course and lesson if provided
    let contextInfo = '';
    
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, description: true }
      });
      if (course) {
        contextInfo += `Course: ${course.title}. ${course.description}. `;
      }
    }
    
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { title: true, content: true }
      });
      if (lesson) {
        contextInfo += `Lesson: ${lesson.title}. `;
      }
    }

    // Generate AI response with context
    const aiResponse = await generateAIResponse(message, contextInfo || undefined);

    // Save interaction to database
    const interaction = await prisma.aIInteraction.create({
      data: {
        userId,
        type: (type as AIInteractionType) || AIInteractionType.QUESTION,
        context: contextInfo || undefined,
        userMessage: message,
        aiResponse,
      },
    });

    res.json({
      response: aiResponse,
      interactionId: interaction.id,
    });
  } catch (error) {
    console.error('AI tutor error:', error);
    res.status(500).json({ error: 'Server error processing AI request' });
  }
};

export const getAIHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { limit = 50, context } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const where: any = { userId };

    if (context) {
      where.context = {
        contains: context as string,
      };
    }

    const interactions = await prisma.aIInteraction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
    });

    res.json({ interactions });
  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({ error: 'Server error fetching AI history' });
  }
};

export const rateAIResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const interaction = await prisma.aIInteraction.findUnique({
      where: { id },
    });

    if (!interaction || interaction.userId !== userId) {
      res.status(404).json({ error: 'Interaction not found' });
      return;
    }

    const updated = await prisma.aIInteraction.update({
      where: { id },
      data: { helpful },
    });

    res.json({ interaction: updated });
  } catch (error) {
    console.error('Rate AI response error:', error);
    res.status(500).json({ error: 'Server error rating response' });
  }
};
