"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  MessageCircle,
  Image,
  Users,
  Target,
  Shield,
  Mic,
  Heart,
  ArrowLeft,
  Compass,
  User,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { GuidedFlow } from '@/components/dashboard/guided-flow';
import { ToolModal, ToolModalHeader, getToolMetadata, hasModalComponent } from '@/components/tools';

interface Tool {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  route: string;
  category: 'profile' | 'communication' | 'analysis' | 'safety';
  popular?: boolean;
}

function ToolsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showGuidedFlow, setShowGuidedFlow] = useState(false);

  // Modal state for tools
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    route: string | null;
    title: string;
    subtitle: string;
    component: React.ComponentType<any> | null;
  }>({
    isOpen: false,
    route: null,
    title: '',
    subtitle: '',
    component: null,
  });

  // Handle URL parameters for direct tool access
  useEffect(() => {
    const tool = searchParams?.get('tool');
    const category = searchParams?.get('category');

    if (tool) {
      // Map tool names to categories
      const toolCategoryMap: Record<string, string> = {
        'profile': 'profile',
        'profiel': 'profile',
        'chat': 'communication',
        'date': 'analysis',
        'date-planner': 'analysis',
        'bio-generator': 'profile',
        'ai-bio-generator': 'profile',
        'foto-checker': 'profile',
        'ai-foto-checker': 'profile',
        'conversatie-starter': 'communication',
        'ai-conversatie-starter': 'communication',
        'gespreks-ehbo': 'safety',
        'ai-gespreks-ehbo': 'safety',
        'confidence-coach': 'analysis',
        'ai-confidence-coach': 'analysis',
        'ai-profiel-coach': 'analysis',
        'waarden-kompas': 'analysis',
        'waardenkompas': 'analysis',
        'kompas': 'analysis'
      };

      const mappedCategory = toolCategoryMap[tool.toLowerCase()];
      if (mappedCategory) {
        setSelectedCategory(mappedCategory);
      }
    } else if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  const tools: Tool[] = [
    // Core Tools
    {
      id: 'waarden-kompas',
      icon: <Compass className="w-6 h-6" />,
      title: 'Waarden Kompas™',
      description: 'Ontdek je kernwaarden voor betere matches',
      route: '/waarden-kompas',
      category: 'analysis',
      popular: true,
    },

    // Profile Tools
    {
      id: 'profile-coach',
      icon: <Camera className="w-6 h-6" />,
      title: 'Profiel Coach',
      description: 'Foto, bio en profiel optimalisatie',
      route: '/profiel',
      category: 'profile',
      popular: true,
    },
    {
      id: 'ai-bio-generator',
      icon: <Heart className="w-6 h-6" />,
      title: 'AI Bio Generator',
      description: 'Professionele bio varianten genereren',
      route: '/tools/ai-bio-generator',
      category: 'profile',
      popular: true,
    },
    {
      id: 'ai-foto-checker',
      icon: <Image className="w-6 h-6" />,
      title: 'AI Foto Checker',
      description: 'Professionele foto beoordeling',
      route: '/profiel',
      category: 'profile',
    },

    // Communication Tools
    {
      id: 'chat-coach',
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Chat Coach',
      description: 'Gespreksanalyse en advies',
      route: '/chat',
      category: 'communication',
      popular: true,
    },
    {
      id: 'ai-conversatie-starter',
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'AI Conversatie Starter',
      description: 'Slimme openingszinnen genereren',
      route: '/chat',
      category: 'communication',
    },
    {
      id: 'ai-gespreks-ehbo',
      icon: <Shield className="w-6 h-6" />,
      title: 'AI Gespreks EHBO',
      description: 'Problematische gesprekken analyseren',
      route: '/chat',
      category: 'communication',
    },

    // Analysis Tools
    {
      id: 'date-planner',
      icon: <Target className="w-6 h-6" />,
      title: 'Date Planner',
      description: 'Perfecte date ideeën',
      route: '/date-planner',
      category: 'analysis',
      popular: true,
    },
    {
      id: 'ai-confidence-coach',
      icon: <Target className="w-6 h-6" />,
      title: 'AI Confidence Coach',
      description: 'Zelfvertrouwen en mindset coaching',
      route: '/groei',
      category: 'analysis',
    },
    {
      id: 'ai-profiel-coach',
      icon: <User className="w-6 h-6" />,
      title: 'AI Profiel Coach',
      description: 'Profiel analyse en optimalisatie',
      route: '/profiel',
      category: 'analysis',
    },
  ];

  const categories = [
    { id: 'all', label: 'Alles', count: tools.length },
    { id: 'profile', label: 'Profiel', count: tools.filter(t => t.category === 'profile').length },
    { id: 'communication', label: 'Communicatie', count: tools.filter(t => t.category === 'communication').length },
    { id: 'analysis', label: 'Analyse', count: tools.filter(t => t.category === 'analysis').length },
    { id: 'safety', label: 'Veiligheid', count: tools.filter(t => t.category === 'safety').length },
  ];

  const filteredTools = selectedCategory === 'all'
    ? tools
    : tools.filter(tool => tool.category === selectedCategory);

  const handleToolClick = (route: string, title: string, description: string) => {
    // Check if tool has modal component
    if (hasModalComponent(route)) {
      const metadata = getToolMetadata(route);
      if (metadata) {
        setActiveModal({
          isOpen: true,
          route,
          title: metadata.title,
          subtitle: metadata.subtitle,
          component: metadata.component,
        });
      }
    } else {
      // Fallback to page navigation for tools without modal
      router.push(route);
    }
  };

  const closeModal = () => {
    setActiveModal({
      isOpen: false,
      route: null,
      title: '',
      subtitle: '',
      component: null,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'profile': return 'bg-blue-100 text-blue-700';
      case 'communication': return 'bg-green-100 text-green-700';
      case 'analysis': return 'bg-purple-100 text-purple-700';
      case 'safety': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Tools</h1>
            <p className="text-sm text-gray-600">Kies je dating tool</p>
          </div>
        </div>

        {/* Category Filter and Guide Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>

          <Button
            onClick={() => setShowGuidedFlow(true)}
            className="ml-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Persoonlijke Gids
          </Button>
        </div>
      </div>

      {/* 3-Tier Tool Showcase */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Essentials - Free Tier */}
          <Card
            className="cursor-pointer overflow-hidden border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all"
            onClick={() => router.push('/essentials')}
          >
            <CardContent className="p-4">
              <Badge className="bg-green-500 text-white border-0 mb-2">
                🆓 GRATIS
              </Badge>
              <h3 className="font-bold text-gray-900 mb-1">Essentials</h3>
              <p className="text-xs text-gray-600 mb-3">
                Badges, Activity Logger, Stats & meer
              </p>
              <Button size="sm" variant="outline" className="border-green-500 text-green-700 hover:bg-green-100 w-full">
                Ontdek →
              </Button>
            </CardContent>
          </Card>

          {/* Kickstart Toolkit */}
          <Card
            className="cursor-pointer overflow-hidden border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-all"
            onClick={() => router.push('/kickstart-toolkit')}
          >
            <CardContent className="p-4">
              <Badge className="bg-blue-500 text-white border-0 mb-2">
                💎 KICKSTART
              </Badge>
              <h3 className="font-bold text-gray-900 mb-1">Kickstart Toolkit</h3>
              <p className="text-xs text-gray-600 mb-3">
                5 AI tools met dagelijkse limieten
              </p>
              <Button size="sm" variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-100 w-full">
                Ontdek →
              </Button>
            </CardContent>
          </Card>

          {/* Pro Arsenal - Premium Tier */}
          <Card
            className="cursor-pointer overflow-hidden border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all"
            onClick={() => router.push('/pro-arsenal')}
          >
            <CardContent className="p-4">
              <Badge className="bg-purple-500 text-white border-0 mb-2">
                ⭐ PREMIUM
              </Badge>
              <h3 className="font-bold text-gray-900 mb-1">Pro Arsenal</h3>
              <p className="text-xs text-gray-600 mb-3">
                Premium tools + unlimited access
              </p>
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white w-full">
                Ontdek →
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-white"
              onClick={() => handleToolClick(tool.route, tool.title, tool.description)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center">
                    <div className="text-pink-600">
                      {tool.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {tool.title}
                      </h3>
                      {tool.popular && (
                        <Badge className="text-xs bg-pink-100 text-pink-700">
                          🔥
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-tight">
                      {tool.description}
                    </p>
                  </div>

                  {/* Category Badge */}
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getCategoryColor(tool.category)}`}
                  >
                    {tool.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Geen tools gevonden</h3>
            <p className="text-gray-600 text-sm">Probeer een andere categorie</p>
          </div>
        )}
      </div>

      {/* Guided Flow Modal */}
      {showGuidedFlow && (
        <GuidedFlow
          onComplete={() => setShowGuidedFlow(false)}
          onClose={() => setShowGuidedFlow(false)}
        />
      )}

      <BottomNavigation />

      {/* Tool Modal */}
      <ToolModal isOpen={activeModal.isOpen} onClose={closeModal}>
        <ToolModalHeader
          title={activeModal.title}
          subtitle={activeModal.subtitle}
          onBack={closeModal}
          onClose={closeModal}
        />

        {/* Tool Content with Suspense for lazy loading */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeModal.component && (
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-3 border-gray-300 border-t-pink-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-600">Tool laden...</p>
                  </div>
                </div>
              }
            >
              <activeModal.component onClose={closeModal} />
            </Suspense>
          )}
        </div>
      </ToolModal>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔧</div>
          <p className="text-gray-600">Tools laden...</p>
        </div>
      </div>
    }>
      <ToolsPageContent />
    </Suspense>
  );
}