# AI Integration Guide
## AI for Inclusive Learning Platform

This guide will help you integrate real AI capabilities into the platform.

---

## 🤖 Current Status

The platform has **placeholder AI responses** in the AI Tutor. To enable real AI:
- OpenAI GPT-4 (Recommended)
- Anthropic Claude
- Azure OpenAI Service

---

## 📋 Prerequisites

### 1. Get API Keys

#### Option A: OpenAI (Recommended)
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

**Cost:** ~$0.03 per 1K tokens (GPT-4)

#### Option B: Anthropic Claude
1. Go to https://console.anthropic.com/
2. Sign up for access
3. Create an API key
4. Copy the key (starts with `sk-ant-`)

**Cost:** ~$0.015 per 1K tokens (Claude 3 Sonnet)

#### Option C: Azure OpenAI
1. Create Azure account
2. Request OpenAI Service access
3. Deploy a model
4. Get endpoint and key

---

## 🔧 Integration Steps

### Step 1: Install Required Packages

```bash
cd server
npm install openai @anthropic-ai/sdk
```

### Step 2: Add API Key to Environment

Edit `server/.env`:

```env
# For OpenAI
OPENAI_API_KEY="sk-your-actual-api-key-here"
OPENAI_MODEL="gpt-4"
OPENAI_MAX_TOKENS=500

# OR for Anthropic Claude
ANTHROPIC_API_KEY="sk-ant-your-actual-api-key-here"
ANTHROPIC_MODEL="claude-3-sonnet-20240229"
```

### Step 3: Update AI Tutor Controller

Replace the placeholder function in `server/src/controllers/ai-tutor.controller.ts`:

#### For OpenAI:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateAIResponse = async (userMessage: string, context?: string): Promise<string> => {
  try {
    const systemPrompt = `You are an AI tutor for an inclusive learning platform. 
Your role is to help students understand concepts, provide explanations, and guide them through problems.
Be encouraging, patient, and adapt your explanations to different learning styles.
${context ? `Context: ${context}` : ''}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      temperature: 0.7,
    });

    return completion.choices[0].message.content || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get AI response');
  }
};
```

#### For Anthropic Claude:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const generateAIResponse = async (userMessage: string, context?: string): Promise<string> => {
  try {
    const systemPrompt = `You are an AI tutor for an inclusive learning platform. 
Your role is to help students understand concepts, provide explanations, and guide them through problems.
Be encouraging, patient, and adapt your explanations to different learning styles.
${context ? `Context: ${context}` : ''}`;

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: [
        { role: 'user', content: `${systemPrompt}\n\nStudent question: ${userMessage}` }
      ],
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Anthropic API Error:', error);
    throw new Error('Failed to get AI response');
  }
};
```

### Step 4: Add Context-Aware Responses

Enhance the AI with course context:

```typescript
export const askAITutor = async (req: AuthRequest, res: Response) => {
  try {
    const { message, courseId, lessonId, type } = req.body;
    const userId = req.user?.userId;

    if (!userId || !message) {
      return res.status(400).json({ error: 'User ID and message required' });
    }

    // Fetch context if courseId or lessonId provided
    let context = '';
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, description: true }
      });
      context += `Course: ${course?.title}. ${course?.description}. `;
    }
    
    if (lessonId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { title: true, content: true }
      });
      context += `Lesson: ${lesson?.title}. `;
    }

    // Generate AI response with context
    const aiResponse = await generateAIResponse(message, context);

    // Save interaction
    const interaction = await prisma.aIInteraction.create({
      data: {
        userId,
        type: type || 'QUESTION',
        userMessage: message,
        aiResponse,
        context: context || undefined,
      },
    });

    res.json({
      response: aiResponse,
      interactionId: interaction.id,
    });
  } catch (error: any) {
    console.error('AI Tutor Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
};
```

### Step 5: Test the Integration

```bash
# Restart the server
cd server
npm run dev

# Test with curl
curl -X POST http://localhost:5000/api/ai-tutor/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Can you explain what a variable is in algebra?",
    "type": "QUESTION"
  }'
```

---

## 🎯 Advanced Features

### 1. Personalized Learning Paths

```typescript
// Add to AI prompt
const userProfile = await prisma.user.findUnique({
  where: { id: userId },
  include: { accessibilitySettings: true }
});

const personalizedPrompt = `
Student learning style: ${userProfile?.learningStyle}
Accessibility needs: ${userProfile?.accessibilitySettings?.dyslexiaFont ? 'Dyslexia-friendly' : 'Standard'}
Adapt your response accordingly.
`;
```

### 2. Multi-turn Conversations

```typescript
// Fetch conversation history
const recentInteractions = await prisma.aIInteraction.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 5,
});

