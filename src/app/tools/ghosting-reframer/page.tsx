'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ghost,
  ArrowLeft,
  Loader2,
  Send,
  AlertCircle,
  MessageCircle,
  Heart,
  Sparkles,
  Eye,
  Zap,
  RefreshCcw,
  Info,
  User,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'ghosted_after_date',
    title: 'Geghost na een date',
    description: 'Je had een goede date, maar hoorde daarna niets meer.',
    icon: Heart,
    color: 'rose',
  },
  {
    id: 'ghosted_while_texting',
    title: 'Geghost tijdens het chatten',
    description: 'Het gesprek liep goed, maar de ander verdween plotseling.',
    icon: MessageCircle,
    color: 'blue',
  },
  {
    id: 'rejected_directly',
    title: 'Direct afgewezen',
    description: 'Je kreeg een duidelijke afwijzing en wilt dit verwerken.',
    icon: AlertCircle,
    color: 'amber',
  },
  {
    id: 'pattern_rejection',
    title: 'Herhaaldelijke afwijzing',
    description: 'Je ervaart een patroon van afwijzingen en voelt je ontmoedigd.',
    icon: RefreshCcw,
    color: 'purple',
  },
  {
    id: 'general',
    title: 'Vrij gesprek',
    description: 'Praat vrijuit over je dating frustraties.',
    icon: Sparkles,
    color: 'green',
  },
];

export default function GhostingReframerPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async (scenarioId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ghosting-reframer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'start_session',
          scenario: scenarioId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kon sessie niet starten');
      }

      setSelectedScenario(scenarioId);
      setSessionId(data.session.id);
      setMessages([{ role: 'assistant', content: data.welcomeMessage }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/ghosting-reframer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'send_message',
          sessionId,
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kon bericht niet verzenden');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err: any) {
      setError(err.message);
      // Remove the user message if failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setSelectedScenario(null);
    setSessionId(null);
    setMessages([]);
    setInput('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getScenarioColor = (color: string) => {
    switch (color) {
      case 'rose': return 'border-rose-200 bg-rose-50 hover:border-rose-400';
      case 'blue': return 'border-blue-200 bg-blue-50 hover:border-blue-400';
      case 'amber': return 'border-amber-200 bg-amber-50 hover:border-amber-400';
      case 'purple': return 'border-purple-200 bg-purple-50 hover:border-purple-400';
      case 'green': return 'border-green-200 bg-green-50 hover:border-green-400';
      default: return 'border-gray-200 bg-gray-50 hover:border-gray-400';
    }
  };

  const getScenarioIconColor = (color: string) => {
    switch (color) {
      case 'rose': return 'text-rose-600';
      case 'blue': return 'text-blue-600';
      case 'amber': return 'text-amber-600';
      case 'purple': return 'text-purple-600';
      case 'green': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedScenario ? resetSession() : router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Ghost className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Ghosting Reframer</h1>
                  <p className="text-xs text-gray-500">Verwerk afwijzing op een gezonde manier</p>
                </div>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-0">
              Transformatie
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Scenario Selection */}
        {!selectedScenario && (
          <div className="space-y-6">
            {/* Intro Card */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Info className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Therapeutische ondersteuning</h3>
                    <p className="text-sm text-gray-600">
                      Een veilige plek om je gevoelens te verwerken na ghosting of afwijzing.
                      Gebaseerd op CGT en zelfcompassie-technieken.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario Selection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Wat speelt er bij je?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SCENARIOS.map((scenario) => {
                  const Icon = scenario.icon;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => startSession(scenario.id)}
                      disabled={isLoading}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 text-left transition-all',
                        getScenarioColor(scenario.color)
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={cn('w-5 h-5 mt-0.5', getScenarioIconColor(scenario.color))} />
                        <div>
                          <p className="font-medium text-gray-900">{scenario.title}</p>
                          <p className="text-sm text-gray-600">{scenario.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Chat Interface */}
        {selectedScenario && (
          <div className="flex flex-col h-[calc(100vh-240px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl p-4',
                        message.role === 'user'
                          ? 'bg-purple-500 text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Input */}
            <div className="bg-white border border-gray-200 rounded-2xl p-2">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Deel wat je voelt..."
                  className="flex-1 border-0 resize-none min-h-[44px] max-h-[120px] focus-visible:ring-0"
                  rows={1}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            {messages.length > 2 && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSession}
                  className="text-xs"
                >
                  <RefreshCcw className="w-3 h-3 mr-1" />
                  Nieuw onderwerp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/transformatie')}
                  className="text-xs"
                >
                  Terug naar cursus
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
