'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, X, Sparkles, Heart } from 'lucide-react';
import { trackInviteShown, trackInviteAccepted, trackInviteDismissed } from '@/lib/analytics/chat-analytics';
import { trackLeadEngagement } from '@/lib/analytics/lead-scoring';

interface ProactiveInviteProps {
  onAccept: () => void;
  onDismiss: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'middle-right';
  delay?: number; // Delay in milliseconds before showing
  companyName?: string;
  message?: string;
  agentName?: string;
  agentAvatar?: string;
}

export function ProactiveInvite({
  onAccept,
  onDismiss,
  position = 'bottom-right',
  delay = 10000, // 10 seconds default
  companyName = 'DatingAssistent',
  message = 'Hallo! Heeft u vragen over dating? Ik help u graag!',
  agentName = 'Support Team',
  agentAvatar
}: ProactiveInviteProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show invite after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Start animation after a brief delay
      setTimeout(() => setIsAnimating(true), 100);

      // Track that invite was shown
      trackInviteShown({
        companyName,
        agentName,
        delay
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, companyName, agentName]);

  const handleAccept = () => {
    // Track acceptance (conversion!)
    trackInviteAccepted({
      companyName,
      agentName
    });

    // Track for lead scoring
    trackLeadEngagement('invite_accepted');

    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onAccept();
    }, 300);
  };

  const handleDismiss = () => {
    // Track dismissal
    trackInviteDismissed({
      companyName,
      agentName
    });

    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  if (!isVisible) return null;

  const positionClasses = {
    'bottom-right': 'bottom-24 right-4',
    'bottom-left': 'bottom-24 left-4',
    'middle-right': 'bottom-1/2 right-4 translate-y-1/2'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      <Card className={`w-80 shadow-2xl border-2 border-pink-100 transition-all duration-300 overflow-hidden ${
        isAnimating
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      }`}>
        {/* Iris branded header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-white/30">
                  <AvatarImage src="/images/iris-avatar.png" alt="Iris" />
                  <AvatarFallback className="bg-white/20 text-white">
                    <Sparkles className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-white">{agentName}</p>
                <p className="text-xs text-white/80">{companyName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"
              onClick={handleDismiss}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Message */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
          </div>

          {/* Typing indicator */}
          <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-gray-500">Iris is aan het typen...</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-md"
              size="sm"
            >
              <Heart className="w-4 h-4 mr-2" />
              Chat met Iris
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              size="sm"
              className="px-4 border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              Later
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-muted-foreground text-center">
              <Sparkles className="w-3 h-3 inline mr-1 text-pink-500" />
              AI Dating Coach • Direct beschikbaar
            </p>
          </div>
        </CardContent>

        {/* Chat bubble pointer */}
        <div className={`absolute top-full ${
          position.includes('right') ? 'right-6' : 'left-6'
        }`}>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
          <div className={`absolute top-0 ${
            position.includes('right') ? 'right-1' : 'left-1'
          } w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-pink-100`}></div>
        </div>
      </Card>
    </div>
  );
}

// Hook for managing proactive invites
export function useProactiveInvite() {
  const [inviteShown, setInviteShown] = useState(false);
  const [inviteDismissed, setInviteDismissed] = useState(false);

  // Check if user has already seen/dismissed invite in this session
  useEffect(() => {
    const hasSeenInvite = sessionStorage.getItem('proactive-invite-seen');
    const hasDismissedInvite = sessionStorage.getItem('proactive-invite-dismissed');

    if (hasSeenInvite) setInviteShown(true);
    if (hasDismissedInvite) setInviteDismissed(true);
  }, []);

  const showInvite = () => {
    if (!inviteShown && !inviteDismissed) {
      setInviteShown(true);
      sessionStorage.setItem('proactive-invite-seen', 'true');
    }
  };

  const dismissInvite = () => {
    setInviteDismissed(true);
    sessionStorage.setItem('proactive-invite-dismissed', 'true');
  };

  const resetInvite = () => {
    setInviteShown(false);
    setInviteDismissed(false);
    sessionStorage.removeItem('proactive-invite-seen');
    sessionStorage.removeItem('proactive-invite-dismissed');
  };

  return {
    shouldShowInvite: !inviteShown && !inviteDismissed,
    showInvite,
    dismissInvite,
    resetInvite
  };
}