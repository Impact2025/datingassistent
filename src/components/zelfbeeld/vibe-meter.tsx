"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VibeMeterProps {
  label: string;
  value: number;
  benchmark?: {
    average?: number;
    top10?: number;
  };
  tips?: string[];
  examples?: Array<{
    before: string;
    after: string;
  }>;
  className?: string;
}

export function VibeMeter({
  label,
  value,
  benchmark,
  tips = [],
  examples = [],
  className
}: VibeMeterProps) {
  const [expanded, setExpanded] = useState(false);

  // Determine status
  const getStatus = () => {
    if (!benchmark?.average) return 'neutral';
    if (value >= (benchmark.top10 || 80)) return 'excellent';
    if (value >= benchmark.average) return 'good';
    return 'needs-work';
  };

  const status = getStatus();

  const statusConfig = {
    excellent: {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: TrendingUp,
      label: 'Excellent',
      message: 'Je scoort in de top 10%!'
    },
    good: {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: TrendingUp,
      label: 'Goed',
      message: 'Boven gemiddeld, maar kan beter'
    },
    'needs-work': {
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: TrendingDown,
      label: 'Verbeteren',
      message: 'Hier ligt kans voor groei'
    },
    neutral: {
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: Minus,
      label: 'Gemeten',
      message: 'Je persoonlijke score'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={cn("overflow-hidden transition-all", className)}>
      <CardContent className="p-0">
        {/* Main Meter */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{label}</h4>
                <Badge
                  variant="outline"
                  className={cn("text-xs", config.color, config.borderColor)}
                >
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{config.message}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className={cn("text-2xl font-bold", config.color)}>
                {value}%
              </div>
              {benchmark?.average && (
                <div className="text-xs text-gray-500">
                  Ø {benchmark.average}%
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  status === 'excellent' && "bg-gradient-to-r from-green-400 to-green-600",
                  status === 'good' && "bg-gradient-to-r from-blue-400 to-blue-600",
                  status === 'needs-work' && "bg-gradient-to-r from-orange-400 to-orange-600",
                  status === 'neutral' && "bg-gradient-to-r from-gray-400 to-gray-600"
                )}
                style={{ width: `${value}%` }}
              />
            </div>

            {/* Benchmark Markers */}
            {benchmark && (
              <div className="relative h-4">
                {benchmark.average && (
                  <div
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${benchmark.average}%` }}
                  >
                    <div className="w-0.5 h-3 bg-gray-400" />
                    <div className="text-xs text-gray-500 mt-0.5 -translate-x-1/2">
                      Gem
                    </div>
                  </div>
                )}
                {benchmark.top10 && (
                  <div
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${benchmark.top10}%` }}
                  >
                    <div className="w-0.5 h-3 bg-green-500" />
                    <div className="text-xs text-green-600 mt-0.5 -translate-x-1/2 font-medium">
                      Top
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Expand Button */}
          {(tips.length > 0 || examples.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full justify-between text-coral-600 hover:text-coral-700 hover:bg-coral-50"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {tips.length} verbeterpunt{tips.length !== 1 ? 'en' : ''}
                </span>
              </span>
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Expanded Tips & Examples */}
        {expanded && (tips.length > 0 || examples.length > 0) && (
          <div className={cn("border-t p-4 space-y-4", config.bgColor)}>
            {/* Tips */}
            {tips.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-900">Verbeterpunten:</h5>
                <ul className="space-y-2">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            {examples.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-900">Voor/Na Voorbeelden:</h5>
                <div className="space-y-3">
                  {examples.map((example, index) => (
                    <div key={index} className="space-y-2">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive" className="text-xs">Voor</Badge>
                        </div>
                        <p className="text-sm text-gray-700 italic">"{example.before}"</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-xs bg-green-600">Na</Badge>
                        </div>
                        <p className="text-sm text-gray-700 italic">"{example.after}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
