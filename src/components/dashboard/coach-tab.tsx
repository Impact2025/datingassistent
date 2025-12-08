'use client';

/**
 * Coach Tab - OPTIMIZED VERSION
 * Clean, simple interface to Iris AI Coach
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle, Heart } from 'lucide-react';
import { ChatCoachTab } from './chat-coach-tab';
import { LOADING_MESSAGES } from '@/lib/constants/dashboard';

interface CoachTabProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
}

export function CoachTab({ onTabChange, userId }: CoachTabProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{LOADING_MESSAGES.COACH}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Header Card */}
      <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pink-500" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Stel vragen</h4>
                <p className="text-xs text-muted-foreground">Over dating, relaties en jezelf</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Persoonlijk advies</h4>
                <p className="text-xs text-muted-foreground">AI begeleiding op maat</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Empathisch</h4>
                <p className="text-xs text-muted-foreground">Begripvol en ondersteunend</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <div className="h-[calc(100vh-280px)]">
        <ChatCoachTab />
      </div>
    </div>
  );
}
