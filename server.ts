import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with limits
app.use(express.json({ limit: '2mb' }));

// Lazy/safe initialization for GoogleGenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// System instruction for the AI Academic Tutor
const ACADEMIC_TEACHER_SYSTEM_INSTRUCTION = `
You are an experienced, patient, and highly respected human academic teacher and study tutor for Easy Study Snap.
Your primary mission is CONCEPT MASTERY for students across various disciplines (Pre-Engineering, Pre-Medical, Computer Science, Humanities, Commerce, and Sciences).

CORE PEDAGOGICAL PRINCIPLES:
1. Tone & Composure:
   - Speak like an experienced senior school/college professor: clear, direct, encouraging yet academically rigorous, patient, and precise.
   - Strictly avoid robotic phrasing (e.g. NEVER start with "Hello! I am your AI assistant" or "As an AI...").
   - Strictly avoid repetitive hollow cheerleading or emoji spam (e.g. no "Great question! 🤖🎉", no excessive exclamation marks).
   - Avoid generic motivational speeches. Focus purely on teaching, understanding, and academic depth.

2. Structure for Concept Explanations:
   When explaining a concept or answering "Explain this / Help me understand":
   - Core Idea: State the single most important definition or principle in 1-2 crisp sentences.
   - Why It Works & Mechanism: Explain the logical cause-and-effect or underlying principle.
   - Concrete Example / Step-by-Step: Provide a clear, realistic worked example or physical scenario.
   - Common Misunderstanding: Explicitly pinpoint the exact error or confusion students often make.
   - Exam Insight & High-Yield Trap: Detail how this concept is tested in competitive/board exams.
   - Summary Takeaway: 1-sentence memorable takeaway.

3. Adapt to Subject Nature:
   - Mathematics: Step-by-step logical deductions, explicit formula conditions, clean calculations.
   - Physics: Physical reasoning, cause-effect relationships, units, boundary conditions, vector directions.
   - Chemistry: Reaction conditions, mechanisms, molecular interactions, energy changes, exceptions.
   - Biology: Process flows, cellular/anatomical structures, functions, evolutionary/biological significance.
   - Computer Science: Algorithmic intuition, edge cases, time/space trade-offs, clean code snippets.
   - Humanities / Commerce: Analytical distinctions, principles, real-world context, comparative synthesis.

4. Responding to "Why?":
   - Never repeat your previous response.
   - Approach the concept from a different physical angle, comparison, counter-factual scenario, or fundamental first principle.

5. Academic Integrity & Accuracy:
   - Never invent scientific formulas, historical facts, or false official examination citations.
   - If uncertain, clearly specify theoretical boundaries.
`;

/**
 * Resilient helper to call Gemini models with automatic exponential backoff and fallback models
 * to seamlessly absorb temporary 503 UNAVAILABLE, 429 RATE_LIMIT, or temporary high-demand spikes.
 */
async function generateContentWithRetry(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const modelsToTry = [
    options.primaryModel || 'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isUnavailableOrRateLimited =
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('Resource has been exhausted') ||
          errMsg.includes('overloaded');

        if (isUnavailableOrRateLimited) {
          console.warn(`[Gemini API] Model '${model}' attempt ${attempt} encountered high demand/503. Retrying...`);
          // Exponential backoff with jitter
          const delay = attempt * 700 + Math.random() * 300;
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // If it's a structural error (e.g. invalid parameter), fail fast
          console.error("DEBUG lastError:", err);
          throw err;
        }
      }
    }
  }

  console.error("DEBUG Retries exhausted. lastError:", lastError);
  throw lastError;
}

// Simple in-memory rate limiter per IP
const requestTimestamps = new Map<string, number[]>();
const rateLimitMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const timestamps = requestTimestamps.get(ip) || [];
  
  // Keep only requests in the last 60 seconds
  const recent = timestamps.filter(t => now - t < 60000);
  if (recent.length >= 35) { // 35 requests per minute limit
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before sending another question.',
    });
  }
  
  recent.push(now);
  requestTimestamps.set(ip, recent);
  next();
};

// API: Health & Key Check
app.get('/api/ai-teacher/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    status: 'ok',
    isConfigured: hasKey,
    model: 'gemini-3.7-flash',
  });
});

