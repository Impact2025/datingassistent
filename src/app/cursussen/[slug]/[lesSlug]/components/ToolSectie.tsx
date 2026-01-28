'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, Wrench, ExternalLink } from 'lucide-react';

interface ToolSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

// Map tool IDs to their routes
const TOOL_ROUTES: Record<string, string> = {
  'bio-generator': '/tools/ai-bio-generator',
  'ai-bio-generator': '/tools/ai-bio-generator',
  'profile-analysis': '/profile-analysis',
  'foto-analyse': '/foto',
  'foto': '/foto',
  'opener': '/opener',
  'opener-generator': '/opener',
  'match': '/match',
  'match-coach': '/match',
  'voice': '/voice',
  'stemcoach': '/voice',
  'ai-coach': '/ai-relationship-coach',
  'relationship-coach': '/ai-relationship-coach',
  'pro-tools': '/pro-tools',
  'essentials': '/essentials',
  'kickstart-toolkit': '/kickstart-toolkit',
  'pro-arsenal': '/pro-arsenal',
};

export function ToolSectie({ sectie, isCompleted, onComplete }: ToolSectieProps) {
  const router = useRouter();
  const content = sectie.inhoud || {};

  const handleLaunchTool = () => {
    const toolId = content.toolId || content.toolSlug || sectie.titel?.toLowerCase().replace(/\s+/g, '-');
    const route = TOOL_ROUTES[toolId] || content.toolUrl;

    if (route) {
      // Open in same tab (better UX for course flow)
      router.push(route);
    } else if (content.toolUrl?.startsWith('http')) {
      // External URL - open in new tab
      window.open(content.toolUrl, '_blank');
    } else {
      // Fallback to tools page
      router.push('/tools');
    }
  };

  return (
    <Card className="shadow-lg border-coral-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sectie.titel}</h3>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro text */}
        {content.introTekst && (
          <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">{content.introTekst}</p>
        )}

        {/* Tool card */}
        <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-coral-50 to-white dark:from-coral-900/30 dark:to-gray-800 border-2 border-coral-200 dark:border-coral-700">
          <div className="text-center">
            <div className="text-4xl mb-4">🛠️</div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
              {content.toolNaam || sectie.titel}
            </h4>
            {content.toolBeschrijving && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{content.toolBeschrijving}</p>
            )}
            <PrimaryButton
              onClick={handleLaunchTool}
              className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg"
            >
              {content.ctaTekst || 'Open tool'}
            </PrimaryButton>
          </div>
        </div>

        {/* Instructions */}
        {content.instructies && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Hoe te gebruiken:</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{content.instructies}</p>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <PrimaryButton
            onClick={onComplete}
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full border-2 border-gray-300 dark:border-gray-600"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Tool gebruikt
          </PrimaryButton>
        )}
      </CardContent>
    </Card>
  );
}
