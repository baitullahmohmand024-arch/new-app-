/**
 * Easy Study Snap - AI Teacher Service
 * Client-side interface to secure server-side academic AI endpoints
 */

import {
  AITeacherChatSession,
  AITeacherContext,
  AITeacherMessage,
  AITeacherStudyMode,
  AITeacherSessionStats,
  MCQDifficulty,
  MCQQuestion,
} from '../types';

const STORAGE_PREFIX = 'easy_study_ai_chats_';

export interface ChatRequestOptions {
  messages: AITeacherMessage[];
  context?: AITeacherContext;
  studyMode?: AITeacherStudyMode;
  userQuery?: string;
}

export interface GenerateMCQOptions {
  context?: AITeacherContext;
  difficulty?: MCQDifficulty;
  studyMode?: AITeacherStudyMode;
  topic?: string;
  weakConcepts?: string[];
}

export class AITeacherService {
  /**
   * Check if online and backend health
   */
  static async checkHealth(): Promise<{ isOnline: boolean; isConfigured: boolean }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return { isOnline: false, isConfigured: false };
    }
    try {
      const res = await fetch('/api/ai-teacher/health', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) return { isOnline: true, isConfigured: false };
      const data = await res.json();
      return { isOnline: true, isConfigured: Boolean(data.isConfigured) };
    } catch {
      return { isOnline: false, isConfigured: false };
    }
  }

  /**
   * Send a study query to AI Teacher
   */
  static async askTeacher(options: ChatRequestOptions): Promise<{ text: string }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('AI Teacher needs an internet connection.');
    }

    const response = await fetch('/api/ai-teacher/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Something went wrong while connecting to the AI Teacher.');
    }

    return response.json();
  }

  /**
   * Generate an academic MCQ
   */
  static async generateMCQ(options: GenerateMCQOptions): Promise<{ question: MCQQuestion }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('AI Teacher needs an internet connection.');
    }

    const response = await fetch('/api/ai-teacher/generate-mcq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate practice question. Please try again.');
    }

    return response.json();
  }

  /**
   * Get all persistent chat sessions for a user
   */
  static getChatSessions(userId: string): AITeacherChatSession[] {
    if (!userId) return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
      if (!raw) return [];
      const parsed: AITeacherChatSession[] = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
    } catch (e) {
      console.error('Failed to load AI teacher chats:', e);
      return [];
    }
  }

  /**
   * Save or update a chat session
   */
  static saveChatSession(userId: string, session: AITeacherChatSession): void {
    if (!userId || !session) return;
    try {
      const existing = this.getChatSessions(userId);
      const index = existing.findIndex((s) => s.id === session.id);
      if (index >= 0) {
        existing[index] = { ...session, updatedAt: Date.now() };
      } else {
        existing.unshift({ ...session, updatedAt: Date.now() });
      }
      // Keep up to 30 most recent sessions to conserve local quota
      const trimmed = existing.slice(0, 30);
      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save AI teacher chat:', e);
    }
  }

  /**
   * Delete a chat session
   */
  static deleteChatSession(userId: string, sessionId: string): void {
    if (!userId || !sessionId) return;
    try {
      const existing = this.getChatSessions(userId);
      const filtered = existing.filter((s) => s.id !== sessionId);
      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete AI teacher chat:', e);
    }
  }

  /**
   * Create a fresh empty chat session
   */
  static createEmptySession(userId: string, context?: AITeacherContext): AITeacherChatSession {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let initialTitle = 'New Study Session';
    if (context?.chapterTitle) {
      initialTitle = `${context.chapterTitle}`;
    } else if (context?.subjectName) {
      initialTitle = `${context.subjectName} Study`;
    }

    return {
      id,
      userId,
      title: initialTitle,
      context,
      messages: [],
      stats: {
        questionsAttempted: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracy: 100,
        topicsPracticed: [],
        weakConcepts: [],
        mistakes: [],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Generate an academic concise title from the first question
   */
  static deriveAcademicTitle(prompt: string, context?: AITeacherContext): string {
    if (context?.chapterTitle) {
      return `${context.chapterTitle} Revision`;
    }
    const clean = prompt
      .replace(/^(explain|help me understand|give me|practice|what is|why is|how does)\s+/i, '')
      .replace(/[?!.,;:]/g, '')
      .trim();

    if (!clean) return 'Study Discussion';
    const words = clean.split(/\s+/).slice(0, 5);
    const capitalized = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return capitalized.length > 32 ? `${capitalized.slice(0, 29)}...` : capitalized;
  }
}
