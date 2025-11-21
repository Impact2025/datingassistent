"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Copy,
  Download,
  RefreshCw
} from "lucide-react";
import { analyzeBio, type BioAnalysisResult, type MetricResult } from "@/lib/bio-analyzer";
import { cn } from "@/lib/utils";

interface BioAnalyzerProps {
  initialBio?: string;
  onSave?: (bio: string, analysis: BioAnalysisResult) => void;
  onAIEnhance?: (bio: string) => void;
}

export function BioAnalyzer({ initialBio = "", onSave, onAIEnhance }: BioAnalyzerProps) {
  const [bioText, setBioText] = useState(initialBio);
  const [analysis, setAnalysis] = useState<BioAnalysisResult | null>(null);
  const [showExamples, setShowExamples] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Real-time analysis with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bioText.trim()) {
        const result = analyzeBio(bioText);
        setAnalysis(result);
      } else {
        setAnalysis(null);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [bioText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(bioText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (analysis && onSave) {
      onSave(bioText, analysis);
    }
  };

  const handleAIEnhance = () => {
    if (onAIEnhance) {
      onAIEnhance(bioText);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Bio Analyzer
          </CardTitle>
          <CardDescription>
            Plak je bio hieronder voor een realtime analyse van 6 belangrijke metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Plak hier je dating bio of schrijf een nieuwe...

Bijvoorbeeld:
'Laatst verdwaald in een Shinto-tempel in Tokio - geen wifi, geen plan. Eindigde met thee bij een monnik die me de weg wees. Beste middag ooit.

Ik ben het type dat spontane roadtrips plant met spreadsheets. Oxymoron? Misschien.

Op zoek naar iemand die begrijpt waarom je soms moet verdwalen om jezelf te vinden.'"
              rows={10}
              className="font-mono text-sm resize-none"
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {bioText.length} karakters
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!bioText}
            >
              {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Gekopieerd!" : "Kopieer"}
            </Button>

            {onAIEnhance && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIEnhance}
                disabled={!bioText || !analysis}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Verbeteren
              </Button>
            )}

            {onSave && analysis && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!analysis || analysis.overallScore < 50}
              >
                Opslaan & Verder
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Overall Score */}
          <OverallScoreCard analysis={analysis} />

          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Specificiteit"
              metric={analysis.metrics.specificity}
              onShowExample={() => setShowExamples(showExamples === 'specificity' ? null : 'specificity')}
              showExample={showExamples === 'specificity'}
            />
            <MetricCard
              title="Cliché Detectie"
              metric={analysis.metrics.clicheDetection}
              onShowExample={() => setShowExamples(showExamples === 'cliche' ? null : 'cliche')}
              showExample={showExamples === 'cliche'}
            />
            <MetricCard
              title="Lengte"
              metric={analysis.metrics.lengthOptimization}
              onShowExample={() => setShowExamples(showExamples === 'length' ? null : 'length')}
              showExample={showExamples === 'length'}
            />
            <MetricCard
              title="Conversation Hooks"
              metric={analysis.metrics.conversationHooks}
              onShowExample={() => setShowExamples(showExamples === 'hooks' ? null : 'hooks')}
              showExample={showExamples === 'hooks'}
            />
            <MetricCard
              title="Toon"
              metric={analysis.metrics.tone}
              onShowExample={() => setShowExamples(showExamples === 'tone' ? null : 'tone')}
              showExample={showExamples === 'tone'}
            />
            <MetricCard
              title="Authenticiteit"
              metric={analysis.metrics.authenticity}
              onShowExample={() => setShowExamples(showExamples === 'authenticity' ? null : 'authenticity')}
              showExample={showExamples === 'authenticity'}
            />
          </div>

          {/* Top Suggestions */}
          {analysis.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Top Verbeteringen
                </CardTitle>
                <CardDescription>
                  Deze aanpassingen hebben de grootste impact op je score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.suggestions.slice(0, 3).map((suggestion, index) => (
                  <Alert
                    key={index}
                    variant={suggestion.priority === 'high' ? 'destructive' : 'default'}
                    className={cn(
                      suggestion.priority === 'medium' && 'border-orange-500 bg-orange-50 text-orange-900',
                      suggestion.priority === 'low' && 'border-blue-500 bg-blue-50 text-blue-900'
                    )}
                  >
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-1">{suggestion.title}</div>
                      <div className="text-sm">{suggestion.description}</div>

                      {suggestion.exampleBefore && suggestion.exampleAfter && (
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-red-600 font-semibold">❌</span>
                            <span className="text-muted-foreground italic">
                              {suggestion.exampleBefore}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600 font-semibold">✅</span>
                            <span className="font-medium">
                              {suggestion.exampleAfter}
                            </span>
                          </div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Highlighted Issues */}
          {analysis.highlightedIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gedetecteerde Problemen</CardTitle>
                <CardDescription>
                  Deze termen maken je bio minder effectief
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.highlightedIssues.slice(0, 10).map((issue, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-lg border",
                        issue.type === 'cliche' && "bg-red-50 border-red-200",
                        issue.type === 'vague' && "bg-orange-50 border-orange-200",
                        issue.type === 'negative' && "bg-yellow-50 border-yellow-200"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-mono text-sm font-semibold">
                            "{issue.text}"
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {issue.tooltip}
                          </div>
                          {issue.alternative && (
                            <div className="text-xs text-green-700 mt-1 font-medium">
                              💡 {issue.alternative}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant={issue.type === 'cliche' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {issue.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!analysis && bioText.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              Klaar om je bio te analyseren?
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Plak je huidige dating bio hierboven, of schrijf een nieuwe.
              Je krijgt direct feedback op 6 belangrijke metrics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function OverallScoreCard({ analysis }: { analysis: BioAnalysisResult }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent! 🎉";
    if (score >= 80) return "Zeer goed! ✨";
    if (score >= 70) return "Goed! 👍";
    if (score >= 60) return "Oké 👌";
    if (score >= 40) return "Kan beter ⚠️";
    return "Needs work 🔨";
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Bio Health Score</CardTitle>
        <CardDescription>
          Overall effectiviteit van je bio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Score Ring */}
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.overallScore / 100)}`}
                className={cn("transition-all duration-1000", getScoreColor(analysis.overallScore))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={cn("text-3xl font-bold", getScoreColor(analysis.overallScore))}>
                {analysis.overallScore}
              </div>
              <div className="text-xs text-muted-foreground">/ 100</div>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-2xl font-bold mb-1">
                {getScoreLabel(analysis.overallScore)}
              </div>
              <p className="text-sm text-muted-foreground">
                {analysis.overallScore >= 80 && "Je bio is klaar om matches te genereren! Kleine tweaks kunnen hem nog beter maken."}
                {analysis.overallScore >= 60 && analysis.overallScore < 80 && "Je bio is goed, maar er zijn nog verbeterpunten die grote impact hebben."}
                {analysis.overallScore >= 40 && analysis.overallScore < 60 && "Je bio heeft potentie, maar mist specificiteit en unieke hooks."}
                {analysis.overallScore < 40 && "Je bio kan veel beter! Focus op de suggesties hieronder voor snelle verbetering."}
              </p>
            </div>

            {analysis.improvementPotential > 20 && (
              <Alert>
                <TrendingUp className="w-4 h-4" />
                <AlertDescription>
                  <span className="font-semibold">+{analysis.improvementPotential} punten mogelijk!</span>
                  <br />
                  <span className="text-sm">
                    Implementeer de top 3 suggesties voor de grootste impact.
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  metric,
  onShowExample,
  showExample
}: {
  title: string;
  metric: MetricResult;
  onShowExample: () => void;
  showExample: boolean;
}) {
  const getStatusIcon = (status: MetricResult['status']) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'good':
        return <CheckCircle2 className="w-5 h-5 text-blue-600" />;
      case 'needs_improvement':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'poor':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: MetricResult['status']) => {
    switch (status) {
      case 'excellent':
        return "text-green-600 border-green-200 bg-green-50";
      case 'good':
        return "text-blue-600 border-blue-200 bg-blue-50";
      case 'needs_improvement':
        return "text-orange-600 border-orange-200 bg-orange-50";
      case 'poor':
        return "text-red-600 border-red-200 bg-red-50";
    }
  };

  return (
    <Card className={cn("transition-all", getStatusColor(metric.status))}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {getStatusIcon(metric.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Score */}
        <div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold">{metric.score}</span>
            <span className="text-sm text-muted-foreground mb-1">/ 10</span>
          </div>
          <Progress value={metric.score * 10} className="h-2" />
        </div>

        {/* Description */}
        <p className="text-sm">
          {metric.description}
        </p>

        {/* Issues */}
        {metric.issues.length > 0 && (
          <div className="space-y-1">
            {metric.issues.map((issue, index) => (
              <div key={index} className="text-xs">
                <div className="font-medium">• {issue.text}</div>
                <div className="text-muted-foreground ml-3">→ {issue.suggestion}</div>
              </div>
            ))}
          </div>
        )}

        {/* Example Toggle */}
        {metric.examples && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowExample}
            className="w-full text-xs"
          >
            {showExample ? "Verberg" : "Toon"} voorbeeld
          </Button>
        )}

        {/* Examples */}
        {showExample && metric.examples && (
          <div className="space-y-2 text-xs border-t pt-3">
            <div>
              <div className="flex items-start gap-2">
                <span className="text-red-600">❌</span>
                <span className="text-muted-foreground italic flex-1">
                  {metric.examples.bad}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span className="font-medium flex-1">
                  {metric.examples.good}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
