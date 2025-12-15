"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { ChatCoachTab } from '@/components/dashboard/chat-coach-tab';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chat Coach</h1>
            <p className="text-sm text-gray-600">Altijd beschikbaar • Persoonlijk advies</p>
          </div>
        </div>
      </div>

      {/* Chat Coach Tool */}
      <div className="p-4">
        <ChatCoachTab />
      </div>

      <BottomNavigation />
    </div>
  );
}