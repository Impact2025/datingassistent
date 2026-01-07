"use client";

import { useState, useEffect, useCallback } from 'react';

// ============================================
// PUSH NOTIFICATIONS HOOK - World-Class
// ============================================

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UsePushNotificationsReturn extends PushNotificationState {
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
}

// VAPID public key - should be set in environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: null,
    subscription: null,
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  // Check support and current subscription on mount
  useEffect(() => {
    async function checkSupport() {
      if (typeof window === 'undefined') {
        setState(s => ({ ...s, isLoading: false }));
        return;
      }

      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      const permission = 'Notification' in window ? Notification.permission : null;

      if (!isSupported) {
        setState({
          isSupported: false,
          permission,
          subscription: null,
          isSubscribed: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setState({
          isSupported: true,
          permission,
          subscription,
          isSubscribed: !!subscription,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState(s => ({
          ...s,
          isSupported: true,
          permission,
          isLoading: false,
          error: 'Failed to check subscription status',
        }));
      }
    }

    checkSupport();
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    setState(s => ({ ...s, permission }));
    return permission;
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !VAPID_PUBLIC_KEY) {
      setState(s => ({ ...s, error: 'Push notifications not supported or VAPID key missing' }));
      return false;
    }

    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      // Request permission if not granted
      if (state.permission !== 'granted') {
        const permission = await requestPermission();
        if (permission !== 'granted') {
          setState(s => ({ ...s, isLoading: false, error: 'Permission denied' }));
          return false;
        }
      }

      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      setState(s => ({
        ...s,
        subscription,
        isSubscribed: true,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('Subscribe error:', error);
      setState(s => ({
        ...s,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Subscription failed',
      }));
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      return true;
    }

    setState(s => ({ ...s, isLoading: true, error: null }));

    try {
      // Unsubscribe from push
      await state.subscription.unsubscribe();

      // Remove from server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: state.subscription.endpoint }),
      });

      setState(s => ({
        ...s,
        subscription: null,
        isSubscribed: false,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setState(s => ({
        ...s,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unsubscribe failed',
      }));
      return false;
    }
  }, [state.subscription]);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!state.isSubscribed) {
      throw new Error('Not subscribed to push notifications');
    }

    await fetch('/api/push/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  }, [state.isSubscribed]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

// Simplified hook for just checking notification status
export function useNotificationPermission(): {
  permission: NotificationPermission | null;
  requestPermission: () => Promise<NotificationPermission>;
} {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied' as NotificationPermission;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return { permission, requestPermission };
}
