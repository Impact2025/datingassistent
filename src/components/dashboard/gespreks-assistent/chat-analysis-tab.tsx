'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Heart,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  Loader2
} from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { useToolCompletion } from '@/hooks/use-tool-completion';

interface ChatAnalysisResult {
  overall_score: number;
  vibe_analysis: {
    your_tone: string;
    their_tone: string;
    compatibility: number;
  };
  flirt_balance: {
    your_investment: number;
    their_investment: number;
    ratio: string;
  };
  conversation_metrics: {
    message_count: number;
    response_times: string;
    engagement_level: number;
    depth_score: number;
  };
  red_flags: string[];
  green_flags: string[];
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    advice: string;
    expected_impact: string;
  }>;
  success_probability: number;
  next_steps: string[];
}

interface ChatAnalysisTabProps {
  onTabChange?: (tab: string) => void;
}

export function ChatAnalysisTab({ onTabChange }: ChatAnalysisTabProps) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chatContent, setChatContent] = useState('');
  const [platform, setPlatform] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ChatAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { markAsCompleted } = useToolCompletion('gespreks-assistent');

  const platforms = [
    { value: 'tinder', label: 'Tinder', icon: '💙' },
    { value: 'bumble', label: 'Bumble', icon: '🐝' },
    { value: 'hinge', label: 'Hinge', icon: '📱' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { value: 'other', label: 'Anders', icon: '💭' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setChatContent(content);
    };
    reader.readAsText(file);
  };

  const analyzeChat = async () => {
    if (!chatContent.trim() || !platform) {
      setError('Vul zowel de chat inhoud als het platform in');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/gespreks-assistent/chat-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatContent,
          platform,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Analyse mislukt. Probeer het opnieuw.');
      }

      const analysisResult = await response.json();
      setResult(analysisResult);

      // Track completion
      await markAsCompleted('chat_analysis_completed', {
        platform,
        message_count: analysisResult.conversation_metrics.message_count,
        success_probability: analysisResult.success_probability
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Uitstekend';
    if (score >= 60) return 'Goed';
    if (score >= 40) return 'Voldoende';
    return 'Verbetering nodig';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Chat Analyse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Selecteer het platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <div className="flex items-center gap-2">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chat Content Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Chat Inhoud</label>
            <Textarea
              value={chatContent}
              onChange={(e) => setChatContent(e.target.value)}
              placeholder="Plak hier je chat gesprek... (bijv. WhatsApp export of gekopieerde berichten)"
              rows={6}
              className="bg-white border-gray-200 resize-none"
            />
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border-gray-200 hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Bestand uploaden
              </Button>
              <span className="text-sm text-gray-500">of plak de tekst hierboven</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={analyzeChat}
            disabled={isAnalyzing || !chatContent.trim() || !platform}
            size="lg"
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Analyseert chat...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyseer Chat
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl border text-xl font-bold ${getScoreColor(result.overall_score)}`}>
                  <BarChart3 className="w-6 h-6" />
                  <span>{result.overall_score}/100</span>
                  <span className="text-sm font-normal">•</span>
                  <span className="text-sm font-normal">{getScoreLabel(result.overall_score)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.success_probability}%
                  </div>
                  <div className="text-sm text-gray-600">Succeskans</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.conversation_metrics.message_count}
                  </div>
                  <div className="text-sm text-gray-600">Berichten</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.flirt_balance.ratio}
                  </div>
                  <div className="text-sm text-gray-600">Flirt Balans</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {result.vibe_analysis.compatibility}%
                  </div>
                  <div className="text-sm text-gray-600">Vibe Match</div>
                </div>
              </div>

              <p className="text-gray-600 max-w-2xl mx-auto text-sm">
                {result.success_probability >= 70
                  ? "Deze chat heeft sterke fundamenten voor een succesvolle date!"
                  : result.success_probability >= 40
                  ? "Met wat aanpassingen kan deze chat veelbelovend worden."
                  : "Deze chat heeft aandachtspunten die verbetering nodig hebben."
                }
              </p>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vibe Analysis */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Vibe Analyse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm font-medium text-gray-700 mb-1">Jouw Vibe</div>
                    <div className="text-sm text-gray-900">{result.vibe_analysis.your_tone}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-sm font-medium text-gray-700 mb-1">Hun Vibe</div>
                    <div className="text-sm text-gray-900">{result.vibe_analysis.their_tone}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Vibe Compatibiliteit</span>
                    <span className="text-sm font-semibold text-gray-900">{result.vibe_analysis.compatibility}%</span>
                  </div>
                  <Progress value={result.vibe_analysis.compatibility} className="h-2 bg-gray-200" />
                </div>
              </CardContent>
            </Card>

            {/* Conversation Metrics */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  Gespreksstatistieken
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {result.conversation_metrics.engagement_level}%
                    </div>
                    <div className="text-sm text-gray-600">Betrokkenheid</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {result.conversation_metrics.depth_score}%
                    </div>
                    <div className="text-sm text-gray-600">Diepgang</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  Gemiddelde responstijd: {result.conversation_metrics.response_times}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Green Flags */}
            {result.green_flags.length > 0 && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Groene Vlaggen
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {result.green_flags.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.green_flags.map((flag, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-500" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Red Flags */}
            {result.red_flags.length > 0 && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Rode Vlaggen
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      {result.red_flags.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.red_flags.map((flag, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Verbeteradvies
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {result.recommendations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {getPriorityIcon(rec.priority)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            rec.priority === 'high' ? 'destructive' :
                            rec.priority === 'medium' ? 'default' : 'secondary'
                          } className="text-xs">
                            {rec.priority === 'high' ? 'Hoog' :
                             rec.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                          </Badge>
                          <span className="text-sm font-medium text-gray-600">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-2">{rec.advice}</p>
                        <p className="text-xs text-gray-500">
                          Verwachte impact: {rec.expected_impact}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Volgende Stappen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {result.next_steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-900">{step}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => onTabChange?.('scripts')}
                  variant="outline"
                  className="bg-white border-gray-200 hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Scripts Bekijken
                </Button>
                <Button
                  onClick={() => onTabChange?.('strategy-advisor')}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Strategie Tips
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}