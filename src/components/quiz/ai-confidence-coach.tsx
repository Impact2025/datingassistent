"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AIResultCard } from '@/components/shared/ai-result-card';
import { useToast } from '@/hooks/use-toast';
import * as Lucide from 'lucide-react';

interface AIConfidenceCoachProps {
  userId?: string;
  currentModule?: number;
  userProfile?: any;
  onCoachingComplete?: (response: string) => void;
  compact?: boolean;
  context?: string;
}

interface CoachingSession {
  id: string;
  timestamp: Date;
  module: number;
  userInput: string;
  aiResponse: string;
  coachingType: 'motivation' | 'feedback' | 'advice' | 'celebration';
  sentiment: 'positive' | 'neutral' | 'challenging';
}

const COACHING_PROMPTS = {
  motivation: [
    "Ik voel me onzeker over mijn dating skills. Wat kan ik doen?",
    "Ik heb een afwijzing gekregen en voel me down. Help me hiermee om te gaan.",
    "Ik vind het moeilijk om het initiatief te nemen in gesprekken.",
    "Ik twijfel aan mijn aantrekkelijkheid. Hoe kan ik hier anders naar kijken?"
  ],
  feedback: [
    "Geef me feedback op mijn voortgang deze week.",
    "Wat gaat er goed en wat kan ik verbeteren?",
    "Analyseer mijn sterke en zwakke punten in dating."
  ],
  advice: [
    "Wat is de beste manier om iemand te benaderen?",
    "Hoe maak ik een goed gesprek?",
    "Tips voor een eerste date?"
  ]
};

const getLucideIcon = (name: string) => {
  const icons = Lucide as any;
  return icons[name] || Lucide.MessageCircle;
};

