'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Minimize2,
  X,
  User,
  Bot,
  Sparkles
} from 'lucide-react';
import { trackLeadEngagement, LeadEngagementLevel } from '@/lib/analytics/lead-scoring';

/**
 * XSS Prevention - Sanitize HTML content
 * Removes potentially dangerous HTML tags and attributes
 */
function sanitizeMessage(content: string): string {
  // Remove HTML tags that could execute scripts
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Escape HTML entities for display
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
}

interface Message {
  id: string;
  content: string;
  senderType: 'user' | 'agent' | 'system';
  senderName?: string;
  timestamp: Date;
  messageType?: 'text' | 'file' | 'image';
}

interface ChatWidgetProps {
  apiUrl?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  companyName?: string;
  welcomeMessage?: string;
}

// Iris welcome message with personality
const IRIS_WELCOME = `Hoi! 👋 Ik ben Iris, jouw dating coach.

Stel me gerust je vraag over dating, profielen of gesprekstechnieken. Ik help je graag!`;

export function ChatWidget({
  apiUrl = '/api/chatbot',
  position = 'bottom-right',
  primaryColor = '#FF7B54',
  companyName = 'DatingAssistent',
  welcomeMessage = IRIS_WELCOME
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen, sessionId]);

  // Track chat opened for lead scoring
  useEffect(() => {
    if (isOpen) {
      trackLeadEngagement('chat_opened');
    }
  }, [isOpen]);

  const initializeChat = async () => {
    try {
      // Generate session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);

      // Add welcome message from Iris
      setMessages([{
        id: `welcome_${Date.now()}`,
        content: welcomeMessage,
        senderType: 'agent',
        senderName: 'Iris',
        timestamp: new Date()
      }]);

      setIsConnected(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setMessages([{
        id: 'error',
        content: 'Sorry, we kunnen momenteel geen verbinding maken. Probeer het later opnieuw.',
        senderType: 'system',
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Track message sent for lead scoring (with high-intent detection)
    trackLeadEngagement('message_sent', { message: messageContent });

    // Add user message to UI immediately (sanitized for display)
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: messageContent,
      senderType: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          sessionId,
          locale: 'nl',
          metadata: {
            source: 'website_widget',
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        })
      });

      // Hide typing indicator
      setIsTyping(false);

      if (response.ok) {
        const data = await response.json();

        // Add AI response
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          content: data.replyText,
          senderType: 'agent',
          senderName: 'Iris',
          timestamp: new Date()
        }]);
      } else {
        const errorData = await response.json();
        setMessages(prev => [...prev, {
          id: `error_send_${Date.now()}`,
          content: `Fout: ${errorData.message || 'Bericht kon niet worden verzonden. Probeer het opnieuw.'}`,
          senderType: 'system',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Hide typing indicator on error
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `error_send_${Date.now()}`,
        content: 'Bericht kon niet worden verzonden. Probeer het opnieuw.',
        senderType: 'system',
        timestamp: new Date()
      }]);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };



  if (!isOpen) {
    return (
      <div className={`fixed ${position === 'bottom-right' ? 'bottom-10 right-4' : 'bottom-10 left-4'} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 border-2 border-white/30"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            {/* Sparkle animation */}
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed ${position === 'bottom-right' ? 'bottom-10 right-4' : 'bottom-10 left-4'} z-50`}>
      <Card className={`w-96 sm:w-96 ${isMinimized ? 'h-14' : 'h-[28rem]'} shadow-2xl border-2 transition-all duration-300 max-w-[calc(100vw-2rem)] flex flex-col`}>
        {/* Header - Iris branded */}
        <CardHeader className="pb-2 cursor-pointer flex-shrink-0 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-t-lg" onClick={() => setIsMinimized(!isMinimized)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border-2 border-white/30">
                <AvatarImage src="/images/iris-avatar.png" alt="Iris" />
                <AvatarFallback className="bg-white/20 text-white text-xs">
                  <Sparkles className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm font-semibold text-white">Chat met Iris</CardTitle>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isConnected ? '#4ade80' : '#ef4444' }}
                  />
                  <span className="text-xs text-white/80">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                title="Minimaliseren"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
                title="Sluiten"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col" style={{ height: 'calc(28rem - 3.5rem)' }}>
            {/* Messages */}
            <div className="overflow-y-auto p-3" style={{ flex: '1 1 0', minHeight: 0 }}>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.senderType === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-7 h-7 flex-shrink-0">
                        {message.senderType === 'agent' ? (
                          <>
                            <AvatarImage src="/images/iris-avatar.png" alt="Iris" />
                            <AvatarFallback className="bg-gradient-to-br from-coral-400 to-coral-600 text-white text-xs">
                              <Sparkles className="w-3 h-3" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="text-xs bg-blue-500 text-white">
                            <User className="w-3 h-3" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div
                        className={`px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                          message.senderType === 'user'
                            ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.senderName && message.senderType === 'agent' && (
                          <div className="font-medium text-xs mb-1 text-coral-600">
                            {message.senderName}
                          </div>
                        )}
                        {/* XSS-safe content rendering */}
                        {sanitizeMessage(message.content)}
                        <div className="text-xs opacity-60 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[80%]">
                      <Avatar className="w-7 h-7 flex-shrink-0">
                        <AvatarImage src="/images/iris-avatar.png" alt="Iris" />
                        <AvatarFallback className="bg-gradient-to-br from-coral-400 to-coral-600 text-white text-xs">
                          <Sparkles className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-900">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-coral-600">Iris</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-coral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-2 sm:p-3 border-t flex-shrink-0 bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Stel je vraag..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-base sm:text-sm flex-1 bg-white text-gray-900 border-gray-300 placeholder:text-gray-400"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                  className="px-3 sm:px-4"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  💬 Alle vragen via deze chat - We helpen je graag!
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}