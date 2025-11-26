'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, CheckCircle, AlertCircle, Trophy, TrendingUp } from 'lucide-react';

interface ScoringItem {
  id: string;
  beschrijving: string;
  maxScore: number;
}

interface ScoringCategorie {
  naam: string;
  maxScore: number;
  items: ScoringItem[];
}

interface ScoreRange {
  min: number;
  max: number;
  level: string;
  feedback: string;
}

interface ComprehensiveScoringProps {
  titel: string;
  beschrijving: string;
  categorieën: ScoringCategorie[];
  resultaatRanges: ScoreRange[];
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface ComprehensiveScoringResultaten {
  categorieScores: Record<string, Record<string, number>>;
  totaalScore: number;
  scoreLevel: string;
  scoreFeedback: string;
  isValid: boolean;
}

export function ComprehensiveScoring({
  titel,
  beschrijving,
  categorieën,
  resultaatRanges,
  irisContext,
  onComplete,
  onPrevious
}: ComprehensiveScoringProps) {
  const [categorieScores, setCategorieScores] = useState<Record<string, Record<string, number>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize scores
  useEffect(() => {
    const initialScores: Record<string, Record<string, number>> = {};
    categorieën.forEach(categorie => {
      initialScores[categorie.naam] = {};
      categorie.items.forEach(item => {
        initialScores[categorie.naam][item.id] = Math.floor(item.maxScore / 2); // Start at middle
      });
    });
    setCategorieScores(initialScores);
  }, [categorieën]);

  const handleScoreChange = (categorieNaam: string, itemId: string, score: number[]) => {
    setCategorieScores(prev => ({
      ...prev,
      [categorieNaam]: {
        ...prev[categorieNaam],
        [itemId]: score[0]
      }
    }));
  };

  const calculateTotaalScore = () => {
    let totaal = 0;
    categorieën.forEach(categorie => {
      const categorieScore = Object.values(categorieScores[categorie.naam] || {}).reduce((sum, score) => sum + score, 0);
      totaal += categorieScore;
    });
    return totaal;
  };

  const getScoreLevel = (score: number) => {
    const range = resultaatRanges.find(r => score >= r.min && score <= r.max);
    return range || resultaatRanges[resultaatRanges.length - 1];
  };

  const handleSubmit = () => {
    const totaalScore = calculateTotaalScore();
    const scoreLevelInfo = getScoreLevel(totaalScore);

    const resultaten: ComprehensiveScoringResultaten = {
      categorieScores,
      totaalScore,
      scoreLevel: scoreLevelInfo.level,
      scoreFeedback: scoreLevelInfo.feedback,
      isValid: true
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const totaalScore = calculateTotaalScore();
  const scoreLevelInfo = getScoreLevel(totaalScore);
  const maxTotaalScore = categorieën.reduce((sum, cat) => sum + cat.maxScore, 0);
  const isValid = true; // Always valid for scoring

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Profiel Score Berekend
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je Onweerstaanbaarheids-Score is {totaalScore}/{maxTotaalScore} punten.
            </p>
          </CardContent>
        </Card>

        {/* Score Display */}
        <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-6xl font-bold text-yellow-600 mb-4">
              {totaalScore}
            </div>
            <div className="text-2xl font-semibold text-yellow-700 mb-2">
              {scoreLevelInfo.level}
            </div>
            <p className="text-yellow-800 max-w-md mx-auto">
              {scoreLevelInfo.feedback}
            </p>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Score per Categorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorieën.map(categorie => {
                const categorieScore = Object.values(categorieScores[categorie.naam] || {}).reduce((sum, score) => sum + score, 0);
                const percentage = Math.round((categorieScore / categorie.maxScore) * 100);

                return (
                  <div key={categorie.naam} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{categorie.naam}</h4>
                      <Badge variant="outline">
                        {categorieScore}/{categorie.maxScore} ({percentage}%)
                      </Badge>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* Item breakdown */}
                    <div className="ml-4 space-y-1">
                      {categorie.items.map(item => {
                        const score = categorieScores[categorie.naam]?.[item.id] || 0;
                        return (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{item.beschrijving}</span>
                            <span className="font-medium">{score}/{item.maxScore}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* Current Score Preview */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-4">
          <div className="text-center">
            <h3 className="font-bold text-yellow-900 mb-2">Huidige Score</h3>
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {totaalScore}/{maxTotaalScore}
            </div>
            <div className="text-lg font-semibold text-yellow-700">
              {scoreLevelInfo.level}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Categories */}
      <div className="space-y-6">
        {categorieën.map(categorie => {
          const categorieScore = Object.values(categorieScores[categorie.naam] || {}).reduce((sum, score) => sum + score, 0);

          return (
            <Card key={categorie.naam}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{categorie.naam}</CardTitle>
                  <Badge variant="outline">
                    {categorieScore}/{categorie.maxScore} punten
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {categorie.items.map(item => {
                  const currentScore = categorieScores[categorie.naam]?.[item.id] || 0;

                  return (
                    <div key={item.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-medium text-gray-900">
                          {item.beschrijving}
                        </label>
                        <Badge variant="outline">{currentScore}/{item.maxScore}</Badge>
                      </div>

                      <Slider
                        value={[currentScore]}
                        onValueChange={(value) => handleScoreChange(categorie.naam, item.id, value)}
                        max={item.maxScore}
                        min={0}
                        step={1}
                        className="w-full"
                      />

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0 - Niet goed</span>
                        <span>{item.maxScore} - Uitstekend</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Score Ranges Info */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Score Uitleg</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resultaatRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <div className="text-2xl">{range.level}</div>
                <div>
                  <div className="font-medium">{range.min}-{range.max} punten</div>
                  <div className="text-sm text-gray-600">{range.feedback}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
            size="lg"
          >
            Score Berekenen & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Eindscore: {totaalScore}/{maxTotaalScore} punten ({scoreLevelInfo.level})
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}