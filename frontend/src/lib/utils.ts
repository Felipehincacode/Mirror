import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Reverse geocoding using Nominatim (OpenStreetMap)
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MirrorApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    // Extract country from address
    const country = data.address?.country || data.address?.country_code?.toUpperCase();
    return country || null;
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return null;
  }
}

// Compress and resize image for upload
export async function compressImage(file: File, maxWidth: number = 1600, maxHeight: number = 1600, quality: number = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg', // Convert to JPEG for better compression
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Push notification utilities
export const NOTIFICATION_VAPID_PUBLIC_KEY = 'BL4HZHncFUpHnJkFr9oh7qogQ1ZKyKCrOsuipgJj9P7TeEzAZododbr_jENIwLeTfhb-f3BepF5NCoYl4tzL5Ak';

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
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

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  console.log('[DEBUG] registerServiceWorker called');
  console.log('[DEBUG] serviceWorker in navigator:', 'serviceWorker' in navigator);

  if ('serviceWorker' in navigator) {
    try {
      console.log('[DEBUG] Registering service worker at /sw.js...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('[DEBUG] Service Worker registered successfully:', registration);
      console.log('[DEBUG] Service worker state:', registration.active?.state);
      console.log('[DEBUG] Service worker scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('[DEBUG] Service Worker registration failed:', error);
      return null;
    }
  }

  console.log('[DEBUG] Service Worker not supported');
  return null;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  console.log('[DEBUG] requestNotificationPermission called');
  console.log('[DEBUG] Notification in window:', 'Notification' in window);

  if (!('Notification' in window)) {
    console.error('[DEBUG] Notifications not supported by browser');
    throw new Error('This browser does not support notifications');
  }

  console.log('[DEBUG] Current permission state:', Notification.permission);

  if (Notification.permission === 'granted') {
    console.log('[DEBUG] Permission already granted');
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    console.log('[DEBUG] Permission already denied');
    return 'denied';
  }

  console.log('[DEBUG] Requesting permission from user...');
  const permission = await Notification.requestPermission();
  console.log('[DEBUG] User responded with permission:', permission);
  return permission;
}

export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(NOTIFICATION_VAPID_PUBLIC_KEY)
    });

    console.log('Push subscription created:', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const result = await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications:', result);
      return result;
    }
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}
