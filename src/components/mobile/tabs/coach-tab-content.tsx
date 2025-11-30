"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Send,
  Sparkles,
  Brain,
  Heart,
  Target,
  MessageCircle,
  Lightbulb,
  Mic,
  Camera,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================================
// COACH TAB - Iris AI Chat Interface (Embedded)
// ============================================================================

interface CoachTabContentProps {
  user: any;
  userProfile: any;
}

interface Message {
  id: string;
  type: 'iris' | 'user';
  text: string;
  timestamp: Date;
  mode?: string;
  sentiment?: string;
}

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
  { text: 'Help me met mijn bio', icon: Sparkles },
  { text: 'Beoordeel mijn foto\'s', icon: Camera },
  { text: 'Openingszin voor een match', icon: Heart },
  { text: 'Date ideeën voor vanavond', icon: Target },
];

// Mode badge component
function ModeBadge({ mode }: { mode: string }) {
  const modeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    'profile-review': { label: 'Profiel Review', color: 'bg-blue-100 text-blue-700', icon: Camera },
    'match-analysis': { label: 'Match Analyse', color: 'bg-purple-100 text-purple-700', icon: Heart },
    'date-prep': { label: 'Date Prep', color: 'bg-green-100 text-green-700', icon: Target },
    'conversation': { label: 'Gesprek Tips', color: 'bg-orange-100 text-orange-700', icon: MessageCircle },
    'general': { label: 'Algemeen', color: 'bg-gray-100 text-gray-700', icon: Brain },
  };

  const config = modeConfig[mode] || modeConfig['general'];
  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Message bubble component
function MessageBubble({ message }: { message: Message }) {
  const isIris = message.type === 'iris';

  return (
    <div className={cn("flex", isIris ? "justify-start" : "justify-end")}>
      <div className={cn(
        "max-w-[85%] px-4 py-3 rounded-2xl",
        isIris
          ? "bg-white border border-gray-100 shadow-sm rounded-bl-md"
          : "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md"
      )}>
        {/* Mode badge for Iris messages */}
        {isIris && message.mode && message.mode !== 'general' && (
          <div className="mb-2">
            <ModeBadge mode={message.mode} />
          </div>
        )}

        {/* Message text */}
        <p className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap",
          isIris ? "text-gray-800" : "text-white"
        )}>
          {message.text}
        </p>

        {/* Timestamp */}
        <p className={cn(
          "text-[10px] mt-1.5",
          isIris ? "text-gray-400" : "text-white/70"
        )}>
          {message.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-pink-500 animate-pulse" />
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-gray-500">Iris denkt na...</span>
        </div>
      </div>
    </div>
  );
}

export function CoachTabContent({ user, userProfile }: CoachTabContentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'iris',
      text: `Hoi ${user?.name?.split(' ')[0] || 'daar'}! Ik ben Iris, je persoonlijke AI dating coach. Ik ken je voorkeuren en help je graag met alles rondom dating - van profiel tips tot gespreksadvies. Wat kan ik voor je doen?`,
      timestamp: new Date(),
      mode: 'general',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Send message handler
  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    setInput('');
    setShowSuggestions(false);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Call Iris API
      const response = await fetch('/api/iris/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          context_type: 'general',
        }),
      });

      const data = await response.json();

      // Add Iris response
      const irisMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'iris',
        text: data.response || 'Hmm, ik kon even geen antwoord vinden. Kun je het anders formuleren?',
        timestamp: new Date(),
        mode: data.mode || 'general',
        sentiment: data.sentiment,
      };
      setMessages(prev => [...prev, irisMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'iris',
        text: 'Oeps, er ging iets mis. Probeer het nog eens!',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  // Handle quick suggestion click
  const handleSuggestionClick = (text: string) => {
    handleSend(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Image
              src="/images/Logo Icon DatingAssistent.png"
              alt="Iris"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-white">Iris AI Coach</h2>
            <p className="text-xs text-white/80">Online - Klaar om je te helpen</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setMessages([messages[0]])}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {showSuggestions && messages.length <= 2 && (
        <div className="px-4 py-2 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-1 mb-2">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-gray-500">Snelle opties</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-200 rounded-full text-xs text-gray-700 hover:text-pink-600 transition-all"
                >
                  <Icon className="w-3 h-3" />
                  {suggestion.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Stel een vraag aan Iris..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all pr-10"
              disabled={isTyping}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CoachTabContent;
