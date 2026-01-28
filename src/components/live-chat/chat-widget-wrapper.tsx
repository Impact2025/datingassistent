'use client';

import { useState, useEffect } from 'react';
import { ChatWidget } from './chat-widget';
import { ProactiveInvite, useProactiveInvite } from './proactive-invite';

interface ChatWidgetWrapperProps {
  apiUrl?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  companyName?: string;
  welcomeMessage?: string;
  enableProactiveInvites?: boolean;
  proactiveDelay?: number;
  proactiveMessage?: string;
  agentName?: string;
  agentAvatar?: string;
}

export function ChatWidgetWrapper({
  apiUrl = '/api/chatbot',
  position = 'bottom-right',
  primaryColor = '#FF7B54',
  companyName = 'DatingAssistent',
  welcomeMessage = 'Hallo! Ik ben je AI-assistent voor dating advies. Ik kan je helpen met vragen over daten, relaties en persoonlijke ontwikkeling. Stel je vraag gerust!',
  enableProactiveInvites = true,
  proactiveDelay = 15000, // 15 seconds
  proactiveMessage = 'Hallo! Heeft u vragen over dating? Ik help u graag!',
  agentName = 'AI Dating Coach',
  agentAvatar
}: ChatWidgetWrapperProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const { shouldShowInvite, showInvite, dismissInvite } = useProactiveInvite();

  // Track user interactions to trigger proactive invites
  useEffect(() => {
    if (!enableProactiveInvites) return;

    let interactionTimer: NodeJS.Timeout;
    let scrollTimer: NodeJS.Timeout;

    const handleUserInteraction = () => {
      // Clear existing timers
      clearTimeout(interactionTimer);
      clearTimeout(scrollTimer);

      // Set new timer for proactive invite
      interactionTimer = setTimeout(() => {
        showInvite();
      }, proactiveDelay);
    };

    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // Show invite after scrolling (user engagement)
        if (window.scrollY > 200) {
          handleUserInteraction();
        }
      }, 1000);
    };

    const handleMouseMove = () => {
      handleUserInteraction();
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Cleanup
    return () => {
      clearTimeout(interactionTimer);
      clearTimeout(scrollTimer);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [enableProactiveInvites, proactiveDelay, showInvite]);

  const handleAcceptInvite = () => {
    setChatOpen(true);
    dismissInvite();
  };

  const handleOpenChat = () => {
    setChatOpen(true);
    dismissInvite();
  };

  return (
    <>
      {/* Main Chat Widget */}
      <ChatWidget
        apiUrl={apiUrl}
        position={position}
        primaryColor={primaryColor}
        companyName={companyName}
        welcomeMessage={welcomeMessage}
      />

      {/* Proactive Invite */}
      {enableProactiveInvites && shouldShowInvite && !chatOpen && (
        <ProactiveInvite
          onAccept={handleAcceptInvite}
          onDismiss={dismissInvite}
          position={position === 'bottom-right' ? 'bottom-right' : 'bottom-left'}
          delay={0} // Already handled by the hook
          companyName={companyName}
          message={proactiveMessage}
          agentName={agentName}
          agentAvatar={agentAvatar}
        />
      )}
    </>
  );
}

// Export types for external use
export type { ChatWidgetWrapperProps };