export function AIConfidenceCoach({
  userId,
  currentModule = 1,
  userProfile,
  onCoachingComplete,
  compact = false,
  context = ''
}: AIConfidenceCoachProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [coachingHistory, setCoachingHistory] = useState<CoachingSession[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [coachingType, setCoachingType] = useState<'motivation' | 'feedback' | 'advice'>('motivation');
  const { toast } = useToast();

  // Load coaching history
  useEffect(() => {
    if (userId) {
      loadCoachingHistory();
    }
  }, [userId]);

  const loadCoachingHistory = async () => {
    try {
      const response = await fetch(`/api/user/coaching-history?userId=${userId}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setCoachingHistory(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load coaching history:', error);
    }
  };

  const generateCoachingResponse = useCallback(async (input: string, type: string) => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const contextData = {
        userProfile,
        currentModule,
        coachingType: type,
        userInput: input,
        recentHistory: coachingHistory.slice(0, 3)
      };

      const response = await fetch('/api/ai-confidence-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: input,
          context: contextData,
          coachingType: type
        })
      });

      if (!response.ok) {
        throw new Error('AI coach request failed');
      }

      const data = await response.json();
      const aiResponse = data.response;

      // Save to history
      if (userId) {
        await saveCoachingSession(input, aiResponse, type as any);
      }

      // Add to local history
      const newSession: CoachingSession = {
        id: Date.now().toString(),
        timestamp: new Date(),
        module: currentModule,
        userInput: input,
        aiResponse,
        coachingType: type as any,
        sentiment: data.sentiment || 'neutral'
      };

      setCoachingHistory(prev => [newSession, ...prev.slice(0, 4)]);
      setUserInput('');

      if (onCoachingComplete) {
        onCoachingComplete(aiResponse);
      }

      toast({
        title: '💪 AI Coach heeft geantwoord!',
        description: 'Je persoonlijke coaching advies is klaar.',
      });

    } catch (error) {
      console.error('AI coaching error:', error);
      toast({
        title: 'Coach tijdelijk niet beschikbaar',
        description: 'Probeer het later opnieuw.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentModule, userProfile, coachingHistory, onCoachingComplete, toast]);

  const saveCoachingSession = async (userInput: string, aiResponse: string, type: string) => {
    try {
      await fetch('/api/user/coaching-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userInput,
          aiResponse,
          coachingType: type,
          module: currentModule
        })
      });
    } catch (error) {
      console.error('Failed to save coaching session:', error);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setUserInput(prompt);
    setSelectedPrompt(prompt);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'challenging': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCoachingTypeIcon = (type: string) => {
    switch (type) {
      case 'motivation': return 'Heart';
      case 'feedback': return 'Target';
      case 'advice': return 'Lightbulb';
      case 'celebration': return 'Trophy';
      default: return 'MessageCircle';
    }
  };

  // Compact mode for inline lesson integration
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Quick Coaching Type Selector */}
        <div className="flex gap-1">
          {Object.entries({
            motivation: '💪',
            feedback: '🎯',
            advice: '💡'
          }).map(([key, emoji]) => (
            <Button
              key={key}
              variant={coachingType === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCoachingType(key as any)}
              className="h-8 w-8 p-0"
              title={key === 'motivation' ? 'Motivatie' : key === 'feedback' ? 'Feedback' : 'Advies'}
            >
              {emoji}
            </Button>
          ))}
        </div>

        {/* Compact Input Area */}
        <div className="space-y-2">
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={context ? `Deel je gedachten over "${context}"...` : "Deel wat je dwars zit..."}
            rows={2}
            className="resize-none text-sm"
          />
          <Button
            onClick={() => generateCoachingResponse(userInput, coachingType)}
            disabled={!userInput.trim() || isLoading}
            size="sm"
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Lucide.Loader2 className="h-3 w-3 animate-spin" />
                Coach denkt na...
              </>
            ) : (
              <>
                <Lucide.Send className="h-3 w-3" />
                Vraag coaching
              </>
            )}
          </Button>
        </div>

        {/* Compact History Preview */}
        {coachingHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Laatste coaching:</p>
            <div className="p-3 rounded-lg bg-muted/50">
              <AIResultCard content={coachingHistory[0].aiResponse} compact={true} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full mode for standalone coach
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-primary">
            <div className="rounded-full bg-primary/10 p-2">
              <Lucide.Brain className="h-6 w-6" />
            </div>
            <div>
              <span>AI Zelfvertrouwen Coach</span>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Persoonlijke coaching 24/7 beschikbaar
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Coaching Type Selector */}
          <div className="flex gap-2">
            {Object.entries({
              motivation: 'Motivatie',
              feedback: 'Feedback',
              advice: 'Advies'
            }).map(([key, label]) => (
              <Button
                key={key}
                variant={coachingType === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCoachingType(key as any)}
                className="gap-2"
              >
                {React.createElement(getLucideIcon(getCoachingTypeIcon(key)), { className: "h-4 w-4" })}
                {label}
              </Button>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Snelle prompts:</p>
            <div className="flex flex-wrap gap-2">
              {COACHING_PROMPTS[coachingType].map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-xs h-auto py-2 px-3 text-left"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Deel wat je dwars zit of waar je advies over wilt..."
              rows={4}
              className="resize-none"
            />
            <Button
              onClick={() => generateCoachingResponse(userInput, coachingType)}
              disabled={!userInput.trim() || isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Lucide.Loader2 className="h-4 w-4 animate-spin" />
                  Coach denkt na...
                </>
              ) : (
                <>
                  <Lucide.Send className="h-4 w-4" />
                  Vraag om coaching
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coaching History */}
      {coachingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recente Coaching Sessies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coachingHistory.map((session) => (
              <div key={session.id} className="space-y-3 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {React.createElement(getLucideIcon(getCoachingTypeIcon(session.coachingType)), {
                      className: "h-4 w-4 text-primary"
                    })}
                    <span className="text-sm font-medium capitalize">
                      {session.coachingType === 'motivation' ? 'Motivatie' :
                       session.coachingType === 'feedback' ? 'Feedback' :
                       session.coachingType === 'advice' ? 'Advies' : 'Celebratie'}
                    </span>
                    <Badge className={getSentimentColor(session.sentiment)}>
                      {session.sentiment === 'positive' ? 'Positief' :
                       session.sentiment === 'challenging' ? 'Uitdagend' : 'Neutraal'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(session.timestamp).toLocaleDateString('nl-NL')}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <strong className="text-primary">Jij:</strong> {session.userInput}
                  </div>
                  <AIResultCard content={session.aiResponse} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}