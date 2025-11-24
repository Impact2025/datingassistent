"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Zap,
  Heart,
  Target,
  Star,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: 'positive' | 'suggestion' | 'warning';
  message: string;
  score: number;
  category: string;
  icon: React.ReactNode;
}

interface RealTimeAIFeedbackProps {
  text: string;
  onTextChange: (text: string) => void;
  onFeedbackUpdate?: (feedback: FeedbackItem[]) => void;
  disabled?: boolean;
}

const FEEDBACK_RULES = [
  {
    id: 'length',
    check: (text: string) => text.length >= 80 && text.length <= 500,
    positive: { message: 'Perfecte lengte! Je profiel is niet te kort of te lang.', score: 10 },
    warning: { message: 'Profielen werken het beste tussen 80-500 karakters.', score: -5 }
  },
  {
    id: 'questions',
    check: (text: string) => /\?/.test(text),
    positive: { message: 'Goed! Vragen maken je profiel interactief.', score: 8 },
    suggestion: { message: 'Overweeg een vraag toe te voegen om gesprekken te starten.', score: 0 }
  },
  {
    id: 'specificity',
    check: (text: string) => {
      const specificWords = ['mijn', 'ik', 'mijn favoriete', 'ik hou van', 'ik ben'];
      return specificWords.some(word => text.toLowerCase().includes(word));
    },
    positive: { message: 'Uitstekend! Je gebruikt specifieke, persoonlijke taal.', score: 12 },
    warning: { message: 'Maak het persoonlijker met concrete details over jezelf.', score: -8 }
  },
  {
    id: 'humor',
    check: (text: string) => {
      const humorIndicators = ['😂', '😄', '😉', 'grapje', 'mop', 'lol', 'haha'];
      return humorIndicators.some(indicator => text.toLowerCase().includes(indicator.toLowerCase()));
    },
    positive: { message: 'Humor is een geweldige ijsbreker!', score: 10 },
    suggestion: { message: 'Humor kan je profiel extra aantrekkelijk maken.', score: 0 }
  },
  {
    id: 'vulnerability',
    check: (text: string) => {
      const vulnerabilityWords = ['soms', 'eigenlijk', 'eerlijk gezegd', 'ik worstel', 'ik leer', 'mijn zwakte'];
      return vulnerabilityWords.some(word => text.toLowerCase().includes(word));
    },
    positive: { message: 'Mooi! Kwetsbaarheid creëert verbinding.', score: 15 },
    suggestion: { message: 'Een beetje kwetsbaarheid kan vertrouwen opbouwen.', score: 0 }
  },
  {
    id: 'negativity',
    check: (text: string) => {
      const negativeWords = ['haat', 'stom', 'saai', 'slecht', 'nooit', 'altijd'];
      return !negativeWords.some(word => text.toLowerCase().includes(word));
    },
    positive: { message: 'Positieve vibe! Negativiteit vermijden is slim.', score: 8 },
    warning: { message: 'Vermijd negatieve woorden - focus op het positieve.', score: -10 }
  },
  {
    id: 'call-to-action',
    check: (text: string) => {
      const ctaWords = ['vertel', 'laat horen', 'benieuwd', 'zoek', 'wil weten', 'vertel me'];
      return ctaWords.some(word => text.toLowerCase().includes(word));
    },
    positive: { message: 'Sterke call-to-action! Dit lokt reacties uit.', score: 12 },
    suggestion: { message: 'Een call-to-action helpt mensen om te reageren.', score: 0 }
  },
  {
    id: 'uniqueness',
    check: (text: string) => {
      const genericPhrases = ['hou van reizen', 'lekker eten', 'gezelligheid', 'sportief', 'avontuurlijk'];
      return !genericPhrases.some(phrase => text.toLowerCase().includes(phrase));
    },
    positive: { message: 'Uniek en onderscheidend! Dit valt op tussen de massa.', score: 10 },
    warning: { message: 'Maak het unieker - vermijd generieke zinnen.', score: -6 }
  }
];

