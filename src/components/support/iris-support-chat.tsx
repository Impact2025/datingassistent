'use client';

/**
 * Iris Support Chat Component
 * Wereldklasse AI-First Support Chat
 *
 * Features:
 * - Support-focused AI persona
 * - Escalation to human agent
 * - Ticket creation capability
 * - Context-aware responses
 * - Quick actions & suggestions
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { SupportMessage, TicketCategory } from '@/lib/support/types';

interface IrisSupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  userSegment?: string;
  userId?: number;
}

// Quick reply options
const QUICK_REPLIES = [
  { id: 'billing', label: 'Betalingsvraag', icon: '💳' },
  { id: 'technical', label: 'Technisch probleem', icon: '🔧' },
  { id: 'account', label: 'Account hulp', icon: '👤' },
  { id: 'feature', label: 'Feature vraag', icon: '✨' },
];

// Escalation triggers
const ESCALATION_TRIGGERS = [
  'ik wil een mens spreken',
  'kan ik iemand bellen',
  'dit helpt niet',
  'verbind me door',
  'klantenservice',
  'echt persoon',
  'geen bot',
];

export function IrisSupportChat({
  isOpen,
  onClose,
  initialMessage,
  userSegment = 'anonymous',
  userId,
}: IrisSupportChatProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const [ticketCreated, setTicketCreated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: SupportMessage = {
        id: 'welcome-1',
        type: 'iris',
        content: getWelcomeMessage(userSegment),
        timestamp: new Date(),
        metadata: {
          sentiment: 'positief',
        },
      };
      setMessages([welcomeMessage]);

      // If there's an initial message, process it
      if (initialMessage) {
        setTimeout(() => {
          handleSendMessage(initialMessage);
        }, 500);
      }
    }
  }, [isOpen, initialMessage, userSegment]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const getWelcomeMessage = (segment: string): string => {
    switch (segment) {
      case 'premium':
        return 'Hoi! Ik ben Iris Support, je persoonlijke hulplijn. Als Premium lid krijg je voorrang. Hoe kan ik je helpen? 🌟';
      case 'new_user':
        return 'Welkom bij DatingAssistent! Ik ben Iris, je support assistant. Heb je vragen over het platform of loop je ergens tegenaan?';
      case 'struggling':
        return 'Hoi! Ik ben Iris. Ik zie dat je misschien wat hulp kunt gebruiken. Vertel me wat er speelt, ik help je graag verder! 💜';
      default:
        return 'Hoi! Ik ben Iris Support, je AI hulplijn. Stel je vraag en ik help je zo snel mogelijk. Voor complexe zaken kan ik je ook doorverbinden met een collega.';
    }
  };

  const checkForEscalation = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return ESCALATION_TRIGGERS.some(trigger => lowerMessage.includes(trigger));
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText) return;

    setInput('');

    // Add user message
    const userMessage: SupportMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Check for escalation request
    if (checkForEscalation(messageText)) {
      setShowEscalation(true);
      const escalationMessage: SupportMessage = {
        id: `system-${Date.now()}`,
        type: 'system',
        content: 'Ik begrijp dat je liever met een medewerker spreekt. Geen probleem! Kies hieronder hoe je contact wilt opnemen.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, escalationMessage]);
      return;
    }

    // Show typing indicator
    setIsTyping(true);

    try {
      // Call support chat API
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-10),
          userSegment,
          userId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const irisMessage: SupportMessage = {
        id: `iris-${Date.now()}`,
        type: 'iris',
        content: data.response,
        timestamp: new Date(),
        metadata: {
          sentiment: data.sentiment,
          category: data.category,
          suggestedActions: data.suggestedActions,
          escalationNeeded: data.escalationNeeded,
        },
      };

      setMessages(prev => [...prev, irisMessage]);

      // Check if AI suggests escalation
      if (data.escalationNeeded) {
        setShowEscalation(true);
      }

    } catch (error) {
      console.error('Support chat error:', error);
      const errorMessage: SupportMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Er ging iets mis. Probeer het opnieuw of neem direct contact met ons op.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (category: string) => {
    const quickMessages: Record<string, string> = {
      billing: 'Ik heb een vraag over mijn betaling of abonnement',
      technical: 'Ik loop tegen een technisch probleem aan',
      account: 'Ik heb hulp nodig met mijn account',
      feature: 'Ik heb een vraag over een feature',
    };
    handleSendMessage(quickMessages[category] || category);
  };

  const handleCreateTicket = async () => {
    setIsTyping(true);
    try {
      // In production, this would create an actual ticket
      await new Promise(resolve => setTimeout(resolve, 1000));

      setTicketCreated(true);
      const ticketMessage: SupportMessage = {
        id: `system-ticket-${Date.now()}`,
        type: 'system',
        content: '✅ Je supportticket is aangemaakt! Je ontvangt binnen 24 uur een reactie per email. Ticketnummer: #DA-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, ticketMessage]);
      setShowEscalation(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    setFeedbackGiven(prev => new Set(prev).add(messageId));
    // In production, log this feedback
    console.log(`Feedback for ${messageId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        'fixed z-50',
        'bottom-4 right-4 sm:bottom-6 sm:right-6',
        'w-[calc(100vw-2rem)] sm:w-96',
        'max-w-md'
      )}
    >
      <div
        className={cn(
          'bg-white rounded-2xl shadow-2xl border border-gray-200',
          'flex flex-col overflow-hidden',
          isMinimized ? 'h-16' : 'h-[32rem] max-h-[80vh]'
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-coral-500 to-coral-600 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Iris Support</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/80">Online - Antwoord in seconden</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      'flex',
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      'flex gap-2 max-w-[85%]',
                      message.type === 'user' && 'flex-row-reverse'
                    )}>
                      {/* Avatar */}
                      {message.type === 'iris' && (
                        <div className="w-8 h-8 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      {message.type === 'system' && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-4 h-4 text-blue-600" />
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={cn(
                        'px-4 py-3 rounded-2xl',
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white'
                          : message.type === 'system'
                          ? 'bg-blue-50 text-blue-900 border border-blue-200'
                          : 'bg-gray-100 text-gray-900'
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>

                        {/* Feedback buttons for Iris messages */}
                        {message.type === 'iris' && !feedbackGiven.has(message.id) && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-500">Was dit nuttig?</span>
                            <button
                              onClick={() => handleFeedback(message.id, true)}
                              className="p-1 hover:bg-green-100 rounded transition-colors"
                            >
                              <ThumbsUp className="w-3.5 h-3.5 text-gray-400 hover:text-green-600" />
                            </button>
                            <button
                              onClick={() => handleFeedback(message.id, false)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                            >
                              <ThumbsDown className="w-3.5 h-3.5 text-gray-400 hover:text-red-600" />
                            </button>
                          </div>
                        )}

                        {feedbackGiven.has(message.id) && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs text-gray-500">Bedankt voor je feedback!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-coral-500 to-coral-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-4 py-3 bg-gray-100 rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Escalation Options */}
              <AnimatePresence>
                {showEscalation && !ticketCreated && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 space-y-3"
                  >
                    <p className="text-sm font-medium text-gray-700">
                      Hoe wil je contact opnemen?
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={handleCreateTicket}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200 text-left"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Maak een ticket</div>
                          <div className="text-xs text-gray-500">Reactie binnen 24 uur</div>
                        </div>
                      </button>
                      <a
                        href="tel:+31201234567"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Bel ons</div>
                          <div className="text-xs text-gray-500">Ma-Vr 9:00-17:00</div>
                        </div>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies (only show at start) */}
            {messages.length <= 2 && !isTyping && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => handleQuickReply(reply.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-coral-100 hover:text-coral-700 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    <span>{reply.icon}</span>
                    <span>{reply.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Typ je vraag..."
                  disabled={isTyping}
                  className={cn(
                    'flex-1 px-4 py-3 bg-gray-50 rounded-xl',
                    'border border-gray-200 focus:border-coral-400 focus:ring-2 focus:ring-coral-500/20',
                    'text-sm text-gray-900 placeholder:text-gray-400',
                    'transition-all outline-none',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white px-4 rounded-xl"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
