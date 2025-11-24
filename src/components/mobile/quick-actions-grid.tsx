"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, MessageCircle, Target, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  route: string;
  priority: 'high' | 'medium' | 'low';
  color: string;
  bgColor: string;
}

interface QuickActionsGridProps {
  className?: string;
}

export function QuickActionsGrid({ className }: QuickActionsGridProps) {
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'profile',
      icon: <Camera className="w-6 h-6" />,
      title: 'Profiel Check',
      subtitle: 'Foto + Bio',
      route: '/profiel',
      priority: 'high',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'chat',
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Chat Coach',
      subtitle: 'Upload/chat direct',
      route: '/chat',
      priority: 'high',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      id: 'goals',
      icon: <Target className="w-6 h-6" />,
      title: 'Doelen',
      subtitle: 'Weekdoelen + voortgang',
      route: '/groei',
      priority: 'high',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      id: 'course',
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Cursus',
      subtitle: 'Jouw les van vandaag',
      route: '/leren',
      priority: 'medium',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    router.push(action.route);
  };

  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {quickActions.map((action) => (
        <div
          key={action.id}
          className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50"
          onClick={() => handleActionClick(action)}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Icon with background */}
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <div className="text-pink-600">
                {action.icon}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {action.title}
              </h3>
              <p className="text-xs text-gray-600">
                {action.subtitle}
              </p>
            </div>

            {/* Priority indicator */}
            {action.priority === 'high' && (
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}