const conversationHistory = recentInteractions.reverse().map(i => ({
  role: 'user',
  content: i.userMessage,
}, {
  role: 'assistant',
  content: i.aiResponse,
}));

// Include in API call
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ],
});
```

### 3. Content Generation

```typescript
// Generate lesson content
export const generateLessonContent = async (topic: string, level: string) => {
  const prompt = `Create a ${level} level lesson about ${topic}. 
Include:
1. Introduction
2. Key concepts
3. Examples
4. Practice questions
Format in markdown.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
  });

  return completion.choices[0].message.content;
};
```

---

## 🔊 Speech Integration (Optional)

### Text-to-Speech (Azure)

```bash
npm install microsoft-cognitiveservices-speech-sdk
```

```typescript
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export const textToSpeech = async (text: string): Promise<Buffer> => {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY!,
    process.env.AZURE_SPEECH_REGION!
  );
  
  speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
  
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      result => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(result.audioData));
        } else {
          reject(new Error('Speech synthesis failed'));
        }
        synthesizer.close();
      },
      error => {
        synthesizer.close();
        reject(error);
      }
    );
  });
};
```

### Speech-to-Text (Web Speech API)

Already available in browsers! Add to frontend:

```typescript
// client/src/components/SpeechInput.tsx
const SpeechInput = ({ onTranscript }: { onTranscript: (text: string) => void }) => {
  const startListening = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    
    recognition.start();
  };
  
  return <button onClick={startListening}>🎤 Speak</button>;
};
```

---

## 💰 Cost Optimization

### 1. Caching Responses

```typescript
import Redis from 'ioredis';
const redis = new Redis();

const getCachedResponse = async (message: string): Promise<string | null> => {
  const cached = await redis.get(`ai:${message}`);
  return cached;
};

const cacheResponse = async (message: string, response: string) => {
  await redis.setex(`ai:${message}`, 3600, response); // Cache for 1 hour
};
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many AI requests, please try again later.'
});

app.use('/api/ai-tutor', aiLimiter);
```

### 3. Token Management

```typescript
const MAX_TOKENS = 500;
const MAX_MESSAGE_LENGTH = 2000;

if (message.length > MAX_MESSAGE_LENGTH) {
  return res.status(400).json({ 
    error: 'Message too long. Please keep it under 2000 characters.' 
  });
}
```

---

## 🧪 Testing

### Test Script

```bash
# Create test script
cat > test-ai.sh << 'EOF'
#!/bin/bash

TOKEN="your-jwt-token-here"

echo "Testing AI Tutor..."
curl -X POST http://localhost:5000/api/ai-tutor/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Explain photosynthesis in simple terms",
    "type": "QUESTION"
  }' | jq .

echo ""
echo "Testing with context..."
curl -X POST http://localhost:5000/api/ai-tutor/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "What is a variable?",
    "courseId": "your-course-id",
    "type": "QUESTION"
  }' | jq .
EOF

chmod +x test-ai.sh
./test-ai.sh
```

---

## 📊 Monitoring

### Track AI Usage

```typescript
// Add to dashboard controller
export const getAIUsageStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  
  const stats = await prisma.aIInteraction.groupBy({
    by: ['type'],
    where: { userId },
    _count: true,
  });
  
  const totalTokensEstimate = await prisma.aIInteraction.aggregate({
    where: { userId },
    _sum: {
      // Estimate: ~4 chars per token
      // You'd need to add a tokens field to track actual usage
    }
  });
  
  res.json({ stats });
};
```

---

## 🚨 Error Handling

```typescript
const generateAIResponse = async (userMessage: string, context?: string): Promise<string> => {
  try {
    // AI API call
  } catch (error: any) {
    // Log error
    console.error('AI Error:', error);
    
    // Check error type
    if (error.code === 'insufficient_quota') {
      throw new Error('AI service quota exceeded. Please contact support.');
    }
    
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('Too many requests. Please wait a moment.');
    }
    
    // Generic fallback
    throw new Error('AI service temporarily unavailable. Please try again.');
  }
};
```

---

## ✅ Checklist

- [ ] Get API key from OpenAI or Anthropic
- [ ] Install required npm packages
- [ ] Add API key to `.env`
- [ ] Update `ai-tutor.controller.ts`
- [ ] Test with sample questions
- [ ] Add error handling
- [ ] Implement rate limiting
- [ ] Add usage monitoring
- [ ] Test with different user roles
- [ ] Document for team

---

## 📞 Support

**OpenAI Documentation:** https://platform.openai.com/docs  
**Anthropic Documentation:** https://docs.anthropic.com  
**Azure OpenAI:** https://learn.microsoft.com/en-us/azure/ai-services/openai/

---

**Once integrated, your AI Tutor will provide real, intelligent responses to students!** 🎓
