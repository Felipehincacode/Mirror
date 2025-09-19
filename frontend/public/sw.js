// Service Worker for mirror PWA
const CACHE_NAME = 'mirror-v1';
const STATIC_CACHE = [
  '/',
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event with cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push received:', event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: data.icon || '/icon-192x192.svg',
    badge: data.badge || '/icon-192x192.svg',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: true,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Mirror App', options)
  );
});

// Notification click event - handle when user clicks on notification
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  let url = '/';

  // Handle different action types
  if (event.action) {
    switch (event.action) {
      case 'open':
        url = notificationData.url || '/';
        break;
      case 'later':
        // Just open the app, no specific navigation
        url = '/';
        break;
      default:
        url = notificationData.url || '/';
    }
  } else {
    // Default click behavior
    url = notificationData.url || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // App is open, focus it and navigate
            client.focus();
            if (url !== '/') {
              client.postMessage({
                type: 'NAVIGATE',
                url: url
              });
            }
            return;
          }
        }

        // App is not open, open it
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync for offline photo uploads
self.addEventListener('sync', (event) => {
  if (event.tag === 'upload-photos') {
    event.waitUntil(syncUploads());
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  if (type === 'QUEUE_UPLOAD') {
    event.waitUntil(queueOfflineUpload(data));
  } else if (type === 'MANUAL_SYNC') {
    event.waitUntil(syncUploads());
  }
});

// IndexedDB setup for offline storage
const DB_NAME = 'mirror-uploads';
const DB_VERSION = 1;
const UPLOADS_STORE = 'pending-uploads';

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(UPLOADS_STORE)) {
        const store = db.createObjectStore(UPLOADS_STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function saveUploadToIndexedDB(uploadData) {
  try {
    const db = await openDB();
    const transaction = db.transaction([UPLOADS_STORE], 'readwrite');
    const store = transaction.objectStore(UPLOADS_STORE);

    const upload = {
      id: Date.now().toString(),
      ...uploadData,
      timestamp: Date.now(),
      retryCount: 0
    };

    await new Promise((resolve, reject) => {
      const request = store.add(upload);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return upload.id;
  } catch (error) {
    console.error('Error saving upload to IndexedDB:', error);
    throw error;
  }
}

async function getPendingUploads() {
  try {
    const db = await openDB();
    const transaction = db.transaction([UPLOADS_STORE], 'readonly');
    const store = transaction.objectStore(UPLOADS_STORE);
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => {
        resolve(request.result);
        db.close();
      };
      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  } catch (error) {
    console.error('Error getting pending uploads:', error);
    throw error;
  }
}

async function removeUploadFromIndexedDB(uploadId) {
  try {
    const db = await openDB();
    const transaction = db.transaction([UPLOADS_STORE], 'readwrite');
    const store = transaction.objectStore(UPLOADS_STORE);

    await new Promise((resolve, reject) => {
      const request = store.delete(uploadId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error('Error removing upload from IndexedDB:', error);
    throw error;
  }
}

async function uploadToSupabase(uploadData) {
  const SUPABASE_URL = 'https://awepdardqnffaptvstrg.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBkYXJkcW5mZmFwdHZzdHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MjMwNTMsImV4cCI6MjA3MzI5OTA1M30.49t5rq9t6qvxmQIl_s5EmUd1SIMHaCehW1LQrA2tWgs';

  try {
    // First, upload the file to Supabase Storage
    const fileName = `${uploadData.userId}/${uploadData.challengeId}/original.${uploadData.fileName.split('.').pop()}`;

    const formData = new FormData();
    formData.append('file', uploadData.file);

    const storageResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/submission/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: formData
    });

    if (!storageResponse.ok) {
      throw new Error(`Storage upload failed: ${storageResponse.status}`);
    }

    const storageData = await storageResponse.json();
    const photoUrl = `${SUPABASE_URL}/storage/v1/object/public/submission/${fileName}`;

    // Then, create the submission record
    const submissionResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        p_user_id: uploadData.userId,
        p_challenge_id: uploadData.challengeId,
        p_photo_url: photoUrl,
        p_title: uploadData.title,
        p_note: uploadData.note || null,
        p_location_lat: uploadData.location?.lat || null,
        p_location_lng: uploadData.location?.lng || null
      })
    });

    if (!submissionResponse.ok) {
      throw new Error(`Submission creation failed: ${submissionResponse.status}`);
    }

    return { success: true, photoUrl };
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
}

async function syncUploads() {
  console.log('Starting background sync for offline uploads...');

  try {
    const pendingUploads = await getPendingUploads();
    console.log(`Found ${pendingUploads.length} pending uploads`);

    if (pendingUploads.length === 0) {
      console.log('No pending uploads to sync');
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const upload of pendingUploads) {
      try {
        console.log(`Syncing upload: ${upload.id}`);

        // Attempt to upload to Supabase
        const result = await uploadToSupabase(upload);

        if (result.success) {
          // Remove from IndexedDB on success
          await removeUploadFromIndexedDB(upload.id);
          successCount++;
          console.log(`Successfully synced upload: ${upload.id}`);
        }
      } catch (error) {
        console.error(`Failed to sync upload ${upload.id}:`, error);

        // Increment retry count
        upload.retryCount = (upload.retryCount || 0) + 1;

        // If retry count exceeds limit, remove from queue
        if (upload.retryCount >= 3) {
          await removeUploadFromIndexedDB(upload.id);
          console.log(`Removed failed upload ${upload.id} after ${upload.retryCount} retries`);
        }

        failureCount++;
      }
    }

    // Send notification with results
    const notificationTitle = successCount > 0 ? 'Photos Synced Successfully' : 'Sync Failed';
    const notificationBody = successCount > 0
      ? `Successfully synced ${successCount} photo${successCount > 1 ? 's' : ''}${failureCount > 0 ? `, ${failureCount} failed` : ''}`
      : `Failed to sync ${failureCount} photo${failureCount > 1 ? 's' : ''}`;

    await self.registration.showNotification(notificationTitle, {
      body: notificationBody,
      icon: '/icon-192x192.svg',
      badge: '/icon-192x192.svg',
      tag: 'sync-result',
      requireInteraction: false
    });

    console.log(`Background sync completed: ${successCount} successful, ${failureCount} failed`);

  } catch (error) {
    console.error('Background sync failed:', error);

    // Send error notification
    await self.registration.showNotification('Sync Error', {
      body: 'Failed to sync offline photos. Please check your connection.',
      icon: '/icon-192x192.svg',
      badge: '/icon-192x192.svg',
      tag: 'sync-error',
      requireInteraction: false
    });
  }
}

// Function to queue uploads for offline sync
async function queueOfflineUpload(uploadData) {
  try {
    const uploadId = await saveUploadToIndexedDB(uploadData);
    console.log(`Queued upload for offline sync: ${uploadId}`);

    // Try to register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('upload-photos');
    }

    return uploadId;
  } catch (error) {
    console.error('Error queuing offline upload:', error);
    throw error;
  }
}