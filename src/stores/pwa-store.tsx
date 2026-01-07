"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

// ============================================
// PWA STORE - World-Class State Management
// ============================================

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  // Install state
  isInstallable: boolean;
  isInstalled: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  installDismissed: boolean;

  // Service worker state
  serviceWorkerRegistration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;

  // Network state
  isOnline: boolean;

  // Notification state
  notificationPermission: NotificationPermission | null;
}

interface PWAActions {
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
  setIsInstallable: (installable: boolean) => void;
  setIsInstalled: (installed: boolean) => void;
  setInstallDismissed: (dismissed: boolean) => void;
  setServiceWorkerRegistration: (registration: ServiceWorkerRegistration | null) => void;
  setUpdateAvailable: (available: boolean) => void;
  setIsOnline: (online: boolean) => void;
  setNotificationPermission: (permission: NotificationPermission) => void;

  // Actions
  promptInstall: () => Promise<boolean>;
  applyUpdate: () => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

type PWAStore = PWAState & PWAActions;

const PWAContext = createContext<PWAStore | null>(null);

const INSTALL_DISMISSED_KEY = 'pwa-install-dismissed';
const INSTALL_DISMISSED_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function PWAProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    deferredPrompt: null,
    installDismissed: false,
    serviceWorkerRegistration: null,
    updateAvailable: false,
    isOnline: true,
    notificationPermission: null,
  });

  // Check if install was previously dismissed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissedTime = localStorage.getItem(INSTALL_DISMISSED_KEY);
      if (dismissedTime) {
        const elapsed = Date.now() - parseInt(dismissedTime, 10);
        if (elapsed < INSTALL_DISMISSED_DURATION) {
          setState(s => ({ ...s, installDismissed: true }));
        } else {
          localStorage.removeItem(INSTALL_DISMISSED_KEY);
        }
      }

      // Check notification permission
      if ('Notification' in window) {
        setState(s => ({ ...s, notificationPermission: Notification.permission }));
      }
    }
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setState(s => ({
        ...s,
        deferredPrompt: promptEvent,
        isInstallable: true,
      }));
    };

    const handleAppInstalled = () => {
      setState(s => ({
        ...s,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Actions
  const setDeferredPrompt = useCallback((prompt: BeforeInstallPromptEvent | null) => {
    setState(s => ({ ...s, deferredPrompt: prompt }));
  }, []);

  const setIsInstallable = useCallback((installable: boolean) => {
    setState(s => ({ ...s, isInstallable: installable }));
  }, []);

  const setIsInstalled = useCallback((installed: boolean) => {
    setState(s => ({ ...s, isInstalled: installed }));
  }, []);

  const setInstallDismissed = useCallback((dismissed: boolean) => {
    if (dismissed) {
      localStorage.setItem(INSTALL_DISMISSED_KEY, Date.now().toString());
    } else {
      localStorage.removeItem(INSTALL_DISMISSED_KEY);
    }
    setState(s => ({ ...s, installDismissed: dismissed }));
  }, []);

  const setServiceWorkerRegistration = useCallback((registration: ServiceWorkerRegistration | null) => {
    setState(s => ({ ...s, serviceWorkerRegistration: registration }));
  }, []);

  const setUpdateAvailable = useCallback((available: boolean) => {
    setState(s => ({ ...s, updateAvailable: available }));
  }, []);

  const setIsOnline = useCallback((online: boolean) => {
    setState(s => ({ ...s, isOnline: online }));
  }, []);

  const setNotificationPermission = useCallback((permission: NotificationPermission) => {
    setState(s => ({ ...s, notificationPermission: permission }));
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!state.deferredPrompt) return false;

    try {
      await state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setState(s => ({
          ...s,
          isInstalled: true,
          isInstallable: false,
          deferredPrompt: null,
        }));
        return true;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
    }

    return false;
  }, [state.deferredPrompt]);

  const applyUpdate = useCallback(() => {
    if (state.serviceWorkerRegistration?.waiting) {
      state.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [state.serviceWorkerRegistration]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setState(s => ({ ...s, notificationPermission: permission }));
    return permission;
  }, []);

  const store: PWAStore = {
    ...state,
    setDeferredPrompt,
    setIsInstallable,
    setIsInstalled,
    setInstallDismissed,
    setServiceWorkerRegistration,
    setUpdateAvailable,
    setIsOnline,
    setNotificationPermission,
    promptInstall,
    applyUpdate,
    requestNotificationPermission,
  };

  return (
    <PWAContext.Provider value={store}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWAStore(): PWAStore {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAStore must be used within a PWAProvider');
  }
  return context;
}

// Utility hook for checking if should show install prompt
export function useShowInstallPrompt(): boolean {
  const { isInstallable, isInstalled, installDismissed } = usePWAStore();
  return isInstallable && !isInstalled && !installDismissed;
}
