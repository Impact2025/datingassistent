'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, X, User } from 'lucide-react';
import { trackInviteShown, trackInviteAccepted, trackInviteDismissed } from '@/lib/analytics/chat-analytics';

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
      <Card className={`w-80 shadow-2xl border-2 transition-all duration-300 ${
        isAnimating
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      }`}>
        <CardContent className="p-4">
          {/* Header with agent info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              {agentAvatar ? (
                <img
                  src={agentAvatar}
                  alt={agentName}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{agentName}</p>
              <p className="text-xs text-muted-foreground">{companyName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          {/* Message */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
          </div>

          {/* Typing indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-muted-foreground">Aan het typen...</span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              size="sm"
              className="px-4"
            >
              Later
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-muted-foreground text-center">
              💬 24/7 beschikbaar • Gemiddelde wachttijd: 2 minuten
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
          } w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200`}></div>
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