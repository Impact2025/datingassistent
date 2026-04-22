'use client';

/**
 * Coach Tab - OPTIMIZED VERSION
 * Clean, simple interface to Iris AI Coach
 */

import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle, Heart } from 'lucide-react';
import { ChatCoachTab } from './chat-coach-tab';
import { LOADING_MESSAGES } from '@/lib/constants/dashboard';

interface CoachTabProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
}

export const CoachTab = memo(function CoachTab({ onTabChange, userId }: CoachTabProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">{LOADING_MESSAGES.COACH}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header — compact op mobiel, uitgebreid op desktop */}
      <div className="flex-shrink-0 mb-3 md:mb-6">
        {/* Mobile: slanke balk */}
        <div className="flex items-center justify-between px-1 py-2 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Coach Iris</p>
              <p className="text-[11px] text-muted-foreground">Jouw dating coach • 24/7</p>
            </div>
          </div>
          <Badge className="bg-green-500 text-white text-[10px] px-2 py-0.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse inline-block"></span>
            Online
          </Badge>
        </div>

        {/* Desktop: volledige kaart */}
        <Card className="hidden md:block border-0 shadow-sm bg-gradient-to-r from-coral-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-coral-500" />
                  Iris AI Coach
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Je persoonlijke dating coach • 24/7 beschikbaar
                </p>
              </div>
              <Badge className="bg-green-500 text-white">
                <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                Online
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: MessageCircle, title: 'Stel vragen', sub: 'Over dating, relaties en jezelf' },
                { icon: Sparkles, title: 'Persoonlijk advies', sub: 'AI begeleiding op maat' },
                { icon: Heart, title: 'Empathisch', sub: 'Begripvol en ondersteunend' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-coral-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{title}</h4>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface — vult resterende ruimte */}
      <div className="flex-1 min-h-0">
        <ChatCoachTab />
      </div>
    </div>
  );
});
