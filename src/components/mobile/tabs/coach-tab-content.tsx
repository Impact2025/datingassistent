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
  Camera
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================================
// COACH TAB - Clean, Minimalist Chat UI
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
}

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
  { text: 'Help me met mijn bio', icon: Sparkles },
  { text: 'Beoordeel mijn foto\'s', icon: Camera },
  { text: 'Openingszin voor een match', icon: Heart },
  { text: 'Date tips', icon: Target },
];

// Message bubble component - Clean Design
function MessageBubble({ message }: { message: Message }) {
  const isIris = message.type === 'iris';

  return (
    <div className={cn("flex", isIris ? "justify-start" : "justify-end")}>
      {isIris && (
        <div className="w-8 h-8 bg-coral-50 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
          <Sparkles className="w-4 h-4 text-coral-500" />
        </div>
      )}
      <div className={cn(
        "max-w-[80%] px-4 py-3 rounded-2xl",
        isIris
          ? "bg-white shadow-sm rounded-bl-md"
          : "bg-coral-500 text-white rounded-br-md"
      )}>
        <p className={cn(
          "text-sm leading-relaxed",
          isIris ? "text-gray-800" : "text-white"
        )}>
          {message.text}
        </p>
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

// Typing indicator - Clean Design
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="w-8 h-8 bg-coral-50 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-coral-500" />
      </div>
      <div className="bg-white shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-gray-500">Iris typt...</span>
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
      text: `Hoi ${user?.name?.split(' ')[0] || 'daar'}! Ik ben Iris, je AI dating coach. Waarmee kan ik je helpen?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        text: data.response || 'Hmm, kun je dat anders formuleren?',
        timestamp: new Date(),
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

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header - Clean Design */}
      <div className="bg-white shadow-sm px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-coral-50 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-coral-500" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Iris AI Coach</h2>
            <p className="text-xs text-green-600">Online</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions - Clean Design */}
      {showSuggestions && messages.length <= 2 && (
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs text-gray-500">Probeer</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleSend(suggestion.text)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-coral-50 rounded-full text-xs text-gray-700 hover:text-coral-600 transition-colors"
                >
                  <Icon className="w-3 h-3" />
                  {suggestion.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area - Clean Design */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stel een vraag..."
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-coral-500 transition-all"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-coral-500 hover:bg-coral-600 disabled:bg-gray-200 p-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CoachTabContent;
