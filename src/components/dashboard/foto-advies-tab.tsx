'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle, Lightbulb, HelpCircle } from 'lucide-react';
import { useCoachingTracker } from '@/hooks/use-coaching-tracker';
import { ToolOnboardingOverlay, useOnboardingOverlay } from '@/components/shared/tool-onboarding-overlay';
import { getOnboardingSteps, getToolDisplayName } from '@/lib/tool-onboarding-content';
import { ContextualTooltip } from '@/components/shared/contextual-tooltip';
import { useToolCompletion } from '@/hooks/use-tool-completion';

interface PhotoAnalysisResult {
  overall_score: number;
  analysis: {
    lighting: { score: number; feedback: string };
    composition: { score: number; feedback: string };
    authenticity: { score: number; feedback: string };
    facial_expression: { score: number; feedback: string };
  };
  tips: string[];
  suggestions: {
    alternative_angles: string[];
    background: string[];
    overall: string;
  };
}

export function FotoAdviesTab() {
  const { trackCustomEvent, isFirstTime, isFromOnboarding } = useCoachingTracker('foto-advies');
  const { showOverlay, setShowOverlay } = useOnboardingOverlay('foto-advies');
  const {
    isCompleted: isActionCompleted,
    markAsCompleted: markCompleted,
    completedActions = [],
    progressPercentage = 0,
    isLoading: progressLoading
  } = useToolCompletion('foto-advies');

  // Create progress object for backward compatibility
  const progress = {
    completedActions: completedActions?.length || 0,
    progressPercentage: progressPercentage || 0,
    actionsCompleted: completedActions || []
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'photo' | 'screenshot'>('photo');
  const [bestScore, setBestScore] = useState<number>(0);

  // Load best score from completion metadata
  useEffect(() => {
    if (progress.actionsCompleted.includes('photo_improved')) {
      const completions = progress.actionsCompleted;
      // Extract best score from metadata if available
      const bestScoreAction = completions.find(a => a.startsWith('score_'));
      if (bestScoreAction) {
        const score = parseFloat(bestScoreAction.split('_')[1] || '0');
        setBestScore(score);
      }
    }
  }, [progress]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Selecteer een afbeelding (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Afbeelding is te groot. Maximum 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Track photo upload in database
    await markCompleted('photo_uploaded', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString()
    });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('context', uploadType === 'screenshot' ? 'profile_screenshot' : 'profile_photo');
      formData.append('type', uploadType);

      const response = await fetch('/api/photo-analysis', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Log in om je foto te laten analyseren door onze AI. Het analyseren van foto\'s is alleen beschikbaar voor geregistreerde gebruikers.');
        }
        if (response.status === 403) {
          throw new Error('Upgrade je abonnement om foto\'s te laten analyseren. Foto analyse is beschikbaar vanaf het Sociaal abonnement (€0/maand).');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Analyse mislukt');
      }

      const data: PhotoAnalysisResult = await response.json();
      setResult(data);

      // Track analysis viewed in database
      await markCompleted('analysis_viewed', {
        score: data.overall_score,
        type: uploadType,
        timestamp: new Date().toISOString()
      });

      // Track improvement if score is better
      if (data.overall_score > bestScore) {
        setBestScore(data.overall_score);
        if (bestScore > 0) {
          await markCompleted('photo_improved', {
            previousScore: bestScore,
            newScore: data.overall_score,
            improvement: data.overall_score - bestScore,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Track photo analysis completion
      await trackCustomEvent('photo_analyzed', {
        score: data.overall_score,
        type: uploadType,
        recommendations: data.tips.length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij de analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Goed';
    if (score >= 4) return 'Voldoende';
    return 'Kan beter';
  };

  return (
    <>
      {/* Onboarding Overlay */}
      <ToolOnboardingOverlay
        toolName="foto-advies"
        displayName={getToolDisplayName('foto-advies')}
        steps={getOnboardingSteps('foto-advies')}
        open={showOverlay}
        onOpenChange={setShowOverlay}
        onComplete={() => console.log('Foto Advies onboarding completed!')}
      />

      <div className="space-y-6">
        {/* Header with Help Button and Progress */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">📸 Foto Analyse</h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-muted-foreground">
                Upload je profielfoto en krijg direct professioneel advies
              </p>
              {progress?.completedActions > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">
                    {progress.progressPercentage}% voltooid ({progress.completedActions} acties)
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOverlay(true)}
            className="gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tutorial</span>
          </Button>
        </div>

        {isFirstTime && !showOverlay && (
          <Alert className="border-primary bg-primary/5">
            <Lightbulb className="w-4 h-4" />
            <AlertDescription>
              <strong>Eerste keer Foto Advies?</strong> Upload je beste profielfoto en krijg direct professionele feedback. Tip: natuurlijk licht werkt het beste!
            </AlertDescription>
          </Alert>
        )}

        {isFromOnboarding && !isFirstTime && (
          <Card className="border-l-4 border-l-primary bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong>💡 Tip van je coach:</strong> Upload je beste foto eerst om te zien waar je staat!
              </p>
            </CardContent>
          </Card>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Stap 2: Optimaliseer je visuele presentatie
        </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Upload je foto of screenshot
            <ContextualTooltip
              content="Upload een foto gemaakt in natuurlijk licht voor de beste resultaten. Screenshots van dating app profielen kunnen ook geanalyseerd worden."
              showIcon
            />
          </CardTitle>
          <CardDescription>
            JPG, PNG of WebP - Maximum 10MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Type Selection */}
          <div className="flex gap-2">
            <ContextualTooltip content="Analyseer een los gemaakte foto van jezelf">
              <Button
                variant={uploadType === 'photo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadType('photo')}
                className="flex-1"
              >
                📸 Profielfoto
              </Button>
            </ContextualTooltip>
            <ContextualTooltip content="Analyseer een screenshot van je complete dating app profiel">
              <Button
                variant={uploadType === 'screenshot' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadType('screenshot')}
                className="flex-1"
              >
                🖥️ Screenshot
              </Button>
            </ContextualTooltip>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label htmlFor="photo-upload">
              <Button asChild variant="outline">
                <span className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadType === 'screenshot' ? 'Selecteer screenshot' : 'Selecteer foto'}
                </span>
              </Button>
            </label>

            {selectedFile && (
              <span className="text-sm text-muted-foreground">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </span>
            )}
          </div>

          {previewUrl && (
            <div className="space-y-4">
              <div className="relative w-full max-w-md mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-lg border shadow-sm"
                />
              </div>

              <ContextualTooltip content="AI analyseert je foto op belichting, compositie, authenticiteit en gezichtsuitdrukking. Dit duurt ongeveer 10 seconden.">
                <Button
                  onClick={analyzePhoto}
                  disabled={analyzing}
                  className="w-full max-w-md mx-auto block"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadType === 'screenshot' ? 'Screenshot analyseren...' : 'Foto analyseren...'}
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      {uploadType === 'screenshot' ? 'Analyseer deze screenshot' : 'Analyseer deze foto'}
                    </>
                  )}
                </Button>
              </ContextualTooltip>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Analyse Resultaten
            </CardTitle>
            <CardDescription>
              Overall score: <span className={`font-bold text-lg ${getScoreColor(result.overall_score)}`}>
                {result.overall_score.toFixed(1)}/10
              </span> ({getScoreLabel(result.overall_score)})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(result.analysis).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">
                      {key === 'lighting' && '💡 Belichting'}
                      {key === 'composition' && '🎨 Compositie'}
                      {key === 'authenticity' && '✨ Authenticiteit'}
                      {key === 'facial_expression' && '😊 Gezichtsuitdrukking'}
                    </h4>
                    <span className={`font-bold ${getScoreColor(value.score)}`}>
                      {value.score.toFixed(1)}/10
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{value.feedback}</p>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div>
              <h3 className="font-semibold mb-3">💡 Concrete Tips</h3>
              <ul className="space-y-2">
                {result.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">📐 Alternatieve hoeken</h4>
                <ul className="space-y-1">
                  {result.suggestions.alternative_angles.map((angle, index) => (
                    <li key={index} className="text-sm text-muted-foreground ml-4">
                      • {angle}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🖼️ Achtergrond advies</h4>
                <ul className="space-y-1">
                  {result.suggestions.background.map((bg, index) => (
                    <li key={index} className="text-sm text-muted-foreground ml-4">
                      • {bg}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">🎯 Overall advies</h4>
                <p className="text-sm">{result.suggestions.overall}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setResult(null);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            >
              Analyseer een andere foto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">ℹ️ Hoe werkt het?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Upload je profielfoto of een screenshot van je dating app profiel</p>
          <p>• AI analyseert op 4 aspecten: belichting, compositie, authenticiteit en gezichtsuitdrukking</p>
          <p>• Je krijgt een score van 0-10 per aspect + overall score</p>
          <p>• Concrete, toepasbare tips om je foto te verbeteren</p>
          <p>• Alle analyses blijven privé en worden niet opgeslagen</p>
          <p>• Rate limit: 10 analyses per uur</p>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
