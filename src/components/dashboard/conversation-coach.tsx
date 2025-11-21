'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToolCompletion } from '@/hooks/use-tool-completion';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Heart,
  Zap,
  CheckCircle,
  AlertTriangle,
  Star,
  Clock,
  Target
} from 'lucide-react';

interface ConversationMessage {
  id: string;
  sender: 'user' | 'date';
  content: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
  engagement?: number;
}

interface ConversationAnalysis {
  overallScore: number;
  engagement: number;
  authenticity: number;
  listening: number;
  humor: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
  realTimeTips: string[];
}

export function ConversationCoach() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('ConversationCoach error:', error, errorInfo);
      }}
    >
      <ConversationCoachInner />
    </ErrorBoundary>
  );
}

function ConversationCoachInner() {
  const { user } = useUser();
  const { markAsCompleted } = useToolCompletion('conversation-coach');

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ConversationAnalysis | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSender, setCurrentSender] = useState<'user' | 'date'>('user');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, sender: 'user' | 'date') => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    addMessage(currentMessage, currentSender);

    // Auto-analyze after every few messages
    if (messages.length >= 2) {
      await analyzeConversation();
    }
  };

  const analyzeConversation = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/conversation-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({
          messages,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result.analysis);

      // Track completion
      await markAsCompleted('conversation_analyzed', {
        messageCount: messages.length,
        overallScore: result.analysis.overallScore
      });

    } catch (error) {
      console.error('Conversation analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Voice recording logic would go here
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Process recorded audio and convert to text
  };

  const resetConversation = () => {
    setMessages([]);
    setAnalysis(null);
    setCurrentMessage('');
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🎭 AI Conversation Coach</h1>
        <p className="text-muted-foreground">
          Real-time feedback op je gesprekken voor betere connecties
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message History */}
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Gesprek Simulatie
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentSender(currentSender === 'user' ? 'date' : 'user')}
                  >
                    {currentSender === 'user' ? 'Jij spreekt' : 'Date spreekt'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetConversation}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Start een gesprek om feedback te krijgen</p>
                    <p className="text-sm">Voeg berichten toe van jou en je date</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.sentiment && (
                            <span className={`text-xs ${getSentimentColor(message.sentiment)}`}>
                              {message.sentiment === 'positive' ? '😊' :
                               message.sentiment === 'negative' ? '😔' : '😐'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder={`Typ een bericht als ${currentSender === 'user' ? 'jou' : 'je date'}...`}
                    className="flex-1"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={isRecording ? 'bg-red-50 border-red-200' : ''}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {messages.length >= 3 && (
                  <Button
                    onClick={analyzeConversation}
                    disabled={isAnalyzing}
                    className="w-full"
                    variant="outline"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Analyseert gesprek...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Analyseer Gesprek
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Panel */}
        <div className="space-y-6">
          {analysis ? (
            <>
              {/* Overall Score */}
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Gesprek Score</CardTitle>
                  <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}/100
                  </div>
                  <Progress value={analysis.overallScore} className="mt-2" />
                </CardHeader>
              </Card>

              {/* Detailed Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gedetailleerde Analyse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Betrokkenheid', value: analysis.engagement, icon: Heart },
                    { label: 'Authenticiteit', value: analysis.authenticity, icon: Star },
                    { label: 'Luistervaardigheden', value: analysis.listening, icon: MessageSquare },
                    { label: 'Humor', value: analysis.humor, icon: Zap }
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4" />
                        <span className="text-sm">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${getScoreColor(metric.value)}`}>
                          {metric.value}/100
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              metric.value >= 80 ? 'bg-green-500' :
                              metric.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${metric.value}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Real-time Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Live Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysis.realTimeTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                        <span className="text-yellow-600 font-bold text-sm mt-0.5">💡</span>
                        <p className="text-sm text-yellow-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Sterke punten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.feedback.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <TrendingUp className="w-5 h-5" />
                    Verbeterpunten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.feedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Target className="w-5 h-5" />
                    Volgende stappen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.feedback.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Start een gesprek</h3>
                <p className="text-muted-foreground text-sm">
                  Voeg minimaal 3 berichten toe om een analyse te krijgen
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}