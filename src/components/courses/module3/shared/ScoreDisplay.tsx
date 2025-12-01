'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoreDisplayProps } from '../types/module3.types';

export function ScoreDisplay({ score, maxScore, title, feedback, className }: ScoreDisplayProps) {
  const percentage = Math.round((score / maxScore) * 100);

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = () => {
    if (percentage >= 80) return <Trophy className="w-5 h-5" />;
    if (percentage >= 60) return <Star className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  return (
    <Card className={cn("border-2", getScoreColor(), className)}>
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-white rounded-full shadow-sm">
            {getScoreIcon()}
          </div>
          <div>
            <div className="text-3xl font-bold">{score}/{maxScore}</div>
            <div className="text-sm opacity-75">{percentage}%</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm opacity-90">{feedback}</p>
        </div>

        <Badge variant="secondary" className="bg-white/50 text-current border-current/20">
          Score opgeslagen in je profiel
        </Badge>
      </CardContent>
    </Card>
  );
}