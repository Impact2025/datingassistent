'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Heart,
  Eye,
  Zap,
  RefreshCcw,
  Info,
  X,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface VibeAnalysis {
  eersteEmotie: string;
  eersteGedachte: string;
  vibeScores: {
    toegankelijkMysterieus: number;
    serieuseSpeels: number;
    rustigAvontuurlijk: number;
  };
  nieuwsgierigheidFactor: string;
  suggestie: string;
  overallVibe: string;
}

export default function VibeCheckPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VibeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selecteer een afbeelding (JPG, PNG, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setAnalysis(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/vibe-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analyse mislukt');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Er is iets misgegaan');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setError(null);
  };

  const getScoreLabel = (score: number): string => {
    if (score < 30) return 'Laag';
    if (score < 70) return 'Gemiddeld';
    return 'Hoog';
  };

  const getScoreColor = (score: number): string => {
    if (score < 30) return 'bg-blue-500';
    if (score < 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 to-white pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Vibe Check</h1>
                  <p className="text-xs text-gray-500">Ontdek hoe je foto overkomt</p>
                </div>
              </div>
            </div>
            <Badge className="bg-pink-100 text-pink-700 border-0">
              Transformatie
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Intro Card */}
        {!selectedImage && !analysis && (
          <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Hoe werkt het?</h3>
                  <p className="text-sm text-gray-600">
                    Upload een profielfoto en ontdek welke <strong>emotionele eerste indruk</strong> je
                    maakt. Geen technische feedback over belichting - puur hoe iemand zich voelt
                    als ze door dating apps scrollen en jouw foto zien.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Area */}
        {!analysis && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload je foto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedImage ? (
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                    dragActive
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-pink-500" />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">
                    Sleep je foto hierheen
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    of klik om te selecteren
                  </p>
                  <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                    Kies foto
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-square max-w-xs mx-auto rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-6"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyseren...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyseer mijn vibe
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* First Impression */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-pink-500" />
                    Eerste Indruk
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                    <p className="text-lg font-medium text-gray-900 italic">
                      "{analysis.eersteGedachte}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className="bg-pink-100 text-pink-700 border-0 px-3 py-1">
                      <Heart className="w-3 h-3 mr-1" />
                      {analysis.eersteEmotie}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Vibe Scores */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Vibe Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Score 1: Toegankelijk - Mysterieus */}
                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Toegankelijk</span>
                      <span className="text-sm font-medium text-gray-700">Mysterieus</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                        style={{ width: `${analysis.vibeScores.toegankelijkMysterieus}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {analysis.vibeScores.toegankelijkMysterieus}%
                    </p>
                  </div>

                  {/* Score 2: Serieus - Speels */}
                  <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Serieus</span>
                      <span className="text-sm font-medium text-gray-700">Speels</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
                        style={{ width: `${analysis.vibeScores.serieuseSpeels}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {analysis.vibeScores.serieuseSpeels}%
                    </p>
                  </div>

                  {/* Score 3: Rustig - Avontuurlijk */}
                  <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Rustig</span>
                      <span className="text-sm font-medium text-gray-700">Avontuurlijk</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all"
                        style={{ width: `${analysis.vibeScores.rustigAvontuurlijk}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {analysis.vibeScores.rustigAvontuurlijk}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Reflectie Section - Matching Design */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Reflectie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Spiegel */}
                  <div className="p-4 rounded-xl border-2 border-pink-200 bg-pink-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                        <Eye className="w-3 h-3 text-white" />
                      </div>
                      <Badge className="bg-pink-100 text-pink-700 border-0 text-xs">
                        Spiegel
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Nieuwsgierigheid factor</p>
                    <p className="text-sm text-gray-600">{analysis.nieuwsgierigheidFactor}</p>
                  </div>

                  {/* Identiteit */}
                  <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                        Identiteit
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Overall vibe</p>
                    <p className="text-sm text-gray-600">{analysis.overallVibe}</p>
                  </div>

                  {/* Actie */}
                  <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                        Actie
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Suggestie</p>
                    <p className="text-sm text-gray-600">{analysis.suggestie}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={resetAnalysis}
                  className="flex-1 border-gray-200"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Nieuwe foto
                </Button>
                <Button
                  onClick={() => router.push('/transformatie')}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Terug naar cursus
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation />
    </div>
  );
}