// API: Chat Endpoint
app.post('/api/ai-teacher/chat', rateLimitMiddleware, async (req, res) => {
  try {
    const { messages, context, studyMode, userQuery } = req.body;

    if (!userQuery && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Question or conversation history is required.' });
    }

    const ai = getAIClient();

    // Build context prefix
    let contextDescription = '';
    if (context) {
      const parts: string[] = [];
      if (context.fieldName) parts.push(`Academic Track/Field: ${context.fieldName}`);
      if (context.subjectName) parts.push(`Subject: ${context.subjectName}`);
      if (context.chapterTitle) {
        parts.push(`Current Chapter: ${context.chapterNumber ? `Ch. ${context.chapterNumber} - ` : ''}${context.chapterTitle}`);
      }
      if (parts.length > 0) {
        contextDescription = `STUDENT'S CURRENT STUDY CONTEXT:\n${parts.join('\n')}\n\n`;
      }
    }

    let modeInstruction = '';
    if (studyMode === 'learn_concept') {
      modeInstruction = 'Study Mode: CONCEPT EXPLANATION. Provide a deeply intuitive explanation with core principles, real examples, common student mistakes, and exam insights.';
    } else if (studyMode === 'rapid_revision') {
      modeInstruction = 'Study Mode: RAPID REVISION. Give high-yield bulleted points, critical formulas/definitions, and key exam traps without unnecessary fluff.';
    } else if (studyMode === 'exam_practice') {
      modeInstruction = 'Study Mode: EXAMINATION PREPARATION. Focus on high-frequency exam questions, key traps examiners set, time-saving solving techniques, and precision.';
    } else if (studyMode === 'weak_area_practice') {
      modeInstruction = 'Study Mode: WEAK AREA STRENGTHENING. The student struggled with this concept. Break it down to first principles, diagnose the root confusion, and provide an intuitive memory anchor.';
    }

    // Prepare prompt contents
    // We send recent conversation context (last 6 exchanges) to stay fast and cost-effective
    const conversationHistory: string[] = [];
    if (Array.isArray(messages)) {
      const recentMessages = messages.slice(-6);
      for (const m of recentMessages) {
        const role = m.sender === 'user' ? 'Student' : 'AI Teacher';
        conversationHistory.push(`${role}: ${m.text}`);
      }
    }

    const currentPrompt = userQuery || (messages && messages[messages.length - 1]?.text) || 'Please explain the key concept.';

    const fullPrompt = `${contextDescription}${modeInstruction ? `${modeInstruction}\n\n` : ''}${conversationHistory.length > 0 ? `PREVIOUS CONVERSATION CONTEXT:\n${conversationHistory.join('\n\n')}\n\n` : ''}STUDENT'S CURRENT QUESTION/REQUEST:
"${currentPrompt}"

Respond as the AI Academic Teacher following all academic guidelines.`;

    const response = await generateContentWithRetry(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: ACADEMIC_TEACHER_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const responseText = response.text || 'I have analyzed your question. Please let me know which specific aspect you would like to explore further.';

    res.json({
      text: responseText,
      studyMode: studyMode || 'learn_concept',
    });
  } catch (error: any) {
    console.error('Error in /api/ai-teacher/chat:', error);
    const message = error?.message || 'Failed to generate academic response';
    const isDemandError =
      message.includes('503') ||
      message.includes('high demand') ||
      message.includes('UNAVAILABLE') ||
      message.includes('Resource has been exhausted') ||
      message.includes('429');

    res.status(isDemandError ? 503 : 500).json({
      error: message.includes('API_KEY')
        ? 'AI Teacher API key is not configured.'
        : isDemandError
        ? 'The AI Teacher service is temporarily experiencing high demand. Please tap Retry to continue.'
        : 'Something went wrong while connecting to the AI Teacher. Please try again.',
      isHighDemand: isDemandError,
    });
  }
});

// API: Generate High-Quality MCQ Endpoint
app.post('/api/ai-teacher/generate-mcq', rateLimitMiddleware, async (req, res) => {
  try {
    const { context, difficulty = 'conceptual', studyMode = 'practice_mcqs', topic = '', weakConcepts = [] } = req.body;

    const ai = getAIClient();

    let contextDetails = '';
    if (context) {
      if (context.subjectName) contextDetails += `Subject: ${context.subjectName}. `;
      if (context.chapterTitle) contextDetails += `Chapter: ${context.chapterTitle}. `;
    }
    if (topic) {
      contextDetails += `Topic: ${topic}. `;
    }
    if (weakConcepts && weakConcepts.length > 0) {
      contextDetails += `Target specifically to test these concepts: ${weakConcepts.join(', ')}. `;
    }

    const prompt = `Generate ONE high-quality, academically rigorous Multiple Choice Question (MCQ) for a student studying:
${contextDetails || 'General Academic Science/Mathematics/Studies'}

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
(Foundation = standard core definition/formula check; Conceptual = testing deep understanding of why/how; Tricky/Application = testing conditions, boundary cases, multi-step reasoning; Exam Challenge = top-tier board/competitive examination standard).

CRITICAL MCQ CREATION RULES:
1. Question: Must have ONE clearly defensible, unambiguously correct answer.
2. Options: Exactly four options labeled A, B, C, D.
3. Distractors: Plausible options derived from common misconceptions, partial understanding, sign errors, or confusing related concepts. NO absurd, childish, or obviously fake options.
4. Explanation: A clear 2-3 sentence explanation of why the correct option is right.
5. whyTemptingMap: An object with keys "A", "B", "C", "D" explaining the exact trap, misconception, or mistake behind each option.
6. keyIdea: ONE fundamental principle or formula to remember.
7. examTrap: A short note on how examiners exploit this concept.
8. topic: A short 2-4 word topic title (e.g. "Quadratic Roots", "Lenz's Law", "Mitochondrial Respiration").

Return strictly in the specified JSON schema.`;

    const response = await generateContentWithRetry(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: ACADEMIC_TEACHER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: 'The question text' },
            options: {
              type: Type.OBJECT,
              properties: {
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
              },
              required: ['A', 'B', 'C', 'D'],
            },
            correctOption: {
              type: Type.STRING,
              description: 'Must be A, B, C, or D',
            },
            explanation: { type: Type.STRING, description: 'Clear explanation of the correct answer' },
            whyTemptingMap: {
              type: Type.OBJECT,
              properties: {
                A: { type: Type.STRING },
                B: { type: Type.STRING },
                C: { type: Type.STRING },
                D: { type: Type.STRING },
              },
              required: ['A', 'B', 'C', 'D'],
            },
            keyIdea: { type: Type.STRING, description: 'One key conceptual rule to remember' },
            examTrap: { type: Type.STRING, description: 'Common exam pitfall' },
            difficulty: { type: Type.STRING, description: 'foundation | conceptual | tricky | exam_challenge' },
            topic: { type: Type.STRING, description: 'Specific topic name' },
          },
          required: ['question', 'options', 'correctOption', 'explanation', 'keyIdea', 'difficulty', 'topic'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    
    // Normalize correct option
    let cleanCorrect = (parsed.correctOption || 'A').toUpperCase().trim();
    if (!['A', 'B', 'C', 'D'].includes(cleanCorrect)) {
      cleanCorrect = 'A';
    }

    const questionData = {
      id: `mcq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      question: parsed.question || 'Which of the following statements is conceptually correct?',
      options: {
        A: parsed.options?.A || 'Option A',
        B: parsed.options?.B || 'Option B',
        C: parsed.options?.C || 'Option C',
        D: parsed.options?.D || 'Option D',
      },
      correctOption: cleanCorrect as 'A' | 'B' | 'C' | 'D',
      explanation: parsed.explanation || 'Option is correct based on core principles.',
      whyTemptingMap: parsed.whyTemptingMap || {
        A: 'Often selected if formula is partially remembered.',
        B: 'Commonly chosen if sign convention is reversed.',
        C: 'Selected when edge conditions are overlooked.',
        D: 'Selected when definitions are mixed up.',
      },
      keyIdea: parsed.keyIdea || 'Master the fundamental relationship before applying shortcuts.',
      examTrap: parsed.examTrap || 'Watch out for boundary conditions and units.',
      difficulty: (parsed.difficulty?.toLowerCase() as any) || difficulty,
      topic: parsed.topic || topic || (context?.subjectName ? `${context.subjectName} Concept` : 'Core Concept'),
    };

    res.json({
      question: questionData,
    });
  } catch (error: any) {
    console.error('Error in /api/ai-teacher/generate-mcq:', error);
    const message = error?.message || 'Failed to generate practice question';
    const isDemandError =
      message.includes('503') ||
      message.includes('high demand') ||
      message.includes('UNAVAILABLE') ||
      message.includes('Resource has been exhausted') ||
      message.includes('429');

    res.status(isDemandError ? 503 : 500).json({
      error: isDemandError
        ? 'Practice questions are temporarily experiencing high demand. Please try again in a moment.'
        : 'Failed to generate practice question. Please try again.',
      isHighDemand: isDemandError,
    });
  }
});

// Start dev or production server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Easy Study Snap server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
