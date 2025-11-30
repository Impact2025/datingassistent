"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  TrendingUp,
  Target,
  ChevronRight,
  Flame,
  Calendar,
  Star,
  Zap,
  Award,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================================
// HOME TAB - AI Greeting, Stats, Personalized Recommendations
// ============================================================================

interface HomeTabContentProps {
  user: any;
  userProfile: any;
}

// Dynamic greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Goedenacht';
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

// Get motivational message
function getMotivationalMessage(): string {
  const messages = [
    'Klaar om je dating game te verbeteren?',
    'Vandaag wordt een geweldige dag!',
    'Je bent op de goede weg naar succes.',
    'Elke stap brengt je dichter bij je doel.',
    'Consistentie is de sleutel tot groei.',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Stats Card Component
function StatsCard({ icon: Icon, label, value, trend, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {trend && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

// Quick Action Card
function QuickActionCard({
  title,
  description,
  icon: Icon,
  gradient,
  onClick
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-pink-200 transition-all active:scale-98 group"
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", gradient)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-pink-500 transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}

// AI Insight Card
function AIInsightCard({ insight }: { insight: { title: string; message: string; action: string; route: string } }) {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
          <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
          <Button
            onClick={() => router.push(insight.route)}
            size="sm"
            className="mt-3 h-8 text-xs bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {insight.action}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HomeTabContent({ user, userProfile }: HomeTabContentProps) {
  const router = useRouter();
  const [stats, setStats] = useState({
    streak: 7,
    goalsCompleted: 3,
    toolsUsed: 12,
    weeklyProgress: 68,
  });

  const [aiInsight] = useState({
    title: 'Tip van Iris',
    message: 'Je profiel foto\'s scoren goed! Overweeg nu je bio te optimaliseren voor meer matches.',
    action: 'Bio Verbeteren',
    route: '/profiel',
  });

  const quickActions = [
    {
      title: 'Dagelijkse Check-in',
      description: 'Bekijk je voortgang en doelen',
      icon: Calendar,
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      route: '/groei',
    },
    {
      title: 'Chat Analyse',
      description: 'Verbeter je gesprekken',
      icon: Target,
      gradient: 'bg-gradient-to-br from-purple-500 to-indigo-500',
      route: '/chat',
    },
    {
      title: 'Profiel Boost',
      description: 'Optimaliseer je dating profiel',
      icon: Zap,
      gradient: 'bg-gradient-to-br from-orange-500 to-red-500',
      route: '/profiel',
    },
  ];

  return (
    <div className="p-4 space-y-5">
      {/* Hero Greeting Section */}
      <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/30">
            {userProfile?.avatar_url ? (
              <Image
                src={userProfile.avatar_url}
                alt="Avatar"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>

          {/* Greeting Text */}
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Dater'}!
            </h1>
            <p className="text-white/80 text-sm mt-0.5">
              {getMotivationalMessage()}
            </p>
          </div>
        </div>

        {/* Streak Badge */}
        <div className="mt-4 flex items-center gap-2">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-300" />
            <span className="text-sm font-medium">{stats.streak} dagen streak</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">Level 3</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          icon={Target}
          label="Doelen deze week"
          value={`${stats.goalsCompleted}/5`}
          trend="+2"
          color="bg-gradient-to-br from-green-500 to-emerald-500"
        />
        <StatsCard
          icon={Zap}
          label="Tools gebruikt"
          value={stats.toolsUsed}
          trend="+5"
          color="bg-gradient-to-br from-purple-500 to-indigo-500"
        />
        <StatsCard
          icon={TrendingUp}
          label="Week voortgang"
          value={`${stats.weeklyProgress}%`}
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <StatsCard
          icon={Award}
          label="Achievements"
          value="8"
          color="bg-gradient-to-br from-orange-500 to-red-500"
        />
      </div>

      {/* AI Insight */}
      <AIInsightCard insight={aiInsight} />

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Aanbevolen voor jou</h2>
          <button className="text-xs text-pink-600 font-medium">Bekijk alles</button>
        </div>

        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              gradient={action.gradient}
              onClick={() => router.push(action.route)}
            />
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Vandaag</h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-700 flex-1">Profiel review voltooid</span>
              <span className="text-xs text-green-600">Klaar</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-700 flex-1">Chat coaching sessie</span>
              <span className="text-xs text-blue-600">In progress</span>
            </div>
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <span className="text-sm text-gray-500 flex-1">Date planning tips bekijken</span>
              <span className="text-xs text-gray-400">Later</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeTabContent;
