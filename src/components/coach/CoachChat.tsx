'use client';

import { useState, useRef, useEffect } from 'react';
import { CoachMessage } from './CoachMessage';
import { CoachInput } from './CoachInput';
import { CoachTyping } from './CoachTyping';
import { CoachSuggestions, Suggestion } from './CoachSuggestions';
import { CoachToolCard, ToolSuggestion } from './CoachToolCard';
import { trackChatMessageSent, trackToolUsed } from '@/lib/analytics/ga4-events';

interface Message {
  id: string;
  type: 'coach' | 'user';
  content: string;
  timestamp: Date;
}

interface CoachChatProps {
  userId?: number;
  initialContext?: string;
}

export function CoachChat({ userId, initialContext }: CoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'coach',
      content: 'Hoi! Ik ben Iris, je persoonlijke dating coach. Hoe kan ik je vandaag helpen? Je kunt me vragen stellen over dating, je profiel verbeteren, of advies krijgen over je gesprekken.',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [toolSuggestions, setToolSuggestions] = useState<ToolSuggestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // GA4: Track when coach chat is opened
  useEffect(() => {
    trackToolUsed({
      tool_name: 'coach_chat',
      tool_category: 'ai_coach',
      completed: false,
    });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Set initial suggestions
  useEffect(() => {
    setSuggestions([
      {
        id: 'profile',
        label: 'Verbeter mijn profiel',
        action: () => handleSuggestionClick('Ik wil mijn dating profiel verbeteren')
      },
      {
        id: 'conversation',
        label: 'Help met gesprek',
        action: () => handleSuggestionClick('Ik heb hulp nodig met een gesprek')
      },
      {
        id: 'advice',
        label: 'Dating advies',
        action: () => handleSuggestionClick('Ik wil graag dating advies')
      }
    ]);
  }, []);

  const handleSuggestionClick = (message: string) => {
    handleSendMessage(message);
    setSuggestions([]); // Clear suggestions after use
  };

  const handleSendMessage = async (content: string) => {
    // GA4: Track chat message sent
    trackChatMessageSent({
      chat_type: 'coach',
      message_length: content.length,
    });

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        type: msg.type,
        content: msg.content
      }));

      // Call AI coach API with context
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          userId,
          conversationHistory
        })
      });

      const data = await response.json();
      const coachResponse = data.response || 'Sorry, ik kon geen antwoord genereren.';

      // Add coach message
      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: coachResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, coachMessage]);

      // Add tool suggestions if available
      if (data.toolSuggestions && data.toolSuggestions.length > 0) {
        setToolSuggestions(data.toolSuggestions);
      } else {
        setToolSuggestions([]);
      }

    } catch (error) {
      console.error('Coach chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'coach',
        content: 'Sorry, er ging iets mis. Probeer het nog eens.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log('File uploaded:', file);
    // TODO: Implement file upload logic (e.g., for profile photos)
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.map((message) => (
          <CoachMessage
            key={message.id}
            type={message.type}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}

        {isTyping && <CoachTyping />}

        {/* Suggestions */}
        {suggestions.length > 0 && !isTyping && (
          <CoachSuggestions suggestions={suggestions} />
        )}

        {/* Tool Suggestions */}
        {toolSuggestions.length > 0 && !isTyping && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 mb-2 px-1">Misschien kan dit je helpen</p>
            {toolSuggestions.map((tool) => (
              <CoachToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <CoachInput
        onSend={handleSendMessage}
        onUpload={handleFileUpload}
        disabled={isTyping}
      />
    </div>
  );
}
