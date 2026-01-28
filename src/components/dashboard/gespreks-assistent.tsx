'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  Target,
  Sparkles,
  HelpCircle,
  BarChart3,
  Lightbulb,
  Heart,
  Copy,
  Download,
  Upload,
  Zap
} from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { useToolCompletion } from '@/hooks/use-tool-completion';

// Import sub-components
import { ChatAnalysisTab } from './gespreks-assistent/chat-analysis-tab';

// Placeholder components for now
const DateConversationCoach = () => <div className="p-8 text-center"><h3 className="text-lg font-semibold">Date Conversation Coach</h3><p className="text-muted-foreground">Coming soon...</p></div>;
const ScriptsLibrary = () => <div className="p-8 text-center"><h3 className="text-lg font-semibold">Scripts Library</h3><p className="text-muted-foreground">Coming soon...</p></div>;
const TensionMeter = () => <div className="p-8 text-center"><h3 className="text-lg font-semibold">Tension Meter</h3><p className="text-muted-foreground">Coming soon...</p></div>;
const ProposalAnalyzer = () => <div className="p-8 text-center"><h3 className="text-lg font-semibold">Proposal Analyzer</h3><p className="text-muted-foreground">Coming soon...</p></div>;
const StrategyAdvisor = () => <div className="p-8 text-center"><h3 className="text-lg font-semibold">Strategy Advisor</h3><p className="text-muted-foreground">Coming soon...</p></div>;

interface GespreksAssistentProps {
  onTabChange?: (tab: string) => void;
}

export function GespreksAssistent({ onTabChange }: GespreksAssistentProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('chat-analysis');
  const [showTutorial, setShowTutorial] = useState(false);

  const {
    isCompleted: isToolCompleted,
    markAsCompleted,
    progressPercentage
  } = useToolCompletion('gespreks-assistent');

  // Track first visit
  useEffect(() => {
    if (user?.id && !isToolCompleted) {
      markAsCompleted('first_visit', {
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      });
    }
  }, [user?.id, isToolCompleted, markAsCompleted]);

  const tabs = [
    {
      id: 'chat-analysis',
      label: 'Chat Analyse',
      icon: MessageSquare,
      description: 'NLP-gedreven analyse van je gesprekken',
      component: <ChatAnalysisTab onTabChange={onTabChange} />,
      badge: 'AI'
    },
    {
      id: 'date-coach',
      label: 'Date Coach',
      icon: Users,
      description: 'Advies voor face-to-face gesprekken',
      component: <DateConversationCoach onTabChange={onTabChange} />,
      badge: 'Pro'
    },
    {
      id: 'scripts',
      label: 'Scripts & Zinnen',
      icon: FileText,
      description: 'Kant-en-klare voorbeeldzinnen',
      component: <ScriptsLibrary onTabChange={onTabChange} />,
      badge: '200+'
    },
    {
      id: 'tension-meter',
      label: 'Spanningsmeter',
      icon: TrendingUp,
      description: 'Real-time gesprek flow analyse',
      component: <TensionMeter onTabChange={onTabChange} />,
      badge: 'Live'
    },
    {
      id: 'proposal-analyzer',
      label: 'Voorstel Analyse',
      icon: Target,
      description: 'Optimaliseer je date voorstellen',
      component: <ProposalAnalyzer onTabChange={onTabChange} />,
      badge: 'AI'
    },
    {
      id: 'strategy-advisor',
      label: 'Strategie Adviseur',
      icon: Lightbulb,
      description: 'Realtime gesprekstips',
      component: <StrategyAdvisor onTabChange={onTabChange} />,
      badge: '24/7'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">GespreksAssistent</h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Analyseer je dating gesprekken met AI en krijg professionele inzichten voor betere resultaten
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tool Selector */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Kies je tool</h2>
            <p className="text-gray-600">Selecteer de functie die je wilt gebruiken</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Card
                  key={tab.id}
                  className={`cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md ${
                    isActive
                      ? 'bg-gradient-to-r from-coral-50 to-coral-100 ring-2 ring-coral-200'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-7 h-7" />
                      </div>

                      <div className="space-y-2">
                        <h3 className={`font-semibold text-base ${
                          isActive ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {tab.label}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {tab.description}
                        </p>
                        {tab.badge && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {tab.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Tool Content */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-8">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </CardContent>
      </Card>

    </div>
  );
}

// Export individual components for potential standalone use
export { ChatAnalysisTab } from './gespreks-assistent/chat-analysis-tab';
// Other components will be exported when implemented