import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GraduationCap,
  Sparkles,
  Send,
  Plus,
  History,
  Layers,
  Award,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Zap,
  Target,
  RotateCcw,
  Trash2,
  ChevronDown,
  WifiOff,
  Lightbulb,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  AcademicField,
  Subject,
  Chapter,
  UserProfile,
  AITeacherChatSession,
  AITeacherContext,
  AITeacherMessage,
  AITeacherStudyMode,
  MCQDifficulty,
  MCQOption,
  MCQQuestion,
} from '../../types';
import { AITeacherService } from '../../services/aiTeacherService';
import { TeacherMessageBubble } from './TeacherMessageBubble';
import { ContextSelectorModal } from './ContextSelectorModal';
import { SessionStatsModal } from './SessionStatsModal';
import { DeleteChatConfirmModal } from './DeleteChatConfirmModal';

interface AITeacherViewProps {
  currentUser: UserProfile | null;
  fields: AcademicField[];
  subjects: Subject[];
  chapters: Chapter[];
  initialContext?: AITeacherContext;
}

export const AITeacherView: React.FC<AITeacherViewProps> = ({
  currentUser,
  fields,
  subjects,
  chapters,
  initialContext,
}) => {
  const userId = currentUser?.id || 'guest_student';

  // Active Session State
  const [sessions, setSessions] = useState<AITeacherChatSession[]>(() =>
    AITeacherService.getChatSessions(userId)
  );
  const [activeSession, setActiveSession] = useState<AITeacherChatSession>(() => {
    const existing = AITeacherService.getChatSessions(userId);
    if (existing.length > 0) return existing[0];
    return AITeacherService.createEmptySession(userId, initialContext);
  });

  // UI States
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<AITeacherStudyMode>('learn_concept');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing concept...');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update context if initialContext changes from parent navigation
  useEffect(() => {
    if (initialContext && initialContext.subjectId !== activeSession.context?.subjectId) {
      const updated = {
        ...activeSession,
        context: initialContext,
        updatedAt: Date.now(),
      };
      setActiveSession(updated);
      AITeacherService.saveChatSession(userId, updated);
    }
  }, [initialContext, userId]);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession.messages, isLoading, scrollToBottom]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Start New Chat Session
  const handleNewChat = () => {
    const freshSession = AITeacherService.createEmptySession(userId, activeSession.context);
    setActiveSession(freshSession);
    const updatedSessions = [freshSession, ...sessions.filter((s) => s.id !== freshSession.id)];
    setSessions(updatedSessions);
    AITeacherService.saveChatSession(userId, freshSession);
    setIsHistoryOpen(false);
  };

  // Select an Existing Chat Session
  const handleSelectSession = (session: AITeacherChatSession) => {
    setActiveSession(session);
    setIsHistoryOpen(false);
  };

  // Confirm Delete Session
  const handleDeleteSession = (sessionId: string) => {
    AITeacherService.deleteChatSession(userId, sessionId);
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    if (activeSession.id === sessionId) {
      if (remaining.length > 0) {
        setActiveSession(remaining[0]);
      } else {
        const fresh = AITeacherService.createEmptySession(userId, activeSession.context);
        setActiveSession(fresh);
        setSessions([fresh]);
      }
    }
    setChatToDelete(null);
  };

  // Switch Context (Field, Subject, Chapter)
  const handleContextChange = (newContext: AITeacherContext | undefined) => {
    const updated = {
      ...activeSession,
      context: newContext,
      updatedAt: Date.now(),
    };
    setActiveSession(updated);
    AITeacherService.saveChatSession(userId, updated);
  };

  // Trigger MCQ generation directly
  const handleGenerateMCQ = async (difficulty: MCQDifficulty = 'conceptual', customTopic?: string) => {
    if (!isOnline) return;
    setIsLoading(true);
    setLoadingText('Formulating practice question...');

    try {
      const result = await AITeacherService.generateMCQ({
        context: activeSession.context,
        difficulty,
        studyMode: selectedMode,
        topic: customTopic || '',
        weakConcepts: activeSession.stats.weakConcepts,
      });

      const teacherMsg: AITeacherMessage = {
        id: `msg_${Date.now()}`,
        sender: 'teacher',
        text: `Here is a **${difficulty.toUpperCase()}** level practice question to test your concept mastery:`,
        timestamp: Date.now(),
        studyMode: selectedMode,
        mcqQuestion: result.question,
      };

      const updatedMessages = [...activeSession.messages, teacherMsg];
      const updatedSession: AITeacherChatSession = {
        ...activeSession,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      setActiveSession(updatedSession);
      AITeacherService.saveChatSession(userId, updatedSession);
      setSessions((prev) =>
        prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
      );
    } catch (err: any) {
      console.error('Failed to generate MCQ:', err);
      const errorMsg: AITeacherMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'teacher',
        text: "Sorry, I couldn't answer right now. Please try again.",
        timestamp: Date.now(),
        isError: true,
      };
      setActiveSession((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Submit User Message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isLoading) return;

    if (!isOnline) {
      return;
    }

    const userMsg: AITeacherMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
      studyMode: selectedMode,
    };

    // If this is the first message and title is default, derive a meaningful title
    let sessionTitle = activeSession.title;
    if (
      activeSession.messages.length === 0 ||
      activeSession.title === 'New Study Session'
    ) {
      sessionTitle = AITeacherService.deriveAcademicTitle(textToSend, activeSession.context);
    }

    const newMessages = [...activeSession.messages, userMsg];
    const sessionWithUserMsg: AITeacherChatSession = {
      ...activeSession,
      title: sessionTitle,
      messages: newMessages,
      updatedAt: Date.now(),
    };

    setActiveSession(sessionWithUserMsg);
    AITeacherService.saveChatSession(userId, sessionWithUserMsg);
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionWithUserMsg.id ? sessionWithUserMsg : s))
    );

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Check if user specifically requested an MCQ or tricky question in text
    const lowerText = textToSend.toLowerCase();
    const isMCQRequest =
      lowerText.includes('mcq') ||
      lowerText.includes('quiz') ||
      lowerText.includes('practice question') ||
      selectedMode === 'practice_mcqs' ||
      selectedMode === 'tricky_mcqs';

    setIsLoading(true);
    setLoadingText(
      isMCQRequest
        ? 'Formulating concept question...'
        : selectedMode === 'rapid_revision'
        ? 'Preparing rapid revision...'
        : 'Analyzing academic concept...'
    );

    try {
      if (selectedMode === 'practice_mcqs' || selectedMode === 'tricky_mcqs') {
        const difficulty: MCQDifficulty = selectedMode === 'tricky_mcqs' ? 'tricky' : 'conceptual';
        const mcqResult = await AITeacherService.generateMCQ({
          context: activeSession.context,
          difficulty,
          studyMode: selectedMode,
          topic: textToSend,
          weakConcepts: activeSession.stats.weakConcepts,
        });

        const teacherMsg: AITeacherMessage = {
          id: `msg_t_${Date.now()}`,
          sender: 'teacher',
          text: `Based on your request, here is a targeted **${difficulty.toUpperCase()}** question on **${mcqResult.question.topic || 'this concept'}**:`,
          timestamp: Date.now(),
          studyMode: selectedMode,
          mcqQuestion: mcqResult.question,
        };

        const finalSession: AITeacherChatSession = {
          ...sessionWithUserMsg,
          messages: [...sessionWithUserMsg.messages, teacherMsg],
          updatedAt: Date.now(),
        };

        setActiveSession(finalSession);
        AITeacherService.saveChatSession(userId, finalSession);
        setSessions((prev) =>
          prev.map((s) => (s.id === finalSession.id ? finalSession : s))
        );
      } else {
        const chatResult = await AITeacherService.askTeacher({
          messages: sessionWithUserMsg.messages,
          context: activeSession.context,
          studyMode: selectedMode,
          userQuery: textToSend,
        });

        const teacherMsg: AITeacherMessage = {
          id: `msg_t_${Date.now()}`,
          sender: 'teacher',
          text: chatResult.text,
          timestamp: Date.now(),
          studyMode: selectedMode,
        };

        const finalSession: AITeacherChatSession = {
          ...sessionWithUserMsg,
          messages: [...sessionWithUserMsg.messages, teacherMsg],
          updatedAt: Date.now(),
        };

        setActiveSession(finalSession);
        AITeacherService.saveChatSession(userId, finalSession);
        setSessions((prev) =>
          prev.map((s) => (s.id === finalSession.id ? finalSession : s))
        );
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: AITeacherMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'teacher',
        text: "Sorry, I couldn't answer right now. Please try again.",
        timestamp: Date.now(),
        isError: true,
      };
      const finalSession = {
        ...sessionWithUserMsg,
        messages: [...sessionWithUserMsg.messages, errorMsg],
      };
      setActiveSession(finalSession);
      AITeacherService.saveChatSession(userId, finalSession);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry a failed question
  const handleRetryMessage = (errorMsgId: string) => {
    const errorIndex = activeSession.messages.findIndex((m) => m.id === errorMsgId);
    if (errorIndex < 0) return;

    // Find the closest preceding user message
    let lastUserQuery = '';
    for (let i = errorIndex - 1; i >= 0; i--) {
      if (activeSession.messages[i].sender === 'user') {
        lastUserQuery = activeSession.messages[i].text;
        break;
      }
    }

    // Clean up the error message from the feed
    const filteredMessages = activeSession.messages.filter((m) => m.id !== errorMsgId);
    const cleanedSession = {
      ...activeSession,
      messages: filteredMessages,
      updatedAt: Date.now(),
    };
    setActiveSession(cleanedSession);
    AITeacherService.saveChatSession(userId, cleanedSession);

    if (lastUserQuery) {
      handleSendMessage(lastUserQuery);
    } else {
      handleGenerateMCQ(selectedMode === 'tricky_mcqs' ? 'tricky' : 'conceptual');
    }
  };

  // Answer Submitted for an MCQ
  const handleAnswerMCQ = (questionId: string, selected: MCQOption) => {
    // Find the message containing this question
    const updatedMessages = activeSession.messages.map((m) => {
      if (m.mcqQuestion && m.mcqQuestion.id === questionId) {
        const isCorrect = selected === m.mcqQuestion.correctOption;
        const updatedQ: MCQQuestion = {
          ...m.mcqQuestion,
          userAnswer: selected,
          isAnswered: true,
          isCorrect,
          answeredAt: Date.now(),
        };
        return { ...m, mcqQuestion: updatedQ };
      }
      return m;
    });

    // Update Session Stats
    const targetQ = activeSession.messages.find(
      (m) => m.mcqQuestion && m.mcqQuestion.id === questionId
    )?.mcqQuestion;

    if (!targetQ) return;

    const isCorrect = selected === targetQ.correctOption;
    const currentStats = activeSession.stats;
    const newTotal = (currentStats.questionsAttempted || 0) + 1;
    const newCorrect = (currentStats.correctCount || 0) + (isCorrect ? 1 : 0);
    const newIncorrect = (currentStats.incorrectCount || 0) + (!isCorrect ? 1 : 0);
    const newAccuracy = Math.round((newCorrect / newTotal) * 100);

    const topicsSet = new Set(currentStats.topicsPracticed || []);
    if (targetQ.topic) topicsSet.add(targetQ.topic);

    const weakSet = new Set(currentStats.weakConcepts || []);
    const mistakesList = [...(currentStats.mistakes || [])];

    if (!isCorrect) {
      if (targetQ.topic) weakSet.add(targetQ.topic);
      mistakesList.unshift({
        questionId: targetQ.id,
        question: targetQ.question,
        chosen: selected,
        correct: targetQ.correctOption,
        topic: targetQ.topic || 'Concept',
        keyIdea: targetQ.keyIdea || '',
        timestamp: Date.now(),
      });
    } else {
      // If student gets it right later, keep topics balanced
    }

    const updatedStats = {
      questionsAttempted: newTotal,
      correctCount: newCorrect,
      incorrectCount: newIncorrect,
      accuracy: newAccuracy,
      topicsPracticed: Array.from(topicsSet),
      weakConcepts: Array.from(weakSet),
      mistakes: mistakesList.slice(0, 20),
    };

    const updatedSession: AITeacherChatSession = {
      ...activeSession,
      messages: updatedMessages,
      stats: updatedStats,
      updatedAt: Date.now(),
    };

    setActiveSession(updatedSession);
    AITeacherService.saveChatSession(userId, updatedSession);
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
  };

  // Keyboard shortcut (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Suggested Prompts based on Context
  const getSuggestedPrompts = () => {
    const subName = activeSession.context?.subjectName?.toLowerCase() || '';
    if (subName.includes('math')) {
      return [
        'Explain the discriminant in quadratic equations and its geometrical meaning.',
        'Why does division by zero lead to an undefined result?',
        'Practice tricky calculus integration MCQs.',
        'What is the difference between permutations and combinations?',
      ];
    } else if (subName.includes('physic')) {
      return [
        'Explain Lenz’s Law and how it obeys Conservation of Energy.',
        'Why is work done in a circular orbit zero despite gravitational force?',
        'Practice tricky vector & projectile motion MCQs.',
        'High-yield exam traps in rotational dynamics.',
      ];
    } else if (subName.includes('chem')) {
      return [
        'Explain SN1 vs SN2 reaction mechanisms with stereochemistry.',
        'Why is the second electron affinity of oxygen endothermic?',
        'Practice tricky chemical equilibrium Le Chatelier MCQs.',
        'Give me a rapid revision of Hybridization & VSEPR theory.',
      ];
    } else if (subName.includes('bio')) {
      return [
        'Explain the light-dependent and light-independent reactions of photosynthesis.',
        'Why does the sliding filament theory require ATP for muscle relaxation?',
        'Practice tricky genetics & Mendelian inheritance MCQs.',
        'High-yield exam traps in cellular respiration.',
      ];
    } else if (subName.includes('comp') || subName.includes('code')) {
      return [
        'Explain the difference between Time Complexity O(N) and O(log N).',
        'Why do recursion stack overflows occur and how to avoid them?',
        'Practice tricky Object-Oriented Programming MCQs.',
        'What are race conditions and deadlocks in operating systems?',
      ];
    }

    return [
      'Explain Newton’s second law of motion with everyday examples.',
      'Why does the quadratic formula have a plus-or-minus sign?',
      'Give me 3 tricky conceptual MCQs on our current topic.',
      'Give me a rapid revision checklist for this chapter.',
    ];
  };

  const currentContextLabel = activeSession.context?.subjectName
    ? `${activeSession.context.fieldName ? `${activeSession.context.fieldName} › ` : ''}${
        activeSession.context.subjectName
      }${activeSession.context.chapterTitle ? ` › ${activeSession.context.chapterTitle}` : ''}`
    : 'General Academic Mode';

  return (
    <div
      id="ai-teacher-main-view"
      className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-3 sm:px-4 pb-20 pt-2 transition-colors relative"
    >
      {/* Top Header Bar */}
      <div className="bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-xs mb-3 flex items-center justify-between gap-2">
        {/* Left: Branding & Context */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-700 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/20 border border-indigo-400/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight truncate">
                AI Academic Teacher
              </h2>
              <span className="hidden xs:inline-flex px-2 py-0.2 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Concept Mastery
              </span>
            </div>

            {/* Context Selector Trigger */}
            <button
              id="btn-teacher-context"
              onClick={() => setIsContextModalOpen(true)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 font-medium truncate cursor-pointer transition-colors max-w-xs sm:max-w-md"
              title="Click to change academic context"
            >
              <Layers className="w-3 h-3 text-indigo-500 shrink-0" />
              <span className="truncate">{currentContextLabel}</span>
              <ChevronDown className="w-3 h-3 shrink-0 opacity-70" />
            </button>
          </div>
        </div>

        {/* Right Controls: Stats, New Chat, History */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Stats Button */}
          <button
            id="btn-teacher-stats"
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#131d36] hover:bg-indigo-50 dark:hover:bg-[#1a2647] border border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
            title="Session performance & accuracy"
          >
            <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Stats</span>
            {activeSession.stats.questionsAttempted > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {activeSession.stats.accuracy}%
              </span>
            )}
          </button>

          {/* New Chat Button */}
          <button
            id="btn-teacher-new-chat"
            onClick={handleNewChat}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Start fresh conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">New Chat</span>
          </button>

          {/* History Toggle Button */}
          <button
            id="btn-teacher-history"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isHistoryOpen
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#131d36] border-slate-200/80 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-[#1a2647]'
            }`}
            title="Conversation history"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-[#2c220c] border border-amber-200 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 animate-fadeIn shadow-xs">
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="flex-1">
            <strong>Offline Mode:</strong> AI Teacher requires an active internet connection. Your local photos, chapters, and PDFs remain fully accessible.
          </span>
        </div>
      )}

      {/* History Slide-out Drawer */}
      {isHistoryOpen && (
        <div className="absolute top-16 right-3 sm:right-4 z-40 w-72 sm:w-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-3 animate-fadeIn flex flex-col max-h-[65vh]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Past Study Sessions ({sessions.length})
            </span>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 text-center">No past chats yet.</p>
            ) : (
              sessions.map((s) => {
                const isActive = s.id === activeSession.id;
                return (
                  <div
                    key={s.id}
                    className={`group flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-400 font-semibold text-indigo-900 dark:text-indigo-200'
                        : 'bg-slate-50 dark:bg-[#131d36] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectSession(s)}
                      className="flex-1 text-left truncate mr-2 cursor-pointer"
                    >
                      <div className="truncate font-medium">{s.title || 'Untitled Session'}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(s.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })} • {s.messages.length} messages
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatToDelete({ id: s.id, title: s.title });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Study Modes Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { id: 'learn_concept' as AITeacherStudyMode, label: 'Learn Concept', icon: BookOpen },
          { id: 'practice_mcqs' as AITeacherStudyMode, label: 'Practice MCQs', icon: Sparkles },
          { id: 'tricky_mcqs' as AITeacherStudyMode, label: 'Tricky MCQs', icon: Zap },
          { id: 'exam_practice' as AITeacherStudyMode, label: 'Exam Focus', icon: Target },
          { id: 'rapid_revision' as AITeacherStudyMode, label: 'Rapid Revision', icon: RefreshCw },
          { id: 'weak_area_practice' as AITeacherStudyMode, label: 'Weak Areas', icon: RotateCcw },
        ].map((mode) => {
          const isSelected = selectedMode === mode.id;
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              type="button"
              id={`tab-mode-${mode.id}`}
              onClick={() => {
                setSelectedMode(mode.id);
                if (mode.id === 'practice_mcqs') {
                  handleGenerateMCQ('conceptual');
                } else if (mode.id === 'tricky_mcqs') {
                  handleGenerateMCQ('tricky');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#131d36] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2647] border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 my-2">
        {activeSession.messages.length === 0 ? (
          /* Empty / Welcome Academic State */
          <div className="h-full flex flex-col items-center justify-center p-4 text-center max-w-lg mx-auto animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-700 flex items-center justify-center text-white shadow-xl shadow-indigo-600/25 mb-3 border border-indigo-400/30">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Ready for Academic Concept Mastery
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
              Ask any concept question, request stepped explanations, or practice competitive exam MCQs.
            </p>

            {/* Quick Action Pills */}
            <div className="w-full mt-5 space-y-2 text-left">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                Suggested Prompts for {activeSession.context?.subjectName || 'General Studies'}:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {getSuggestedPrompts().map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="p-2.5 rounded-xl bg-white dark:bg-[#131d36] hover:bg-indigo-50/80 dark:hover:bg-[#1a2647] border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs font-medium transition-all text-left flex items-center justify-between group shadow-2xs cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Render Messages */
          activeSession.messages.map((m) => (
            <TeacherMessageBubble
              key={m.id}
              message={m}
              onAnswerMCQ={handleAnswerMCQ}
              onRequestNextMCQ={() =>
                handleGenerateMCQ(selectedMode === 'tricky_mcqs' ? 'tricky' : 'conceptual')
              }
              onAskFollowUp={handleSendMessage}
              onRetry={m.isError ? () => handleRetryMessage(m.id) : undefined}
            />
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <TeacherMessageBubble
            isThinking={true}
            loadingText={loadingText}
            message={{
              id: 'thinking',
              sender: 'teacher',
              text: '',
              timestamp: Date.now(),
              studyMode: selectedMode,
            }}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar */}
      <div className="bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          {/* Practice MCQ Quick Trigger */}
          <button
            type="button"
            id="btn-trigger-mcq"
            onClick={() => handleGenerateMCQ(selectedMode === 'tricky_mcqs' ? 'tricky' : 'conceptual')}
            disabled={isLoading || !isOnline}
            title="Generate a practice MCQ"
            className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              id="ai-teacher-input"
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isOnline
                  ? selectedMode === 'practice_mcqs'
                    ? 'Ask for a specific topic MCQ (or click the sparkle icon)...'
                    : 'Ask any academic question, doubt, or concept...'
                  : 'AI Teacher is offline (connect to internet to chat)...'
              }
              disabled={isLoading || !isOnline}
              className="w-full resize-none max-h-32 bg-slate-50 dark:bg-[#131d36] border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-60"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            id="btn-teacher-send"
            disabled={!inputText.trim() || isLoading || !isOnline}
            className="p-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Modals */}
      <ContextSelectorModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        fields={fields}
        subjects={subjects}
        chapters={chapters}
        currentContext={activeSession.context}
        onSelectContext={handleContextChange}
      />

      <SessionStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={activeSession.stats}
        onStrengthenWeakAreas={() => {
          setSelectedMode('weak_area_practice');
          if (activeSession.stats.weakConcepts.length > 0) {
            handleSendMessage(
              `Help me strengthen my weak concepts: ${activeSession.stats.weakConcepts.join(', ')}. Explain the core principles and give me a practice question.`
            );
          }
        }}
      />

      <DeleteChatConfirmModal
        isOpen={Boolean(chatToDelete)}
        onClose={() => setChatToDelete(null)}
        onConfirm={() => chatToDelete && handleDeleteSession(chatToDelete.id)}
        chatTitle={chatToDelete?.title || ''}
      />
    </div>
  );
};
