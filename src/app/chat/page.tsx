"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle, Heart, Zap, Bot } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { ChatWidget } from '@/components/live-chat/chat-widget';

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
            onClick={() => router.push('/')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chat Coach</h1>
            <p className="text-sm text-gray-600">AI-gedreven gespreksanalyse en advies</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* AI Chat Coach Card */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-pink-600" />
              AI Chat Coach - Live Sessie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Start een live gesprek met onze AI coach voor directe hulp bij dating vragen, gespreksanalyse en persoonlijke advies.
            </p>

            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Direct beschikbaar</h4>
                  <p className="text-sm text-gray-600">
                    Stel al je dating vragen, upload chatgesprekken voor analyse, of vraag om advies bij specifieke situaties.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                Klik op de roze chat bubbel rechtsonder om te beginnen
              </p>
              <div className="text-xs text-gray-400">
                💬 Ondersteund door geavanceerde AI voor dating-specifieke inzichten
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Tools Card */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Aanvullende Chat Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Naast live coaching bieden we gespecialiseerde tools voor specifieke chat uitdagingen.
            </p>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => router.push('/tools?tool=ai-conversatie-starter')}
                className="bg-blue-500 hover:bg-blue-600 text-white justify-start"
              >
                <Heart className="w-4 h-4 mr-2" />
                AI Conversatie Starter - Slimme openingszinnen
              </Button>

              <Button
                onClick={() => router.push('/tools?tool=ai-gespreks-ehbo')}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 justify-start"
              >
                <Zap className="w-4 h-4 mr-2" />
                AI Gespreks EHBO - Probleemanalyse
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="border-0 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pro Tip</h3>
              <p className="text-gray-600 text-sm">
                Upload je daadwerkelijke chatgesprekken naar de AI coach voor de meest accurate analyse en advies.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Widget */}
      <ChatWidget
        apiUrl="/api/chatbot"
        position="bottom-right"
        primaryColor="#E14874"
        companyName="AI Chat Coach"
        welcomeMessage="Hallo! Ik ben je AI Chat Coach gespecialiseerd in dating advies. Ik kan je helpen met gespreksanalyse, openingszinnen, relatie-advies en persoonlijke ontwikkeling. Wat kan ik voor je doen?"
      />

      <BottomNavigation />
    </div>
  );
}