export function RealTimeAIFeedback({
  text,
  onTextChange,
  onFeedbackUpdate,
  disabled = false
}: RealTimeAIFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(0);

  // Calculate overall score
  const overallScore = useMemo(() => {
    const totalScore = feedback.reduce((sum, item) => sum + item.score, 0);
    return Math.max(0, Math.min(100, 50 + totalScore)); // Base 50, adjusted by feedback
  }, [feedback]);

  // Analyze text and generate feedback
  const analyzeText = useCallback(() => {
    if (!text.trim()) {
      setFeedback([]);
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis delay
    setTimeout(() => {
      const newFeedback: FeedbackItem[] = [];

      FEEDBACK_RULES.forEach(rule => {
        const passed = rule.check(text);

        if (passed && rule.positive) {
          newFeedback.push({
            id: rule.id,
            type: 'positive',
            message: rule.positive.message,
            score: rule.positive.score,
            category: rule.id,
            icon: <CheckCircle className="w-4 h-4 text-green-500" />
          });
        } else if (!passed && rule.warning) {
          newFeedback.push({
            id: rule.id,
            type: 'warning',
            message: rule.warning.message,
            score: rule.warning.score,
            category: rule.id,
            icon: <AlertTriangle className="w-4 h-4 text-orange-500" />
          });
        } else if (!passed && rule.suggestion) {
          newFeedback.push({
            id: rule.id,
            type: 'suggestion',
            message: rule.suggestion.message,
            score: rule.suggestion.score,
            category: rule.id,
            icon: <Lightbulb className="w-4 h-4 text-blue-500" />
          });
        }
      });

      // Add dynamic feedback based on text analysis
      if (text.length > 0) {
        // Word count feedback
        const wordCount = text.split(/\s+/).length;
        if (wordCount < 10) {
          newFeedback.push({
            id: 'word-count-low',
            type: 'suggestion',
            message: 'Overweeg meer details toe te voegen voor een completer beeld.',
            score: -3,
            category: 'length',
            icon: <TrendingUp className="w-4 h-4 text-blue-500" />
          });
        } else if (wordCount > 80) {
          newFeedback.push({
            id: 'word-count-high',
            type: 'warning',
            message: 'Je tekst is vrij lang - mensen scannen vaak snel.',
            score: -2,
            category: 'length',
            icon: <AlertTriangle className="w-4 h-4 text-orange-500" />
          });
        }

        // Emoji feedback
        const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
        if (emojiCount > 3) {
          newFeedback.push({
            id: 'too-many-emojis',
            type: 'warning',
            message: 'Te veel emojis kunnen afleiden - gebruik ze spaarzaam.',
            score: -4,
            category: 'style',
            icon: <AlertTriangle className="w-4 h-4 text-orange-500" />
          });
        } else if (emojiCount > 0 && emojiCount <= 2) {
          newFeedback.push({
            id: 'good-emoji-use',
            type: 'positive',
            message: 'Goede emoji balans - ze voegen persoonlijkheid toe!',
            score: 5,
            category: 'style',
            icon: <CheckCircle className="w-4 h-4 text-green-500" />
          });
        }
      }

      setFeedback(newFeedback);
      setIsAnalyzing(false);
      setLastAnalysis(Date.now());
      onFeedbackUpdate?.(newFeedback);
    }, 500); // 500ms delay for better UX
  }, [text, onFeedbackUpdate]);

  // Auto-analyze when text changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (text && Date.now() - lastAnalysis > 2000) { // Only analyze if 2+ seconds since last analysis
        analyzeText();
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [text, analyzeText, lastAnalysis]);

  // Initial analysis
  useEffect(() => {
    if (text && feedback.length === 0) {
      analyzeText();
    }
  }, [text, feedback.length, analyzeText]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Star className="w-4 h-4" />;
    if (score >= 60) return <ThumbsUp className="w-4 h-4" />;
    return <ThumbsDown className="w-4 h-4" />;
  };

  const getFeedbackStats = () => {
    const positive = feedback.filter(f => f.type === 'positive').length;
    const suggestions = feedback.filter(f => f.type === 'suggestion').length;
    const warnings = feedback.filter(f => f.type === 'warning').length;
    return { positive, suggestions, warnings };
  };

  const stats = getFeedbackStats();

  return (
    <div className="space-y-4">
      {/* Score Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">AI Profiel Analyse</h3>
                <p className="text-sm text-blue-700">Real-time feedback tijdens het typen</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold flex items-center gap-2 ${getScoreColor(overallScore)}`}>
                {getScoreIcon(overallScore)}
                {overallScore}
              </div>
              <Progress value={overallScore} className="w-20 h-2 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-600">{stats.positive}</div>
            <div className="text-xs text-muted-foreground">Goed</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.suggestions}</div>
            <div className="text-xs text-muted-foreground">Suggesties</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-orange-600">{stats.warnings}</div>
            <div className="text-xs text-muted-foreground">Waarschuwingen</div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Live Feedback
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                Analyseren...
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 && !isAnalyzing ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Begin met typen voor AI feedback</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${
                    item.type === 'positive'
                      ? 'bg-green-50 border-green-200'
                      : item.type === 'warning'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${
                        item.type === 'positive'
                          ? 'text-green-800'
                          : item.type === 'warning'
                          ? 'text-orange-800'
                          : 'text-blue-800'
                      }`}>
                        {item.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <span className={`text-xs font-medium ${
                          item.score > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.score > 0 ? '+' : ''}{item.score} punten
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Snelle Tips voor Betere Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-green-700">Do's:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Gebruik persoonlijke verhalen</li>
                <li>• Voeg 1-2 vragen toe</li>
                <li>• Toon een beetje kwetsbaarheid</li>
                <li>• Wees specifiek over interesses</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-red-700">Don'ts:</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Vermijd generieke zinnen</li>
                <li>• Geen negativiteit</li>
                <li>• Niet te lang of te kort</li>
                <li>• Te veel emojis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Re-analyze Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={analyzeText}
          disabled={isAnalyzing || !text}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Opnieuw Analyseren
        </Button>
      </div>
    </div>
  );
}