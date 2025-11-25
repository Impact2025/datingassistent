"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, MessageCircle, Target, BookOpen, Image, Heart, Mic, Users, Shield, Wrench } from 'lucide-react';
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
      title: 'Profiel Coach',
      subtitle: 'Foto + Bio',
      route: '/profiel',
      priority: 'high',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'photo-analysis',
      icon: <Image className="w-6 h-6" />,
      title: 'Foto Analyse',
      subtitle: 'Professionele beoordeling',
      route: '/foto',
      priority: 'high',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
    {
      id: 'chat',
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Chat Coach',
      subtitle: 'Gespreksanalyse',
      route: '/chat',
      priority: 'high',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      id: 'opener-lab',
      icon: <Heart className="w-6 h-6" />,
      title: 'Opener Lab',
      subtitle: 'Openingszinnen',
      route: '/opener',
      priority: 'high',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
    },
    // Voice notes tool - commented out until voice analysis feature is implemented
    // {
    //   id: 'voice-notes',
    //   icon: <Mic className="w-6 h-6" />,
    //   title: 'Stem Berichten',
    //   subtitle: 'Audio analyse',
    //   route: '/voice',
    //   priority: 'medium',
    //   color: 'text-orange-600',
    //   bgColor: 'bg-orange-50 hover:bg-orange-100',
    // },
    {
      id: 'match-analysis',
      icon: <Users className="w-6 h-6" />,
      title: 'Match Analyse',
      subtitle: 'Profielen analyseren',
      route: '/match',
      priority: 'medium',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    },
    {
      id: 'date-planner',
      icon: <Target className="w-6 h-6" />,
      title: 'Date Planner',
      subtitle: 'Perfecte date ideeën',
      route: '/date-planner',
      priority: 'medium',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 hover:bg-teal-100',
    },
    {
      id: 'safety-check',
      icon: <Shield className="w-6 h-6" />,
      title: 'Veiligheidscheck',
      subtitle: 'Rode vlaggen',
      route: '/veiligheid',
      priority: 'high',
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
    {
      id: 'goals',
      icon: <Target className="w-6 h-6" />,
      title: 'Doelen',
      subtitle: 'Weekdoelen + voortgang',
      route: '/groei',
      priority: 'medium',
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
    {
      id: 'all-tools',
      icon: <Wrench className="w-6 h-6" />,
      title: 'Alle Tools',
      subtitle: 'Volledig overzicht',
      route: '/tools',
      priority: 'low',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 hover:bg-gray-100',
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    router.push(action.route);
  };

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {quickActions.map((action) => (
        <div
          key={action.id}
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-pink-300 hover:bg-pink-50/50 hover:shadow-sm active:scale-95"
          onClick={() => handleActionClick(action)}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Icon with background */}
            <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
              <div className="text-gray-700">
                {action.icon}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <h3 className="font-medium text-gray-900 text-sm leading-tight">
                {action.title}
              </h3>
              <p className="text-xs text-gray-600 leading-tight">
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