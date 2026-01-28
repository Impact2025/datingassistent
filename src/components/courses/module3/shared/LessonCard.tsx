'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LessonCardProps } from '../types/module3.types';

export function LessonCard({ title, emoji, children, className }: LessonCardProps) {
  return (
    <Card className={cn(
      "border-0 bg-white shadow-sm rounded-xl",
      "transition-all duration-200 hover:shadow-md",
      className
    )}>
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-coral-100 rounded-2xl flex items-center justify-center">
          <span className="text-2xl">{emoji}</span>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        {children}
      </CardContent>
    </Card>
  );
}