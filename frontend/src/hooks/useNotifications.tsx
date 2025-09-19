import { useState, useEffect } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { useApi } from './useApi';
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
} from '@/lib/utils';

export interface NotificationState {
  permission: NotificationPermission;
  isSubscribed: boolean;
  isSupported: boolean;
  isLoading: boolean;
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSubscribed: false,
    isSupported: false,
    isLoading: false
  });

  const { currentUser } = useCurrentUser();
  const { savePushSubscription, deletePushSubscription } = useApi();

  // Check if notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setState(prev => ({ ...prev, isSupported }));

      if (isSupported) {
        setState(prev => ({ ...prev, permission: Notification.permission }));
      }
    };

    checkSupport();
  }, []);

  // Check subscription status when user changes
  useEffect(() => {
    if (currentUser && state.isSupported) {
      checkSubscriptionStatus();
    }
  }, [currentUser, state.isSupported]);

  const checkSubscriptionStatus = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setState(prev => ({ ...prev, isSubscribed: !!subscription }));
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const permission = await requestNotificationPermission();
      setState(prev => ({ ...prev, permission, isLoading: false }));

      if (permission === 'granted') {
        return await subscribe();
      }

      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    if (!state.isSupported || !currentUser) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) throw new Error('Service worker registration failed');

      // Subscribe to push notifications
      const subscription = await subscribeToPushNotifications(registration);
      if (!subscription) throw new Error('Push subscription failed');

      // Save subscription to database
      const success = await savePushSubscription({
        endpoint: subscription.endpoint,
        p256dhKey: arrayBufferToBase64(subscription.getKey('p256dh')!),
        authKey: arrayBufferToBase64(subscription.getKey('auth')!)
      });

      if (success) {
        setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!state.isSupported || !currentUser) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Unsubscribe from push notifications
      const pushUnsubscribed = await unsubscribeFromPushNotifications();

      // Remove subscription from database
      const dbUnsubscribed = await deletePushSubscription();

      if (pushUnsubscribed && dbUnsubscribed) {
        setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const sendTestNotification = async (): Promise<boolean> => {
    if (!state.isSubscribed || !currentUser) return false;

    // This would call a backend function to send a test notification
    // For now, we'll just show a local notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Mirror App!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      });
      return true;
    }

    return false;
  };

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    checkSubscriptionStatus
  };
};

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}