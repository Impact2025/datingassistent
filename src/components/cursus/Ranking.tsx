'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, GripVertical, CheckCircle } from 'lucide-react';

interface RankingItem {
  id: string;
  label: string;
}

interface RankingProps {
  titel: string;
  beschrijving: string;
  items: RankingItem[];
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface RankingResultaat {
  ranking: Array<{ id: string; label: string; position: number }>;
  topItem: { id: string; label: string };
}

export function Ranking({
  titel,
  beschrijving,
  items,
  irisContext,
  onComplete,
  onPrevious
}: RankingProps) {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize with shuffled items
  useEffect(() => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setRanking(shuffled);
  }, [items]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (!draggedItem) return;

    const draggedIndex = ranking.findIndex(item => item.id === draggedItem);
    if (draggedIndex === -1) return;

    const newRanking = [...ranking];
    const [removed] = newRanking.splice(draggedIndex, 1);
    newRanking.splice(targetIndex, 0, removed);

    setRanking(newRanking);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    const resultaten: RankingResultaat = {
      ranking: ranking.map((item, index) => ({
        id: item.id,
        label: item.label,
        position: index + 1
      })),
      topItem: {
        id: ranking[0].id,
        label: ranking[0].label
      }
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Resultaten Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Ranking Opgeslagen
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je hebt je voorkeuren gerangschikt. Dit helpt ons om je dating strategie te personaliseren.
            </p>
          </CardContent>
        </Card>

        {/* Top Item Highlight */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Jouw #1 Prioriteit</h2>
              <div className="bg-white rounded-lg p-4 shadow-sm border inline-block">
                <div className="text-2xl mb-2">🥇</div>
                <p className="font-medium text-gray-900">{ranking[0]?.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>Je Volledige Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ranking.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    index === 0 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {index === 0 && <Badge className="bg-yellow-500">Top Prioriteit</Badge>}
                </div>
              ))}
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
          <div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Hoe te rangschikken:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sleep items om ze te ordenen</li>
                <li>• #1 is het meest aanwezig bij jou</li>
                <li>• #5 is het minst aanwezig bij jou</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranking List */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep om te rangschikken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ranking.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 border-dashed transition-all cursor-move ${
                  draggedItem === item.id
                    ? 'border-purple-400 bg-purple-50 shadow-lg'
                    : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                <span className="flex-1 font-medium">{item.label}</span>
                {draggedItem === item.id && (
                  <Badge variant="outline" className="text-purple-600">
                    Bezig met slepen
                  </Badge>
                )}
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
            className="w-full bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
            size="lg"
          >
            Ranking Opslaan & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}