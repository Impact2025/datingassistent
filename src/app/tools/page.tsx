"use client";

import { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface Tool {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  route: string;
  category: 'profile' | 'communication' | 'analysis' | 'safety';
  popular?: boolean;
}

export default function ToolsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Handle URL parameters for direct tool access
  useEffect(() => {
    const tool = searchParams.get('tool');
    const category = searchParams.get('category');

    if (tool) {
      // Map tool names to categories
      const toolCategoryMap: Record<string, string> = {
        'profile': 'profile',
        'profiel': 'profile',
        'chat': 'communication',
        'foto': 'profile',
        'photo': 'profile',
        'date': 'analysis',
        'match': 'analysis',
        'veiligheid': 'safety',
        'safety': 'safety',
        'opener': 'communication',
        'voice': 'communication'
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
      id: 'photo-analysis',
      icon: <Image className="w-6 h-6" />,
      title: 'Foto Analyse',
      description: 'Professionele foto beoordeling',
      route: '/foto',
      category: 'profile',
      popular: true,
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
      id: 'opener-lab',
      icon: <Heart className="w-6 h-6" />,
      title: 'Opener Lab',
      description: 'Effectieve openingszinnen',
      route: '/opener',
      category: 'communication',
    },
    {
      id: 'voice-notes',
      icon: <Mic className="w-6 h-6" />,
      title: 'Stem Berichten',
      description: 'Audio analyse en tips',
      route: '/voice',
      category: 'communication',
    },

    // Analysis Tools
    {
      id: 'match-analysis',
      icon: <Users className="w-6 h-6" />,
      title: 'Match Analyse',
      description: 'Profielen en gedrag analyseren',
      route: '/match',
      category: 'analysis',
    },
    {
      id: 'date-planner',
      icon: <Target className="w-6 h-6" />,
      title: 'Date Planner',
      description: 'Perfecte date ideeën',
      route: '/date',
      category: 'analysis',
    },

    // Safety Tools
    {
      id: 'safety-check',
      icon: <Shield className="w-6 h-6" />,
      title: 'Veiligheidscheck',
      description: 'Rode vlaggen detecteren',
      route: '/veiligheid',
      category: 'safety',
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

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
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
      </div>

      {/* Tools Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-white"
              onClick={() => router.push(tool.route)}
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

      <BottomNavigation />
    </div>
  );
}